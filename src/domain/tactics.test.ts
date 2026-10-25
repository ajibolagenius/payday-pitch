import { describe, expect, it } from "vitest"

import { FORMATIONS } from "./formations"
import type { SplitPosition } from "./money"
import {
  boardWarnings,
  editShare,
  fundMonths,
  setShare,
  shareCeilingBps,
  splitProblem,
  suggestFormation,
  type RawSplitItem,
} from "./tactics"

// The board edits the real 4-4-2, so a seed change shows up here rather than
// silently in production copy. Spot index is the array position, the order the
// library read guarantees (GK, DEF, MID, FWD, BENCH).
function base442(): SplitPosition[] {
  const shape = FORMATIONS.find((f) => f.name === "4-4-2")
  if (!shape) throw new Error("4-4-2 missing from the seed")
  return shape.positions.map((position, spotIndex) => ({
    ...position,
    spotIndex,
  }))
}

function total(spots: SplitPosition[]): number {
  return spots.reduce((sum, spot) => sum + spot.basisPoints, 0)
}

function zone(spots: SplitPosition[], role: SplitPosition["role"]): number {
  return spots
    .filter((spot) => spot.role === role)
    .reduce((sum, spot) => sum + spot.basisPoints, 0)
}

const bps = (spots: SplitPosition[], spotIndex: number): number =>
  spots.find((spot) => spot.spotIndex === spotIndex)!.basisPoints

describe("editShare: the total always reaches 10000 (AC-4)", () => {
  it("takes a forward raise from the bench", () => {
    const { spots } = editShare(base442(), 9, 250)
    expect(bps(spots, 9)).toBe(1000)
    expect(bps(spots, 11)).toBe(250)
    expect(total(spots)).toBe(10000)
  })

  it("leaves the defense pool untouched", () => {
    const { spots } = editShare(base442(), 9, 250)
    expect(zone(spots, "DEF")).toBe(4000)
    expect(
      spots.filter((s) => s.role === "DEF").map((s) => s.basisPoints),
    ).toEqual([1000, 1000, 1000, 1000])
  })

  it("moves on to the largest other spot once the bench is empty", () => {
    // Bench holds 500, so a 700 raise drains it and takes 200 from the biggest
    // remaining holder, which is the goalkeeper at 1000.
    const { spots } = editShare(base442(), 9, 700)
    expect(bps(spots, 11)).toBe(0)
    expect(bps(spots, 9)).toBe(1450)
    expect(bps(spots, 0)).toBe(800)
    expect(bps(spots, 5)).toBe(750)
    expect(total(spots)).toBe(10000)
  })

  it("breaks a tie on the lowest spot index", () => {
    const flat: SplitPosition[] = [
      { role: "DEF", label: "Back Four", spotIndex: 0, basisPoints: 4000 },
      { role: "GK", label: "Fund", spotIndex: 1, basisPoints: 2000 },
      { role: "MID", label: "Wide", spotIndex: 2, basisPoints: 2000 },
      { role: "MID", label: "Central", spotIndex: 3, basisPoints: 2000 },
      { role: "BENCH", label: "Guilt-Free", spotIndex: 4, basisPoints: 0 },
    ]
    // The bench is empty, so the take over looks at the two equal holders and
    // picks the lower spot index.
    const { spots } = editShare(flat, 2, 300)
    expect(bps(spots, 1)).toBe(1700)
    expect(bps(spots, 3)).toBe(2000)
    expect(bps(spots, 2)).toBe(2300)
    expect(total(spots)).toBe(10000)
  })

  it("gives a lowering back to the bench and nowhere else", () => {
    const { spots } = editShare(base442(), 9, -300)
    expect(bps(spots, 9)).toBe(450)
    expect(bps(spots, 11)).toBe(800)
    expect(bps(spots, 0)).toBe(1000)
    expect(bps(spots, 5)).toBe(750)
    expect(total(spots)).toBe(10000)
  })

  it("trades a bench raise with the largest forward line spot", () => {
    const { spots } = editShare(base442(), 11, 400)
    expect(bps(spots, 11)).toBe(900)
    expect(bps(spots, 0)).toBe(600)
    expect(zone(spots, "DEF")).toBe(4000)
    expect(total(spots)).toBe(10000)
  })

  it("trades a bench lowering with the same spot", () => {
    const { spots } = editShare(base442(), 11, -300)
    expect(bps(spots, 11)).toBe(200)
    expect(bps(spots, 0)).toBe(1300)
    expect(total(spots)).toBe(10000)
  })
})

