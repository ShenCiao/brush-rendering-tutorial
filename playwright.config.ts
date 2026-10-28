import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000/brush-rendering-tutorial",
    viewport: { width: 1000, height: 1100 },
    launchOptions: { args: ["--enable-unsafe-webgpu"] },
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: "npm run start -- --host 127.0.0.1 --port 3000 --no-open",
    url: "http://127.0.0.1:3000/brush-rendering-tutorial/gallary/",
    reuseExistingServer: !process.env.CI,
  },
});
