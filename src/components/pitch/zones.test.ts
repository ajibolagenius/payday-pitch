// The shared zone words and the one way a share reads as a percentage
// (spec 0008). The walk's picker and the board both render through `percent`,
// so a share must never read as two different numbers depending on the door.
import { describe, expect, it } from "vitest"

import { ZONE_WORD, percent } from "./zones"

describe("percent: basis points read as a share", () => {
  it("writes a whole share without decimals", () => {
    expect(percent(4000)).toBe("40%")
    expect(percent(10000)).toBe("100%")
    expect(percent(0)).toBe("0%")
  })

  it("keeps one decimal when the share needs it", () => {
    // 50 bps is half a percent: the stepper step as the person sees it (AC-1).
    expect(percent(50)).toBe("0.5%")
    expect(percent(750)).toBe("7.5%")
  })

  it("keeps two decimals and drops a trailing zero", () => {
    expect(percent(333)).toBe("3.33%")
    expect(percent(5)).toBe("0.05%")
    // 350 is 3.50, and the trailing zero is not the person's business.
    expect(percent(350)).toBe("3.5%")
  })

  it("carries the sign for a share below zero", () => {
    expect(percent(-50)).toBe("-0.5%")
  })
})

describe("ZONE_WORD", () => {
  it("names the five zones in the words the app uses", () => {
    expect(ZONE_WORD).toEqual({
      GK: "Keeper",
      DEF: "Defence",
      MID: "Midfield",
      FWD: "Attack",
      BENCH: "Bench",
    })
  })
})