describe("editShare: the locked defense pool (AC-1, AC-4)", () => {
  it("moves a defender raise out of another defender only", () => {
    const { spots } = editShare(base442(), 1, 200)
    expect(bps(spots, 1)).toBe(1200)
    // All three other defenders hold 1000, so the tie goes to the lowest index.
    expect(bps(spots, 2)).toBe(800)
    expect(bps(spots, 3)).toBe(1000)
    expect(bps(spots, 4)).toBe(1000)
    expect(zone(spots, "DEF")).toBe(4000)
    expect(bps(spots, 11)).toBe(500)
    expect(total(spots)).toBe(10000)
  })

  it("drains several defenders when one raise needs the room", () => {
    // One back holds 1000, so a 2500 raise empties the lowest index neighbour,
    // then the next, then takes the last 500 from the third.
    const { spots } = editShare(base442(), 1, 2500)
    expect(bps(spots, 1)).toBe(3500)
    expect(
      spots.filter((s) => s.role === "DEF").map((s) => s.basisPoints),
    ).toEqual([3500, 0, 0, 500])
    expect(zone(spots, "DEF")).toBe(4000)
    expect(total(spots)).toBe(10000)
  })

  it("returns a lowering to the largest other defender", () => {
    const { spots } = editShare(base442(), 1, -400)
    expect(bps(spots, 1)).toBe(600)
    expect(bps(spots, 2)).toBe(1400)
    expect(zone(spots, "DEF")).toBe(4000)
    expect(total(spots)).toBe(10000)
  })
})

describe("editShare: the ceiling (AC-4)", () => {
  it("caps a non defender at everything the costs are not holding", () => {
    const spots = base442()
    expect(shareCeilingBps(spots, 9)).toBe(6000)
    const { spots: after, stoppedAtBps } = editShare(spots, 9, 9000)
    expect(bps(after, 9)).toBe(6000)
    expect(stoppedAtBps).toBe(6000)
    // Everything except the locked defense pool is empty: GK, four midfield,
    // the other forward, and the bench.
    expect(
      after
        .filter((s) => s.role !== "DEF" && s.spotIndex !== 9)
        .map((s) => s.basisPoints),
    ).toEqual([0, 0, 0, 0, 0, 0, 0])
    expect(total(after)).toBe(10000)
  })

  it("says so when a spot already sits at its ceiling", () => {
    const atTop = editShare(base442(), 9, 5250)
    expect(bps(atTop.spots, 9)).toBe(6000)
    const again = editShare(atTop.spots, 9, 50)
    expect(again.stoppedAtBps).toBe(6000)
    expect(again.spots).toBe(atTop.spots)
  })

  it("never lets a spot go below zero", () => {
    const { spots, stoppedAtBps } = editShare(base442(), 11, -99999)
    expect(bps(spots, 11)).toBe(0)
    expect(stoppedAtBps).toBe(0)
    expect(total(spots)).toBe(10000)
    expect(spots.every((s) => s.basisPoints >= 0)).toBe(true)
  })

  it("ignores an edit on a spot that is not there", () => {
    const spots = base442()
    expect(editShare(spots, 99, 100).spots).toBe(spots)
  })

  it("keeps the plan whole across a long run of edits", () => {
    let spots = base442()
    for (let index = 0; index < spots.length; index += 1) {
      for (const delta of [50, 500, -50, -500, 3, -3]) {
        spots = editShare(spots, index, delta).spots
        expect(total(spots)).toBe(10000)
        expect(spots.every((s) => s.basisPoints >= 0)).toBe(true)
        expect(zone(spots, "DEF")).toBe(4000)
      }
    }
  })
})

