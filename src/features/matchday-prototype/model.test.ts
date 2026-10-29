import { describe, expect, it } from "vitest"

import {
  DEC,
  FOOD,
  NOV,
  adjustmentDestinations,
  adjustmentSources,
  applyAdjustment,
  applyCarry,
  cleanSheet,
  clockWeek,
  decemberPreview,
  editAllowance,
  editDue,
  editIncome,
  editOpening,
  editPlanned,
  editRecord,
  editRemaining,
  figures,
  foodReport,
  foodTotal,
  goalProgress,
  isDate,
  loadFixture,
  nextDue,
  parseAmount,
  previewAdjustment,
  purposeById,
  savePlan,
  setAcknowledged,
  setClock,
  shareShape,
  unknownSources,
  unusedAllocation,
  warnings,
  weekById,
  type Outcome,
  type Sample,
} from "@/features/matchday-prototype/model"

const naira = (n: number) => n * 100

function ok(outcome: Outcome): Sample {
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.sample
}

describe("spec 0011 worked figures (AC-3, AC-4)", () => {
  it("reproduces the baseline", () => {
    const f = figures(loadFixture("baseline"))
    expect(f.receivedKobo).toBe(naira(400_000))
    expect(f.outstandingKobo).toBe(naira(200_000))
    expect(f.essentialKobo).toBe(naira(330_000))
    expect(f.plannedKobo).toBe(naira(600_000))
    expect(f.receivedRemainderKobo).toBe(naira(70_000))
    expect(f.forecastRemainderKobo).toBe(naira(270_000))
    expect(f.leftToAssignKobo).toBe(naira(-200_000))
    expect(f.overallGapKobo).toBe(naira(200_000))
    expect(f.essentialGapKobo).toBe(0)
  })

  it("reproduces the salary shortfall", () => {
    const f = figures(loadFixture("salary-shortfall"))
    expect(f.receivedRemainderKobo).toBe(naira(-80_000))
    expect(f.forecastRemainderKobo).toBe(naira(270_000))
    expect(f.overallGapKobo).toBe(naira(350_000))
    expect(f.essentialGapKobo).toBe(naira(80_000))
  })

  it("splits November food into six exact clipped weeks", () => {
    const weeks = loadFixture().weeks
    expect(weeks.map((w) => [w.startsOn, w.endsOn])).toEqual([
      ["2026-11-01", "2026-11-01"],
      ["2026-11-02", "2026-11-08"],
      ["2026-11-09", "2026-11-15"],
      ["2026-11-16", "2026-11-22"],
      ["2026-11-23", "2026-11-29"],
      ["2026-11-30", "2026-11-30"],
    ])
    expect(weeks.map((w) => w.allowanceKobo)).toEqual([
      333_334, 2_333_334, 2_333_333, 2_333_333, 2_333_333, 333_333,
    ])
  })

  it("needs an acknowledgement to save a gap, and an edit clears it", () => {
    const s = loadFixture("baseline")
    expect(savePlan(s).ok).toBe(false)
    const saved = ok(savePlan(setAcknowledged(s, true)))
    expect(saved.plans[NOV].status).toBe("saved")
    const edited = ok(editPlanned(saved, "p-misc", naira(30_000)))
    expect(edited.plans[NOV]).toMatchObject({
      status: "draft",
      shortfallAcknowledged: false,
    })
  })

  it("keeps a late receipt in November until it is reassigned", () => {
    const late = loadFixture("late-receipt")
    expect(figures(late).receivedKobo).toBe(naira(550_000))
    const moved = ok(
      editIncome(late, "i-c", {
        expectedKobo: naira(150_000),
        receivedKobo: naira(150_000),
        receivedOn: "2026-11-04",
        planId: DEC,
      }),
    )
    expect(figures(moved).receivedKobo).toBe(naira(400_000))
    expect(decemberPreview(moved).incomes.map((i) => i.id)).toEqual(["i-c"])
  })
})

