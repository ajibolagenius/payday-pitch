// The walk's reads (spec 0007 AC-3, AC-8): library shapes mapped to domain
// formations, money summed to kobo, and the stored match mapped to a snapshot.
// The boundary is the Supabase client: a fake returns seeded rows and records
// the calls, so the filters the screens depend on are asserted too.
import { describe, expect, it, vi } from "vitest"

import { FORMATIONS } from "@/domain/formations"
import {
  getShapePositions,
  listFormations,
  type ReadClient,
} from "@/features/match/library"
import {
  loadActiveMatch,
  loadLastMatch,
  loadMoney,
  loadWalk,
} from "@/features/match/queries"

type CallRecord = { table: string; steps: [string, unknown[]][] }
type FakeOptions = {
  /** Table name whose read answers an error. */
  errorOn?: string
  /** When true, single row reads come back empty. */
  noMatch?: boolean
}

function fakeClient(
  tables: Record<string, unknown[]>,
  options: FakeOptions = {},
) {
  const calls: CallRecord[] = []
  const builder = (table: string) => {
    const record: CallRecord = { table, steps: [] }
    calls.push(record)
    const rows = tables[table] ?? []
    let single = false
    const b: Record<string, (...args: unknown[]) => unknown> = {}
    const step =
      (name: string) =>
      (...args: unknown[]) => {
        record.steps.push([name, args])
        return b
      }
    for (const name of ["select", "eq", "order", "limit"]) b[name] = step(name)
    b.maybeSingle = () => {
      single = true
      record.steps.push(["maybeSingle", []])
      return b
    }
    Object.defineProperty(b, "then", {
      value: (resolve: (value: unknown) => void) => {
        if (options.errorOn === table) {
          resolve({ data: null, error: { message: "read broke" } })
          return
        }
        resolve({
          data: single ? (options.noMatch ? null : (rows[0] ?? null)) : rows,
          error: null,
        })
      },
    })
    return b
  }
  const client = { from: vi.fn(builder) }
  return { client: client as unknown as ReadClient, calls }
}

/** A step assertion helper: the fake records every chained call per table. */
function stepsFor(calls: CallRecord[], table: string) {
  return calls.find((call) => call.table === table)!.steps
}

/** A library position row as the database returns it (snake case columns). */
function positionRow(position: {
  role: string
  label: string
  basisPoints: number
}) {
  return {
    role: position.role,
    label: position.label,
    basis_points: position.basisPoints,
  }
}

/** The library rows the seed produces for a shape, in spot order. */
function shapeRows(name: string, id = 1) {
  const formation = FORMATIONS.find((f) => f.name === name)!
  return {
    id,
    name: formation.name,
    style: formation.style,
    when_to_play: formation.whenToPlay,
    formation_position: formation.positions
      .map(positionRow)
      .map((position, spot_index) => ({ ...position, spot_index })),
  }
}

const POSITION_TABLE = FORMATIONS[0]!.positions
  .map(positionRow)
  .map((position, spot_index) => ({ ...position, spot_index }))

describe("listFormations (AC-3)", () => {
  it("maps library rows to domain formations and asks for live shapes only", async () => {
    const { client, calls } = fakeClient({
      formation_shape: [shapeRows("4-4-2"), shapeRows("5-3-2", 2)],
    })
    const shapes = await listFormations(client)
    expect(shapes).toHaveLength(2)
    expect(shapes[1]).toEqual({
      id: 2,
      name: "5-3-2",
      style: "Defensive",
      whenToPlay: FORMATIONS[4]!.whenToPlay,
      positions: FORMATIONS[4]!.positions,
    })
    const steps = stepsFor(calls, "formation_shape")
    expect(steps).toContainEqual(["eq", ["deprecated", false]])
    expect(steps).toContainEqual(["order", ["sort"]])
    expect(steps).toContainEqual([
      "order",
      ["spot_index", { foreignTable: "formation_position" }],
    ])
  })

  it("keeps the read's order, so the array index is the spot", async () => {
    const { client } = fakeClient({
      formation_shape: [
        {
          ...shapeRows("4-4-2"),
          formation_position: [
            {
              role: "DEF",
              spot_index: 1,
              label: "Right Back",
              basis_points: 1000,
            },
            {
              role: "GK",
              spot_index: 0,
              label: "Emergency Fund",
              basis_points: 1000,
            },
          ],
        },
      ],
    })
    const [shape] = await listFormations(client)
    expect(shape!.positions.map((p) => p.label)).toEqual([
      "Right Back",
      "Emergency Fund",
    ])
  })

  it("throws rather than rendering a failed read as an empty library", async () => {
    const { client } = fakeClient({}, { errorOn: "formation_shape" })
    await expect(listFormations(client)).rejects.toThrow(
      /read formations failed/,
    )
  })
})

describe("getShapePositions", () => {
  it("returns the twelve spots for the split", async () => {
    const { client } = fakeClient({ formation_position: POSITION_TABLE })
    const spots = await getShapePositions(client, 1)
    expect(spots).toHaveLength(12)
    expect(spots![0]).toEqual({
      role: "GK",
      spotIndex: 0,
      label: "Emergency Fund",
      basisPoints: 1000,
    })
  })

  it("answers null for a shape with no spots (the write path calls that not found)", async () => {
    const { client } = fakeClient({ formation_position: [] })
    expect(await getShapePositions(client, 999)).toBeNull()
  })
})

