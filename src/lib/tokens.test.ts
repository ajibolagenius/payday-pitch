import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { CONTRAST_PAIRS } from "./tokens"

// Spec 0005, AC-3: contrast is proven from the token values themselves, so a
// palette edit that breaks a pair fails here, not in a browser session.
const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
)

/** Declared values per selector block, later blocks winning, as in a browser. */
function readBlocks(selector: string): Record<string, string>[] {
  const pattern = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g")
  return [...css.matchAll(pattern)].map(([, body]) =>
    Object.fromEntries(
      [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(
        ([, name, value]) => [name, value.trim()],
      ),
    ),
  )
}

function resolve(
  name: string,
  blocks: readonly Record<string, string>[],
): string {
  for (const block of [...blocks].reverse()) {
    const value = block[name]
    if (value === undefined) continue
    const reference = value.match(/^var\(--([\w-]+)\)$/)
    return reference ? resolve(reference[1], blocks) : value
  }
  throw new Error(`token --${name} is not defined`)
}

function channel(value: string): number {
  const n = value.endsWith("%")
    ? (Number(value.slice(0, -1)) / 100) * 255
    : Number(value)
  return n / 255
}

function luminance(color: string): number {
  const rgb = color.startsWith("#")
    ? [1, 3, 5].map((i) => Number.parseInt(color.slice(i, i + 2), 16) / 255)
    : [...color.matchAll(/(\d*\.?\d+%?)\s/g)]
        .slice(0, 3)
        .map((m) => channel(m[1]))
  const [r, g, b] = rgb.map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const THEMES = {
  light: readBlocks(":root"),
  dark: [...readBlocks(":root"), ...readBlocks("\\.dark")],
} as const

for (const [theme, blocks] of Object.entries(THEMES)) {
  describe(`tokens (${theme})`, () => {
    it("gives every semantic token an explicit value", () => {
      for (const pair of CONTRAST_PAIRS) {
        for (const token of [pair.background, pair.foreground]) {
          expect(resolve(token, blocks), `--${token}`).toBeTruthy()
        }
      }
    })

    for (const pair of CONTRAST_PAIRS) {
      it(`${pair.foreground} on ${pair.background} clears AA`, () => {
        const bg = resolve(pair.background, blocks)
        const fg = resolve(pair.foreground, blocks)
        expect(
          contrast(fg, bg),
          `${pair.use} (${fg} on ${bg})`,
        ).toBeGreaterThanOrEqual(pair.min)
      })
    }
  })
}

describe("the volt yellow rule", () => {
  it("never paints text with volt on a light surface", () => {
    const light = THEMES.light
    const volt = resolve("volt", light)
    for (const token of [
      "foreground",
      "card-foreground",
      "muted-foreground",
      "accent-foreground",
    ]) {
      expect(resolve(token, light), `--${token}`).not.toBe(volt)
    }
  })
})
