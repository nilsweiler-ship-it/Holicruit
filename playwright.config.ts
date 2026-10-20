import { defineConfig, devices } from "@playwright/test";

/**
 * Two suites, one config:
 *  - smoke   (tests/e2e/smoke.spec.ts)    read-only — safe against production.
 *  - journey (tests/e2e/journeys.spec.ts) mutating — CI only, throwaway database.
 *
 * BASE_URL picks the target. Locally: `npm run dev` then `npm run test:e2e`.
 */
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isLocal = /localhost|127\.0\.0\.1/.test(baseURL);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-GB",
  },
  projects: [
    { name: "smoke", testMatch: /smoke\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "smoke-mobile", testMatch: /smoke\.spec\.ts/, use: { ...devices["Pixel 7"] } },
    { name: "journey", testMatch: /journeys\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: isLocal && !process.env.NO_WEBSERVER
    ? {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      }
    : undefined,
});