describe("loadMoney (AC-2, AC-4)", () => {
  it("sums the stored kobo and keeps each entry for the walk", async () => {
    const { client, calls } = fakeClient({
      income_stream: [
        {
          id: 1,
          name: "Salary",
          amount_minor: "45000000",
          currency: "NGN",
          payday_day: 28,
        },
        {
          id: 2,
          name: "Side hustle",
          amount_minor: "8000000",
          currency: "NGN",
          payday_day: 5,
        },
      ],
      fixed_cost: [
        { id: 1, name: "Rent", amount_minor: "12000000", currency: "NGN" },
        { id: 2, name: "Data", amount_minor: "3000000", currency: "NGN" },
      ],
      profile: [{ default_currency: "NGN" }],
    })
    const money = await loadMoney(client, "user-1")
    expect(money.incomeMinorUnits).toBe(53_000_000)
    expect(money.costMinorUnits).toBe(15_000_000)
    expect(money.incomes[1]).toEqual({
      id: 2,
      name: "Side hustle",
      amountMinorUnits: 8_000_000,
      currency: "NGN",
      paydayDay: 5,
    })
    expect(money.currency).toBe("NGN")
    expect(stepsFor(calls, "income_stream")).toContainEqual([
      "eq",
      ["user_id", "user-1"],
    ])
  })

  it("falls back to naira when no profile row exists yet (spec 0004 AC-10)", async () => {
    const { client } = fakeClient(
      { income_stream: [], fixed_cost: [] },
      { noMatch: true },
    )
    const money = await loadMoney(client, "user-1")
    expect(money.currency).toBe("NGN")
    expect(money.incomes).toEqual([])
    expect(money.incomeMinorUnits).toBe(0)
  })

  it("takes the stored preference for a non naira account", async () => {
    const { client } = fakeClient({
      income_stream: [],
      fixed_cost: [],
      profile: [{ default_currency: "USD" }],
    })
    expect((await loadMoney(client, "user-1")).currency).toBe("USD")
  })

  it("throws on a failed read so the screen renders its error state", async () => {
    const { client } = fakeClient({}, { errorOn: "fixed_cost" })
    await expect(loadMoney(client, "user-1")).rejects.toThrow(
      /read costs failed/,
    )
  })
})

const MATCH_ROW = {
  id: 42,
  period: "2026-10-01",
  shape_name: "4-4-2",
  library_id: 1,
  currency: "NGN",
  match_line: [
    {
      role: "GK",
      spot_index: 0,
      label: "Emergency Fund",
      basis_points: 1000,
      planned_minor: "5000000",
      actual_minor: null,
    },
    {
      role: "DEF",
      spot_index: 1,
      label: "Right Back",
      basis_points: 1000,
      planned_minor: "3750000",
      actual_minor: "200000",
    },
  ],
}

describe("match reads (AC-8)", () => {
  it("maps the stored snapshot to camel case, bigint to number, null kept", async () => {
    const { client, calls } = fakeClient({ match: [MATCH_ROW] })
    const active = await loadActiveMatch(client, "user-1", "2026-10-01")
    expect(active).toEqual({
      id: 42,
      period: "2026-10-01",
      shapeId: 1,
      shapeName: "4-4-2",
      currency: "NGN",
      lines: [
        {
          role: "GK",
          spotIndex: 0,
          label: "Emergency Fund",
          basisPoints: 1000,
          plannedMinorUnits: 5_000_000,
          actualMinorUnits: null,
        },
        {
          role: "DEF",
          spotIndex: 1,
          label: "Right Back",
          basisPoints: 1000,
          plannedMinorUnits: 3_750_000,
          actualMinorUnits: 200_000,
        },
      ],
    })
    const steps = stepsFor(calls, "match")
    expect(steps).toContainEqual(["eq", ["status", "active"]])
    expect(steps).toContainEqual(["eq", ["period", "2026-10-01"]])
  })

  it("answers null when the month has not been played", async () => {
    const { client } = fakeClient({}, { noMatch: true })
    expect(await loadActiveMatch(client, "user-1")).toBeNull()
  })

  it("asks for the newest period first for the fallback pitch", async () => {
    const { client, calls } = fakeClient({ match: [MATCH_ROW] })
    const last = await loadLastMatch(client, "user-1")
    expect(last!.shapeName).toBe("4-4-2")
    const steps = stepsFor(calls, "match")
    expect(steps).toContainEqual(["eq", ["user_id", "user-1"]])
    expect(steps).toContainEqual(["order", ["period", { ascending: false }]])
    expect(steps).toContainEqual(["limit", [1]])
  })

  it("loads the whole walk state in one pass", async () => {
    const { client } = fakeClient({
      income_stream: [
        {
          id: 1,
          name: "Salary",
          amount_minor: "45000000",
          currency: "NGN",
          payday_day: 28,
        },
      ],
      fixed_cost: [
        { id: 1, name: "Rent", amount_minor: "15000000", currency: "NGN" },
      ],
      profile: [{ default_currency: "NGN" }],
      formation_shape: [shapeRows("4-4-2")],
      match: [MATCH_ROW],
    })
    const walk = await loadWalk(client, "user-1")
    expect(walk.incomeMinorUnits).toBe(45_000_000)
    expect(walk.formations).toHaveLength(1)
    expect(walk.active!.id).toBe(42)
    expect(walk.last!.id).toBe(42)
  })
})
