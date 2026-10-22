import { defineConfig, devices } from "@playwright/test"

const PORT = 3200
// The demo route only exists under `next dev` (spec 0005), so it gets its own
// project. Port 3000 reuses a dev server the engineer already has running.
// Both dev-server projects use the 127.0.0.1 origin: that is SITE_URL, the
// canonical host the proxy (src/proxy.ts) steers `localhost` visitors to, and
// asserting against the alias would race the one-hop redirect.
const DEV_PORT = 3000
const DEV_ORIGIN = `http://127.0.0.1:${DEV_PORT}`

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
      testIgnore: ["**/design-system.spec.ts", "**/auth.spec.ts"],
    },
    {
      name: "design-system",
      use: { ...devices["Pixel 7"], baseURL: DEV_ORIGIN },
      testMatch: ["**/design-system.spec.ts"],
    },
    {
      // Auth runs against the dev server on 127.0.0.1:3000 because SITE_URL,
      // the Supabase cookie host, and the email redirect allow list all use
      // that exact origin.
      name: "auth",
      use: { ...devices["Pixel 7"], baseURL: DEV_ORIGIN },
      testMatch: ["**/auth.spec.ts"],
    },
  ],
  webServer: [
    {
      command: `pnpm build && pnpm start --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm dev --port ${DEV_PORT}`,
      url: `http://localhost:${DEV_PORT}`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
