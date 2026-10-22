// Unit tests for the server client factory (spec 0004 context, spec 0001 RLS
// rule). The boundary is @supabase/supabase-js: nothing real is called.
// supabaseEnv() memoizes per module instance, so every test re-imports the
// module with its env stubs already in place.
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"

const createClient = vi.fn()
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}))

async function freshServerModule() {
  vi.resetModules()
  return import("@/lib/supabase/server")
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://db.test:54321")
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable")
})

afterEach(() => {
  vi.unstubAllEnvs()
  createClient.mockReturnValue({})
})

describe("supabaseServerClient", () => {
  it("throws when no key is configured for a remote project", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://prod.example.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")
    vi.stubEnv("SUPABASE_ANON_KEY", "")
    const { supabaseServerClient: make } = await freshServerModule()
    expect(() => make()).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/)
    // The failure must not leak the key value into the message.
    expect(() => make()).not.toThrow(/test-publishable/)
  })

  it("builds the anon role client when no token is given", async () => {
    const { supabaseServerClient: make } = await freshServerModule()
    make()
    const [url, key, opts] = createClient.mock.calls[0]!
    expect(url).toBe("http://db.test:54321")
    expect(key).toBe("test-publishable")
    expect(opts.auth.persistSession).toBe(false)
    expect(opts.global).toBeUndefined()
  })

  it("falls back to the local dev URL and demo key when nothing is set", async () => {
    // stubEnv with undefined removes the variable, so the read is truly
    // unset, the case the local fallbacks are written for.
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined)
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined)
    vi.stubEnv("SUPABASE_URL", undefined)
    vi.stubEnv("SUPABASE_ANON_KEY", undefined)
    const { supabaseServerClient: make } = await freshServerModule()
    make()
    const last = createClient.mock.calls.at(-1)!
    expect(last[0]).toBe("http://127.0.0.1:54321")
    expect(last[1]).toMatch(/^eyJ/)
  })

  it("sends the access token as a bearer header so RLS sees the user", async () => {
    const { supabaseServerClient: make } = await freshServerModule()
    make("token-123")
    const [, , opts] = createClient.mock.calls[0]!
    expect(opts.global.headers.Authorization).toBe("Bearer token-123")
  })

  it("keeps any token text as provided, without a second guess at its scheme", async () => {
    // A tampered or malformed token must still reach the server untouched:
    // the database decides, the client factory never rewrites credentials.
    const { supabaseServerClient: make } = await freshServerModule()
    make("eyJ.abc")
    const [, , opts] = createClient.mock.calls[0]!
    expect(opts.global.headers.Authorization).toBe("Bearer eyJ.abc")
  })

  it("signs in with the publishable key only, never a service credential", async () => {
    const { supabaseServerClient: make } = await freshServerModule()
    make("token-123")
    expect(createClient).toHaveBeenCalledTimes(1)
    const [, key] = createClient.mock.calls[0]!
    expect(key).toBe("test-publishable")
  })
})
