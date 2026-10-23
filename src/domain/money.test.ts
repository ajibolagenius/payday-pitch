import { describe, expect, it } from "vitest"
// The `@/` import below is part of what this file proves (spec 0003, AC-7):
// the Vitest harness resolves the alias and runs pure modules under src/ with
// no React and no jsdom.
import { formatKobo, formatKoboSpoken, type Amount } from "@/domain/money"

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
