import { describe, expect, it } from "vitest"
// The `@/` import below is part of what this file proves (spec 0003, AC-7):
// the Vitest harness resolves the alias and runs pure modules under src/ with
// no React and no jsdom.
import {
  formatKobo,
  formatKoboSpoken,
  parseNaira,
  splitMatch,
  zoneShareKobo,
  type Amount,
  type SplitPosition,
} from "@/domain/money"
import { FORMATIONS } from "@/domain/formations"

const naira = (kobo: number): Amount => ({ kobo, currency: "NGN" })

describe("formatKobo", () => {
  it("renders kobo as naira with two decimals and grouping", () => {
    const salary: Amount = { kobo: 2_500_000_00, currency: "NGN" }
    expect(formatKobo(salary)).toContain("2,500,000.00")
  })

  it("renders zero without a stray fraction", () => {
    const empty: Amount = { kobo: 0, currency: "NGN" }
    expect(formatKobo(empty)).toContain("0.00")
  })

  // Money is exact integer minor units (spec 0001). Display must not round a
  // real kobo away, so the smallest amounts are the ones to watch.
  it.each([
    [1, "0.01"],
    [99, "0.99"],
    [100, "1.00"],
    [101, "1.01"],
  ])("keeps every kobo when formatting %i minor units", (kobo, expected) => {
    expect(formatKobo(naira(kobo))).toContain(expected)
  })

  it("keeps the exact fraction on a billion naira amount", () => {
    expect(formatKobo(naira(100_000_000_099))).toContain("1,000,000,000.99")
  })

  it("shows the naira symbol, not a bare number", () => {
    expect(formatKobo(naira(2_500_000_00))).toContain("₦")
  })

  // The schema allows any ISO code (spec 0004); the formatter must follow it
  // and never paint another currency as naira (audit finding 2).
  it("renders a non-naira amount in its own currency", () => {
    const dollars: Amount = { kobo: 1_000, currency: "USD" }
    const text = formatKobo(dollars)
    expect(text).not.toContain("₦")
    expect(text).toContain("10.00")
  })

  // Kobo is always hundredths (spec 0004); the displayed fraction digits
  // come from the currency code itself, not a forced two.
  it("uses the currency's own fraction digits", () => {
    const yen = formatKobo({ kobo: 100_000, currency: "JPY" })
    expect(yen).toContain("1,000")
    expect(yen).not.toMatch(/\.\d/)
    expect(formatKobo({ kobo: 100_000, currency: "KWD" })).toContain(
      "1,000.000",
    )
  })
})

describe("formatKoboSpoken", () => {
  it("says naira, never the symbol", () => {
    expect(formatKoboSpoken(naira(4_500_000))).toBe("45,000 naira")
  })

  it("floors the fraction instead of rounding it up", () => {
    expect(formatKoboSpoken(naira(50))).toBe("0 naira")
    expect(formatKoboSpoken(naira(4_500_099))).toBe("45,000 naira")
  })

  it("names other currencies by their code", () => {
    expect(formatKoboSpoken({ kobo: 1_000, currency: "USD" })).toBe("10 USD")
  })
})

describe("parseNaira", () => {
  it("accepts whole naira and up to two decimals", () => {
    expect(parseNaira("45000")).toBe(4_500_000)
    expect(parseNaira("45000.5")).toBe(4_500_050)
    expect(parseNaira("45000.50")).toBe(4_500_050)
    expect(parseNaira("0.01")).toBe(1)
  })

  it("rejects precision beyond kobo, zero, negatives, and junk", () => {
    expect(parseNaira("45000.500")).toBeNull()
    expect(parseNaira("-1")).toBeNull()
    expect(parseNaira("0")).toBeNull()
    expect(parseNaira("0.00")).toBeNull()
    expect(parseNaira("abc")).toBeNull()
    expect(parseNaira("")).toBeNull()
    expect(parseNaira("1,000")).toBeNull()
    expect(parseNaira("1e3")).toBeNull()
    expect(parseNaira(" 45000")).toBeNull()
  })

  // Spec 0007 AC-6: an entered actual of 0.00 means "moved nothing", a stored
  // zero rather than a rejected amount. Only the caller that collects
  // actuals says zero counts.
  it("takes zero when the caller says zero is a real answer", () => {
    expect(parseNaira("0", true)).toBe(0)
    expect(parseNaira("0.00", true)).toBe(0)
    expect(parseNaira("0.000", true)).toBeNull()
    expect(parseNaira("-1", true)).toBeNull()
  })
})

