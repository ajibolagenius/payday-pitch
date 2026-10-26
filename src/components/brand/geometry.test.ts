import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import {
  CHIP_RX,
  LINEUP_BOX,
  LINEUP_DOTS,
  LINEUP_DOT_R,
  LINEUP_KEEPER,
  PRIMARY_DOTS,
  PRIMARY_DOT_R,
  PRIMARY_KEEPER,
  REDUCED_DOTS,
  REDUCED_DOT_R,
  REDUCED_KEEPER,
} from "./geometry"

// Spec 0010. The component and the master SVGs share one set of coordinates,
// so these tests read both and prove they agree: a formation edited on one
// side and not the other fails here instead of shipping two brands. The
// raster sizes themselves are judged in the browser (tests/e2e/brand.spec.ts).

type Circle = { cx: number; cy: number; r: number }

const asset = (rel: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../${rel}`, import.meta.url)),
    "utf8",
  )

/** One numeric attribute of a tag, NaN when absent. */
function numAttr(tag: string, name: string): number {
  return Number(new RegExp(`${name}="(-?[\\d.]+)"`).exec(tag)?.[1])
}

/** Every circle in an SVG, in document order, with the attributes it carries. */
function circles(svg: string): Circle[] {
  return [...svg.matchAll(/<circle[^>]*>/g)].map(([tag]) => ({
    cx: numAttr(tag, "cx"),
    cy: numAttr(tag, "cy"),
    r: numAttr(tag, "r"),
  }))
}

function attr(svg: string, name: string): string | undefined {
  return svg.match(new RegExp(`${name}="([^"]+)"`))?.[1]
}

/** The transform the maskable master puts on the formation group. */
function formationTransform(svg: string): {
  tx: number
  ty: number
  scale: number
} {
  const group = [...svg.matchAll(/<g transform="([^"]+)"/g)]
    .map(([, t]) => t)
    .find((t) => t.includes("scale"))
  if (!group) throw new Error("no scaled group in the maskable master")
  const translate = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(group)
  const scale = /scale\(([-\d.]+)\)/.exec(group)
  return {
    tx: Number(translate?.[1]),
    ty: Number(translate?.[2]),
    scale: Number(scale?.[1]),
  }
}

const toCircles = (
  dots: ReadonlyArray<{ cx: number; cy: number }>,
  r: number,
) => dots.map((d) => ({ ...d, r }))

describe("the primary formation (AC-1)", () => {
  it("lines up ten outfield dots as rows of 3, 3 and 4", () => {
    const rows = [118, 220, 322].map(
      (cy) => PRIMARY_DOTS.filter((dot) => dot.cy === cy).length,
    )
    expect(rows).toEqual([3, 3, 4])
    expect(PRIMARY_DOTS).toHaveLength(10)
  })

  it("keeps one keeper alone at the base, below the deepest row", () => {
    expect(PRIMARY_KEEPER.cx).toBe(256)
    expect(PRIMARY_KEEPER.cy).toBeGreaterThan(322)
    expect(PRIMARY_DOTS.some((dot) => dot.cy === PRIMARY_KEEPER.cy)).toBe(false)
  })

  it("spaces the rows 102 apart and gives the keeper 114 of breathing room", () => {
    const rowGaps = [220 - 118, 322 - 220]
    expect(rowGaps).toEqual([102, 102])
    expect(PRIMARY_KEEPER.cy - 322).toBe(114)
    expect(PRIMARY_KEEPER.r).toBeGreaterThan(PRIMARY_DOT_R)
  })

  it("keeps every dot inside the 512 chip", () => {
    for (const dot of [
      ...toCircles(PRIMARY_DOTS, PRIMARY_DOT_R),
      PRIMARY_KEEPER,
    ]) {
      expect(dot.cx - dot.r).toBeGreaterThanOrEqual(0)
      expect(dot.cy - dot.r).toBeGreaterThanOrEqual(0)
      expect(dot.cx + dot.r).toBeLessThanOrEqual(512)
      expect(dot.cy + dot.r).toBeLessThanOrEqual(512)
    }
  })
})

describe("the reduced formation (AC-1)", () => {
  it("drops to three dots over two with the keeper", () => {
    expect(REDUCED_DOTS.filter((d) => d.cy === 160)).toHaveLength(3)
    expect(REDUCED_DOTS.filter((d) => d.cy === 292)).toHaveLength(2)
    expect(REDUCED_DOTS).toHaveLength(5)
  })

  it("draws fatter dots and a fatter keeper so it survives small sizes", () => {
    expect(REDUCED_DOT_R).toBeGreaterThan(PRIMARY_DOT_R)
    expect(REDUCED_KEEPER.r).toBeGreaterThan(PRIMARY_KEEPER.r)
  })

  it("keeps every dot inside the 512 chip", () => {
    for (const dot of [
      ...toCircles(REDUCED_DOTS, REDUCED_DOT_R),
      REDUCED_KEEPER,
    ]) {
      expect(dot.cx - dot.r).toBeGreaterThanOrEqual(0)
      expect(dot.cy + dot.r).toBeLessThanOrEqual(512)
    }
  })
})

