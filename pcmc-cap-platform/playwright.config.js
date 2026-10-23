import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  workers: 1,
  reporter: "list",
  use: {
    actionTimeout: 15000,
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: process.env.PCMC_CHROMIUM
      ? { executablePath: process.env.PCMC_CHROMIUM }
      : {},
  },
});
