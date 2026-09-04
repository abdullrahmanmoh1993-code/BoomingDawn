import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
      testMatch: /header\.spec\.ts/,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});