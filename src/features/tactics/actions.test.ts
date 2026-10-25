// The tactics write path (spec 0008 AC-2, AC-3, AC-9, AC-10, AC-11). Schema
// validation, splitProblem, the domain split, and the authedAction composition
// all run real; the boundary is the session client and the play_match RPC.
// Asserted here: what each statement filters, that a validated split is stored
// untouched, that a refusal writes nothing, and that no client value can name
// a user, a version, or an amount.
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  createActionClient: vi.fn(),
  loadMoney: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseActionClient: mocks.createActionClient,
}))
vi.mock("@/features/match/queries", () => ({ loadMoney: mocks.loadMoney }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from "next/cache"

import { FORMATIONS } from "@/domain/formations"
import {
  deleteTactic,
  playSavedTactic,
  renameTactic,
  saveTactic,
} from "@/features/tactics/actions"

const INCOME = 45_000_000
const COSTS = 15_000_000
const USER = "user-1"

type Step = [string, unknown[]]
type Recording = { table: string; op: string; steps: Step[] }

function seed442Raw() {
  const shape = FORMATIONS.find((f) => f.name === "4-4-2")!
  return shape.positions.map((p, spotIndex) => ({
    role: p.role,
    spot_index: spotIndex,
    label: p.label,
    basis_points: p.basisPoints,
  }))
}

/**
 * A fake session client. eq and is actually filter the seeded rows, insert and
 * update are recorded, and the named table collides on insert with 23505 when
 * asked to. Every chained call is recorded so a test can assert the filters
 * (the owner scoping and the deleted_at predicate) rather than trust them.
 */
function actionState(
  over: {
    formation_shape?: Record<string, unknown>[]
    user_tactic?: Record<string, unknown>[]
    user_tactic_version?: Record<string, unknown>[]
  } = {},
) {
  const tables: Record<string, Record<string, unknown>[]> = {
    formation_shape: [
      {
        id: 1,
        name: "4-4-2",
        formation_position: seed442Raw().map((s) => ({
          role: s.role,
          basis_points: s.basis_points,
        })),
      },
    ],
    user_tactic: [],
    user_tactic_version: [],
    ...over,
  }
  const collide = new Set<string>()
  const recordings: Recording[] = []
  let nextId = 500

  const builder = (table: string) => {
    const record: Recording = { table, op: "select", steps: [] }
    recordings.push(record)
    let values: Record<string, unknown> | null = null
    let single = false
    let maybeOne = false
    let selectFields = ""
    const filters: [kind: "eq" | "is", column: string, value: unknown][] = []
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
    b.order = step("order")
    b.single = () => {
      single = true
      record.steps.push(["single", []])
      return b
    }
    b.maybeSingle = () => {
      maybeOne = true
      record.steps.push(["maybeSingle", []])
      return b
    }
    for (const op of ["insert", "update", "delete"] as const) {
      b[op] = (input?: unknown) => {
        record.op = op
        if (input) values = input as Record<string, unknown>
        record.steps.push([op, [input]])
        return b
      }
    }
    Object.defineProperty(b, "then", {
      value: (resolve: (value: unknown) => void) => {
        let rows = (tables[table] ?? []).filter((row) =>
          filters.every(([, column, value]) => row[column] === value),
        )
        // The head read asks for its versions inline; mirror the embed the
        // real client would attach.
        if (selectFields.includes("user_tactic_version")) {
          rows = rows.map((row) => ({
            ...row,
            user_tactic_version: (tables.user_tactic_version ?? []).filter(
              (child) => child.tactic_id === row.id,
            ),
          }))
        }
        if (record.op === "insert" || record.op === "update") {
          if (collide.has(table)) {
            resolve({
              data: null,
              error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "u"',
              },
            })
            return
          }
        }
        if (record.op === "insert") {
          const created = { id: nextId++, ...(values ?? {}) }
          tables[table]!.push(created)
          rows = [created]
        }
        if (record.op === "update") {
          for (const row of rows) Object.assign(row, values)
        }
        if (record.op === "delete")
          tables[table] = tables[table]!.filter((r) => !rows.includes(r))
        resolve({
          data: single
            ? (rows[0] ?? null)
            : maybeOne
              ? (rows[0] ?? null)
              : rows,
          error: null,
        })
      },
    })
    return b
  }

  const client = {
    auth: {
      getClaims: async (): Promise<{
        data: { claims: { sub: string } | null }
      }> => ({ data: { claims: { sub: USER } } }),
    },
    from: vi.fn(builder),
    rpc: mocks.rpc,
  }
  return {
    client,
    recordings,
    /** The next insert into this table answers a unique violation. */
    collideOn(table: string) {
      collide.add(table)
    },
    rows: tables,
  }
}

function signedIn(state = actionState()) {
  mocks.createActionClient.mockResolvedValue(state.client)
  mocks.loadMoney.mockResolvedValue({
    incomes: [],
    costs: [],
    incomeMinorUnits: INCOME,
    costMinorUnits: COSTS,
    currency: "NGN",
  })
  mocks.rpc.mockResolvedValue({
    data: { code: "ok", match_id: 42, period: "2026-10-01" },
    error: null,
  })
  return state
}

const stepsFor = (state: ReturnType<typeof actionState>, table: string) =>
  state.recordings.find((r) => r.table === table)!.steps

const savePayload = (over: Record<string, unknown> = {}) => ({
  name: "My 4-4-2",
  baseShapeName: "4-4-2",
  split: seed442Raw(),
  ...over,
})

// vitest.config sets clearMocks, and each test calls signedIn() itself, so no
// beforeEach here: clearing between tests would wipe the per test mock setup.

describe("saveTactic (AC-2, AC-3)", () => {
  it("creates the head and a first version, and stores the split exactly as it arrived", async () => {
    const state = signedIn()
    const split = seed442Raw()
    // Striker 750 to 800, the bench 500 to 450: a real board edit, still a whole.
    split[9] = { ...split[9]!, basis_points: 800 }
    split[11] = { ...split[11]!, basis_points: 450 }

    const result = await saveTactic(savePayload({ split }))
    expect(result).toMatchObject({
      ok: true,
      data: { tacticId: 500, versionId: 501 },
    })

    const head = state.recordings.find(
      (r) => r.table === "user_tactic" && r.op === "insert",
    )!
    // Identity comes from the claims, never from the payload.
    expect(head.steps.find(([name]) => name === "insert")![1][0]).toMatchObject(
      {
        user_id: USER,
        name: "My 4-4-2",
        shape_name: "4-4-2",
      },
    )

    const version = state.recordings.find(
      (r) => r.table === "user_tactic_version",
    )!
    const stored = version.steps.find(([name]) => name === "insert")![1][0] as {
      tactic_id: number
      split: { basis_points: number }[]
    }
    expect(stored.tactic_id).toBe(500)
    // No re-normalisation: the draft that passed the rules is what the version
    // pins, spot for spot.
    expect(stored.split).toEqual(split)
    expect(revalidatePath).toHaveBeenCalledWith("/app/tactics")
  })

  it("refuses a duplicate name and writes no version row", async () => {
    const state = signedIn()
    state.collideOn("user_tactic")
    const result = await saveTactic(savePayload())
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "name_taken",
        message: expect.stringMatching(/reserved/i),
      },
    })
    expect(
      state.recordings.some(
        (r) => r.table === "user_tactic_version" && r.op === "insert",
      ),
    ).toBe(false)
  })

  it("refuses a sixth tactic with the cap named", async () => {
    const held = [1, 2, 3, 4, 5].map((id) => ({
      id,
      user_id: USER,
      name: `Plan ${id}`,
      shape_name: "4-4-2",
      deleted_at: null,
    }))
    const versions = held.map((head) => ({
      tactic_id: head.id,
      is_current: true,
      split: seed442Raw(),
    }))
    const state = signedIn(
      actionState({
        user_tactic: held,
        user_tactic_version: versions,
      }),
    )
    const result = await saveTactic(savePayload({ name: "Sixth" }))
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "tactic_limit",
        message: expect.stringMatching(/5 tactics\. Delete one/i),
      },
    })
    expect(state.recordings.some((r) => r.op === "insert")).toBe(false)
  })

  it("refuses a split whose defense zone moved, before any write", async () => {
    const state = signedIn()
    const split = seed442Raw()
    // A hand written payload that shrinks the locked cost pool.
    split[1] = { ...split[1]!, basis_points: 900 }
    split[11] = { ...split[11]!, basis_points: 600 }
    const result = await saveTactic(savePayload({ split }))
    expect(result).toMatchObject({
      ok: false,
      error: { code: "invalid_split", message: expect.any(String) },
    })
    expect(state.recordings.some((r) => r.op === "insert")).toBe(false)
  })

  it("refuses a split that is one spot short for its base shape", async () => {
    const state = signedIn()
    const result = await saveTactic(
      savePayload({ split: seed442Raw().slice(0, 11) }),
    )
    expect(result).toMatchObject({
      ok: false,
      error: { code: "invalid_split" },
    })
    expect(state.recordings.some((r) => r.op === "insert")).toBe(false)
  })

  it("edits in place: the head's base shape wins, no cap check, one new version (AC-3)", async () => {
    const state = signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: USER,
            name: "My 4-4-2",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
        user_tactic_version: [
          { tactic_id: 7, is_current: true, split: seed442Raw() },
        ],
      }),
    )
    const result = await saveTactic(
      savePayload({ tacticId: 7, name: "Ignored", baseShapeName: "5-4-1" }),
    )
    expect(result).toMatchObject({ ok: true, data: { tacticId: 7 } })

    // A new version row on the existing head; no second head.
    expect(
      state.recordings.filter(
        (r) => r.table === "user_tactic_version" && r.op === "insert",
      ),
    ).toHaveLength(1)
    expect(
      state.recordings.filter(
        (r) => r.table === "user_tactic" && r.op === "insert",
      ),
    ).toHaveLength(0)
    // The edit looked the head up by id AND owner, live only.
    const headRead = stepsFor(state, "user_tactic")
    expect(
      headRead.some(
        ([name, args]) =>
          name === "eq" && args[0] === "user_id" && args[1] === USER,
      ),
    ).toBe(true)
    expect(
      headRead.some(
        ([name, args]) => name === "is" && args[0] === "deleted_at",
      ),
    ).toBe(true)
  })

  it("says not found for a tactic that is gone, deleted, or never this user's (AC-11)", async () => {
    const state = signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: "someone-else",
            name: "Theirs",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
      }),
    )
    const result = await saveTactic(savePayload({ tacticId: 7 }))
    expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
    expect(state.recordings.some((r) => r.op === "insert")).toBe(false)
  })

  it("refuses a forty character name as a field error before touching the database", async () => {
    signedIn()
    const result = await saveTactic(savePayload({ name: "x".repeat(40) }))
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "validation",
        fieldErrors: { name: [expect.stringMatching(/30 characters/)] },
      },
    })
    expect(mocks.createActionClient).not.toHaveBeenCalled()
  })

  it("refuses an empty name the same way", async () => {
    const result = await saveTactic(savePayload({ name: "   " }))
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "validation",
        fieldErrors: { name: [expect.any(String)] },
      },
    })
  })

  it("answers session_expired with no writes when the claims are gone", async () => {
    const state = actionState()
    state.client.auth.getClaims = async () => ({ data: { claims: null } })
    mocks.createActionClient.mockResolvedValue(state.client)
    const result = await saveTactic(savePayload())
    expect(result).toMatchObject({
      ok: false,
      error: { code: "session_expired" },
    })
    expect(state.recordings.some((r) => r.op === "insert")).toBe(false)
  })

  it("never accepts a user_id from the payload: the head keeps the claim subject (AC-11)", async () => {
    const state = signedIn()
    await saveTactic(
      savePayload({ user_id: "someone-else" }) as Record<string, unknown>,
    )
    const head = state.recordings.find(
      (r) => r.table === "user_tactic" && r.op === "insert",
    )!
    expect(head.steps.find(([name]) => name === "insert")![1][0]).toMatchObject(
      { user_id: USER },
    )
  })
})

