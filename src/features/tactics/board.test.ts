// The board's read (spec 0008 AC-1 to AC-3, AC-6 to AC-8, AC-10). The boundary
// is the Supabase client: a fake returns seeded rows, applies the eq and is
// filters the owner scoping depends on, and records the chain, so a forgotten
// deleted_at or user_id filter fails here rather than in someone's browser.
import { describe, expect, it, vi } from "vitest"

import { FORMATIONS } from "@/domain/formations"
import type { SplitPosition } from "@/domain/money"
import {
  readBoardContext,
  tacticList,
  type BoardParams,
} from "@/features/tactics/board"
import { getShapePositions, type ReadClient } from "@/features/match/library"
import { loadMoney } from "@/features/match/queries"

vi.mock("@/features/match/library", () => ({
  getShapePositions: vi.fn(),
}))
vi.mock("@/features/match/queries", () => ({
  loadMoney: vi.fn(),
}))

const INCOME = 45_000_000
const COSTS = 15_000_000
const USER = "user-1"

/** The 4-4-2 seed as the library read hands it back. */
function seed442(): SplitPosition[] {
  const shape = FORMATIONS.find((f) => f.name === "4-4-2")!
  return shape.positions.map((p, spotIndex) => ({ ...p, spotIndex }))
}

/** The same split as stored JSONB. */
function raw442() {
  return seed442().map((p) => ({
    role: p.role,
    spot_index: p.spotIndex,
    label: p.label,
    basis_points: p.basisPoints,
  }))
}

type Filter = ["eq", string, unknown] | ["is", string, unknown]

type FakeOptions = {
  /** Table whose read answers an error. */
  errorOn?: string
}

/**
 * A chainable fake: eq / is actually filter the rows, order and limit are
 * recorded, embedded selects attach child rows by convention
 * (user_tactic_version by tactic_id, match_line by match_id).
 */
function fakeClient(
  tables: Record<string, unknown[]>,
  options: FakeOptions = {},
) {
  const calls: { table: string; steps: [string, unknown[]][] }[] = []
  const embeds: Record<string, { table: string; fk: string; pk: string }> = {
    user_tactic_version: {
      table: "user_tactic_version",
      fk: "tactic_id",
      pk: "id",
    },
    match_line: { table: "match_line", fk: "match_id", pk: "id" },
    formation_position: {
      table: "formation_position",
      fk: "shape_id",
      pk: "id",
    },
  }

  const builder = (table: string) => {
    const record = { table, steps: [] as [string, unknown[]][] }
    calls.push(record)
    const filters: Filter[] = []
    let single = false
    let limitCount = Infinity
    let selectFields = ""
    const b: Record<string, (...args: unknown[]) => unknown> = {}
    const step =
      (name: string) =>
      (...args: unknown[]) => {
        record.steps.push([name, args])
        return b
      }
    b.select = (...args: unknown[]) => {
      selectFields = String(args[0] ?? "")
      record.steps.push(["select", args])
      return b
    }
    const filterStep =
      (kind: "eq" | "is") => (column: unknown, value: unknown) => {
        filters.push([kind, String(column), value])
        record.steps.push([kind, [column, value]])
        return b
      }
    b.eq = filterStep("eq")
    b.is = filterStep("is")
    for (const name of ["order", "limit"]) b[name] = step(name)
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
        let rows = (tables[table] ?? []) as Record<string, unknown>[]
        // Filters apply in call order, exactly as the database chains them,
        // so a wrong eq value (a shape name, the user id, a status) narrows
        // the answer here rather than silently passing everything through.
        for (const [, column, value] of filters) {
          rows = rows.filter((row) => row[column] === value)
        }
        const embedded = Object.entries(embeds).filter(([name]) =>
          selectFields.includes(name),
        )
        rows = rows.map((row) => {
          const copy: Record<string, unknown> = { ...row }
          for (const [name, link] of embedded) {
            copy[name] = (
              (tables[link.table] ?? []) as Record<string, unknown>[]
            )
              .filter((child) => child[link.fk] === row[link.pk])
              .map((child) => ({ ...child }))
          }
          return copy
        })
        resolve({
          data: single
            ? (rows.slice(0, 1)[0] ?? null)
            : rows.slice(0, limitCount),
          error: null,
        })
      },
    })
    b.limit = (...args: unknown[]) => {
      limitCount = Number(args[0])
      record.steps.push(["limit", args])
      return b
    }
    return b
  }
  const client = { from: vi.fn(builder) }
  return { client: client as unknown as ReadClient, calls }
}

