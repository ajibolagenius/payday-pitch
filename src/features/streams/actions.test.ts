// Income stream CRUD actions (spec 0007, AC-1/AC-2/AC-9). The boundary is
// the Supabase action client and next/cache; schema validation and the
// authedAction composition run real.
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const chain = () => {
    const steps: Record<string, unknown> = {}
    type Step = ((arg?: unknown) => unknown) & { mock: { calls: unknown[] } }
    const builder = {} as Record<string, Step>
    for (const method of ["insert", "update", "delete", "eq", "select"]) {
      builder[method] = vi.fn((arg?: unknown) => {
        steps[method] = arg
        return builder
      })
    }
    Object.defineProperty(builder, "then", {
      value: (
        resolve: (value: unknown) => void,
        reject: (cause: unknown) => void,
      ) => {
        const call = builder.delete.mock.calls.length
          ? "delete"
          : builder.update.mock.calls.length
            ? "update"
            : "insert"
        const outcome = mocks.outcomes[call] ?? { data: [], error: null }
        if (outcome.error) reject(outcome.error)
        else resolve(outcome)
      },
    })
    return builder
  }
  return {
    outcomes: {} as Record<
      string,
      { data?: unknown; error?: unknown } | undefined
    >,
    chain,
    client: { from: vi.fn(), auth: { getClaims: vi.fn() } },
    createActionClient: vi.fn(),
  }
})

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseActionClient: mocks.createActionClient,
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from "next/cache"

import {
  addIncomeAction,
  deleteIncomeAction,
  updateIncomeAction,
} from "@/features/streams/actions"

const signedIn = () => {
  mocks.createActionClient.mockResolvedValue(mocks.client)
  mocks.client.auth.getClaims.mockResolvedValue({
    data: { claims: { sub: "user-1" } },
  })
  mocks.client.from.mockImplementation(() => mocks.chain())
}

beforeEach(() => {
  mocks.outcomes = {}
  vi.clearAllMocks()
})

describe("addIncomeAction", () => {
  it("stores the parsed kobo with the claims id and NGN, then revalidates", async () => {
    signedIn()
    const result = await addIncomeAction({
      name: "Salary",
      amountNaira: "450000",
      paydayDay: "28",
    })
    expect(result.ok).toBe(true)
    const builder = mocks.client.from.mock.results[0].value
    expect(mocks.client.from).toHaveBeenCalledWith("income_stream")
    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Salary",
      amount_minor: 45_000_000,
      currency: "NGN",
      payday_day: 28,
    })
    expect(revalidatePath).toHaveBeenCalledWith("/app")
  })

  it("rejects a third decimal with the validation code and a field error", async () => {
    signedIn()
    const result = await addIncomeAction({
      name: "Salary",
      amountNaira: "45000.500",
      paydayDay: "28",
    })
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "validation",
        fieldErrors: { amountNaira: [expect.any(String)] },
      },
    })
    expect(mocks.client.from).not.toHaveBeenCalled()
  })

  it("rejects a payday day outside 1 to 31", async () => {
    signedIn()
    const result = await addIncomeAction({
      name: "Salary",
      amountNaira: "45000",
      paydayDay: "32",
    })
    expect(result).toMatchObject({ ok: false, error: { code: "validation" } })
  })

  it("answers unexpected when the database throws", async () => {
    signedIn()
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.outcomes.insert = { error: new Error("raw unique violation text") }
    const result = await addIncomeAction({
      name: "Salary",
      amountNaira: "45000",
      paydayDay: "28",
    })
    expect(result).toMatchObject({ ok: false, error: { code: "unexpected" } })
    expect(JSON.stringify(result)).not.toContain("raw unique violation")
  })
})

describe("updateIncomeAction", () => {
  it("refuses a payload that names no row instead of reporting a save", async () => {
    signedIn()
    await expect(
      updateIncomeAction({
        name: "Side hustle",
        amountNaira: "80000",
        paydayDay: "15",
      }),
    ).resolves.toMatchObject({ ok: false, error: { code: "validation" } })
    expect(mocks.client.from).not.toHaveBeenCalled()
  })

  it("filters by id and the claims user, and reports not_found on a zero-row write", async () => {
    signedIn()
    mocks.outcomes.update = { data: [] }
    const result = await updateIncomeAction({
      id: "7",
      name: "Side hustle",
      amountNaira: "80000",
      paydayDay: "15",
    })
    expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
    const builder = mocks.client.from.mock.results[0].value
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1")
  })

  it("succeeds when the row comes back", async () => {
    signedIn()
    mocks.outcomes.update = { data: [{ id: 7 }] }
    const result = await updateIncomeAction({
      id: "7",
      name: "Side hustle",
      amountNaira: "80000",
      paydayDay: "15",
    })
    expect(result.ok).toBe(true)
  })
})

describe("deleteIncomeAction", () => {
  it("deletes only the caller's row and maps zero rows to not_found", async () => {
    signedIn()
    mocks.outcomes.delete = { data: [] }
    const result = await deleteIncomeAction({ id: "9" })
    expect(result).toMatchObject({ ok: false, error: { code: "not_found" } })
    const builder = mocks.client.from.mock.results[0].value
    expect(builder.eq).toHaveBeenCalledWith("id", 9)
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1")
  })
})
