import { expect, test, Page } from "@playwright/test";
import type { PolygonAA } from "../src/rendering/format";
import { renderFile } from "./helpers/renderFile";

type Point = [number, number];
const outline: Point[] = [
  [-65, -37],
  [52, -61],
  [69, 43],
  [-47, 66],
];

function fixture(
  points: Point[],
  indices: number[],
  alpha: number,
  aa?: PolygonAA,
) {
  const binary = Buffer.alloc(points.length * 8 + indices.length * 4);
  points.flat().forEach((v, i) => binary.writeFloatLE(v, i * 4));
  indices.forEach((v, i) => binary.writeUInt32LE(v, points.length * 8 + i * 4));
  return renderFile(
    [
      {
        kind: "fill",
        color: [0.2, 0.5, 0.8, alpha],
        positions: { offset: 0, count: points.length * 2 },
        indices: { offset: points.length * 8, count: indices.length },
      },
    ],
    binary,
    aa,
  );
}

async function render(page: Page, bytes: Buffer) {
  await page.route("**/artwork.glb2dim", (route) =>
    route.fulfill({ body: bytes, contentType: "application/octet-stream" }),
  );
  await page.goto("/brush-rendering-tutorial/gallary/inaba-meguru/");
  const canvas = page.locator('canvas[data-view="vector"]');
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-samples", "1");
  await expect(page.getByRole("alert")).toHaveCount(0);
  // Synchronize with presentation before reading the actual backing pixels.
  await canvas.screenshot();
  return canvas.evaluate(async (element: HTMLCanvasElement) => {
    const image = new Image();
    image.src = element.toDataURL();
    await image.decode();
    const copy = document.createElement("canvas");
    copy.width = element.width;
    copy.height = element.height;
    const context = copy.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, copy.width, copy.height).data;
    return {
      width: copy.width,
      height: copy.height,
      camera: JSON.parse(element.dataset.camera!),
      // Read alpha directly so CSS backgrounds and color conversion cannot hide seams.
      alpha: Array.from({ length: data.length / 4 }, (_, i) => data[i * 4 + 3]),
    };
  });
}

// A numerical area reference over the outline is independent of the GPU's
// triangle clipping and triangulation. It exposes missing expanded fragments,
// ordinary alpha*coverage seams, winding mistakes, and incorrect pixel units.
function numericalCoverage(polygon: Point[], x: number, y: number) {
  let inside = 0;
  const samples = 128;
  for (let sy = 0; sy < samples; sy++) {
    for (let sx = 0; sx < samples; sx++) {
      const px = x + (sx + 0.5) / samples,
        py = y + (sy + 0.5) / samples;
      if (
        polygon.every(([ax, ay], i) => {
          const [bx, by] = polygon[(i + 1) % polygon.length];
          return (bx - ax) * (py - ay) - (by - ay) * (px - ax) >= 0;
        })
      )
        inside++;
    }
  }
  return inside / (samples * samples);
}

for (const alpha of [0.5, 1]) {
  test(`polygon AA matches pixel area without seams at alpha ${alpha}`, async ({
    page,
  }) => {
    // Four triangles meet inside the polygon; alternate their winding and add
    // degenerate triangles. Neither should change the outline's coverage.
    const points: Point[] = [...outline, [1.3, -2.1]];
    const indices = [0, 1, 4, 4, 2, 1, 2, 3, 4, 4, 0, 3, 0, 0, 1, 4, 4, 4];
    const rendered = await render(page, fixture(points, indices, alpha));
    const { width, height, camera } = rendered;
    const screen = ([x, y]: Point): Point => [
      (x - camera.x) * camera.scale + width / 2,
      (y - camera.y) * camera.scale + height / 2,
    ];
    const polygon = outline.map(screen);
    const center = screen(points[4]);
    const probes = new Map<string, Point>();
    const add = ([x, y]: Point) => {
      const px = Math.floor(x),
        py = Math.floor(y);
      probes.set(`${px},${py}`, [px, py]);
    };
    for (let edge = 0; edge < 4; edge++) {
      const a = polygon[edge],
        b = polygon[(edge + 1) % 4];
      for (const t of [0.27, 0.63]) {
        const p: Point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++) add([p[0] + dx, p[1] + dy]);
        // Internal edges must have the same alpha as the rest of the interior.
        add([
          center[0] + (a[0] - center[0]) * t,
          center[1] + (a[1] - center[1]) * t,
        ]);
      }
    }
    add(center);
    let partial = 0;
    for (const [x, y] of probes.values()) {
      const coverage = numericalCoverage(polygon, x, y);
      if (coverage > 0.01 && coverage < 0.99) partial++;
      const expected =
        255 * (1 - Math.pow(Math.max(1 - alpha, 0.01), coverage));
      expect(
        Math.abs(rendered.alpha[y * width + x] - expected),
        `alpha at ${x},${y}`,
      ).toBeLessThanOrEqual(2);
    }
    expect(partial).toBeGreaterThan(10);
  });
}

test("exported AA settings control opacity and bounded subpixel geometry", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const square: Point[] = [
    [-70, -70],
    [70, -70],
    [70, 70],
    [-70, 70],
  ];
  for (const enabled of [true, false]) {
    const image = await render(
      page,
      fixture(square, [0, 1, 2, 0, 2, 3], 1, {
        enabled,
        epsilon: 0.2,
        maxVertexOffsetPixels: 10,
      }),
    );
    const pixel =
      image.alpha[
        Math.floor(image.height / 2) * image.width + Math.floor(image.width / 2)
      ];
    expect(Math.abs(pixel - (enabled ? 204 : 255))).toBeLessThanOrEqual(1);
    await page.unroute("**/artwork.glb2dim");
  }

  // Unused positions stabilize fitting while the visible geometry becomes tiny.
  // A sharp tip and coincident vertices must not create distant fragments.
  const points: Point[] = [
    ...square,
    [-20, 0],
    [20, 0],
    [20, 0.02],
    [0, -0.02],
    [0.02, 0.02],
    [-0.02, 0.02],
  ];
  const image = await render(
    page,
    fixture(points, [4, 5, 6, 7, 8, 9, 4, 4, 5], 1),
  );
  const { width, height, camera } = image;
  let occupied = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!image.alpha[y * width + x]) continue;
      occupied++;
      expect(Math.abs(x + 0.5 - width / 2)).toBeLessThan(20 * camera.scale + 2);
      expect(Math.abs(y + 0.5 - height / 2)).toBeLessThan(2);
    }
  }
  expect(occupied).toBeGreaterThan(10);
});
