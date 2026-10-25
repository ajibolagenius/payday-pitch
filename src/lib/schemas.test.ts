// The tactic payload schemas (spec 0008 AC-2). The name bounds are the
// contract: a 40 character name must fail here, before any database call. The
// split deliberately stays half unvalidated: its values belong to splitProblem,
// which answers invalid_split for the whole payload rather than a field error.
import { describe, expect, it } from "vitest"

import { tacticName, tacticSplit } from "./schemas"

describe("tacticName (AC-2)", () => {
  it("accepts a plain name and trims it", () => {
    expect(tacticName.parse("  My 4-4-2 ")).toBe("My 4-4-2")
  })

  it("takes the full 30 characters and refuses one more", () => {
    expect(tacticName.parse("x".repeat(30))).toBe("x".repeat(30))
    expect(tacticName.safeParse("x".repeat(31)).success).toBe(false)
  })

  it("refuses an empty or whitespace name with the copy the form shows", () => {
    const empty = tacticName.safeParse("")
    expect(empty.success).toBe(false)
    expect(empty.error?.issues[0]?.message).toBe("Name your tactic.")
    expect(tacticName.safeParse("   ").success).toBe(false)
  })

  it("refuses a non string", () => {
    expect(tacticName.safeParse(42).success).toBe(false)
  })
})

describe("tacticSplit", () => {
  it("lets a full split through with its keys untouched", () => {
    const split = [
      { role: "GK", spot_index: 0, label: "Fund", basis_points: 1000 },
      { role: "DEF", spot_index: 1, label: "Right Back", basis_points: 4000 },
      { role: "BENCH", spot_index: 2, label: "Sub", basis_points: 5000 },
    ]
    expect(tacticSplit.parse(split)).toEqual(split)
  })

  it("lets an empty array reach the domain check instead of a field error", () => {
    // The count problem belongs to splitProblem, so a payload with no spots
    // must parse here; the save answers invalid_split, not a Zod message.
    expect(tacticSplit.safeParse([]).success).toBe(true)
  })

  it("carries unknown values without coercing them", () => {
    // Half validated on purpose: a string basis point survives the schema and
    // is refused by splitProblem as share.
    const odd = [{ role: 3, spot_index: "0", label: null, basis_points: "10" }]
    expect(tacticSplit.safeParse(odd).success).toBe(true)
  })

  it("refuses a payload that is not an array", () => {
    expect(tacticSplit.safeParse({ role: "GK" }).success).toBe(false)
  })
})
