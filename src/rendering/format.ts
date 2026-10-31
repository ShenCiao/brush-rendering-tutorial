export interface BufferRange {
  offset: number;
  count: number;
}
export interface Brush {
  color: number[];
  density: number;
  pressureFlow: boolean;
  erase: boolean;
  pressure: BufferRange;
  falloff: BufferRange;
}
export interface Stroke {
  kind: "stroke";
  brush: number;
  positions: BufferRange;
  radii: BufferRange;
  pressures: BufferRange;
  tilts: BufferRange;
}
export interface Fill {
  kind: "fill";
  color: number[];
  positions: BufferRange;
  indices: BufferRange;
}
export interface Group {
  kind: "group";
  name: string;
  opacity: number;
  blend: number;
  children: PaintNode[];
}
export interface Clip {
  kind: "clip";
  base: Group;
  clips: Group[];
}
export type PaintNode = Stroke | Fill | Group | Clip;
export interface PolygonAA {
  enabled: boolean;
  epsilon: number;
  maxVertexOffsetPixels: number;
}
export interface Artwork {
  version: number;
  profile: string;
  name: string;
  width: number;
  height: number;
  frame: number;
  colorSpace: string;
  polygonAA: PolygonAA;
  brushes: Brush[];
  nodes: PaintNode[];
}

/** The file boundary is validated here; the renderer consumes trusted typed data. */
export class RenderDocument {
  readonly artwork: Artwork;
  readonly binary: ArrayBuffer;
  readonly byteLength: number;
  readonly bounds: [number, number, number, number];
  readonly counts = {
    strokes: 0,
    fills: 0,
    groups: 0,
    points: 0,
    triangles: 0,
    clippingStacks: 0,
    erasers: 0,
  };

