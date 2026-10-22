// Unit tests for the server client factory (spec 0004 context, spec 0001 RLS
// rule). The boundary is @supabase/supabase-js: nothing real is called.
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"

const createClient = vi.fn()
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}))

import { supabaseServerClient } from "@/lib/supabase/server"

beforeEach(() => {
  vi.stubEnv("SUPABASE_ANON_KEY", "test-anon")
  vi.stubEnv("SUPABASE_URL", "http://db.test:54321")
})

afterEach(() => {
  vi.unstubAllEnvs()
  createClient.mockReturnValue({})
})

describe("supabaseServerClient", () => {
  it("throws when the anon key is not configured", () => {
    vi.stubEnv("SUPABASE_ANON_KEY", "")
    expect(() => supabaseServerClient()).toThrow(/SUPABASE_ANON_KEY/)
    // The failure must not leak the key value into the message.
    expect(() => supabaseServerClient()).not.toThrow(/test-anon/)
  })

  it("builds the anon role client when no token is given", () => {
    supabaseServerClient()
    const [url, key, opts] = createClient.mock.calls[0]!
    expect(url).toBe("http://db.test:54321")
    expect(key).toBe("test-anon")
    expect(opts.auth.persistSession).toBe(false)
    expect(opts.global).toBeUndefined()
  })

  it("falls back to the local dev URL when SUPABASE_URL is not set", () => {
    // stubEnv with undefined removes the variable, so the read is truly
    // unset, the case the source fallback is written for.
    vi.stubEnv("SUPABASE_URL", undefined)
    supabaseServerClient()
    const last = createClient.mock.calls.at(-1)!
    expect(last[0]).toBe("http://127.0.0.1:54321")
  })

  it("sends the access token as a bearer header so RLS sees the user", () => {
    supabaseServerClient("token-123")
    const [, , opts] = createClient.mock.calls[0]!
    expect(opts.global.headers.Authorization).toBe("Bearer token-123")
  })

  it("keeps any token text as provided, without a second guess at its scheme", () => {
    // A tampered or malformed token must still reach the server untouched:
    // the database decides, the client factory never rewrites credentials.
    supabaseServerClient("eyJ.abc")
    const [, , opts] = createClient.mock.calls[0]!
    expect(opts.global.headers.Authorization).toBe("Bearer eyJ.abc")
  })

  it("signs in with the anon key only, never a service credential", () => {
    supabaseServerClient("token-123")
    expect(createClient).toHaveBeenCalledTimes(1)
    const [, key] = createClient.mock.calls[0]!
    expect(key).toBe("test-anon")
  })
})
