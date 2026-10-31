import type { PolygonAA } from "../../src/rendering/format";

export function renderFile(
  nodes: object[],
  binary: Buffer,
  polygonAA: PolygonAA = {
    enabled: true,
    epsilon: 0.01,
    maxVertexOffsetPixels: 10,
  },
) {
  const json = Buffer.from(
    JSON.stringify({
      version: 1,
      profile: "ciallo-airbrush-2",
      polygonAA,
      colorSpace: "linear-srgb",
      width: 200,
      height: 200,
      frame: 1,
      name: "Rendering regression",
      brushes: [],
      nodes,
    }),
  );
  const chunk = (tag: string, payload: Buffer) => {
    const header = Buffer.alloc(8);
    header.write(tag);
    header.writeUInt32LE(payload.length, 4);
    return Buffer.concat([header, payload, Buffer.alloc(payload.length & 1)]);
  };
  const body = Buffer.concat([
    Buffer.from("C2DI"),
    chunk("JSON", json),
    chunk("BIN0", binary),
  ]);
  const header = Buffer.alloc(8);
  header.write("RIFF");
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}
