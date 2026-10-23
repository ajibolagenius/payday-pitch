// playMatchAction (spec 0007 AC-4 to AC-6, AC-9). The boundary is the reads
// and the RPC: schema validation, the domain split, and the authedAction
// composition all run real. Asserted here is what the function receives
// (twelve frozen lines computed server side, no client money) and what a
// caller sees back for each code.
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getShapePositions: vi.fn(),
  loadMoney: vi.fn(),
  rpc: vi.fn(),
  createActionClient: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseActionClient: mocks.createActionClient,
}))
vi.mock("@/features/match/library", () => ({
  getShapePositions: mocks.getShapePositions,
}))
vi.mock("@/features/match/queries", () => ({ loadMoney: mocks.loadMoney }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from "next/cache"

import { FORMATIONS } from "@/domain/formations"
import { playMatchAction } from "@/features/match/actions"

const INCOME = 45_000_000
const COSTS = 15_000_000

type PayloadLine = {
  role: string
  spot_index: number
  label: string
  basis_points: number
  planned_minor: number
  actual_minor: number | null
  currency: string
}

function signedIn(money = { income: INCOME, costs: COSTS, currency: "NGN" }) {
  mocks.createActionClient.mockResolvedValue({
    auth: {
      getClaims: async () => ({ data: { claims: { sub: "user-1" } } }),
    },
    rpc: mocks.rpc,
  })
  mocks.getShapePositions.mockResolvedValue(
    FORMATIONS[0]!.positions.map((p, i) => ({ ...p, spotIndex: i })),
  )
  mocks.loadMoney.mockResolvedValue({
    incomes: [
      {
        id: 1,
        name: "Salary",
        amountMinorUnits: money.income,
        currency: money.currency,
        paydayDay: 28,
      },
    ],
    costs: [
      {
        id: 1,
        name: "Rent",
        amountMinorUnits: money.costs,
        currency: money.currency,
      },
    ],
    incomeMinorUnits: money.income,
    costMinorUnits: money.costs,
    currency: money.currency,
  })
}

const actuals = (over: Record<number, string> = {}) =>
  Array.from({ length: 12 }, (_, spotIndex) => ({
    spotIndex,
    actualNaira: over[spotIndex] ?? "",
  }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.rpc.mockResolvedValue({
    data: { code: "ok", match_id: 42, period: "2026-10-01" },
    error: null,
  })
})

describe("playMatchAction", () => {
  it("plays the domain split: twelve lines that sum to income, defense at the cost total", async () => {
    signedIn()
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(result).toEqual({
      ok: true,
      data: { matchId: 42, period: "2026-10-01" },
    })

    const args = mocks.rpc.mock.calls[0]![1] as {
      p_shape_id: number
      p_lines: PayloadLine[]
    }
    expect(mocks.rpc).toHaveBeenCalledWith(
      "play_match",
      expect.objectContaining({ p_shape_id: 7 }),
    )
    const lines = args.p_lines
    expect(lines).toHaveLength(12)
    expect(new Set(lines.map((l) => l.spot_index))).toHaveLength(12)
    expect(lines.reduce((s, l) => s + l.planned_minor, 0)).toBe(INCOME)
    expect(
      lines
        .filter((l) => l.role === "DEF")
        .reduce((s, l) => s + l.planned_minor, 0),
    ).toBe(COSTS)
    // 4-4-2: four equal defenders share the costs, the keeper takes its
    // 1000 bps of the 6000 left over.
    expect(lines.find((l) => l.spot_index === 1)!.planned_minor).toBe(3_750_000)
    expect(lines.find((l) => l.spot_index === 0)!.planned_minor).toBe(5_000_000)
    expect(lines.find((l) => l.role === "BENCH")!.planned_minor).toBe(2_500_000)
    expect(lines.every((l) => l.actual_minor === null)).toBe(true)
    expect(lines.every((l) => l.currency === "NGN")).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith("/app")
  })

  it("stores an entered 0 as zero and a blank box as null (AC-6)", async () => {
    signedIn()
    await playMatchAction({
      shapeId: "7",
      actuals: actuals({ 0: "0.00", 2: "5000" }),
    })
    const lines = (mocks.rpc.mock.calls[0]![1] as { p_lines: PayloadLine[] })
      .p_lines
    expect(lines.find((l) => l.spot_index === 0)!.actual_minor).toBe(0)
    expect(lines.find((l) => l.spot_index === 2)!.actual_minor).toBe(500_000)
    expect(lines.find((l) => l.spot_index === 1)!.actual_minor).toBeNull()
  })

  it("refuses a gap the domain can already see, with the shortfall, and never calls the function", async () => {
    signedIn({ income: 20_000_000, costs: 15_000_000, currency: "NGN" })
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    // Defense holds floor(20,000,000 * 4000 / 10000) = 8,000,000 of the
    // 15,000,000 costs: a 7,000,000 kobo gap, stated in naira.
    expect(result).toMatchObject({
      ok: false,
      error: { code: "unable_to_cover" },
    })
    if (!result.ok) expect(result.error.message).toContain("70,000")
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it("says add your income first when there is nothing to play", async () => {
    signedIn({ income: 0, costs: 0, currency: "NGN" })
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "no_income" },
    })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it("answers shape_not_found when the library has no such shape", async () => {
    signedIn()
    mocks.getShapePositions.mockResolvedValue(null)
    const result = await playMatchAction({ shapeId: "999", actuals: actuals() })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "shape_not_found" },
    })
  })

  it("maps a concurrent second play (23505) to the conflict code", async () => {
    signedIn()
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key value violates" },
    })
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "conflict", message: expect.stringMatching(/reload/i) },
    })
  })

  it("passes the function's own friendly codes and messages through", async () => {
    signedIn()
    const cases: [string, string][] = [
      ["shape_deprecated", "retired"],
      ["mixed_currency", "currency"],
      ["validation", "reload"],
    ]
    for (const [code, needle] of cases) {
      mocks.rpc.mockResolvedValue({
        data: {
          code,
          message: code === "validation" ? "Reload the pitch." : null,
        },
        error: null,
      })
      const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
      expect(result).toMatchObject({ ok: false, error: { code } })
      if (!result.ok)
        expect(result.error.message).toMatch(new RegExp(needle, "i"))
    }
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("uses the function's shortfall when its re-read moved past the domain's", async () => {
    signedIn()
    mocks.rpc.mockResolvedValue({
      data: { code: "unable_to_cover", shortfall_minor: 1_000_000 },
      error: null,
    })
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "unable_to_cover" },
    })
    if (!result.ok) expect(result.error.message).toContain("10,000")
  })

  it("turns an unmapped code into unexpected without leaking the database", async () => {
    signedIn()
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.rpc.mockResolvedValue({
      data: { code: "future_code" },
      error: null,
    })
    const result = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(result).toMatchObject({ ok: false, error: { code: "future_code" } })

    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "500", message: "raw trigger text with amounts" },
    })
    const thrown = await playMatchAction({ shapeId: "7", actuals: actuals() })
    expect(thrown).toMatchObject({ ok: false, error: { code: "unexpected" } })
    expect(JSON.stringify(thrown)).not.toContain("raw trigger")
    spy.mockRestore()
  })

  it("rejects a malformed actual or a payload that is not twelve entries as a field error", async () => {
    signedIn()
    const bad = await playMatchAction({
      shapeId: "7",
      actuals: actuals({ 3: "45000.500" }),
    })
    expect(bad).toMatchObject({
      ok: false,
      error: {
        code: "validation",
        fieldErrors: { "actuals.3.actualNaira": [expect.any(String)] },
      },
    })
    expect(mocks.rpc).not.toHaveBeenCalled()

    const short = await playMatchAction({
      shapeId: "7",
      actuals: actuals().slice(0, 11),
    })
    expect(short).toMatchObject({ ok: false, error: { code: "validation" } })

    const doubled = await playMatchAction({
      shapeId: "7",
      actuals: actuals().map((a) => ({ ...a, spotIndex: 0 })),
    })
    expect(doubled).toMatchObject({ ok: false, error: { code: "validation" } })
    expect(mocks.getShapePositions).not.toHaveBeenCalled()
  })
})
