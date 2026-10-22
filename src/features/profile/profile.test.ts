// Unit tests for the lazy profile upsert (spec 0004, AC-10). The client is a
// boundary here, so each test hands ensureProfile a fake one and asserts the
// calls it makes and the value it returns. The DB integration side (a real
// row created once) lives in src/lib/supabase/rls.test.ts.
import { describe, expect, it, vi } from "vitest"

import { ensureProfile } from "@/features/profile/profile"

type Reply = {
  upsertError?: { message: string } | null
  readError?: { message: string } | null
  row?: {
    user_id: string
    default_currency: string
    created_at: string
  } | null
}

const USER = "11111111-1111-1111-1111-111111111111"

function fakeClient(reply: Reply = {}, userId = USER) {
  const upsert = vi.fn().mockResolvedValue({ error: reply.upsertError ?? null })
  const maybeSingle = vi.fn().mockResolvedValue({
    data:
      reply.row === undefined
        ? {
            user_id: userId,
            default_currency: "NGN",
            created_at: "2026-10-21T00:00:00Z",
          }
        : reply.row,
    error: reply.readError ?? null,
  })
  const select = vi.fn(() => ({
    eq: () => ({ maybeSingle }),
  }))
  const client = {
    from: vi.fn(() => ({ upsert, select })),
  }
  return { client: client as never, upsert, select, maybeSingle }
}

describe("ensureProfile", () => {
  it("upserts on user_id without clobbering an existing row, then reads it back (AC-10)", async () => {
    const { client, upsert, select } = fakeClient({}, USER)
    const row = await ensureProfile(USER, client)
    expect(upsert).toHaveBeenCalledWith(
      { user_id: USER },
      { onConflict: "user_id", ignoreDuplicates: true },
    )
    expect(select).toHaveBeenCalledWith("user_id, default_currency, created_at")
    expect(row?.user_id).toBe(USER)
    expect(row?.default_currency).toBe("NGN")
  })

  it("tolerates a missing row: the read finds nothing and no error is thrown (AC-10)", async () => {
    const { client } = fakeClient({ row: null })
    await expect(ensureProfile(USER, client)).resolves.toBeNull()
  })

  it("returns null instead of throwing when the upsert fails", async () => {
    const { client, maybeSingle } = fakeClient({
      upsertError: { message: "permission denied" },
    })
    await expect(ensureProfile(USER, client)).resolves.toBeNull()
    // A failed write must not be followed by a read that pretends success.
    expect(maybeSingle).not.toHaveBeenCalled()
  })

  it("returns null instead of throwing when the read fails", async () => {
    const { client } = fakeClient({
      readError: { message: "connection reset" },
    })
    await expect(ensureProfile(USER, client)).resolves.toBeNull()
  })

  it("never sends a client-controlled currency or extra column on the write", async () => {
    const { client, upsert } = fakeClient()
    await ensureProfile(USER, client)
    const payload = upsert.mock.calls[0]![0]
    expect(Object.keys(payload)).toEqual(["user_id"])
  })
})
