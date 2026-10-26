import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

import { create } from "fontkit"
import { describe, expect, it } from "vitest"

import {
  LOCKUP_CHIP,
  LOCKUP_GLYPHS,
  PRIMARY_CHIP,
  REDUCED_CHIP,
} from "@/lib/brand-art"
import {
  CHIP_RX,
  PRIMARY_DOTS,
  PRIMARY_DOT_R,
  PRIMARY_KEEPER,
  REDUCED_DOTS,
  REDUCED_DOT_R,
  REDUCED_KEEPER,
} from "@/components/brand/geometry"

// Spec 0010 AC-6: the drawn lockup is generated, so it must agree with the
// canonical component geometry and with the live wordmark settings it is meant
// to copy. These tests read the vendored Melodrama woff2 the same way the
// generator does, which is what makes "matches the live text" checkable.

const CANVAS = { width: 736, height: 160 }
const CHIP_BOX = 128
const GAP = 28
const BASELINE_Y = 116
const CAP_HEIGHT = 72
const WEIGHT = 600
/** Tailwind tracking-tight, the live Wordmark setting. */
const TRACKING_EM = -0.025
const TEXT = "Payday Pitch"

/** Pen positions for the wordmark as the live setting would lay it out. */
async function liveWordmark(): Promise<{ scale: number; xs: number[] }> {
  const woff2 = new Uint8Array(
    await readFile(
      fileURLToPath(
        new URL(
          "../app/styles/fonts/melodrama-variable.woff2",
          import.meta.url,
        ),
      ),
    ),
  )
  const { decompress } = await import("wawoff2")
  const font = create(Buffer.from(await decompress(woff2)))
  if (!font.variationAxes?.wght) {
    throw new Error("vendored Melodrama is not a variable font")
  }
  const instance = font.getVariation({ wght: WEIGHT })
  const cap = instance.capHeight ?? instance.ascender
  const scale = CAP_HEIGHT / cap
  const tracking = TRACKING_EM * instance.unitsPerEm * scale
  const xs: number[] = []
  let pen = CHIP_BOX + GAP
  for (const pos of instance.layout(TEXT).glyphs) {
    xs.push(pen)
    pen += pos.advanceWidth * scale + tracking
  }
  return { scale, xs }
}

describe("generated geometry mirrors the canonical formation (invariant: one source)", () => {
  it("PRIMARY_CHIP is the primary tier, dot for dot", () => {
    expect(PRIMARY_CHIP.dots).toEqual(
      PRIMARY_DOTS.map(({ cx, cy }) => ({ cx, cy })),
    )
    expect(PRIMARY_CHIP.dotR).toBe(PRIMARY_DOT_R)
    expect(PRIMARY_CHIP.keeper).toEqual(PRIMARY_KEEPER)
    expect(PRIMARY_CHIP.rx).toBe(CHIP_RX)
    expect(PRIMARY_CHIP.size).toBe(512)
  })

  it("REDUCED_CHIP is the reduced tier, dot for dot", () => {
    expect(REDUCED_CHIP.dots).toEqual(
      REDUCED_DOTS.map(({ cx, cy }) => ({ cx, cy })),
    )
    expect(REDUCED_CHIP.dotR).toBe(REDUCED_DOT_R)
    expect(REDUCED_CHIP.keeper).toEqual(REDUCED_KEEPER)
    expect(REDUCED_CHIP.rx).toBe(CHIP_RX)
  })
})

describe("the lockup sits on its pinned canvas (AC-6)", () => {
  it("puts the chip in a 128 box at x 0, y 16", () => {
    expect(PRIMARY_CHIP.size * LOCKUP_CHIP.scale).toBe(CHIP_BOX)
    expect(LOCKUP_CHIP.x).toBe(0)
    expect(LOCKUP_CHIP.y).toBe(16)
    expect(LOCKUP_CHIP.y + CHIP_BOX).toBeLessThanOrEqual(CANVAS.height)
  })

  it("starts the wordmark one 28 px gap to the right of the chip", () => {
    expect(LOCKUP_GLYPHS[0]!.x).toBe(CHIP_BOX + GAP)
  })

  it("lays every glyph on the same baseline, flipped upright to the pin", () => {
    for (const glyph of LOCKUP_GLYPHS) {
      expect(glyph.y).toBe(BASELINE_Y)
      expect(glyph.sy).toBe(-glyph.sx)
    }
  })

  it("keeps the whole wordmark inside the 736 px canvas", () => {
    const xs = LOCKUP_GLYPHS.map((g) => g.x)
    expect(xs).toEqual([...xs].sort((a, b) => a - b))
    expect(xs.at(-1)).toBeLessThan(CANVAS.width)
  })

  it("draws one path per character of the name, space included", () => {
    expect(LOCKUP_GLYPHS).toHaveLength(TEXT.length)
    expect(LOCKUP_GLYPHS.filter((g) => g.d === "")).toHaveLength(1)
  })

  it("scales the glyphs to the pinned 72 px cap height", async () => {
    const { scale } = await liveWordmark()
    // The generator rounds the emitted scale to two decimals, which lands the
    // cap height at 70 px and makes the letters narrower than their spacing.
    expect(LOCKUP_GLYPHS[0]!.sx).toBeCloseTo(scale, 3)
  })

  it("spaces the letters with the live tracking-tight setting", async () => {
    const { xs: expected } = await liveWordmark()
    expect(LOCKUP_GLYPHS).toHaveLength(expected.length)
    LOCKUP_GLYPHS.forEach((glyph, i) => {
      expect(glyph.x, `glyph ${i}`).toBeCloseTo(expected[i]!, 1)
    })
  })
})

describe("the committed asset agrees with the generated module (AC-6)", () => {
  const svg = readFile(
    fileURLToPath(
      new URL("../../public/brand/lockup-horizontal.svg", import.meta.url),
    ),
    "utf8",
  )

  it("carries the pinned canvas size", async () => {
    const text = await svg
    expect(text).toContain(`width="${CANVAS.width}"`)
    expect(text).toContain(`height="${CANVAS.height}"`)
    expect(text).toContain(`viewBox="0 0 ${CANVAS.width} ${CANVAS.height}"`)
  })

  it("holds the same chip formation as the module", async () => {
    const text = await svg
    const dots = [...text.matchAll(/<circle cx="(\d+)" cy="(\d+)" r="(\d+)"/g)]
    expect(dots.map(([, cx, cy, r]) => ({ cx: +cx, cy: +cy, r: +r }))).toEqual([
      ...PRIMARY_DOTS.map(({ cx, cy }) => ({ cx, cy, r: PRIMARY_DOT_R })),
      PRIMARY_KEEPER,
    ])
  })

  it("holds one drawn path per glyph", async () => {
    const text = await svg
    expect([...text.matchAll(/<path transform=/g)]).toHaveLength(
      LOCKUP_GLYPHS.length,
    )
  })
})