describe("the line-up (AC-6)", () => {
  it("sets ten dots at equal 37 px steps in one row", () => {
    expect(LINEUP_DOTS).toHaveLength(10)
    expect(new Set(LINEUP_DOTS.map((d) => d.cy))).toEqual(new Set([72]))
    const steps = LINEUP_DOTS.slice(1).map((d, i) => d.cx - LINEUP_DOTS[i]!.cx)
    expect(steps).toEqual(steps.map(() => 37))
  })

  it("leads with the keeper on the left, larger than the row", () => {
    expect(LINEUP_KEEPER.cx).toBeLessThan(LINEUP_DOTS[0]!.cx)
    expect(LINEUP_KEEPER.cy).toBe(72)
    expect(LINEUP_KEEPER.r).toBeGreaterThan(LINEUP_DOT_R)
  })

  it("fits the 512 by 144 band with the keeper edge included", () => {
    const last = LINEUP_DOTS[LINEUP_DOTS.length - 1]!
    expect(LINEUP_KEEPER.cx - LINEUP_KEEPER.r).toBeGreaterThanOrEqual(0)
    expect(last.cx + LINEUP_DOT_R).toBeLessThanOrEqual(LINEUP_BOX.width)
    expect(LINEUP_KEEPER.cy + LINEUP_KEEPER.r).toBeLessThanOrEqual(
      LINEUP_BOX.height,
    )
  })
})

describe("the masters carry the same coordinates as the component", () => {
  it("master.svg is the primary formation on a rounded forest chip", () => {
    const svg = asset("public/icons/master.svg")
    expect(circles(svg)).toEqual([
      ...toCircles(PRIMARY_DOTS, PRIMARY_DOT_R),
      PRIMARY_KEEPER,
    ])
    expect(Number(attr(svg, "rx"))).toBe(CHIP_RX)
    expect(Number(attr(svg, "width"))).toBe(512)
  })

  it("master-reduced.svg is the reduced formation", () => {
    const svg = asset("public/icons/master-reduced.svg")
    expect(circles(svg)).toEqual([
      ...toCircles(REDUCED_DOTS, REDUCED_DOT_R),
      REDUCED_KEEPER,
    ])
    expect(Number(attr(svg, "rx"))).toBe(CHIP_RX)
  })

  it("lineup.svg is the single row with the keeper leading", () => {
    const svg = asset("public/brand/lineup.svg")
    expect(circles(svg)).toEqual([
      ...toCircles(LINEUP_DOTS, LINEUP_DOT_R),
      LINEUP_KEEPER,
    ])
    expect(attr(svg, "viewBox")).toBe(
      `0 0 ${LINEUP_BOX.width} ${LINEUP_BOX.height}`,
    )
  })
})

describe("the maskable safe zone (AC-2)", () => {
  const svg = asset("public/icons/master-maskable.svg")
  const { tx, ty, scale } = formationTransform(svg)
  const CENTER = 256
  /** What a launcher may keep: radius 156 of the 512 bleed. */
  const SAFE_RADIUS = 156

  it("scales the formation to 0.72 or smaller", () => {
    expect(scale).toBeLessThanOrEqual(0.72)
  })

  it("paints the forest chip full bleed, with no corner radius to lose", () => {
    expect(svg).not.toContain("rx=")
    expect(Number(attr(svg, "width"))).toBe(512)
  })

  it("keeps every dot, the keeper edge included, inside the safe circle", () => {
    const shapes = [...toCircles(PRIMARY_DOTS, PRIMARY_DOT_R), PRIMARY_KEEPER]
    const reach = shapes.map(({ cx, cy, r }) => {
      const dx = tx + cx * scale - CENTER
      const dy = ty + cy * scale - CENTER
      return Math.hypot(dx, dy) + r * scale
    })
    const deepest = Math.max(...reach)
    expect(deepest).toBeLessThanOrEqual(SAFE_RADIUS)
    // The keeper is the deepest element, the measurement the spec names.
    expect(reach.indexOf(deepest)).toBe(shapes.length - 1)
  })

  it("centres the scaled formation on the bleed", () => {
    expect(tx).toBeCloseTo((512 * (1 - scale)) / 2, 2)
    expect(ty).toBeCloseTo((512 * (1 - scale)) / 2, 2)
  })
})

describe("the old ball is gone (AC-9)", () => {
  const brandArt = [
    "public/icons/master.svg",
    "public/icons/master-reduced.svg",
    "public/icons/master-maskable.svg",
    "public/brand/lineup.svg",
    "src/components/brand/geometry.ts",
    "src/components/brand/index.tsx",
    "src/lib/brand-art.ts",
    "src/emails/brand-art.tsx",
    "src/app/offline/page.tsx",
    "supabase/templates/confirmation.html",
    "supabase/templates/recovery.html",
  ]

  it("no brand surface still carries the old seam path", () => {
    for (const file of brandArt) {
      expect(asset(file), file).not.toContain("M256 206")
    }
  })

  it("the masters are formation dots only, ten or five plus a keeper", () => {
    for (const file of [
      "public/icons/master.svg",
      "public/icons/master-reduced.svg",
      "public/icons/master-maskable.svg",
    ]) {
      const count = circles(asset(file)).length
      expect([5, 6, 10, 11], file).toContain(count)
    }
  })
})