  constructor(bytes: ArrayBuffer) {
    this.byteLength = bytes.byteLength;
    const view = new DataView(bytes);
    const tag = (offset: number) =>
      String.fromCharCode(...new Uint8Array(bytes, offset, 4));
    if (
      bytes.byteLength < 12 ||
      tag(0) !== "RIFF" ||
      tag(8) !== "C2DI" ||
      view.getUint32(4, true) !== bytes.byteLength - 8
    )
      throw new Error("This is not a valid Ciallo RIFF render file.");
    let json: ArrayBuffer | undefined, binary: ArrayBuffer | undefined;
    for (let offset = 12; offset < bytes.byteLength; ) {
      if (offset + 8 > bytes.byteLength)
        throw new Error("Truncated RIFF chunk.");
      const length = view.getUint32(offset + 4, true),
        end = offset + 8 + length;
      if (end + (length & 1) > bytes.byteLength)
        throw new Error("RIFF chunk extends past the file.");
      const type = tag(offset);
      if (type === "JSON") {
        if (json) throw new Error("Duplicate JSON chunk.");
        json = bytes.slice(offset + 8, end);
      } else if (type === "BIN0") {
        if (binary) throw new Error("Duplicate binary chunk.");
        binary = bytes.slice(offset + 8, end);
      }
      offset = end + (length & 1);
    }
    if (!json || !binary)
      throw new Error("Missing render description or binary data.");
    this.artwork = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(json),
    );
    this.binary = binary;
    const a = this.artwork;
    if (
      a.version !== 1 ||
      a.profile !== "ciallo-airbrush-2" ||
      a.colorSpace !== "linear-srgb"
    )
      throw new Error("Unsupported Ciallo render version or brush profile.");
    if (
      ![a.width, a.height].every((x) => Number.isFinite(x) && x > 0) ||
      !Array.isArray(a.brushes) ||
      !Array.isArray(a.nodes)
    )
      throw new Error("Invalid canvas or resource description.");
    const aa = a.polygonAA;
    if (
      !aa ||
      typeof aa.enabled !== "boolean" ||
      !Number.isFinite(aa.epsilon) ||
      aa.epsilon <= 0 ||
      aa.epsilon >= 1 ||
      !Number.isFinite(aa.maxVertexOffsetPixels) ||
      aa.maxVertexOffsetPixels < 0
    )
      throw new Error("Invalid polygon antialiasing settings.");
    const color = (c: number[]) => {
      if (
        !Array.isArray(c) ||
        c.length !== 4 ||
        !c.every(Number.isFinite) ||
        c[3] < 0 ||
        c[3] > 1
      )
        throw new Error("Invalid material color.");
    };
    for (const b of a.brushes) {
      color(b.color);
      if (
        !Number.isFinite(b.density) ||
        b.density < 0 ||
        typeof b.erase !== "boolean" ||
        typeof b.pressureFlow !== "boolean"
      )
        throw new Error("Invalid brush parameters.");
      for (const r of [b.pressure, b.falloff]) {
        if (this.floats(r).length !== 512)
          throw new Error("Brush curves must have 512 samples.");
      }
    }
    let visited = 0;
    const bounds = [Infinity, Infinity, -Infinity, -Infinity] as [
      number,
      number,
      number,
      number,
    ];
    const visit = (node: PaintNode, depth: number) => {
      if (++visited > 100000 || depth > 64)
        throw new Error("Render tree is too large or deeply nested.");
      if (node.kind === "group") {
        if (
          ![0, 1, 2].includes(node.blend) ||
          !Number.isFinite(node.opacity) ||
          node.opacity < 0 ||
          node.opacity > 1 ||
          !Array.isArray(node.children)
        )
          throw new Error("Invalid group compositing parameters.");
        this.counts.groups++;
        node.children.forEach((n) => visit(n, depth + 1));
      } else if (node.kind === "clip") {
        this.counts.clippingStacks++;
        if (
          node.base?.kind !== "group" ||
          !Array.isArray(node.clips) ||
          node.clips.some((n) => n.kind !== "group")
        )
          throw new Error("Invalid clipping stack.");
        visit(node.base, depth + 1);
        node.clips.forEach((n) => visit(n, depth + 1));
      } else if (node.kind === "stroke" || node.kind === "fill") {
        const positions = this.floats(node.positions);
        if (positions.length % 2)
          throw new Error("Invalid vertex coordinates.");
        const radii =
          node.kind === "stroke" ? this.floats(node.radii) : undefined;
        if (node.kind === "stroke") {
          if (
            !Number.isInteger(node.brush) ||
            !a.brushes[node.brush] ||
            radii.length !== positions.length / 2 ||
            this.floats(node.pressures).length !== radii.length ||
            radii.some((r) => r < 0)
          )
            throw new Error("Invalid stroke samples.");
          const tilts = this.floats(node.tilts);
          if (tilts.length !== positions.length)
            throw new Error("Invalid tilt samples.");
          this.counts.strokes++;
          this.counts.points += radii.length;
          if (a.brushes[node.brush].erase) this.counts.erasers++;
        } else {
          color(node.color);
          const indices = this.indices(node.indices);
          if (
            indices.length % 3 ||
            indices.some((i) => i >= positions.length / 2)
          )
            throw new Error("Invalid triangle indices.");
          this.counts.fills++;
          this.counts.triangles += indices.length / 3;
        }
        for (let i = 0; i < positions.length; i += 2) {
          const r = radii ? radii[i / 2] : 0;
          bounds[0] = Math.min(bounds[0], positions[i] - r);
          bounds[1] = Math.min(bounds[1], positions[i + 1] - r);
          bounds[2] = Math.max(bounds[2], positions[i] + r);
          bounds[3] = Math.max(bounds[3], positions[i + 1] + r);
        }
      } else throw new Error("Unsupported drawing operation.");
    };
    a.nodes.forEach((n) => visit(n, 0));
    const cropped: typeof bounds = [
      Math.max(bounds[0], -a.width / 2),
      Math.max(bounds[1], -a.height / 2),
      Math.min(bounds[2], a.width / 2),
      Math.min(bounds[3], a.height / 2),
    ];
    this.bounds =
      cropped[0] < cropped[2] && cropped[1] < cropped[3]
        ? cropped
        : [-a.width / 2, -a.height / 2, a.width / 2, a.height / 2];
  }

  private range(r: BufferRange): void {
    if (
      !r ||
      !Number.isSafeInteger(r.offset) ||
      !Number.isSafeInteger(r.count) ||
      r.offset < 0 ||
      r.count < 0 ||
      r.offset % 4 ||
      r.offset + r.count * 4 > this.binary.byteLength
    )
      throw new Error("A geometry buffer is outside the file.");
  }
  floats(r: BufferRange): Float32Array {
    this.range(r);
    const values = new Float32Array(this.binary, r.offset, r.count);
    if (!values.every(Number.isFinite))
      throw new Error("Non-finite geometry or curve data.");
    return values;
  }
  indices(r: BufferRange): Uint32Array {
    this.range(r);
    return new Uint32Array(this.binary, r.offset, r.count);
  }
}
