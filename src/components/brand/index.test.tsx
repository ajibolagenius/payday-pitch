// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  LINEUP_DOTS,
  LINEUP_DOT_R,
  PRIMARY_DOTS,
  PRIMARY_DOT_R,
  REDUCED_DOTS,
  REDUCED_DOT_R,
} from "@/components/brand/geometry"
import { BrandMark, Lineup, Wordmark } from "@/components/brand"

// Spec 0010, the component half of the brand system. The marks paint raw ramp
// variables, never hex, and the theme swap is a token read rather than a
// second file, so the fills are the contract here and are asserted directly.
// Coordinates are the other half: one geometry source shared with the masters.

afterEach(cleanup)

function markSvg(ui: React.ReactElement): SVGSVGElement {
  const { container } = render(ui)
  const svg = container.querySelector("svg")
  if (!svg) throw new Error("no svg rendered")
  return svg as SVGSVGElement
}

const fills = (svg: SVGSVGElement) => ({
  chip: svg.querySelector("rect")?.getAttribute("fill"),
  dots: svg.querySelector("g")?.getAttribute("fill"),
  keeper: [...svg.querySelectorAll("circle")].at(-1)?.getAttribute("fill"),
})

describe("BrandMark tiers (AC-1)", () => {
  it("draws the primary tier as eleven formation dots on the chip", () => {
    const svg = markSvg(<BrandMark tier="primary" />)
    expect(svg.querySelectorAll("circle")).toHaveLength(11)
    expect(svg.getAttribute("viewBox")).toBe("0 0 512 512")
    expect(svg.querySelector("rect")?.getAttribute("rx")).toBe("112")
  })

  it("draws the reduced tier as six dots for the small slots", () => {
    const svg = markSvg(<BrandMark tier="reduced" />)
    expect(svg.querySelectorAll("circle")).toHaveLength(6)
  })

  it("places the primary dots at the canonical coordinates", () => {
    const svg = markSvg(<BrandMark tier="primary" />)
    const dots = [...svg.querySelectorAll("g circle")].map((c) => ({
      cx: Number(c.getAttribute("cx")),
      cy: Number(c.getAttribute("cy")),
      r: Number(c.getAttribute("r")),
    }))
    expect(dots).toEqual(
      PRIMARY_DOTS.map(({ cx, cy }) => ({ cx, cy, r: PRIMARY_DOT_R })),
    )
  })

  it("places the reduced dots at the canonical coordinates", () => {
    const svg = markSvg(<BrandMark tier="reduced" />)
    const dots = [...svg.querySelectorAll("g circle")].map((c) => ({
      cx: Number(c.getAttribute("cx")),
      cy: Number(c.getAttribute("cy")),
      r: Number(c.getAttribute("r")),
    }))
    expect(dots).toEqual(
      REDUCED_DOTS.map(({ cx, cy }) => ({ cx, cy, r: REDUCED_DOT_R })),
    )
  })
})

describe("BrandMark chips (AC-4, AC-7)", () => {
  it("paints the forest chip with gold 200 dots and a paper keeper", () => {
    expect(fills(markSvg(<BrandMark tier="primary" chip="forest" />))).toEqual({
      chip: "var(--forest-700)",
      dots: "var(--gold-200)",
      keeper: "var(--paper-50)",
    })
  })

  it("paints the paper chip with gold 600 dots and a forest keeper", () => {
    expect(fills(markSvg(<BrandMark tier="primary" chip="paper" />))).toEqual({
      chip: "var(--paper-50)",
      dots: "var(--gold-600)",
      keeper: "var(--forest-700)",
    })
  })

  it("defaults to the forest chip when a surface names none", () => {
    expect(fills(markSvg(<BrandMark tier="reduced" />)).chip).toBe(
      "var(--forest-700)",
    )
  })

  it("reads the auto chip from the theme tokens so one mark serves both themes", () => {
    expect(fills(markSvg(<BrandMark tier="primary" chip="auto" />))).toEqual({
      chip: "var(--brand-chip)",
      dots: "var(--brand-chip-dots)",
      keeper: "var(--brand-chip-keeper)",
    })
  })

  it("writes no hex literal anywhere in the rendered art", () => {
    for (const svg of [
      markSvg(<BrandMark tier="primary" chip="forest" />),
      markSvg(<BrandMark tier="primary" chip="paper" />),
      markSvg(<BrandMark tier="primary" chip="auto" />),
      markSvg(<BrandMark tier="reduced" chip="auto" />),
    ]) {
      expect(svg.outerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })
})

describe("BrandMark accessibility (AC-1)", () => {
  it("exposes the label as the image name when the mark carries meaning", () => {
    render(
      <BrandMark tier="primary" label="Payday Pitch" className="size-16" />,
    )
    expect(
      screen.getByRole("img", { name: "Payday Pitch" }),
    ).toBeInTheDocument()
  })

  it("stays silent when a wordmark beside it already names the brand", () => {
    const svg = markSvg(<BrandMark tier="reduced" chip="auto" />)
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).not.toHaveAttribute("role", "img")
    expect(screen.queryByRole("img")).toBeNull()
  })
})

describe("Wordmark (AC-5)", () => {
  it("sets the name as live text in sentence case", () => {
    render(<Wordmark />)
    expect(screen.getByText("Payday Pitch")).toBeInTheDocument()
  })

  it("carries the pinned type setting: heading face, weight 600, tight tracking", () => {
    const text = render(<Wordmark />).getByText("Payday Pitch")
    // The classes are the setting: font-heading is Melodrama, font-semibold is
    // 600, tracking-tight is the -0.025em the drawn lockup must match.
    expect(text.className).toContain("font-heading")
    expect(text.className).toContain("font-semibold")
    expect(text.className).toContain("tracking-tight")
  })

  it("lets a surface size and colour it without changing the setting", () => {
    const text = render(
      <Wordmark className="text-xl" style={{ color: "var(--paper-50)" }} />,
    ).getByText("Payday Pitch")
    expect(text.className).toContain("text-xl")
    expect(text.className).toContain("tracking-tight")
    expect(text.getAttribute("style")).toContain("var(--paper-50)")
  })
})

describe("Lineup (AC-6)", () => {
  it("draws the eleven in one row on the forest band", () => {
    const svg = markSvg(<Lineup />)
    expect(svg.getAttribute("viewBox")).toBe("0 0 512 144")
    expect(svg.querySelectorAll("circle")).toHaveLength(11)
    expect(svg.querySelector("rect")?.getAttribute("fill")).toBe(
      "var(--forest-700)",
    )
    expect(svg.querySelector("g")?.getAttribute("fill")).toBe("var(--gold-200)")
  })

  it("paces the row at the canonical 37 px steps", () => {
    const svg = markSvg(<Lineup />)
    const xs = [...svg.querySelectorAll("g circle")].map((c) =>
      Number(c.getAttribute("cx")),
    )
    expect(xs).toEqual(LINEUP_DOTS.map((d) => d.cx))
    expect(svg.querySelector("g circle")?.getAttribute("r")).toBe(
      String(LINEUP_DOT_R),
    )
  })

  it("is decoration, not content", () => {
    const svg = markSvg(<Lineup />)
    expect(svg).toHaveAttribute("aria-hidden", "true")
  })
})
