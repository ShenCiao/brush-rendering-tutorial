/// <reference types="@webgpu/types" />
import { RenderDocument, PaintNode, Clip } from "./format";
import { GpuTimer } from "./GpuTimer";
import {
  strokeShader,
  fillShader,
  compositeShader,
  presentShader,
  bitmapShader,
} from "./shaders";

type Target = {
  texture: GPUTexture;
  view: GPUTextureView;
  msaa?: GPUTexture;
  msaaView?: GPUTextureView;
};
export type SampleCount = 1 | 4;
export const MAX_BITMAP_LONG_EDGE = 8192;
type PaintPipelines = {
  stroke: GPURenderPipeline;
  erase: GPURenderPipeline;
  fill: GPURenderPipeline;
  composite: GPURenderPipeline;
};
type Draw = { first: number; count: number; erase?: boolean };
export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface RenderStats {
  cpuMs: number;
  bitmapCpuMs?: number;
  draws: number;
  passes: number;
  width: number;
  height: number;
  targetBytes: number;
  samples: SampleCount;
}
export interface BitmapInfo {
  width: number;
  height: number;
  cpuMs: number;
  readyMs: number;
  bytes: number;
}
export interface Comparison {
  context: GPUCanvasContext;
  filter: "linear" | "nearest";
  difference: boolean;
  gain: number;
  grid: boolean;
}

export class WebGpuRenderer {
  private readonly resources: GPUBuffer[] = [];
  private readonly targets: Target[] = [];
  private readonly available: Target[] = [];
  private readonly draws = new Map<PaintNode, Draw>();
  private readonly viewBuffer: GPUBuffer;
  private readonly geometryBind: GPUBindGroup;
  private readonly fillVertices: GPUBuffer;
  private readonly fillIndices: GPUBuffer;
  private readonly pipelines = new Map<SampleCount, PaintPipelines>();
  private samples: SampleCount = 1;
  private readonly presentPipeline: GPURenderPipeline;
  private readonly bakePipeline: GPURenderPipeline;
  private readonly bitmapPipeline: GPURenderPipeline;
  private readonly bitmapOptions: GPUBuffer;
  private readonly samplers: Record<"linear" | "nearest", GPUSampler>;
  private readonly timer?: GpuTimer;
  private bitmap?: GPUTexture;
  private framePasses = 0;
  private frameDraws = 0;
  private timedFrame = false;
  private readonly compositeParams = new Map<string, GPUBuffer>();
  private width = 0;
  private height = 0;
  private disposed = false;
  readonly document: RenderDocument;
  readonly segmentCount: number;
  get supportsGpuTiming(): boolean {
    return !!this.timer;
  }
  get maxBitmapLongEdge(): number {
    return Math.min(
      MAX_BITMAP_LONG_EDGE,
      this.device.limits.maxTextureDimension2D,
    );
  }
  private get paint(): PaintPipelines {
    return this.pipelines.get(this.samples)!;
  }

  setSampleCount(samples: SampleCount): void {
    if (samples === this.samples) return;
    this.samples = samples;
    this.clearBitmap();
    this.releaseTargets();
    this.width = this.height = 0;
  }