describe("renameTactic (AC-10)", () => {
  it("updates by id and owner only and revalidates the board", async () => {
    const state = signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: USER,
            name: "Old",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
      }),
    )
    const result = await renameTactic({ tacticId: 7, name: "New name" })
    expect(result).toMatchObject({ ok: true })
    const steps = stepsFor(state, "user_tactic")
    expect(
      steps.some(
        ([name, args]) => name === "eq" && args[0] === "id" && args[1] === 7,
      ),
    ).toBe(true)
    expect(
      steps.some(
        ([name, args]) =>
          name === "eq" && args[0] === "user_id" && args[1] === USER,
      ),
    ).toBe(true)
    expect(state.rows.user_tactic![0]!.name).toBe("New name")
  })

  it("maps a unique violation to name_taken", async () => {
    const state = signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: USER,
            name: "Old",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
      }),
    )
    state.collideOn("user_tactic")
    const result = await renameTactic({ tacticId: 7, name: "Taken" })
    expect(result).toMatchObject({ ok: false, error: { code: "name_taken" } })
  })

  it("says not found when no row matches, including another user's id (AC-11)", async () => {
    signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: "someone-else",
            name: "Theirs",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
      }),
    )
    const result = await renameTactic({ tacticId: 404, name: "Ghost" })
    expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
    const taken = await renameTactic({ tacticId: 7, name: "Ghost" })
    expect(taken).toMatchObject({ ok: false, error: { code: "not_found" } })
  })
})