describe("input boundary", () => {
  it("keeps blank, zero and invalid distinct", () => {
    expect(parseAmount("", "unknown")).toEqual({ ok: true, kobo: null })
    expect(parseAmount("0", "unknown")).toEqual({ ok: true, kobo: 0 })
    expect(parseAmount("1,250.5", "required")).toEqual({
      ok: true,
      kobo: 125_050,
    })
    expect(parseAmount("-5", "required").ok).toBe(false)
    expect(parseAmount("1.234", "required").ok).toBe(false)
    expect(parseAmount("9".repeat(20), "required").ok).toBe(false)
  })

  it("rejects a positive receipt with no date", () => {
    const s = loadFixture()
    const out = editIncome(s, "i-c", {
      expectedKobo: naira(150_000),
      receivedKobo: naira(1),
      receivedOn: null,
      planId: NOV,
    })
    expect(out.ok).toBe(false)
  })
})

describe("adjustment (AC-6)", () => {
  const food = { kind: "week" as const, id: "w-2" }
  const extra = { kind: "purpose" as const, id: "p-extra-debt" }

  it("moves an uncompleted extra repayment into food, once", () => {
    const s = loadFixture("adjustment-before")
    const p = previewAdjustment(s, extra, food, naira(20_000))
    if (!p.ok) throw new Error(p.error)
    expect(p.preview.sourceAfter).toBe(naira(60_000))
    expect(p.preview.foodAfter).toBe(naira(120_000))
    const after = ok(applyAdjustment(s, p.preview, false))
    expect(figures(after).plannedKobo).toBe(figures(s).plannedKobo)
    expect(after.plans[NOV].status).toBe("saved")
    expect(applyAdjustment(after, p.preview, false).ok).toBe(false)
  })

  it("never offers a completed repayment, and holds back unknown ones", () => {
    const after = loadFixture("adjustment-after")
    expect(adjustmentSources(after).map((e) => e.id)).toEqual(["p-course"])
    expect(previewAdjustment(after, extra, food, naira(20_000)).ok).toBe(false)
    expect(adjustmentSources(loadFixture("fully-received"))).toEqual([])
  })
})

describe("report and next month (AC-5, AC-8)", () => {
  it("names the four month end states", () => {
    expect(cleanSheet(loadFixture("baseline")).status).toBe("not-finished")
    expect(cleanSheet(loadFixture("report-complete")).status).toBe("clean")
    expect(cleanSheet(loadFixture("report-incomplete"))).toEqual({
      status: "still-due",
      unpaid: 1,
      unknown: 0,
    })
    expect(cleanSheet(loadFixture("report-unknown"))).toEqual({
      status: "unknown",
      unknown: 1,
    })
  })

  it("recalculates on a correction that replaces the total", () => {
    const fixed = ok(
      editRecord(
        loadFixture("report-incomplete"),
        "p-required-debt",
        naira(120_000),
      ),
    )
    expect(cleanSheet(fixed).status).toBe("clean")
  })

  it("orders the next due payment by date, then fixture order", () => {
    expect(nextDue(loadFixture())?.id).toBe("p-transport")
  })

  it("reports unused allocation without unknown or still due amounts", () => {
    // Miscellaneous ₦35,000 − ₦20,000, plus the course recorded at ₦0.
    const u = unusedAllocation(loadFixture("report-incomplete"))
    expect(u.totalKobo).toBe(naira(90_000))
    expect(u.stillDue.map((d) => d.kobo)).toEqual([naira(60_000)])
  })

  it("assigns the confirmed carry, never adds it, and copies no actuals", () => {
    const s = loadFixture("report-complete")
    const once = ok(applyCarry(s, naira(15_000)))
    const twice = ok(applyCarry(once, naira(15_000)))
    const dec = decemberPreview(twice)
    expect(dec.carryKobo).toBe(naira(15_000))
    expect(dec.reserveKobo).toBe(naira(180_000))
    expect(dec.goalSavedKobo).toBe(naira(50_000))
    expect(dec.incomes).toEqual([])
    expect(
      decemberPreview(loadFixture("report-unknown")).reserveKobo,
    ).toBeNull()
  })
})

