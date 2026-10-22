// Lazy Supabase env validation (spec 0001: public pages render without keys;
// spec 0006: SITE_URL feeds the callback allow list). supabaseEnv() memoizes
// per module instance, so every test re-imports the module with its env stubs
// already in place (same pattern as server.test.ts).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

async function freshEnv() {
  vi.resetModules()
  const { supabaseEnv } = await import("@/lib/env")
  return supabaseEnv()
}

beforeEach(() => {
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_KEY",
    "SITE_URL",
  ]) {
    delete process.env[key]
  }
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("supabaseEnv", () => {
  it("falls back to the local project and its demo key with no env file", async () => {
    const env = await freshEnv()
    expect(env.url).toBe("http://127.0.0.1:54321")
    expect(env.publishableKey).toMatch(/^eyJ/)
    expect(env.siteUrl).toBe("http://127.0.0.1:3000")
  })

  it("prefers the NEXT_PUBLIC values over the server-only names", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://remote.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_pub")
    vi.stubEnv("SUPABASE_URL", "http://ignored:54321")
    const env = await freshEnv()
    expect(env.url).toBe("https://remote.supabase.co")
    expect(env.publishableKey).toBe("sb_publishable_pub")
  })

  it("accepts the legacy anon key as the publishable fallback", async () => {
    vi.stubEnv("SUPABASE_ANON_KEY", "legacy-anon")
    const env = await freshEnv()
    expect(env.publishableKey).toBe("legacy-anon")
  })

  it("throws a set-the-keys message for a remote url with no key, instead of a silent default (covers: AC-7 env guard)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://remote.supabase.co")
    await expect(freshEnv()).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    )
  })

  it("never reaches the local demo key in a production build", async () => {
    vi.stubEnv("NODE_ENV", "production")
    await expect(freshEnv()).rejects.toThrow(/not configured/)
  })

  it("takes SITE_URL as the callback origin", async () => {
    vi.stubEnv("SITE_URL", "https://paydaypitch.app")
    const env = await freshEnv()
    expect(env.siteUrl).toBe("https://paydaypitch.app")
  })

  it("reads the secret key from either env name", async () => {
    vi.stubEnv("SUPABASE_SERVICE_KEY", "svc")
    expect((await freshEnv()).secretKey).toBe("svc")
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret")
    expect((await freshEnv()).secretKey).toBe("secret")
  })

  it("leaves the secret key undefined when unset", async () => {
    expect((await freshEnv()).secretKey).toBeUndefined()
  })
})