function shapeRow(over: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "4-4-2",
    style: "Balanced classic",
    when_to_play: "Your default shape when life is steady.",
    deprecated: false,
    sort: 1,
    ...over,
  }
}

function tacticRow(over: Record<string, unknown> = {}) {
  return {
    id: 7,
    name: "My 4-4-2",
    shape_name: "4-4-2",
    user_id: USER,
    deleted_at: null,
    ...over,
  }
}

function versionRow(over: Record<string, unknown> = {}) {
  return {
    id: 9,
    tactic_id: 7,
    split: raw442(),
    is_current: true,
    ...over,
  }
}

/** The rows a steady user has: the live library, money loaded, nothing saved.
 *  Every seed shape is present, because a suggestion only survives if its
 *  shape is a live row (AC-7). */
function baseTables(over: Record<string, unknown[]> = {}) {
  return {
    formation_shape: FORMATIONS.map((shape, sort) =>
      shapeRow({
        id: sort + 1,
        name: shape.name,
        style: shape.style,
        when_to_play: shape.whenToPlay,
        sort,
      }),
    ),
    user_tactic: [],
    user_tactic_version: [],
    gk_fund_progress: [],
    match: [],
    match_line: [],
    debt: [],
    debt_progress: [],
    ...over,
  }
}

function money(income: number, costs: number) {
  return {
    incomes: [],
    costs: [],
    incomeMinorUnits: income,
    costMinorUnits: costs,
    currency: "NGN",
  }
}

function contextFor(
  tables: Record<string, unknown[]>,
  params: BoardParams = {},
  options: FakeOptions = {},
) {
  const { client, calls } = fakeClient(tables, options)
  vi.mocked(getShapePositions).mockReset().mockResolvedValue(seed442())
  vi.mocked(loadMoney).mockReset().mockResolvedValue(money(INCOME, COSTS))
  return {
    board: readBoardContext(client, USER, params),
    calls,
  }
}

