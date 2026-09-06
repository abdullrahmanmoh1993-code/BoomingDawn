import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  ...(process.env.CI
    ? {
        webServer: {
          command:
            "npm run build:vinext && npx wrangler d1 migrations apply booming-dawn --config dist/server/wrangler.json --local && npm run start:vinext",
          url: "http://127.0.0.1:8789",
          reuseExistingServer: false,
          timeout: 300_000,
        },
      }
    : {}),
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:8789",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
      testMatch: /(header|a11y-dom)\.spec\.ts/,
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
      testIgnore: /orders-api\.spec\.ts/,
    },
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});