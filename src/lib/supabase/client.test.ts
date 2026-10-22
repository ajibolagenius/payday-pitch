// Browser Supabase client (spec 0006 build step 1, AC-7). The boundary is
// @supabase/ssr; the test pins what the auth screens rely on: env values and
// the PKCE flow type that makes email links land on /auth/callback.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const createBrowserClient = vi.hoisted(() => vi.fn())

vi.mock("@supabase/ssr", () => ({ createBrowserClient }))

import { createSupabaseBrowserClient } from "@/lib/supabase/client"

beforeEach(() => {
  createBrowserClient.mockReset()
  createBrowserClient.mockReturnValue({})
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("createSupabaseBrowserClient", () => {
  it("builds the client from the public env values with the PKCE flow (covers: AC-7)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://remote.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_pub")
    createSupabaseBrowserClient()
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://remote.supabase.co",
      "sb_publishable_pub",
      { auth: { flowType: "pkce" } },
    )
  })

  it("falls back to the local project so the e2e suite needs no env file", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    createSupabaseBrowserClient()
    expect(createBrowserClient).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "",
      { auth: { flowType: "pkce" } },
    )
  })
})
