import { test, expect, Page } from "@playwright/test";

// These cases distinguish whole-group opacity, clipped alpha, and transparent
// Multiply from superficially similar but incorrect blend implementations.
function fixture(nodes: (fill: (color: number[]) => object) => object[]) {
  const data = Buffer.alloc(8 * 4 + 6 * 4);
  [-100, -100, 100, -100, 100, 100, -100, 100].forEach((x, i) =>
    data.writeFloatLE(x, i * 4),
  );
  [0, 1, 2, 0, 2, 3].forEach((x, i) => data.writeUInt32LE(x, 32 + i * 4));
  const fill = (color: number[]) => ({
    kind: "fill",
    color,
    positions: { offset: 0, count: 8 },
    indices: { offset: 32, count: 6 },
  });
  const json = Buffer.from(
    JSON.stringify({
      version: 1,
      profile: "ciallo-airbrush-1",
      colorSpace: "linear-srgb",
      width: 200,
      height: 200,
      frame: 1,
      name: "Compositing",
      brushes: [],
      nodes: nodes(fill),
    }),
  );
  const chunk = (tag: string, payload: Buffer) => {
    const h = Buffer.alloc(8);
    h.write(tag);
    h.writeUInt32LE(payload.length, 4);
    return Buffer.concat([h, payload, Buffer.alloc(payload.length & 1)]);
  };
  const body = Buffer.concat([
    Buffer.from("C2DI"),
    chunk("JSON", json),
    chunk("BIN0", data),
  ]);
  const head = Buffer.alloc(8);
  head.write("RIFF");
  head.writeUInt32LE(body.length, 4);
  return Buffer.concat([head, body]);
}
const group = (children: object[], opacity = 1, blend = 0) => ({
  kind: "group",
  name: "Test",
  children,
  opacity,
  blend,
});

async function pixel(page: Page, bytes: Buffer) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.route("**/artwork.glb2dim", (route) =>
    route.fulfill({ body: bytes, contentType: "application/octet-stream" }),
  );
  await page.goto("/brush-rendering-tutorial/gallary/inaba-meguru/");
  await expect(page.locator('canvas[data-view="vector"]')).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByLabel("Canvas background").selectOption("light");
  const screenshot = await page
    .locator('canvas[data-view="vector"]')
    .screenshot();
  const value = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = "data:image/png;base64," + base64;
    await image.decode();
    const c = document.createElement("canvas");
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    return Array.from(
      ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1)
        .data,
    );
  }, screenshot.toString("base64"));
  expect(errors).toEqual([]);
  return value;
}
function near(actual: number[], expected: number[]) {
  actual.forEach((x, i) =>
    expect(Math.abs(x - expected[i])).toBeLessThanOrEqual(2),
  );
}

test("group opacity is applied after overlapping children are composited", async ({
  page,
}) => {
  near(
    await pixel(
      page,
      fixture((fill) => [
        group([fill([1, 0, 0, 1]), fill([0, 0, 1, 0.5])], 0.5),
      ]),
    ),
    [221, 128, 221, 255],
  );
});
test("a clipping stack changes color without increasing its half-transparent base alpha", async ({
  page,
}) => {
  near(
    await pixel(
      page,
      fixture((fill) => [
        {
          kind: "clip",
          base: group([fill([1, 0, 0, 0.5])]),
          clips: [group([fill([0, 0, 1, 0.5])])],
        },
      ]),
    ),
    [221, 128, 221, 255],
  );
});
test("Multiply includes the source contribution over a transparent backdrop", async ({
  page,
}) => {
  near(
    await pixel(
      page,
      fixture((fill) => [
        group([fill([1, 0, 0, 0.5])]),
        group([fill([0, 0, 1, 0.5])], 1, 2),
      ]),
    ),
    [181, 64, 181, 255],
  );
});
