// /auth/callback: the single landing for every emailed link (spec 0006
// AC-4, AC-9, AC-11). The boundary is createSupabaseCookieClient; the request
// and response are real Next objects so the status, Location header, and
// cookie deletion are asserted as the browser sees them.
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseCookieClient: () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      verifyOtp: mocks.verifyOtp,
    },
  }),
}))

import { NextRequest } from "next/server"

import { GET } from "@/app/auth/callback/route"
import { PENDING_SIGNUP_COOKIE } from "@/features/auth/cookies"

function request(query: string) {
  return new NextRequest(`http://127.0.0.1:3000/auth/callback${query}`)
}

const EXPIRED = "/sign-in?reason=expired"

beforeEach(() => {
  mocks.exchangeCodeForSession.mockReset()
  mocks.verifyOtp.mockReset()
})

describe("GET /auth/callback", () => {
  it("sends a link with neither code nor token_hash to the expired sign-in (covers: AC-11)", async () => {
    const response = await GET(request(""))
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(EXPIRED)
  })

  it("exchanges the PKCE code and lands a signup on /app (covers: AC-1, AC-9)", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    const response = await GET(request("?code=abc&type=signup"))
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("abc")
    expect(response.headers.get("location")).toBe("/app")
  })

  it("lands a recovery link on /reset-password, never /app (covers: AC-4, AC-9)", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    const response = await GET(request("?code=abc&type=recovery"))
    expect(response.headers.get("location")).toBe("/reset-password")
  })

  it("verifies a token_hash link with the signup type when no code is present", async () => {
    mocks.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null })
    const response = await GET(request("?token_hash=T123&type=signup"))
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "T123",
    })
    expect(response.headers.get("location")).toBe("/app")
  })

  it("verifies a token_hash recovery link with the recovery type (covers: AC-4)", async () => {
    mocks.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null })
    await GET(request("?token_hash=T123&type=recovery"))
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "T123",
    })
  })

  it("sends a dead, reused, or expired code to the expired sign-in (covers: AC-11)", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: { message: "invalid code" },
    })
    const response = await GET(request("?code=stolen&type=signup"))
    expect(response.headers.get("location")).toBe(EXPIRED)
  })

  it("sends a failed token verification to the expired sign-in (covers: AC-11)", async () => {
    mocks.verifyOtp.mockResolvedValue({
      data: null,
      error: { message: "expired otp" },
    })
    const response = await GET(request("?token_hash=old&type=recovery"))
    expect(response.headers.get("location")).toBe(EXPIRED)
  })

  it("spends the pending signup cookie when an address is confirmed (invariant: dropped on confirmation)", async () => {
    mocks.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null })
    const response = await GET(request("?token_hash=T123&type=signup"))
    const setCookies = response.headers.getSetCookie().join("\n")
    expect(setCookies).toContain(`${PENDING_SIGNUP_COOKIE}=;`)
  })

  it("leaves the pending signup alone on recovery, where no signup was just made", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    const response = await GET(request("?code=abc&type=recovery"))
    const setCookies = response.headers.getSetCookie().join("\n")
    expect(setCookies).not.toContain(PENDING_SIGNUP_COOKIE)
  })

  it("redirects with a relative Location, so localhost and 127.0.0.1 share one cookie jar (covers: AC-7)", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    const response = await GET(request("?code=abc&type=signup"))
    expect(response.headers.get("location")).toMatch(/^\//)
  })
})
