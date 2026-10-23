// Server Action framework helpers (spec 0001 writes convention). The only
// boundary is the Supabase action client factory; parsing and error shaping
// run real.
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  client: { auth: { getClaims: vi.fn() } },
  createActionClient: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseActionClient: mocks.createActionClient,
}))

import { z } from "zod"

import {
  actionError,
  actionOk,
  authedAction,
  parsePayload,
  requireClaims,
} from "@/lib/actions"

const schema = z.object({ email: z.string().min(3) })

beforeEach(() => {
  mocks.createActionClient.mockReset()
  mocks.client.auth.getClaims.mockReset()
})

describe("actionOk / actionError", () => {
  it("actionOk defaults the data to null", () => {
    expect(actionOk()).toEqual({ ok: true, data: null })
  })

  it("actionOk carries the payload through unchanged", () => {
    expect(actionOk<string | null>("hello")).toEqual({
      ok: true,
      data: "hello",
    })
  })

  it("actionError carries code, message, and optional field errors", () => {
    expect(actionError("boom", "It broke", { email: ["Too short"] })).toEqual({
      ok: false,
      error: {
        code: "boom",
        message: "It broke",
        fieldErrors: { email: ["Too short"] },
      },
    })
  })
})

describe("parsePayload", () => {
  it("accepts a plain object payload and hands back the parsed input plus a client", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    const parsed = await parsePayload(schema, { email: "a@b.co" })
    expect(parsed).toEqual({
      ok: true,
      client: mocks.client,
      input: { email: "a@b.co" },
    })
  })

  it("flattens a FormData payload the same way", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    const form = new FormData()
    form.set("email", "a@b.co")
    const parsed = await parsePayload(schema, form)
    expect(parsed.ok).toBe(true)
  })

  it("returns an invalid_input result with per-field messages instead of throwing", async () => {
    const parsed = await parsePayload(schema, { email: "ab" })
    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.result).toEqual({
        ok: false,
        error: {
          code: "invalid_input",
          message: "Please correct the highlighted fields.",
          fieldErrors: {
            email: [expect.stringMatching(/too small|at least|short/i)],
          },
        },
      })
    }
    expect(mocks.createActionClient).not.toHaveBeenCalled()
  })

  it("groups two issues on the same field into one list", async () => {
    const twoFields = z.object({ a: z.string().min(3), b: z.string().min(3) })
    const parsed = await parsePayload(twoFields, { a: "x", b: "y" })
    expect(parsed.ok).toBe(false)
    if (!parsed.ok) {
      expect(parsed.result.error.fieldErrors).toEqual({
        a: [expect.any(String)],
        b: [expect.any(String)],
      })
    }
  })

  it("treats a missing payload as invalid input, never a crash", async () => {
    const parsed = await parsePayload(schema, undefined)
    expect(parsed.ok).toBe(false)
  })
})

describe("requireClaims", () => {
  it("returns the sub claim as the identity, never a client param (spec 0001 rule)", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
    })
    await expect(requireClaims()).resolves.toEqual({
      userId: "user-1",
      client: mocks.client,
    })
  })

  it("returns null when there is no sub claim, so the caller can answer session_expired", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({ data: { claims: {} } })
    await expect(requireClaims()).resolves.toBeNull()
  })

  it("returns null when claims themselves are absent", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({ data: null })
    await expect(requireClaims()).resolves.toBeNull()
  })
})

describe("authedAction", () => {
  const writeSchema = z.object({ name: z.string().min(1) })

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("hands the handler the claims identity and the parsed input, never a client user id", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
    })
    const handler = vi.fn(async ({ userId, input }) =>
      actionOk(`${userId}:${input.name}`),
    )
    const action = authedAction(writeSchema, handler)
    await expect(action({ name: "rent" })).resolves.toEqual({
      ok: true,
      data: "user-1:rent",
    })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("maps a rejected payload to the validation code with field errors", async () => {
    const action = authedAction(writeSchema, async () => actionOk())
    const result = await action({ name: "" })
    expect(result).toEqual({
      ok: false,
      error: {
        code: "validation",
        message: "Please correct the highlighted fields.",
        fieldErrors: { name: [expect.any(String)] },
      },
    })
  })

  it("answers session_expired when the claims are gone", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({ data: { claims: {} } })
    const handler = vi.fn()
    const action = authedAction(writeSchema, handler)
    const result = await action({ name: "rent" })
    expect(result).toMatchObject({
      ok: false,
      error: { code: "session_expired" },
    })
    expect(handler).not.toHaveBeenCalled()
  })

  it("passes a handler's expected failure through untouched", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
    })
    const action = authedAction(writeSchema, async () =>
      actionError("unable_to_cover", "Short by ₦2,000."),
    )
    await expect(action({ name: "rent" })).resolves.toEqual({
      ok: false,
      error: { code: "unable_to_cover", message: "Short by ₦2,000." },
    })
  })

  it("catches an unmapped throw and answers unexpected, logging server side only", async () => {
    mocks.createActionClient.mockResolvedValue(mocks.client)
    mocks.client.auth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
    })
    const action = authedAction(writeSchema, async () => {
      throw new Error("raw trigger text with amounts")
    })
    const result = await action({ name: "rent" })
    expect(result).toEqual({
      ok: false,
      error: {
        code: "unexpected",
        message: "Something went wrong. Try again.",
      },
    })
    expect(console.error).toHaveBeenCalled()
    expect(JSON.stringify(result)).not.toContain("raw trigger text")
  })
})