describe("readBoardContext: which source the URL names", () => {
  it("opens the first library shape when nothing is asked for (AC-1)", async () => {
    const { board } = contextFor(baseTables())
    const context = await board
    expect(context?.source).toMatchObject({
      baseShapeName: "4-4-2",
      title: "4-4-2",
      tacticId: null,
      versionId: null,
    })
    expect(context?.source.positions).toHaveLength(12)
  })

  it("opens the shape the shape param names", async () => {
    const { board, calls } = contextFor(baseTables(), { shape: "4-4-2" })
    expect((await board)?.source.title).toBe("4-4-2")
    const shapeCall = calls.find(
      (call) =>
        call.table === "formation_shape" &&
        call.steps.some(([name, args]) => name === "eq" && args[1] === "4-4-2"),
    )
    expect(shapeCall).toBeDefined()
  })

  it("opens a saved tactic from its pinned current version (AC-2, AC-3)", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow()],
      user_tactic_version: [versionRow()],
    })
    const { board, calls } = contextFor(tables, { tactic: "7" })
    const context = await board
    expect(context?.source).toMatchObject({
      title: "My 4-4-2",
      baseShapeName: "4-4-2",
      tacticId: 7,
      versionId: 9,
    })
    // The positions come from the stored split, not the library rows.
    expect(context?.source.positions[0]).toMatchObject({
      role: "GK",
      basisPoints: 1000,
    })
    expect(getShapePositions).not.toHaveBeenCalled()
    // The read asks for the live head only.
    expect(
      calls
        .find((call) => call.table === "user_tactic")!
        .steps.some(([name, args]) => name === "is" && args[1] === null),
    ).toBe(true)
  })

  it("prefers the tactic when both params arrive, which no UI produces", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow()],
      user_tactic_version: [versionRow()],
    })
    const { board } = contextFor(tables, { tactic: "7", shape: "4-4-2" })
    expect((await board)?.source.tacticId).toBe(7)
  })

  it("answers the not found state for a malformed tactic param, without a read", async () => {
    for (const param of ["abc", "-3", "0"]) {
      const { board, calls } = contextFor(baseTables(), { tactic: param })
      expect(await board).toBeNull()
      expect(calls.filter((call) => call.table === "user_tactic")).toHaveLength(
        0,
      )
    }
  })

  it("answers the not found state past the safe integer range", async () => {
    const { board } = contextFor(baseTables(), { tactic: "9007199254740993" })
    expect(await board).toBeNull()
  })

  it("is a not found state for a tactic that is not this user's", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow({ user_id: "someone-else" })],
      user_tactic_version: [versionRow()],
    })
    const { board } = contextFor(tables, { tactic: "7" })
    expect(await board).toBeNull()
  })

  it("is a not found state for a soft deleted tactic (AC-10)", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow({ deleted_at: new Date().toISOString() })],
      user_tactic_version: [versionRow()],
    })
    const { board } = contextFor(tables, { tactic: "7" })
    expect(await board).toBeNull()
  })

  it("is a not found state for a head whose current version never landed", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow()],
      user_tactic_version: [versionRow({ is_current: false })],
    })
    const { board } = contextFor(tables, { tactic: "7" })
    expect(await board).toBeNull()
  })

  it("is a not found state for a shape the library does not carry", async () => {
    const { board } = contextFor(baseTables(), { shape: "2-3-5" })
    expect(await board).toBeNull()
  })

  it("lets a retired base shape still edit", async () => {
    // shapeByName for the tactic's base deliberately has no deprecated filter;
    // only the param driven first read does. A tactic on a retired shape opens.
    const tables = {
      ...baseTables({
        user_tactic: [tacticRow()],
        user_tactic_version: [versionRow()],
      }),
    }
    // The head's base lookup answers even though the shape is deprecated.
    tables.formation_shape = [shapeRow({ deprecated: true })]
    const { board } = contextFor(tables, { tactic: "7" })
    const context = await board
    expect(context?.source.baseShapeName).toBe("4-4-2")
  })

  it("throws a named read failure rather than a silent empty board", async () => {
    const tables = baseTables()
    const { board } = contextFor(tables, {}, { errorOn: "formation_shape" })
    await expect(board).rejects.toThrow(/read shape list failed/)
  })
})

