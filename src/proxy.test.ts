// Host canonicalization and session gate unit tests (spec 0006 AC-8, AC-12).
// The sign in & accounts bug: a signup started on the localhost alias stored
// its PKCE verifier in a second cookie jar, so the confirmation link arrived
// on the canonical host and expired.
import { beforeEach, describe, expect, test, vi } from "vitest"
import { NextRequest } from "next/server"

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  env: {
    url: "http://127.0.0.1:54321",
    publishableKey: "local-anon-key",
    siteUrl: "http://127.0.0.1:3000",
  },
}))

vi.mock("@/lib/env", () => ({ supabaseEnv: () => mocks.env }))

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getClaims: mocks.getClaims } }),
}))

import { canonicalOrigin, proxy } from "@/proxy"

// A page request as the browser would send it: absolute URL, Host header, and
// the cookies in one header.
function pageRequest(
  path: string,
  cookies: Record<string, string> = {},
  host = "127.0.0.1:3000",
): NextRequest {
  const raw = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
  return new NextRequest(`http://${host}${path}`, {
    headers: raw ? { host, cookie: raw } : { host },
  })
}

const SESSION = {
  "sb-demo-auth-token.0": "chunk-a",
  "sb-demo-auth-token.1": "chunk-b",
}
const PKCE_ONLY = {
  "sb-demo-auth-token-code-verifier": "verifier",
  "sb-demo-auth-token-expires-at": "123",
}

beforeEach(() => {
  mocks.getClaims.mockReset()
})

describe("canonicalOrigin", () => {
  test("redirects the localhost alias to the canonical 127.0.0.1 origin", () => {
    expect(canonicalOrigin("localhost:3000", "http://127.0.0.1:3000")).toBe(
      "http://127.0.0.1:3000",
    )
  })

  test("redirects the other direction when SITE_URL uses localhost", () => {
    expect(canonicalOrigin("127.0.0.1:3000", "http://localhost:3000")).toBe(
      "http://localhost:3000",
    )
  })

  test("leaves the canonical host alone", () => {
    expect(
      canonicalOrigin("127.0.0.1:3000", "http://127.0.0.1:3000"),
    ).toBeNull()
  })

  test("leaves a different port alone (production build e2e on 3200)", () => {
    expect(
      canonicalOrigin("localhost:3200", "http://127.0.0.1:3000"),
    ).toBeNull()
  })

  test("never touches a real domain, even one served through the alias", () => {
    expect(
      canonicalOrigin("paydaypitch.app", "http://127.0.0.1:3000"),
    ).toBeNull()
    expect(
      canonicalOrigin("localhost:3000", "https://paydaypitch.app"),
    ).toBeNull()
  })

  test("answers null for a missing or malformed host", () => {
    expect(canonicalOrigin(null, "http://127.0.0.1:3000")).toBeNull()
    expect(
      canonicalOrigin("not a host :3000", "http://127.0.0.1:3000"),
    ).toBeNull()
  })
})

// The branch that decides whether a dead cookie lands on a clear "you were
// signed out" screen or loops (spec 0006 AC-8, AC-12).
describe("proxy session gate", () => {
  test("lets a live session through to /app", async () => {
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "u1" } },
      error: null,
    })
    const res = await proxy(pageRequest("/app", SESSION))
    expect(res.status).toBe(200)
    expect(res.headers.get("x-app-pathname")).toBe("/app")
    expect(mocks.getClaims).toHaveBeenCalled()
  })

  test("sends a revoked session on /app to sign-in with reason=expired (covers: AC-12)", async () => {
    mocks.getClaims.mockResolvedValue({
      data: null,
      error: { message: "invalid claim: missing sub" },
    })
    const res = await proxy(pageRequest("/app", SESSION))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe(
      "http://127.0.0.1:3000/sign-in?next=%2Fapp&reason=expired",
    )
  })

  test("never bounces a dead cookie from sign-in back to sign-in (covers: AC-12)", async () => {
    mocks.getClaims.mockResolvedValue({
      data: null,
      error: { message: "expired" },
    })
    const res = await proxy(pageRequest("/sign-in", SESSION))
    expect(res.status).toBe(200)
  })

  test("gates a cookie-less visit to /app, carrying the path (covers: AC-2, AC-8)", async () => {
    const res = await proxy(pageRequest("/app"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe(
      "http://127.0.0.1:3000/sign-in?next=%2Fapp",
    )
    expect(mocks.getClaims).not.toHaveBeenCalled()
  })

  test("counts a mid-PKCE verifier cookie as no session, not a revoked one (covers: AC-8)", async () => {
    const res = await proxy(pageRequest("/app", PKCE_ONLY))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe(
      "http://127.0.0.1:3000/sign-in?next=%2Fapp",
    )
    expect(mocks.getClaims).not.toHaveBeenCalled()
  })

  test("leaves an unprotected page alone when no session is present", async () => {
    const res = await proxy(pageRequest("/recover"))
    expect(res.status).toBe(200)
    expect(mocks.getClaims).not.toHaveBeenCalled()
  })
})