describe("deleteTactic (AC-10)", () => {
  it("soft deletes: stamps deleted_at, touches no version row", async () => {
    const state = signedIn(
      actionState({
        user_tactic: [
          {
            id: 7,
            user_id: USER,
            name: "Old",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
        user_tactic_version: [
          { tactic_id: 7, is_current: true, split: seed442Raw() },
        ],
      }),
    )
    const result = await deleteTactic({ tacticId: 7 })
    expect(result).toMatchObject({ ok: true })
    expect(state.rows.user_tactic![0]!.deleted_at).toBeTruthy()
    expect(
      state.recordings.some(
        (r) => r.table === "user_tactic_version" && r.op !== "select",
      ),
    ).toBe(false)
    // Live only, owned only: a second delete of the same id finds nothing.
    const again = await deleteTactic({ tacticId: 7 })
    expect(again).toMatchObject({ ok: false, error: { code: "not_found" } })
  })

  it("says not found for an id that is gone or someone else's", async () => {
    const result = await deleteTactic({ tacticId: 999 })
    expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
  })
})

describe("playSavedTactic (AC-8, AC-9, AC-11)", () => {
  const ownTactic = (over: Record<string, unknown> = {}) =>
    actionState({
      user_tactic: [
        {
          id: 7,
          user_id: USER,
          name: "My 4-4-2",
          shape_name: "4-4-2",
          deleted_at: null,
          ...over,
        },
      ],
      user_tactic_version: [
        { tactic_id: 7, is_current: true, split: seed442Raw(), id: 9 },
      ],
    })

  type PayloadLine = {
    role: string
    spot_index: number
    label: string
    basis_points: number
    planned_minor: number
    actual_minor: number | null
    currency: string
  }

  it("plays the current version with twelve server computed lines and no shape id (AC-8)", async () => {
    signedIn(ownTactic())
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({
      ok: true,
      data: { matchId: 42, period: "2026-10-01" },
    })

    expect(mocks.rpc).toHaveBeenCalledTimes(1)
    const args = mocks.rpc.mock.calls[0]![1] as {
      p_shape_id?: number
      p_tactic_version_id: number
      p_lines: PayloadLine[]
    }
    // No shape id in this call: the version is the only source.
    expect(args.p_shape_id).toBeUndefined()
    // The version comes from the head, never from the client.
    expect(args.p_tactic_version_id).toBe(9)
    const lines = args.p_lines
    expect(lines).toHaveLength(12)
    expect(lines.reduce((s, l) => s + l.planned_minor, 0)).toBe(INCOME)
    expect(
      lines
        .filter((l) => l.role === "DEF")
        .reduce((s, l) => s + l.planned_minor, 0),
    ).toBe(COSTS)
    expect(lines.every((l) => l.actual_minor === null)).toBe(true)
    expect(lines.every((l) => l.currency === "NGN")).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith("/app")
  })

  it("picks the current version when the head carries several", async () => {
    const state = signedIn(ownTactic())
    state.rows.user_tactic_version!.push({
      tactic_id: 7,
      is_current: false,
      split: seed442Raw(),
      id: 8,
    })
    await playSavedTactic({ tacticId: 7 })
    const args = mocks.rpc.mock.calls[0]![1] as { p_tactic_version_id: number }
    expect(args.p_tactic_version_id).toBe(9)
  })

  it("refuses a plan that cannot cover the costs, names the shortfall, and never calls the function (AC-9)", async () => {
    signedIn(ownTactic())
    // Income 300,000 naira: defence holds 40 percent, 12,000,000 kobo, against
    // 15,000,000 of costs: a 30,000 naira gap.
    mocks.loadMoney.mockResolvedValue({
      incomes: [],
      costs: [],
      incomeMinorUnits: 30_000_000,
      costMinorUnits: COSTS,
      currency: "NGN",
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "unable_to_cover" },
    })
    if (!result.ok) {
      expect(result.error.message).toContain("30,000")
      expect(result.error.message).toMatch(/base shape with a wider defense/i)
    }
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it("says add your income first when there is nothing to split", async () => {
    signedIn(ownTactic())
    mocks.loadMoney.mockResolvedValue({
      incomes: [],
      costs: [],
      incomeMinorUnits: 0,
      costMinorUnits: 0,
      currency: "NGN",
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({ ok: false, error: { code: "no_income" } })
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it("is not found for a missing, deleted, or foreign tactic, with no hint it exists (AC-11)", async () => {
    for (const rows of [
      // No head at all.
      { user_tactic: [], user_tactic_version: [] },
      // Owned by someone else.
      {
        user_tactic: [
          {
            id: 7,
            user_id: "someone-else",
            name: "Theirs",
            shape_name: "4-4-2",
            deleted_at: null,
          },
        ],
        user_tactic_version: [
          { id: 9, tactic_id: 7, is_current: true, split: seed442Raw() },
        ],
      },
      // Soft deleted.
      {
        user_tactic: [
          {
            id: 7,
            user_id: USER,
            name: "Gone",
            shape_name: "4-4-2",
            deleted_at: "2026-10-01",
          },
        ],
        user_tactic_version: [
          { id: 9, tactic_id: 7, is_current: true, split: seed442Raw() },
        ],
      },
    ]) {
      mocks.rpc.mockClear()
      signedIn(actionState(rows))
      const result = await playSavedTactic({ tacticId: 7 })
      expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
    }
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it("passes the function's tactic_stale answer through", async () => {
    signedIn(ownTactic())
    mocks.rpc.mockResolvedValue({
      data: { code: "tactic_stale", message: "Reload the board." },
      error: null,
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "tactic_stale", message: "Reload the board." },
    })
  })

  it("maps a concurrent second play to the conflict code", async () => {
    signedIn(ownTactic())
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key value violates" },
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "conflict", message: expect.stringMatching(/reload/i) },
    })
  })

  it("uses the function's shortfall when its re-read moved past the domain's", async () => {
    signedIn(ownTactic())
    mocks.rpc.mockResolvedValue({
      data: { code: "unable_to_cover", shortfall_minor: 1_000_000 },
      error: null,
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "unable_to_cover" },
    })
    if (!result.ok) expect(result.error.message).toContain("10,000")
  })

  it("turns a raw database failure into unexpected without leaking it", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    signedIn(ownTactic())
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "500", message: "raw trigger text with amounts" },
    })
    const result = await playSavedTactic({ tacticId: 7 })
    expect(result).toMatchObject({ ok: false, error: { code: "unexpected" } })
    expect(JSON.stringify(result)).not.toContain("raw trigger")
    spy.mockRestore()
  })
})
