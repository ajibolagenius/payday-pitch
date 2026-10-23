// Fixed cost CRUD actions (spec 0007, AC-1/AC-2/AC-9). Same boundary mocking
// as the streams tests; the shared authedAction behavior is proven in
// src/lib/actions.test.ts, so this covers the cost-specific wiring only.
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
  addFixedCostAction,
  deleteFixedCostAction,
  updateFixedCostAction,
} from "@/features/costs/actions"

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

describe("addFixedCostAction", () => {
  it("stores kobo with no payday column", async () => {
    signedIn()
    const result = await addFixedCostAction({
      name: "Rent",
      amountNaira: "850000.75",
    })
    expect(result.ok).toBe(true)
    const builder = mocks.client.from.mock.results[0].value
    expect(mocks.client.from).toHaveBeenCalledWith("fixed_cost")
    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Rent",
      amount_minor: 85_000_075,
      currency: "NGN",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/app")
  })

  it("rejects zero and junk amounts with the validation code", async () => {
    signedIn()
    await expect(
      addFixedCostAction({ name: "Rent", amountNaira: "0" }),
    ).resolves.toMatchObject({ ok: false, error: { code: "validation" } })
    await expect(
      addFixedCostAction({ name: "Rent", amountNaira: "₦8500" }),
    ).resolves.toMatchObject({ ok: false, error: { code: "validation" } })
  })
})

describe("updateFixedCostAction", () => {
  it("refuses a payload that names no row instead of reporting a save", async () => {
    signedIn()
    await expect(
      updateFixedCostAction({ name: "Food", amountNaira: "50000" }),
    ).resolves.toMatchObject({ ok: false, error: { code: "validation" } })
    expect(mocks.client.from).not.toHaveBeenCalled()
  })

  it("maps a zero-row write to not_found", async () => {
    signedIn()
    mocks.outcomes.update = { data: [] }
    await expect(
      updateFixedCostAction({ id: "3", name: "Food", amountNaira: "50000" }),
    ).resolves.toMatchObject({ ok: false, error: { code: "not_found" } })
  })
})

describe("deleteFixedCostAction", () => {
  it("succeeds when the row comes back", async () => {
    signedIn()
    mocks.outcomes.delete = { data: [{ id: 3 }] }
    await expect(deleteFixedCostAction({ id: "3" })).resolves.toEqual({
      ok: true,
      data: null,
    })
  })
})