  static async create(
    canvas: HTMLCanvasElement,
    document: RenderDocument,
    onError: (message: string) => void,
  ) {
    if (!navigator.gpu)
      throw new Error(
        "Interactive viewing needs a browser with WebGPU. Try a current Chrome or Edge with hardware acceleration enabled.",
      );
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter)
      throw new Error(
        "WebGPU could not find a graphics device. Enable hardware acceleration and try again.",
      );
    const device = await adapter.requestDevice({
      requiredLimits: {
        maxTextureDimension2D: Math.min(
          MAX_BITMAP_LONG_EDGE,
          adapter.limits.maxTextureDimension2D,
        ),
      },
      requiredFeatures: adapter.features.has("timestamp-query")
        ? ["timestamp-query"]
        : [],
    });
    const context = canvas.getContext("webgpu");
    if (!context) {
      device.destroy();
      throw new Error("Could not create a WebGPU canvas.");
    }
    device.pushErrorScope("validation");
    const renderer = new WebGpuRenderer(
      canvas,
      context,
      device,
      document,
      onError,
      adapter.info,
    );
    const error = await device.popErrorScope();
    if (error) {
      renderer.dispose();
      throw new Error(error.message);
    }
    device.addEventListener(
      "uncapturederror",
      (event: GPUUncapturedErrorEvent) => onError(event.error.message),
    );
    device.lost.then((info) => {
      if (!renderer.disposed)
        onError(
          `Graphics device disconnected: ${info.message}. Reload the viewer to reconnect.`,
        );
    });
    return renderer;
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    private context: GPUCanvasContext,
    private device: GPUDevice,
    document: RenderDocument,
    private readonly onError: (message: string) => void,
    readonly adapterInfo: GPUAdapterInfo | undefined,
  ) {
    this.document = document;
    this.timer = device.features.has("timestamp-query")
      ? new GpuTimer(device)
      : undefined;
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: canvasFormat,
      alphaMode: "premultiplied",
    });
    const buffer = (data: ArrayBufferView, usage: GPUBufferUsageFlags) => {
      const b = device.createBuffer({
        size: Math.max(64, data.byteLength),
        usage: usage | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(
        b,
        0,
        data.buffer as ArrayBuffer,
        data.byteOffset,
        data.byteLength,
      );
      this.resources.push(b);
      return b;
    };
    this.viewBuffer = buffer(new Float32Array(8), GPUBufferUsage.UNIFORM);
    const segmentWords: number[] = [],
      vertices: number[] = [],
      indices: number[] = [];
    const walk = (node: PaintNode) => {
      if (node.kind === "group") node.children.forEach(walk);
      else if (node.kind === "clip") {
        walk(node.base);
        node.clips.forEach(walk);
      } else if (node.kind === "stroke") {
        const p = document.floats(node.positions),
          r = document.floats(node.radii),
          pressure = document.floats(node.pressures);
        const first = segmentWords.length / 12;
        for (let i = 0; i < Math.max(r.length - 1, r.length ? 1 : 0); i++) {
          const j = Math.min(i + 1, r.length - 1);
          const x1 = p[j * 2] + (r.length === 1 ? 0.01 * r[0] : 0),
            y1 = p[j * 2 + 1];
          if (Math.hypot(x1 - p[i * 2], y1 - p[i * 2 + 1]) < 1e-9) continue;
          segmentWords.push(
            p[i * 2],
            p[i * 2 + 1],
            x1,
            y1,
            r[i],
            r[j],
            pressure[i],
            pressure[j],
            node.brush,
            0,
            0,
            0,
          );
        }
        this.draws.set(node, {
          first,
          count: segmentWords.length / 12 - first,
          erase: document.artwork.brushes[node.brush].erase,
        });
      } else {
        const p = document.floats(node.positions),
          ix = document.indices(node.indices),
          base = vertices.length / 6;
        const first = indices.length;
        for (let i = 0; i < p.length; i += 2)
          vertices.push(p[i], p[i + 1], ...node.color);
        for (const index of ix) indices.push(base + index);
        this.draws.set(node, { first, count: ix.length });
      }
    };
    document.artwork.nodes.forEach(walk);
    this.segmentCount = segmentWords.length / 12;
    const segments = new Float32Array(segmentWords),
      segmentInts = new Uint32Array(segments.buffer);
    for (let i = 8; i < segments.length; i += 12)
      segmentInts[i] = segmentWords[i];
    const brushData = new Float32Array(document.artwork.brushes.length * 8),
      brushInts = new Uint32Array(brushData.buffer);
    const curveData = new Float32Array(document.artwork.brushes.length * 1024);
    document.artwork.brushes.forEach((b, i) => {
      brushData.set(b.color, i * 8);
      brushData[i * 8 + 4] = b.density;
      brushInts[i * 8 + 5] = Number(b.pressureFlow);
      brushInts[i * 8 + 6] = Number(b.erase);
      curveData.set(document.floats(b.pressure), i * 1024);
      curveData.set(document.floats(b.falloff), i * 1024 + 512);
    });
    this.fillVertices = buffer(
      new Float32Array(vertices),
      GPUBufferUsage.VERTEX,
    );
    this.fillIndices = buffer(new Uint32Array(indices), GPUBufferUsage.INDEX);
    const layout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" as const },
        },
        ...[1, 2, 3].map((binding) => ({
          binding,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "read-only-storage" as const },
        })),
      ],
    });
    const gpuBuffers = [
      this.viewBuffer,
      buffer(segments, GPUBufferUsage.STORAGE),
      buffer(brushData, GPUBufferUsage.STORAGE),
      buffer(curveData, GPUBufferUsage.STORAGE),
    ];
    this.geometryBind = device.createBindGroup({
      layout,
      entries: gpuBuffers.map((b, binding) => ({
        binding,
        resource: { buffer: b },
      })),
    });
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [layout],
    });
    const strokeModule = device.createShaderModule({
      code: strokeShader,
      label: "Ciallo Airbrush",
    });
    const blend: GPUBlendComponent = {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    };
    const erase: GPUBlendComponent = {
      srcFactor: "zero",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    };
    const stroke = (eraseMode: boolean, samples: SampleCount) =>
      device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: { module: strokeModule, entryPoint: "vertexMain" },
        fragment: {
          module: strokeModule,
          entryPoint: "fragmentMain",
          targets: [
            {
              format: "rgba16float" as const,
              blend: {
                color: eraseMode ? erase : blend,
                alpha: eraseMode ? erase : blend,
              },
            },
          ],
        },
        primitive: { topology: "triangle-list" },
        multisample: { count: samples },
      });
    const fillModule = device.createShaderModule({ code: fillShader });
    const composite = device.createShaderModule({ code: compositeShader });
    for (const samples of [1, 4] as const) {
      const fill = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
          module: fillModule,
          entryPoint: "vertexMain",
          buffers: [
            {
              arrayStride: 24,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x2" as const },
                { shaderLocation: 1, offset: 8, format: "float32x4" as const },
              ],
            },
          ],
        },
        fragment: {
          module: fillModule,
          entryPoint: "fragmentMain",
          targets: [
            {
              format: "rgba16float" as const,
              blend: { color: blend, alpha: blend },
            },
          ],
        },
        multisample: { count: samples },
      });
      const compositePipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: composite, entryPoint: "vertexMain" },
        fragment: {
          module: composite,
          entryPoint: "fragmentMain",
          targets: [{ format: "rgba16float" as const }],
        },
        multisample: { count: samples },
      });
      this.pipelines.set(samples, {
        stroke: stroke(false, samples),
        erase: stroke(true, samples),
        fill,
        composite: compositePipeline,
      });
    }
    const present = device.createShaderModule({ code: presentShader });
    this.presentPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: present, entryPoint: "vertexMain" },
      fragment: {
        module: present,
        entryPoint: "fragmentMain",
        targets: [{ format: canvasFormat }],
      },
    });
    this.bakePipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: present, entryPoint: "vertexMain" },
      fragment: {
        module: present,
        entryPoint: "fragmentMain",
        targets: [{ format: "rgba8unorm" as const }],
      },
    });
    const bitmap = device.createShaderModule({
      code: bitmapShader,
      label: "Raster comparison",
    });
    this.bitmapPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: bitmap, entryPoint: "vertexMain" },
      fragment: {
        module: bitmap,
        entryPoint: "fragmentMain",
        targets: [{ format: canvasFormat }],
      },
    });
    this.bitmapOptions = buffer(new Uint32Array(4), GPUBufferUsage.UNIFORM);
    this.samplers = {
      linear: device.createSampler({
        minFilter: "linear",
        magFilter: "linear",
      }),
      nearest: device.createSampler({
        minFilter: "nearest",
        magFilter: "nearest",
      }),
    };
  }

  private acquire(): Target {
    const cached = this.available.pop();
    if (cached) return cached;
    const texture = this.device.createTexture({
      size: [this.width, this.height],
      format: "rgba16float" as const,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    const msaa =
      this.samples === 4
        ? this.device.createTexture({
            size: [this.width, this.height],
            sampleCount: 4,
            format: "rgba16float" as const,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
          })
        : undefined;
    const target = {
      texture,
      view: texture.createView(),
      msaa,
      msaaView: msaa?.createView(),
    };
    this.targets.push(target);
    return target;
  }
  private pass(encoder: GPUCommandEncoder, target: Target, clear: boolean) {
    const timestampWrites =
      this.timedFrame && this.framePasses === 0
        ? this.timer!.start()
        : undefined;
    this.framePasses++;
    return encoder.beginRenderPass({
      timestampWrites,
      colorAttachments: [
        {
          view: target.msaaView ?? target.view,
          resolveTarget: target.msaa ? target.view : undefined,
          loadOp: clear ? ("clear" as const) : ("load" as const),
          storeOp: "store" as const,
          clearValue: [0, 0, 0, 0],
        },
      ],
    });
  }
  private composite(
    encoder: GPUCommandEncoder,
    source: Target,
    destination: Target,
    opacity: number,
    mode: number,
    clipped = false,
  ): Target {
    const out = this.acquire(),
      key = `${opacity}/${mode}/${clipped}`;
    let params = this.compositeParams.get(key);
    if (!params) {
      const data = new ArrayBuffer(16);
      new Float32Array(data)[0] = opacity;
      new Uint32Array(data).set([mode, Number(clipped)], 1);
      params = this.device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      this.device.queue.writeBuffer(params, 0, data);
      this.compositeParams.set(key, params);
    }
    const bind = this.device.createBindGroup({
      layout: this.paint.composite.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: source.view },
        { binding: 1, resource: destination.view },
        { binding: 2, resource: { buffer: params } },
      ],
    });
    const pass = this.pass(encoder, out, true);
    pass.setPipeline(this.paint.composite);
    pass.setBindGroup(0, bind);
    pass.draw(3);
    this.frameDraws++;
    pass.end();
    this.available.push(source, destination);
    return out;
  }
  private clipping(encoder: GPUCommandEncoder, node: Clip): Target {
    let target = this.sequence(encoder, node.base.children);
    if (node.base.opacity !== 1) {
      const empty = this.acquire();
      this.pass(encoder, empty, true).end();
      target = this.composite(encoder, target, empty, node.base.opacity, 0);
    }
    for (const clipped of node.clips) {
      const source = this.sequence(encoder, clipped.children);
      target = this.composite(
        encoder,
        source,
        target,
        clipped.opacity,
        clipped.blend,
        true,
      );
    }
    return target;
  }
  private sequence(encoder: GPUCommandEncoder, nodes: PaintNode[]): Target {
    let target = this.acquire(),
      pass = this.pass(encoder, target, true);
    for (const node of this.inlineGroups(nodes)) {
      if (node.kind === "stroke" || node.kind === "fill") {
        const draw = this.draws.get(node)!;
        if (!draw.count) continue;
        this.frameDraws++;
        pass.setBindGroup(0, this.geometryBind);
        if (node.kind === "stroke") {
          pass.setPipeline(draw.erase ? this.paint.erase : this.paint.stroke);
          pass.draw(6, draw.count, 0, draw.first);
        } else {
          pass.setPipeline(this.paint.fill);
          pass.setVertexBuffer(0, this.fillVertices);
          pass.setIndexBuffer(this.fillIndices, "uint32");
          pass.drawIndexed(draw.count, 1, draw.first);
        }
      } else {
        pass.end();
        const source =
          node.kind === "clip"
            ? this.clipping(encoder, node)
            : this.sequence(encoder, node.children);
        target = this.composite(
          encoder,
          source,
          target,
          node.kind === "clip" ? 1 : node.opacity,
          node.kind === "clip" ? node.base.blend : node.blend,
        );
        pass = this.pass(encoder, target, false);
      }
    }
    pass.end();
    return target;
  }

  // Godot Layer2D's automatic boundaries: normal source-over subtrees can be
  // drawn directly. Erasing or an un-clipped non-normal child needs isolation.
  private *inlineGroups(nodes: PaintNode[]): Generator<PaintNode> {
    for (const node of nodes) {
      if (
        node.kind === "group" &&
        node.opacity === 1 &&
        node.blend === 0 &&
        !node.children.some((child) =>
          child.kind === "stroke"
            ? this.document.artwork.brushes[child.brush].erase
            : child.kind === "group"
            ? child.blend !== 0
            : child.kind === "clip" && child.base.blend !== 0,
        )
      ) {
        yield* this.inlineGroups(node.children);
      } else yield node;
    }
  }

  private releaseTargets(): void {
    this.targets.forEach((t) => {
      t.texture.destroy();
      t.msaa?.destroy();
    });
    this.targets.length = 0;
    this.available.length = 0;
  }

  private prepare(w: number, h: number, camera: Camera): void {
    if (w !== this.width || h !== this.height) {
      this.releaseTargets();
      this.width = w;
      this.height = h;
    }
    this.device.queue.writeBuffer(
      this.viewBuffer,
      0,
      new Float32Array([
        w,
        h,
        camera.x,
        camera.y,
        camera.scale,
        this.document.artwork.width,
        this.document.artwork.height,
        0,
      ]),
    );
    this.frameDraws = 0;
    this.framePasses = 0;
  }

  attachComparison(canvas: HTMLCanvasElement): GPUCanvasContext {
    const context = canvas.getContext("webgpu");
    if (!context) throw new Error("Could not create the comparison canvas.");
    context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: "premultiplied",
    });
    return context;
  }

  /** Bake the entire reference canvas once. Camera changes never rebuild it. */
  async bakeBitmap(longEdge: number): Promise<BitmapInfo> {
    if (
      !Number.isInteger(longEdge) ||
      longEdge < 64 ||
      longEdge > this.maxBitmapLongEdge
    )
      throw new Error(
        `Choose a bitmap long edge between 64 and ${this.maxBitmapLongEdge} pixels.`,
      );
    const start = performance.now(),
      a = this.document.artwork;
    const scale = longEdge / Math.max(a.width, a.height),
      w = Math.max(1, Math.round(a.width * scale)),
      h = Math.max(1, Math.round(a.height * scale));
    this.timedFrame = false;
    this.device.pushErrorScope("out-of-memory");
    this.device.pushErrorScope("validation");
    this.prepare(w, h, { x: 0, y: 0, scale });
    const bitmap = this.device.createTexture({
      size: [w, h],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    const encoder = this.device.createCommandEncoder({
      label: "Bake full artwork bitmap",
    });
    const target = this.sequence(encoder, a.nodes);
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: bitmap.createView(),
          loadOp: "clear" as const,
          storeOp: "store" as const,
        },
      ],
    });
    pass.setPipeline(this.bakePipeline);
    pass.setBindGroup(
      0,
      this.device.createBindGroup({
        layout: this.bakePipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: target.view }],
      }),
    );
    pass.draw(3);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
    this.available.push(target);
    const cpuMs = performance.now() - start;
    const [validationError, allocationError] = await Promise.all([
      this.device.popErrorScope(),
      this.device.popErrorScope(),
      this.device.queue.onSubmittedWorkDone(),
    ]);
    if (validationError || allocationError || this.disposed) {
      bitmap.destroy();
      if (allocationError) {
        this.releaseTargets();
        throw new Error(
          "Not enough GPU memory to generate this bitmap. Try a smaller size or turn off MSAA.",
        );
      }
      if (validationError) throw new Error(validationError.message);
      throw new Error("Viewer closed.");
    }
    this.bitmap?.destroy();
    this.bitmap = bitmap;
    return {
      width: w,
      height: h,
      cpuMs,
      readyMs: performance.now() - start,
      bytes: w * h * 4,
    };
  }

  clearBitmap(): void {
    this.bitmap?.destroy();
    this.bitmap = undefined;
  }

  render(
    camera: Camera,
    comparison?: Comparison,
    onTiming?: (timing: { vectorMs: number; bitmapMs?: number }) => void,
  ): RenderStats | undefined {
    if (this.disposed) return;
    const start = performance.now();
    const w = this.canvas.width,
      h = this.canvas.height;
    this.prepare(w, h, camera);
    this.timedFrame = this.timer?.begin() ?? false;
    const encoder = this.device.createCommandEncoder({ label: "Ciallo frame" });
    const target = this.sequence(encoder, this.document.artwork.nodes);
    const pass = encoder.beginRenderPass({
      timestampWrites: this.timedFrame ? this.timer!.end() : undefined,
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: "clear" as const,
          storeOp: "store" as const,
          clearValue: [0, 0, 0, 0],
        },
      ],
    });
    pass.setPipeline(this.presentPipeline);
    pass.setBindGroup(
      0,
      this.device.createBindGroup({
        layout: this.presentPipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: target.view }],
      }),
    );
    pass.draw(3);
    pass.end();
    const cpuMs = performance.now() - start;
    const hasBitmap = !!comparison && !!this.bitmap;
    let bitmapCpuMs: number | undefined;
    if (hasBitmap) {
      const bitmapStart = performance.now();
      const options = new ArrayBuffer(16);
      new Uint32Array(options).set([
        Number(comparison.difference),
        Number(comparison.grid),
      ]);
      new Float32Array(options)[2] = comparison.gain;
      this.device.queue.writeBuffer(this.bitmapOptions, 0, options);
      const bitmapPass = encoder.beginRenderPass({
        timestampWrites: this.timedFrame ? this.timer!.bitmap() : undefined,
        colorAttachments: [
          {
            view: comparison.context.getCurrentTexture().createView(),
            loadOp: "clear" as const,
            storeOp: "store" as const,
            clearValue: [0, 0, 0, 0],
          },
        ],
      });
      bitmapPass.setPipeline(this.bitmapPipeline);
      bitmapPass.setBindGroup(
        0,
        this.device.createBindGroup({
          layout: this.bitmapPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: this.bitmap!.createView() },
            { binding: 1, resource: this.samplers[comparison.filter] },
            { binding: 2, resource: { buffer: this.viewBuffer } },
            { binding: 3, resource: { buffer: this.bitmapOptions } },
            { binding: 4, resource: target.view },
          ],
        }),
      );
      bitmapPass.draw(3);
      bitmapPass.end();
      bitmapCpuMs = performance.now() - bitmapStart;
    }
    if (this.timedFrame) this.timer!.encode(encoder, hasBitmap);
    this.device.queue.submit([encoder.finish()]);
    if (this.timedFrame)
      void this.timer!.read(hasBitmap)
        .then((timing) => {
          if (timing && !this.disposed) onTiming?.(timing);
        })
        .catch((error) => {
          if (!this.disposed)
            this.onError(`GPU timing failed: ${String(error)}`);
        });
    this.available.push(target);
    return {
      cpuMs,
      bitmapCpuMs,
      draws: this.frameDraws + 1,
      passes: this.framePasses + 1,
      width: w,
      height: h,
      targetBytes:
        this.targets.length * w * h * 8 * (this.samples === 4 ? 5 : 1),
      samples: this.samples,
    };
  }

  async settled(): Promise<void> {
    await this.device.queue.onSubmittedWorkDone();
  }
  dispose(): void {
    this.disposed = true;
    this.timer?.dispose();
    this.clearBitmap();
    this.resources.forEach((b) => b.destroy());
    this.compositeParams.forEach((b) => b.destroy());
    this.releaseTargets();
    this.context.unconfigure();
    this.device.destroy();
  }
}
