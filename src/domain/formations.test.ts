import { describe, expect, it } from "vitest"

import { FORMATIONS, sumBasisPoints } from "./formations"

// The migration seed must pass the database sum trigger on day one (spec 0004 AC-4).
describe("built-in formations", () => {
  it("has the six built-in shapes", () => {
    expect(FORMATIONS.map((f) => f.name)).toEqual([
      "4-4-2",
      "4-3-3",
      "3-5-2",
      "4-2-3-1",
      "5-3-2",
      "5-4-1",
    ])
  })

  it.each(FORMATIONS.map((f) => [f.name, f] as const))(
    "%s sums to 10000 basis points",
    (_name, f) => {
      expect(sumBasisPoints(f)).toBe(10000)
    },
  )

  it.each(FORMATIONS.map((f) => [f.name, f] as const))(
    "%s positions are all valid spots",
    (_name, f) => {
      for (const p of f.positions) {
        expect(["GK", "DEF", "MID", "FWD", "BENCH"]).toContain(p.role)
        expect(p.basisPoints).toBeGreaterThanOrEqual(0)
        expect(p.basisPoints).toBeLessThanOrEqual(10000)
        expect(p.label.length).toBeGreaterThan(0)
      }
    },
  )
})