describe("readBoardContext: the suggestion card (AC-7)", () => {
  function withMoney(
    tables: Record<string, unknown[]>,
    moneyOver: { income: number; costs: number },
  ) {
    const { client, calls } = fakeClient(tables)
    vi.mocked(getShapePositions).mockReset().mockResolvedValue(seed442())
    vi.mocked(loadMoney)
      .mockReset()
      .mockResolvedValue(money(moneyOver.income, moneyOver.costs))
    return { board: readBoardContext(client, USER, {}), calls }
  }

  it("puts the debt rule first, even over a comfortable fund", async () => {
    const tables = baseTables({
      debt: [
        { id: 3, user_id: USER, principal_minor: 10_000_000, cleared_at: null },
      ],
      debt_progress: [{ debt_id: 3, paid_minor: 2_000_000 }],
      gk_fund_progress: [{ user_id: USER, gk_saved_minor: 45_000_000 }],
      match: [{ id: 1, user_id: USER, period: "2026-09-01", status: "active" }],
      match_line: [
        { match_id: 1, role: "DEF", planned_minor: 15_000_000 },
        { match_id: 1, role: "GK", planned_minor: 5_000_000 },
      ],
    })
    const { board } = withMoney(tables, { income: INCOME, costs: COSTS })
    expect((await board)?.suggestion?.shapeName).toBe("5-4-1")
  })

  it("recommends the fund shape once the fund reaches three months", async () => {
    const tables = baseTables({
      gk_fund_progress: [{ user_id: USER, gk_saved_minor: 45_000_000 }],
      match: [{ id: 1, user_id: USER, period: "2026-09-01", status: "active" }],
      // Frozen defense total: 15,000,000, so 45,000,000 saved is 3 months.
      match_line: [
        { match_id: 1, role: "DEF", planned_minor: 15_000_000 },
        { match_id: 1, role: "GK", planned_minor: 5_000_000 },
      ],
    })
    const { board } = withMoney(tables, { income: INCOME, costs: COSTS })
    const context = await board
    expect(context?.fundMonthsValue).toBe(3)
    expect(context?.suggestion).toMatchObject({
      shapeName: "4-3-3",
      reason: FORMATIONS.find((f) => f.name === "4-3-3")!.whenToPlay,
    })
  })

  it("recommends the defensive shape when costs pass half of income", async () => {
    const tables = baseTables()
    const { board } = withMoney(tables, {
      income: INCOME,
      costs: 25_000_000, // over half of 450,000 naira
    })
    expect((await board)?.suggestion?.shapeName).toBe("5-3-2")
  })

  it("shows no card for a steady season", async () => {
    const { board } = withMoney(baseTables(), {
      income: INCOME,
      costs: COSTS,
    })
    expect((await board)?.suggestion).toBeNull()
  })

  it("hides the card before there is income to speak of", async () => {
    const { board } = withMoney(baseTables(), { income: 0, costs: COSTS })
    expect((await board)?.suggestion).toBeNull()
  })

  it("never recommends a retired shape (AC-7)", async () => {
    // Costs rule fires and names 5-3-2, but that shape is retired, so the
    // live name list leaves it out and no card shows.
    const tables = baseTables({
      formation_shape: [
        shapeRow(),
        shapeRow({ id: 2, name: "5-3-2", deprecated: true }),
      ],
    })
    const { board } = withMoney(tables, { income: INCOME, costs: 25_000_000 })
    expect((await board)?.suggestion).toBeNull()
  })

  it("counts zero months, never a divide by zero, when nothing was played", async () => {
    const { board } = withMoney(baseTables(), { income: INCOME, costs: COSTS })
    const context = await board
    expect(context?.fundMonthsValue).toBe(0)
  })
})

describe("tacticList (AC-2, AC-10)", () => {
  it("shows only live heads that have a current version, and asks for both filters", async () => {
    const tables = baseTables({
      user_tactic: [
        tacticRow({ id: 7, name: "A keeper" }),
        tacticRow({ id: 8, name: "Deleted", deleted_at: "2026-10-01" }),
        tacticRow({ id: 9, name: "No version" }),
      ],
      user_tactic_version: [
        versionRow({ id: 90, tactic_id: 7 }),
        versionRow({ id: 91, tactic_id: 8 }),
      ],
    })
    const { client, calls } = fakeClient(tables)
    const list = await tacticList(client, USER)
    expect(list).toEqual([{ id: 7, name: "A keeper", shapeName: "4-4-2" }])

    const call = calls.find((c) => c.table === "user_tactic")!
    expect(
      call.steps.some(
        ([name, args]) =>
          name === "eq" && args[0] === "user_id" && args[1] === USER,
      ),
    ).toBe(true)
    expect(
      call.steps.some(
        ([name, args]) =>
          name === "is" && args[0] === "deleted_at" && args[1] === null,
      ),
    ).toBe(true)
  })

  it("leaves out a head whose only version lost its current flag", async () => {
    const tables = baseTables({
      user_tactic: [tacticRow()],
      user_tactic_version: [versionRow({ is_current: false })],
    })
    const { client } = fakeClient(tables)
    expect(await tacticList(client, USER)).toEqual([])
  })

  it("throws a named read failure when the table read breaks", async () => {
    const { client } = fakeClient(baseTables(), { errorOn: "user_tactic" })
    await expect(tacticList(client, USER)).rejects.toThrow(
      /read tactics failed/,
    )
  })
})
