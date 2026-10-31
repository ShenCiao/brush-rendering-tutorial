import { expect, test } from "@playwright/test";
import { fillShader } from "../src/rendering/shaders";

type Point = [number, number];
type Triangle = [Point, Point, Point];

// Independent double-precision reference: clip the triangle to the unit square.
// The production shader integrates edges instead of building this polygon.
function clippedArea(triangle: Triangle) {
  let polygon: Point[] = triangle;
  for (const [axis, boundary, direction] of [
    [0, 0, 1],
    [0, 1, -1],
    [1, 0, 1],
    [1, 1, -1],
  ]) {
    const output: Point[] = [];
    if (!polygon.length) return 0;
    let previous = polygon[polygon.length - 1];
    let pd = (previous[axis] - boundary) * direction;
    for (const current of polygon) {
      const d = (current[axis] - boundary) * direction;
      if ((d < 0 && pd > 0) || (d > 0 && pd < 0)) {
        const t = pd / (pd - d);
        output.push([
          previous[0] + t * (current[0] - previous[0]),
          previous[1] + t * (current[1] - previous[1]),
        ]);
      }
      if (d >= 0) output.push(current);
      previous = current;
      pd = d;
    }
    polygon = output;
  }
  return (
    Math.abs(
      polygon.reduce((sum, p, i) => {
        const q = polygon[(i + 1) % polygon.length];
        return sum + p[0] * q[1] - p[1] * q[0];
      }, 0),
    ) * 0.5
  );
}

test("analytic coverage agrees with clipping for tiny, aligned, reversed and large triangles", async ({
  page,
}) => {
  const triangles: Triangle[] = [
    [
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [-2, -2],
      [4, -2],
      [-2, 4],
    ],
    [
      [0, 0],
      [0, 0],
      [1, 1],
    ],
    [
      [-10, -10],
      [10, 10],
      [0, 0],
    ],
    [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.5, 0.25001],
    ],
    [
      [0.5, -10],
      [0.50001, 10],
      [0.5, 10],
    ],
    [
      [-10, 0.5],
      [10, 0.50001],
      [10, 0.5],
    ],
    [
      [0, -10000],
      [0, 10000],
      [0.00001, 0],
    ],
    [
      [0, 0],
      [0, 10000],
      [10000, 0],
    ],
    [
      [1, 0],
      [1, 10000],
      [10000, 0],
    ],
    [
      [-10000, 1],
      [10000, 1],
      [0, 0],
    ],
  ];
  let seed = 0x3b9aca07;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let i = 0; i < 3000; i++) {
    const scale = [0.001, 1, 10, 100, 10000][i % 5];
    const p = (): Point => [
      0.5 + (random() - 0.5) * scale,
      0.5 + (random() - 0.5) * scale,
    ];
    triangles.push([p(), p(), p()]);
  }
  for (let i = 0; i < 200; i++) {
    const angle = random() * Math.PI * 2;
    const x = Math.cos(angle),
      y = Math.sin(angle);
    const length = 1 + random() * 10000,
      width = random() * 0.001;
    triangles.push([
      [0.5 - x * length, 0.5 - y * length],
      [0.5 + x * length, 0.5 + y * length],
      [0.5 - y * width, 0.5 + x * width],
    ]);
  }
  // Rotating and reversing all vertices exposes directional cancellation errors.
  const cases = triangles
    .flatMap(([a, b, c]): Triangle[] => [
      [a, b, c],
      [b, c, a],
      [c, a, b],
      [c, b, a],
      [b, a, c],
      [a, c, b],
    ])
    .map((t) => t.map((p) => p.map(Math.fround)) as Triangle);
  const packed = cases.flatMap(([a, b, c]) => [...a, ...b, ...c, 0, 0]);
  await page.goto("/brush-rendering-tutorial/gallary/");
  const actual = await page.evaluate(
    async ({ shader, packed }) => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter)
        throw new Error("WebGPU adapter required for coverage regression.");
      const device = await adapter.requestDevice();
      const input = device.createBuffer({
        size: packed.length * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(input, 0, new Float32Array(packed));
      const size = (packed.length / 8) * 4;
      const output = device.createBuffer({
        size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      });
      const readback = device.createBuffer({
        size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
      device.pushErrorScope("validation");
      const module = device.createShaderModule({
        code:
          shader +
          `
@group(0) @binding(5) var<storage,read> testPoints:array<vec4f>;
@group(0) @binding(6) var<storage,read_write> testCoverage:array<f32>;
@compute @workgroup_size(64) fn coverageTest(@builtin(global_invocation_id) id:vec3u) {
 if(id.x>=arrayLength(&testCoverage)){return;}
 var v:Vertex;
 v.position=vec4f(0.5,0.5,0,1);
 v.a=testPoints[id.x*2u].xy;v.b=testPoints[id.x*2u].zw;v.c=testPoints[id.x*2u+1u].xy;
 testCoverage[id.x]=coverage(v);
}`,
      });
      const pipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module, entryPoint: "coverageTest" },
      });
      const bind = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 5, resource: { buffer: input } },
          { binding: 6, resource: { buffer: output } },
        ],
      });
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bind);
      pass.dispatchWorkgroups(Math.ceil(size / 4 / 64));
      pass.end();
      encoder.copyBufferToBuffer(output, 0, readback, 0, size);
      device.queue.submit([encoder.finish()]);
      const error = await device.popErrorScope();
      if (error) throw new Error(error.message);
      await readback.mapAsync(GPUMapMode.READ);
      const result = Array.from(new Float32Array(readback.getMappedRange()));
      readback.unmap();
      device.destroy();
      return result;
    },
    { shader: fillShader, packed },
  );
  let maximumError = 0,
    worst = 0;
  cases.forEach((triangle, i) => {
    expect(
      Number.isFinite(actual[i]),
      `Nonfinite coverage: ${JSON.stringify(triangle)}`,
    ).toBe(true);
    const error = Math.abs(actual[i] - clippedArea(triangle));
    if (error > maximumError) {
      maximumError = error;
      worst = i;
    }
  });
  expect(
    maximumError,
    `Worst triangle: ${JSON.stringify(cases[worst])}; coverage ${
      actual[worst]
    }`,
  ).toBeLessThan(0.0005);
});
