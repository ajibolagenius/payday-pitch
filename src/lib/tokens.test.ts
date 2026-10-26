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

/** [r, g, b] in 0..1 from a resolved hex or rgb() value. */
function toRgb(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    return [1, 3, 5].map(
      (i) => Number.parseInt(color.slice(i, i + 2), 16) / 255,
    ) as [number, number, number]
  }
  const parts = [...color.matchAll(/(\d*\.?\d+%?)/g)]
    .map((m) => m[1])
    .filter(Boolean)
    .slice(0, 3)
  return parts.map(channel) as [number, number, number]
}

function luminance(color: string): number {
  const rgb = toRgb(color).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  )
  const [r, g, b] = rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** The same alpha-over composite Tailwind emits for `bg-x/20` surfaces. */
function composite(fg: string, bg: string, alpha: number): string {
  const [fr, fgc, fb] = toRgb(fg)
  const [br, bgc, bb] = toRgb(bg)
  const mix = (a: number, b: number) =>
    Math.round((alpha * a + (1 - alpha) * b) * 255)
  return `rgb(${mix(fr, br)} ${mix(fgc, bgc)} ${mix(fb, bb)})`
}

const THEMES = {
  light: readBlocks(":root"),
  dark: [...readBlocks(":root"), ...readBlocks("\\.dark")],
} as const

for (const [theme, blocks] of Object.entries(THEMES)) {
  describe(`tokens (${theme})`, () => {
    const pairs = CONTRAST_PAIRS.filter(
      (pair) => !pair.theme || pair.theme === theme || pair.theme === "both",
    )

    it("gives every pair token an explicit value", () => {
      for (const pair of pairs) {
        for (const token of [
          pair.background,
          pair.foreground,
          pair.over?.token,
        ]) {
          if (token === undefined) continue
          expect(resolve(token, blocks), `--${token}`).toBeTruthy()
        }
      }
    })

    for (const pair of pairs) {
      it(`${pair.foreground} on ${pair.background} clears AA`, () => {
        let bg = resolve(pair.background, blocks)
        if (pair.over) {
          bg = composite(bg, resolve(pair.over.token, blocks), pair.over.alpha)
        }
        const textToken = pair.text?.[theme as "light" | "dark"]
        const fg = resolve(textToken ?? pair.foreground, blocks)
        expect(
          contrast(fg, bg),
          `${pair.use} (${fg} on ${bg})`,
        ).toBeGreaterThanOrEqual(pair.min)
      })
    }
  })
}

describe("the bright gold rule", () => {
  it("never paints body text with a bright gold in the paper theme", () => {
    const light = THEMES.light
    const brightGolds = ["gold-200", "gold-300", "gold-500", "gold-600"].map(
      (name) => resolve(name, light),
    )
    for (const token of [
      "foreground",
      "card-foreground",
      "muted-foreground",
      "accent-foreground",
      "accent-text",
    ]) {
      expect(brightGolds, `--${token}`).not.toContain(resolve(token, light))
    }
  })
})

// Spec 0010 AC-7 and AC-4: the formation mark chips. The dots and the keeper
// are graphic objects, so they owe 3:1 against their own chip, and the auto
// chip the headers read must land on the forest pair in light and the paper
// pair in dark. The per theme loop above already measures each pair; what is
// pinned here is that all four exist and point at the right tokens.
describe("the formation mark chips (spec 0010 AC-7)", () => {
  const markPairs = CONTRAST_PAIRS.filter((pair) =>
    pair.use.includes("mark chip"),
  )

  it("proves four pairs at the 3:1 graphic floor, in both themes", () => {
    expect(markPairs).toHaveLength(4)
    for (const pair of markPairs) {
      expect(pair.min, pair.use).toBe(3)
      expect(pair.theme, pair.use).toBe("both")
    }
  })

  it("gives every chip one dots pair and one keeper pair", () => {
    const onForest = markPairs
      .filter((pair) => pair.background === "forest-700")
      .map((pair) => pair.foreground)
      .sort()
    const onPaper = markPairs
      .filter((pair) => pair.background === "paper-50")
      .map((pair) => pair.foreground)
      .sort()
    expect(onForest).toEqual(["gold-200", "paper-50"])
    expect(onPaper).toEqual(["forest-700", "gold-600"])
  })

  it("swaps the auto chip between the two proven chips by theme", () => {
    const want = {
      light: {
        chip: "forest-700",
        dots: "gold-200",
        keeper: "paper-50",
      },
      dark: { chip: "paper-50", dots: "gold-600", keeper: "forest-700" },
    } as const
    for (const [theme, expected] of Object.entries(want)) {
      const blocks = THEMES[theme as keyof typeof THEMES]
      for (const [slot, token] of Object.entries(expected)) {
        expect(
          resolve(`brand-chip${slot === "chip" ? "" : `-${slot}`}`, blocks),
          `${theme} --brand-chip-${slot}`,
        ).toBe(resolve(token, blocks))
      }
    }
  })

  it("keeps the chip values theme independent, so the mark reads alike", () => {
    for (const token of ["forest-700", "paper-50", "gold-200", "gold-600"]) {
      expect(resolve(token, THEMES.dark), `--${token}`).toBe(
        resolve(token, THEMES.light),
      )
    }
  })
})
