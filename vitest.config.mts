import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": new URL("./src/", import.meta.url).pathname } },
  test: {
    dir: "src",
    include: ["**/*.test.{ts,tsx}"],
    environment: "node",
    clearMocks: true,
    coverage: { provider: "v8", include: ["src/**/*.ts"] },
  },
})
