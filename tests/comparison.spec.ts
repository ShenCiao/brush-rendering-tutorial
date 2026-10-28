import { expect, test, Locator } from "@playwright/test";

const camera = async (canvas: Locator) =>
  JSON.parse((await canvas.getAttribute("data-camera"))!);

// The baked image must stay frozen while both panels use the current camera,
// including after the renderer switches target sizes to regenerate the bitmap.
test("comparison keeps one camera and only regenerates the bitmap on request", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/brush-rendering-tutorial/gallary/inaba-meguru/");
  const vector = page.locator('canvas[data-view="vector"]');
  const bitmap = page.locator('canvas[data-view="bitmap"]');
  const toggle = page.getByRole("switch", { name: "Compare bitmap" });
  await expect(vector).toHaveAttribute("data-ready", "true");
  await expect(page.getByLabel("MSAA", { exact: true })).toHaveValue("1");
  await expect(vector).toHaveAttribute("data-samples", "1");
  await toggle.check();
  await expect(bitmap).toHaveAttribute("data-ready", "true");
  await expect(bitmap).toHaveAttribute("data-raster-width", "1024");
  const bake = (await bitmap.getAttribute("data-bake"))!;
  const shared = async () => {
    await expect(bitmap).toHaveAttribute(
      "data-camera",
      (await vector.getAttribute("data-camera"))!,
    );
  };

  for (const [canvas, button] of [
    [vector, "left"],
    [bitmap, "middle"],
  ] as const) {
    await canvas.scrollIntoViewIfNeeded();
    const rect = (await canvas.boundingBox())!;
    const before = await camera(vector);
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down({ button });
    await page.mouse.move(
      rect.x + rect.width / 2 + 30,
      rect.y + rect.height / 2 + 20,
    );
    await page.mouse.up({ button });
    await expect
      .poll(async () => (await camera(vector)).x)
      .toBeCloseTo(before.x - 30 / before.scale);
    await expect
      .poll(async () => (await camera(vector)).y)
      .toBeCloseTo(before.y - 20 / before.scale);
    await shared();
  }

  const beforeWheel = await camera(vector);
  const rect = (await bitmap.boundingBox())!;
  const pointer = {
    x: Math.floor(rect.x + rect.width * 0.7),
    y: Math.floor(rect.y + rect.height * 0.35),
  };
  const anchor = {
    x: pointer.x - rect.x - rect.width / 2,
    y: pointer.y - rect.y - rect.height / 2,
  };
  await page.mouse.move(pointer.x, pointer.y);
  await page.mouse.wheel(0, -200);
  await expect
    .poll(async () => (await camera(vector)).scale)
    .toBeGreaterThan(beforeWheel.scale);
  const afterWheel = await camera(vector);
  expect(afterWheel.x + anchor.x / afterWheel.scale).toBeCloseTo(
    beforeWheel.x + anchor.x / beforeWheel.scale,
  );
  expect(afterWheel.y + anchor.y / afterWheel.scale).toBeCloseTo(
    beforeWheel.y + anchor.y / beforeWheel.scale,
  );
  await shared();

  await page.getByLabel("Bitmap sampling").selectOption("nearest");
  await page.getByLabel("Pixel grid", { exact: true }).check();
  await page.getByLabel("Difference", { exact: true }).check();
  await page.getByLabel("Difference amplification").selectOption("16");
  const beforeZoom = await camera(vector);
  for (let i = 0; i < 22; i++) await bitmap.press("+");
  await expect
    .poll(async () => (await camera(vector)).scale)
    .toBeGreaterThan(beforeZoom.scale * 80);
  await shared();
  await expect(bitmap).toHaveAttribute("data-bake", bake);
  const zoomedCamera = (await vector.getAttribute("data-camera"))!;

  await page.getByLabel("Bitmap long edge", { exact: true }).fill("256");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(bitmap).toHaveAttribute("data-raster-width", "256");
  await expect(bitmap).toHaveAttribute("data-raster-height", "256");
  await expect(bitmap).toHaveAttribute("data-bake", String(Number(bake) + 1));
  await expect(vector).toHaveAttribute("data-camera", zoomedCamera);
  await shared();

  // Sample-count changes replace the paint targets and the frozen bitmap,
  // without resetting either camera or reusing a texture from the previous mode.
  for (const [samples, extraBakes] of [
    ["4", 2],
    ["1", 3],
  ] as const) {
    await page.getByLabel("MSAA", { exact: true }).selectOption(samples);
    await expect(vector).toHaveAttribute("data-samples", samples);
    await expect(bitmap).toHaveAttribute("data-samples", samples);
    await expect(bitmap).toHaveAttribute(
      "data-bake",
      String(Number(bake) + extraBakes),
    );
    await expect(vector).toHaveAttribute("data-camera", zoomedCamera);
    await shared();
  }

  await page.getByLabel("Difference", { exact: true }).uncheck();
  await toggle.uncheck();
  await expect(bitmap).toBeHidden();
  await toggle.check();
  await expect(bitmap).toHaveAttribute("data-ready", "true");
  await expect(bitmap).toHaveAttribute("data-bake", String(Number(bake) + 4));
  await shared();
  await bitmap.press("Home");
  await expect
    .poll(async () => (await camera(vector)).scale)
    .toBeLessThan(beforeZoom.scale);
  await shared();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(errors).toEqual([]);
});
