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
    // Spec 0005: color lives in globals.css tokens, never as a literal in code.
    files: ["src/**/*.{ts,tsx}"],
    // Pitch and sticker artwork own their literal colors; brand.ts holds the
    // one value browser chrome needs as a literal (manifest, theme color).
    ignores: [
      "src/components/pitch/**",
      "src/components/stickers/**",
      "src/lib/brand.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Use a semantic token utility (bg-card, text-muted-foreground) instead of a hex literal.",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]",
          message:
            "Use a semantic token utility (bg-card, text-muted-foreground) instead of a hex literal.",
        },
      ],
    },
  },
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
