import js from "@eslint/js"
import nextConfig from "eslint-config-next"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettierConfig from "eslint-config-prettier/flat"

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "test-results/**",
      "playwright-report/**",
      ".vitest/**",
      ".agents/**",
      ".claude/**",
      "next-env.d.ts",
      "src/lib/supabase/database.types.ts",
      "supabase/.temp/**",
    ],
  },
  js.configs.recommended,
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  { rules: { "no-console": ["warn", { allow: ["warn", "error"] }] } },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
  },
  prettierConfig,
]

export default config