describe("setShare (AC-1)", () => {
  it("applies a typed exact share through the same rules", () => {
    const { spots } = setShare(base442(), 9, 1200)
    expect(bps(spots, 9)).toBe(1200)
    expect(bps(spots, 11)).toBe(50)
    expect(total(spots)).toBe(10000)
  })

  it("clamps a typed share above the ceiling", () => {
    const { spots, stoppedAtBps } = setShare(base442(), 9, 9000)
    expect(bps(spots, 9)).toBe(6000)
    expect(stoppedAtBps).toBe(6000)
  })

  it("reads the same as the equivalent stepper delta", () => {
    const typed = setShare(base442(), 9, 1000).spots
    const stepped = editShare(base442(), 9, 250).spots
    expect(typed.map((s) => s.basisPoints)).toEqual(
      stepped.map((s) => s.basisPoints),
    )
  })

  it("accepts a typed share of zero for a defender", () => {
    const { spots } = setShare(base442(), 1, 0)
    expect(bps(spots, 1)).toBe(0)
    expect(zone(spots, "DEF")).toBe(4000)
    expect(total(spots)).toBe(10000)
  })
})

describe("boardWarnings (AC-5)", () => {
  const INCOME = 1_000_000_00

  it("fires when costs pass half of income", () => {
    expect(boardWarnings(base442(), INCOME, 600_000_00)).toEqual([
      "costs_over_half",
    ])
  })

  it("stays quiet at exactly half", () => {
    expect(boardWarnings(base442(), INCOME, 500_000_00)).toEqual([])
  })

  it("fires when the goalkeeper share reaches zero", () => {
    const { spots } = setShare(base442(), 0, 0)
    expect(boardWarnings(spots, INCOME, 300_000_00)).toEqual([
      "goalkeeper_at_zero",
    ])
  })

  it("reports both at once and blocks nothing", () => {
    const { spots } = setShare(base442(), 0, 0)
    expect(boardWarnings(spots, INCOME, 600_000_00)).toEqual([
      "costs_over_half",
      "goalkeeper_at_zero",
    ])
  })

  it("says nothing before there is an income to measure against", () => {
    expect(boardWarnings(base442(), 0, 400_000_00)).toEqual([])
  })
})

describe("fundMonths (AC-6)", () => {
  it("counts whole months of the frozen defense total", () => {
    expect(fundMonths(12_000_000, 4_000_000)).toBe(3)
    expect(fundMonths(13_999_999, 4_000_000)).toBe(3)
    expect(fundMonths(3_999_999, 4_000_000)).toBe(0)
  })

  it("is zero months when there is nothing to divide by", () => {
    expect(fundMonths(5_000_000, 0)).toBe(0)
  })

  it("is zero months when nothing has been saved", () => {
    expect(fundMonths(0, 4_000_000)).toBe(0)
  })
})

