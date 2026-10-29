import { describe, expect, it } from "vitest"

import {
  clampPaydayDay,
  clippedWeeks,
  currentLagosPeriod,
  daysInLagosMonth,
} from "@/domain/dates"

describe("currentLagosPeriod", () => {
  // Lagos is UTC+1 with no DST: a UTC evening crosses the month boundary
  // a full hour before the UTC clock does.
  it("rolls to the next Lagos month on a UTC boundary evening", () => {
    expect(currentLagosPeriod(new Date("2026-10-31T23:30:00Z"))).toBe(
      "2026-11-01",
    )
  })

  it("keeps the UTC month while Lagos is still inside it", () => {
    expect(currentLagosPeriod(new Date("2026-10-31T22:59:59Z"))).toBe(
      "2026-10-01",
    )
    expect(currentLagosPeriod(new Date("2026-11-01T00:00:00Z"))).toBe(
      "2026-11-01",
    )
  })

  it("rolls the year at the Lagos new year", () => {
    expect(currentLagosPeriod(new Date("2026-12-31T23:30:00Z"))).toBe(
      "2027-01-01",
    )
  })
})

describe("daysInLagosMonth", () => {
  it("counts a common February", () => {
    expect(daysInLagosMonth("2026-02-01")).toBe(28)
  })

  it("counts a leap February", () => {
    expect(daysInLagosMonth("2028-02-01")).toBe(29)
  })

  it("rolls December into the next January", () => {
    expect(daysInLagosMonth("2026-12-01")).toBe(31)
  })
})

describe("clampPaydayDay", () => {
  it("pulls a 31st payday onto the last day of a short month", () => {
    expect(clampPaydayDay(31, "2026-02-01")).toBe(28)
    expect(clampPaydayDay(30, "2026-02-01")).toBe(28)
  })

  it("leaves a day the month has alone", () => {
    expect(clampPaydayDay(25, "2026-02-01")).toBe(25)
    expect(clampPaydayDay(31, "2026-01-01")).toBe(31)
  })
})

// Spec 0011 AC-7: Monday to Sunday weeks clipped to the month.
describe("clippedWeeks", () => {
  it("opens with a one day week when the month starts on a Sunday", () => {
    expect(clippedWeeks("2026-11")[0]).toEqual({
      startsOn: "2026-11-01",
      endsOn: "2026-11-01",
      days: 1,
    })
  })

  it("opens with a full week when the month starts on a Monday", () => {
    const weeks = clippedWeeks("2026-06")
    expect(weeks.map((w) => w.days)).toEqual([7, 7, 7, 7, 2])
    expect(weeks.at(-1)?.endsOn).toBe("2026-06-30")
  })

  it("covers every day of the month exactly once, leap February included", () => {
    for (const month of ["2026-02", "2028-02", "2026-11", "2026-12"]) {
      const weeks = clippedWeeks(month)
      const total = weeks.reduce((a, w) => a + w.days, 0)
      expect(total).toBe(daysInLagosMonth(`${month}-01`))
      expect(weeks[0].startsOn).toBe(`${month}-01`)
    }
  })

  it("ends every week but the last on a Sunday", () => {
    for (const w of clippedWeeks("2026-12").slice(0, -1)) {
      expect(new Date(`${w.endsOn}T00:00:00Z`).getUTCDay()).toBe(0)
    }
  })
})
