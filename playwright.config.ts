import { defineConfig, devices } from "@playwright/test"

const PORT = 3200
// The demo route only exists under `next dev` (spec 0005), so it gets its own
// project. Port 3000 reuses a dev server the engineer already has running.
const DEV_PORT = 3000

// Runs against a production build: the service worker only registers there (spec 0001).
export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    {
      name: "phone",
      use: { ...devices["Pixel 7"] },
      testIgnore: ["**/design-system.spec.ts"],
    },
    {
      name: "design-system",
      use: { ...devices["Pixel 7"], baseURL: `http://localhost:${DEV_PORT}` },
      testMatch: ["**/design-system.spec.ts"],
    },
  ],
  webServer: [
    {
      command: `pnpm build && pnpm start --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      timeout: 180_000,
    },
    {
      command: `pnpm dev --port ${DEV_PORT}`,
      url: `http://localhost:${DEV_PORT}`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
