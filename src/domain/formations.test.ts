import { describe, expect, it } from "vitest"

import {
  FORMATIONS,
  formationSlotCoordinates,
  sumBasisPoints,
} from "./formations"

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

// The pitch view contract (spec 0005, AC-5): every formation has a slot for
// each of its 12 positions, placeable without overlap.
describe("formationSlotCoordinates", () => {
  it.each(FORMATIONS.map((f) => [f.name] as const))(
    "%s returns 12 slots in seed order",
    (name) => {
      const coords = formationSlotCoordinates(name)
      expect(coords).toHaveLength(12)
      if (!coords) return // unreachable: the seeded six all have coordinates
      expect(coords[0]).toEqual({ x: 50, y: 90 })
      // The bench slot is a percent of the strip below the field, not the grass.
      expect(coords[11]).toEqual({ x: 50, y: 60 })
    },
  )

  it.each(FORMATIONS.map((f) => [f.name] as const))(
    "%s keeps all 11 pitch slots inside the drawable area",
    (name) => {
      const pitch = formationSlotCoordinates(name)?.slice(0, 11) ?? []
      expect(pitch).toHaveLength(11)
      for (const p of pitch) {
        expect(p.x).toBeGreaterThanOrEqual(5)
        expect(p.x).toBeLessThanOrEqual(95)
        expect(p.y).toBeGreaterThanOrEqual(5)
        expect(p.y).toBeLessThanOrEqual(95)
      }
    },
  )

  it.each(FORMATIONS.map((f) => [f.name] as const))(
    "%s spaces pitch slots at least 8 percent apart",
    (name) => {
      const pitch = formationSlotCoordinates(name)?.slice(0, 11) ?? []
      for (const [i, p] of pitch.entries()) {
        for (const q of pitch.slice(i + 1)) {
          expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThanOrEqual(8)
        }
      }
    },
  )

  it("knows no other formation", () => {
    expect(formationSlotCoordinates("4-4-2-lie")).toBeUndefined()
  })
})