describe("zoneShareKobo", () => {
  it("floors, never rounds up", () => {
    expect(zoneShareKobo(10_000, 5000)).toBe(5_000)
    expect(zoneShareKobo(19_999, 5000)).toBe(9_999)
    expect(zoneShareKobo(10_000, 4999)).toBe(4_999)
  })
})

// The real 4-4-2 seed, spot index aligned: DEF zone is 4000 bps (40%).
const fourFourTwo: SplitPosition[] = FORMATIONS[0].positions.map(
  (p, spotIndex) => ({ ...p, spotIndex }),
)

describe("splitMatch", () => {
  const income = 12_000_000 // ₦120,000
  const costs = 4_000_000 // ₦40,000, inside the 40% defense share

  it("sums to the income kobo for kobo and covers defense exactly", () => {
    const { lines, shortfallKobo } = splitMatch(fourFourTwo, income, costs)
    expect(shortfallKobo).toBeNull()
    expect(lines).toHaveLength(12)
    expect(lines.reduce((s, l) => s + l.plannedKobo, 0)).toBe(income)
    const defTotal = lines
      .filter((l) => l.role === "DEF")
      .reduce((s, l) => s + l.plannedKobo, 0)
    expect(defTotal).toBe(costs)
  })

  // Regression: the pitch zips amounts with positions by index, so a defense
  // first line up put a defender's number on the keeper's shirt.
  it("returns lines in spot order, index aligned with the positions in", () => {
    const { lines } = splitMatch(fourFourTwo, income, costs)
    expect(lines.map((l) => l.spotIndex)).toEqual(fourFourTwo.map((_, i) => i))
    expect(lines[0].role).toBe("GK")
    expect(lines[1].role).toBe("DEF")
    expect(lines[11].role).toBe("BENCH")
  })

  it("keeps every planned amount non-negative and integer", () => {
    const { lines } = splitMatch(fourFourTwo, income, costs)
    for (const line of lines) {
      expect(Number.isInteger(line.plannedKobo)).toBe(true)
      expect(line.plannedKobo).toBeGreaterThanOrEqual(0)
    }
  })

  it("stays exact on an awkward remainder (4-3-3 midfield 667/666/667)", () => {
    const threeThree: SplitPosition[] = FORMATIONS[1].positions.map(
      (p, spotIndex) => ({ ...p, spotIndex }),
    )
    const { lines } = splitMatch(threeThree, 10_000_001, 4_000_000)
    expect(lines.reduce((s, l) => s + l.plannedKobo, 0)).toBe(10_000_001)
  })

  it("breaks a remainder tie by lower spot index first, deterministically", () => {
    // Two equal DEF spots sharing an odd pool: the extra kobo is always the
    // lower spot's, across repeated runs.
    const spots: SplitPosition[] = [
      { role: "DEF", spotIndex: 1, label: "A", basisPoints: 5000 },
      { role: "DEF", spotIndex: 2, label: "B", basisPoints: 5000 },
      { role: "GK", spotIndex: 0, label: "Keeper", basisPoints: 10000 },
    ]
    for (let run = 0; run < 5; run++) {
      const { lines } = splitMatch(spots, 202, 101)
      const def = lines.filter((l) => l.role === "DEF")
      expect(def.find((l) => l.spotIndex === 1)!.plannedKobo).toBe(51)
      expect(def.find((l) => l.spotIndex === 2)!.plannedKobo).toBe(50)
    }
  })

  it("refuses when the defense floor is out of reach, with the shortfall", () => {
    // AC-5: 4-4-2 DEF share of ₦120,000 is ₦48,000; ₦50,000 rent cannot fit.
    const { lines, shortfallKobo } = splitMatch(fourFourTwo, income, 5_000_000)
    expect(shortfallKobo).toBe(200_000)
    expect(lines).toEqual([])
  })

  it("covers at the exact floor boundary", () => {
    // Costs equal to the floored zone share fit: no shortfall.
    const { shortfallKobo } = splitMatch(fourFourTwo, income, 4_800_000)
    expect(shortfallKobo).toBeNull()
  })

  it("handles zero costs (defense zone gets nothing, rest takes all)", () => {
    const { lines } = splitMatch(fourFourTwo, income, 0)
    expect(lines.reduce((s, l) => s + l.plannedKobo, 0)).toBe(income)
    for (const line of lines.filter((l) => l.role === "DEF")) {
      expect(line.plannedKobo).toBe(0)
    }
  })
})
