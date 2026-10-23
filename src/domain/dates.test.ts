import { describe, expect, it } from "vitest"

import {
  clampPaydayDay,
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