describe("extras (AC-9)", () => {
  it("moves goal progress only on a recorded contribution", () => {
    const s = loadFixture()
    expect(goalProgress(s).knownProgressKobo).toBe(naira(50_000))
    const recorded = ok(editRecord(s, "p-course", naira(75_000)))
    expect(goalProgress(recorded)).toMatchObject({
      knownProgressKobo: naira(125_000),
      basisPoints: 4166,
    })
  })

  it("shares only line basis points and dot counts", () => {
    expect(shareShape(loadFixture())).toEqual([
      { line: "keeper", basisPoints: 1333, dots: 1 },
      { line: "defence", basisPoints: 5500, dots: 5 },
      { line: "midfield", basisPoints: 1917, dots: 2 },
      { line: "attack", basisPoints: 1250, dots: 1 },
    ])
  })
})

describe("value sourcing table", () => {
  it("raises both remainders by the opening carry", () => {
    const s = loadFixture()
    const carried = ok(editOpening(s, "openingCarryKobo", naira(10_000)))
    expect(figures(carried).receivedRemainderKobo).toBe(naira(80_000))
    expect(figures(carried).forecastRemainderKobo).toBe(naira(280_000))
  })

  it("lowers only left to assign when an optional purpose grows", () => {
    const s = loadFixture()
    const more = ok(editPlanned(s, "p-misc", naira(36_000)))
    expect(figures(more).leftToAssignKobo).toBe(naira(-201_000))
    expect(figures(more).receivedRemainderKobo).toBe(naira(70_000))
    expect(figures(more).forecastRemainderKobo).toBe(naira(270_000))
  })

  it("warns when a fixed payment is planned below what it requires", () => {
    const w = warnings(
      ok(editPlanned(loadFixture(), "p-transport", naira(40_000))),
    )
    expect(w.underallocated.map((u) => [u.purpose.id, u.kobo])).toEqual([
      ["p-transport", naira(10_000)],
    ])
  })

  it("needs an acknowledgement for an underallocation alone", () => {
    const s = ok(
      editPlanned(loadFixture("fully-received"), "p-transport", naira(40_000)),
    )
    const w = warnings(s)
    expect([w.overallGapKobo, w.essentialGapKobo]).toEqual([0, 0])
    expect(savePlan(s).ok).toBe(false)
    expect(savePlan(setAcknowledged(s, true)).ok).toBe(true)
  })

  it("saves without a tick when nothing is short", () => {
    expect(savePlan(loadFixture("fully-received")).ok).toBe(true)
  })

  it("moves next due on once transport and data are recorded in full", () => {
    let s = ok(editRecord(loadFixture(), "p-transport", naira(50_000)))
    s = ok(editRecord(s, "p-data", naira(10_000)))
    expect(nextDue(s)?.id).toBe("p-required-debt")
  })

  it("treats a partial record as still due, and nothing due as null", () => {
    const part = ok(editRecord(loadFixture(), "p-transport", naira(20_000)))
    expect(nextDue(part)?.id).toBe("p-transport")
    expect(nextDue(loadFixture("report-complete"))).toBeNull()
  })

  it("loads the late receipt scenario on 4 November, in week 2", () => {
    expect(clockWeek(loadFixture("late-receipt")).id).toBe("w-2")
    expect(clockWeek(loadFixture()).id).toBe("w-1")
  })

  it("keeps edits when only the date changes", () => {
    const edited = ok(editPlanned(loadFixture(), "p-misc", naira(30_000)))
    const later = setClock(edited, "2026-11-30")
    expect(purposeById(later, "p-misc")?.plannedKobo).toBe(naira(30_000))
    expect(later.edited).toBe(true)
  })
})

