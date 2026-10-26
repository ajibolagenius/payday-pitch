import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { BRAND } from "./brand-palette"

// Spec 0010 AC-4 and spec 0009: email clients and browser chrome cannot read
// CSS variables, so src/lib/brand-palette.ts holds the literals. It is meant to
// mirror layer 1 of globals.css, and these tests keep the two in step: an email
// that paints a stale brand green is a brand bug, not a rendering one.

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
)

/** Layer 1 values, the `:root` block before the semantic tokens. */
const rawLayer = new Map(
  [...css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map(
    ([, name, value]) => [name, value.toLowerCase()],
  ),
)

const MIRRORS: Array<[keyof typeof BRAND, string]> = [
  ["forest", "forest-700"],
  ["pitch", "forest-700"],
  ["gold", "gold-200"],
  ["ink", "ink"],
  ["card", "paper-50"],
  ["paper", "paper-100"],
  ["muted", "slate-600"],
]

describe("the email palette mirrors the raw layer (AC-4)", () => {
  it.each(MIRRORS)(
    "BRAND.%s equals the layer 1 value for --%s",
    (key, token) => {
      expect(BRAND[key].toLowerCase(), `--${token}`).toBe(rawLayer.get(token))
    },
  )

  it("gains the gold dots value the formation mark needs", () => {
    // The literal in the palette is uppercase, the token lowercase: same value
    // either way, which is what pnpm check:hex and AC-4 allow for this one file.
    expect(BRAND.gold).toBe(rawLayer.get("gold-200")?.toUpperCase())
  })

  it("keeps every slot a literal a mail client can paint", () => {
    for (const [key, value] of Object.entries(BRAND)) {
      expect(value, key).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(value, key).not.toContain("var(")
    }
  })
})

describe("the palette the emails read", () => {
  it("carries the seven slots the auth email header and card use", () => {
    for (const slot of [
      "forest",
      "gold",
      "pitch",
      "ink",
      "card",
      "paper",
      "muted",
    ] as const) {
      expect(BRAND, slot).toHaveProperty(slot)
    }
  })

  it("keeps the mark chip and its dots distinguishable as values", () => {
    expect(BRAND.forest).not.toBe(BRAND.gold)
    expect(BRAND.card).not.toBe(BRAND.gold)
    expect(BRAND.forest).toBe(BRAND.pitch)
  })
})