describe("splitProblem (AC-2)", () => {
  function raw442(): RawSplitItem[] {
    return base442().map((spot) => ({
      role: spot.role,
      spot_index: spot.spotIndex,
      label: spot.label,
      basis_points: spot.basisPoints,
    }))
  }
  const expected = { spotCount: 12, defBasisPoints: 4000 }

  it("accepts a split that still matches its base shape", () => {
    expect(splitProblem(raw442(), expected)).toBeNull()
  })

  it("calls a fraction in a spot number what it is", () => {
    const split = raw442()
    split[3] = { ...split[3]!, spot_index: 1.5 }
    expect(splitProblem(split, expected)).toBe("index")
  })

  it("counts an empty split as the wrong number of spots", () => {
    // The save schema lets an empty array through so it lands here, which is
    // what makes the answer invalid_split rather than a field error.
    expect(splitProblem([], expected)).toBe("count")
  })

  it("refuses a payload that is not a list of spots", () => {
    expect(splitProblem(null, expected)).toBe("count")
    expect(splitProblem("4-4-2", expected)).toBe("count")
    // A non object entry is the role problem first: nothing about it can be
    // read off the pitch.
    const split = raw442()
    ;(split as unknown[])[2] = 7
    expect(splitProblem(split, expected)).toBe("role")
  })

  it("refuses a role the five zones do not know", () => {
    const split = raw442()
    split[0] = { ...split[0]!, role: "ST" }
    expect(splitProblem(split, expected)).toBe("role")
  })

  it("refuses a spot without a name", () => {
    const split = raw442()
    split[5] = { ...split[5]!, label: "  " }
    expect(splitProblem(split, expected)).toBe("label")
  })

  it("refuses a share outside the whole plan", () => {
    const negative = raw442()
    negative[6] = { ...negative[6]!, basis_points: -10 }
    expect(splitProblem(negative, expected)).toBe("share")

    const tooBig = raw442()
    tooBig[6] = { ...tooBig[6]!, basis_points: 10001 }
    expect(splitProblem(tooBig, expected)).toBe("share")

    const fractional = raw442()
    fractional[6] = { ...fractional[6]!, basis_points: 750.5 }
    expect(splitProblem(fractional, expected)).toBe("share")
  })

  it("refuses a gap or a duplicate in the spot sequence", () => {
    const split = raw442()
    // The same spot numbered twice: every value still adds up.
    split[6] = { ...split[6]!, spot_index: 5 }
    expect(splitProblem(split, expected)).toBe("sequence")

    const skipped = raw442()
    skipped[11] = { ...skipped[11]!, spot_index: 12 }
    expect(splitProblem(skipped, expected)).toBe("sequence")
  })

  it("refuses a plan that does not reach the whole", () => {
    const split = raw442()
    split[11] = { ...split[11]!, basis_points: 400 }
    expect(splitProblem(split, expected)).toBe("sum")
  })

  it("refuses a defense zone that moved off its locked total (AC-4)", () => {
    const split = raw442()
    // One defender down 250, the bench up 250: the whole still reads 10000,
    // but the cost pool is not what the base shape pinned.
    split[1] = { ...split[1]!, basis_points: 750 }
    split[11] = { ...split[11]!, basis_points: 750 }
    expect(splitProblem(split, expected)).toBe("def_zone")
  })
})

describe("suggestFormation (AC-7)", () => {
  const steady = {
    debtOutstanding: false,
    fundMonths: 1,
    incomeKobo: 1_000_000_00,
    costKobo: 300_000_00,
  }

  it("puts a debt first, even over a comfortable fund", () => {
    expect(
      suggestFormation({ ...steady, debtOutstanding: true, fundMonths: 4 }),
    ).toEqual({
      shapeName: "5-4-1",
      reason:
        "When a debt must fall: everything shields the defense and the midfield clears it.",
    })
  })

  it("recommends the attacking shape once the fund is comfortable", () => {
    expect(suggestFormation({ ...steady, fundMonths: 3 })).toMatchObject({
      shapeName: "4-3-3",
    })
  })

  it("recommends the defensive shape for heavy costs", () => {
    expect(suggestFormation({ ...steady, costKobo: 600_000_00 })).toMatchObject(
      { shapeName: "5-3-2" },
    )
  })

  it("names nothing for a steady season", () => {
    expect(suggestFormation(steady)).toBeNull()
  })

  it("stays hidden before the user has both income and a cost", () => {
    expect(suggestFormation({ ...steady, incomeKobo: 0 })).toBeNull()
    expect(suggestFormation({ ...steady, costKobo: 0 })).toBeNull()
  })

  it.each(["5-4-1", "4-3-3", "5-3-2"] as const)(
    "gives %s the reason from its own when_to_play line",
    (name) => {
      const context =
        name === "5-4-1"
          ? { ...steady, debtOutstanding: true }
          : name === "4-3-3"
            ? { ...steady, fundMonths: 3 }
            : { ...steady, costKobo: 600_000_00 }
      const shape = FORMATIONS.find((f) => f.name === name)!
      expect(suggestFormation(context)?.reason).toBe(shape.whenToPlay)
    },
  )
})