describe("income and amount boundaries (AC-3, AC-13)", () => {
  const income = {
    expectedKobo: naira(150_000),
    receivedKobo: 0,
    receivedOn: "2026-11-04",
    planId: NOV,
  } as const

  it("drops the receipt date when nothing was received", () => {
    const s = ok(editIncome(loadFixture(), "i-c", income))
    expect(s.incomes.find((i) => i.id === "i-c")?.receivedOn).toBeNull()
  })

  it("rejects an impossible date", () => {
    const out = editIncome(loadFixture(), "i-c", {
      ...income,
      receivedKobo: naira(1),
      receivedOn: "2026-02-30",
    })
    expect(out).toEqual({ ok: false, error: "Use a real date." })
  })

  it("refuses an edit whose sum would pass a safe integer", () => {
    const s = loadFixture()
    const out = editPlanned(s, "p-misc", Number.MAX_SAFE_INTEGER - 1)
    expect(out.ok).toBe(false)
    expect(purposeById(s, "p-misc")?.plannedKobo).toBe(naira(35_000))
  })

  it("asks for an amount where blank is not allowed", () => {
    expect(parseAmount("  ", "required")).toEqual({
      ok: false,
      error: "Enter an amount. 0 is fine.",
    })
  })

  it("rejects an unsafe integer even when it parses", () => {
    expect(parseAmount("90071992547409.93", "required").ok).toBe(false)
  })

  it("validates calendar dates, not just their shape", () => {
    expect(isDate("2028-02-29")).toBe(true)
    expect(isDate("2026-02-29")).toBe(false)
    expect(isDate("2026-1-05")).toBe(false)
  })

  it("refuses food edits outside its weeks", () => {
    expect(editPlanned(loadFixture(), FOOD, 0).ok).toBe(false)
    expect(editRecord(loadFixture(), FOOD, 0).ok).toBe(false)
  })
})

describe("food weeks (AC-7)", () => {
  it("rejects a remaining amount above the week's allowance", () => {
    const out = editRemaining(loadFixture(), "w-2", 2_333_335)
    expect(out.ok).toBe(false)
  })

  it("reports spending as allowance minus remaining, and counts unchecked weeks", () => {
    const s = ok(editRemaining(loadFixture(), "w-2", naira(10_000)))
    expect(foodReport(s)).toEqual({
      plannedKobo: naira(100_000),
      spentKobo: 2_333_334 - naira(10_000),
      unchecked: 5,
    })
  })

  it("keeps reported spending when a checked week's allowance changes", () => {
    let s = ok(editRemaining(loadFixture(), "w-2", naira(3_333.34)))
    s = ok(editAllowance(s, "w-2", naira(30_000)))
    expect(weekById(s, "w-2")?.remainingKobo).toBe(naira(10_000))
    expect(editAllowance(s, "w-2", naira(19_000)).ok).toBe(false)
  })

  it("moves a week's remaining on to next week without changing food", () => {
    const s = ok(editRemaining(loadFixture(), "w-2", naira(5_000)))
    const p = previewAdjustment(
      s,
      { kind: "week", id: "w-2" },
      { kind: "week", id: "w-3" },
      naira(5_000),
    )
    if (!p.ok) throw new Error(p.error)
    expect(p.preview.foodAfter).toBe(p.preview.foodBefore)
    const after = ok(applyAdjustment(s, p.preview, false))
    expect(weekById(after, "w-2")?.remainingKobo).toBe(0)
    expect(foodTotal(after)).toBe(foodTotal(s))
  })

  it("moves food to a purpose by equal and opposite amounts", () => {
    const s = ok(editRemaining(loadFixture(), "w-2", naira(5_000)))
    const p = previewAdjustment(
      s,
      { kind: "week", id: "w-2" },
      { kind: "purpose", id: "p-misc" },
      naira(5_000),
    )
    if (!p.ok) throw new Error(p.error)
    const after = ok(applyAdjustment(s, p.preview, false))
    expect(foodTotal(s) - foodTotal(after)).toBe(naira(5_000))
    expect(purposeById(after, "p-misc")?.plannedKobo).toBe(naira(40_000))
  })

  it("offers no next week from the last week", () => {
    const s = ok(editRemaining(loadFixture(), "w-6", 100))
    const dests = adjustmentDestinations(s, { kind: "week", id: "w-6" })
    expect(dests.some((d) => d.kind === "week")).toBe(false)
  })
})

describe("adjustment guards (AC-6)", () => {
  it("never offers a fixed payment as a source", () => {
    const s = loadFixture("report-incomplete")
    const ids = adjustmentSources(s).map((e) => e.id)
    expect(ids).not.toContain("p-required-debt")
    expect(ids).not.toContain("p-transport")
  })

  it("never offers a fully recorded fixed payment as a destination", () => {
    const s = loadFixture("report-incomplete")
    const ids = adjustmentDestinations(s, {
      kind: "purpose",
      id: "p-misc",
    }).map((e) => e.id)
    expect(ids).not.toContain("p-transport")
    expect(ids).toContain("p-required-debt")
  })

  it("lists optional purposes waiting for a record", () => {
    expect(
      unknownSources(loadFixture("fully-received")).map((p) => p.id),
    ).toEqual(["p-extra-debt", "p-misc", "p-emergency", "p-course"])
  })

  it("rejects zero and more than is available", () => {
    const s = loadFixture("adjustment-before")
    const src = { kind: "purpose" as const, id: "p-extra-debt" }
    const dst = { kind: "purpose" as const, id: "p-misc" }
    expect(previewAdjustment(s, src, dst, 0).ok).toBe(false)
    expect(previewAdjustment(s, src, dst, naira(80_001)).ok).toBe(false)
  })

  it("needs a fresh tick when a move enlarges the essentials gap", () => {
    // Shortfall: essentials already ₦80,000 short. Moving optional money into
    // food (an essential) widens that gap, so Apply asks again.
    const s = ok(editRecord(loadFixture("salary-shortfall"), "p-extra-debt", 0))
    const p = previewAdjustment(
      s,
      { kind: "purpose", id: "p-extra-debt" },
      { kind: "week", id: "w-2" },
      naira(20_000),
    )
    if (!p.ok) throw new Error(p.error)
    expect(p.preview.newWarnings).toEqual([
      { kind: "essential", kobo: naira(100_000) },
    ])
    expect(applyAdjustment(s, p.preview, false).ok).toBe(false)
    const after = ok(applyAdjustment(s, p.preview, true))
    expect(after.plans[NOV].shortfallAcknowledged).toBe(true)
  })
})

describe("month end edges (AC-5, AC-8, AC-9)", () => {
  it("awards nothing when every fixed payment falls due in December", () => {
    let s = loadFixture("report-complete")
    for (const id of ["p-required-debt", "p-transport", "p-data", "p-family"]) {
      s = ok(editDue(s, id, "2026-12-03"))
    }
    expect(cleanSheet(s).status).toBe("no-due")
  })

  it("awards nothing for an empty plan", () => {
    let s = loadFixture("report-complete")
    for (const p of s.purposes.filter((x) => x.id !== FOOD)) {
      s = ok(editPlanned(s, p.id, 0))
    }
    for (const w of s.weeks) s = ok(editAllowance(s, w.id, 0))
    s = setClock(s, "2026-11-30")
    expect(cleanSheet(s).status).toBe("empty")
    expect(shareShape(s)).toBeNull()
  })

  it("only lets fixed payments carry a due date", () => {
    expect(editDue(loadFixture(), "p-misc", "2026-11-03").ok).toBe(false)
    expect(editDue(loadFixture(), "p-transport", "2026-11-31").ok).toBe(false)
  })

  it("holds December's carry back until it is confirmed", () => {
    expect(decemberPreview(loadFixture("report-complete")).carryKobo).toBeNull()
  })

  it("never moves goal progress on a planned contribution", () => {
    const s = ok(editPlanned(loadFixture(), "p-course", naira(200_000)))
    expect(goalProgress(s).knownProgressKobo).toBe(naira(50_000))
    expect(goalProgress(s).recordedKobo).toBeNull()
  })
})
