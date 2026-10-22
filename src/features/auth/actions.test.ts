// Auth Server Actions (spec 0006 API surface). The boundary is the Supabase
// server client factory plus next/headers and next/navigation; everything
// else (schemas, redirect resolution, messages) runs real so the tests prove
// the composed behavior. redirect() is mocked to throw, matching Next's
// unwinding behavior; redirectedTo records the target.
// Traces to spec 0006 acceptance criteria (covers: tags in test names).
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    getClaims: vi.fn(),
  },
  store: new Map<string, string>(),
  setCookie: vi.fn(),
  redirectedTo: [] as string[],
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseActionClient: async () => ({ auth: mocks.auth }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mocks.store.has(name)
        ? { name, value: mocks.store.get(name) }
        : undefined,
    set: (name: string, value: string, options?: unknown) => {
      mocks.setCookie(name, value, options)
      mocks.store.set(name, value)
    },
    delete: (name: string) => {
      mocks.store.delete(name)
    },
    getAll: () =>
      [...mocks.store.entries()].map(([name, value]) => ({ name, value })),
  }),
}))

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirectedTo.push(url)
    throw new Error(`NEXT_REDIRECT ${url}`)
  },
}))

import {
  recoverAction,
  resendConfirmationAction,
  resendFromSignInAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
  startOverAction,
} from "./actions"
import { PENDING_SIGNUP_COOKIE } from "./cookies"
import {
  CONFIRM_FIRST_MESSAGE,
  RECOVER_SENT_MESSAGE,
  SENT_ANYWAY_MESSAGE,
  SIGNED_OUT_MESSAGE,
  THROTTLED_MESSAGE,
  UNAVAILABLE_MESSAGE,
  VAGUE_CREDENTIALS_ERROR,
} from "./messages"

// A navigate-on-success action rejects with the mock's redirect error and
// records the target. Asserting both keeps the redirect story honest.
async function expectRedirect(action: Promise<unknown>, target: string) {
  await expect(action).rejects.toThrow(`NEXT_REDIRECT ${target}`)
  expect(mocks.redirectedTo.at(-1)).toBe(target)
}

function failed(message: string) {
  return { data: null, error: { message } }
}

const THROTTLE =
  "For security purposes, you can only request this after 60 seconds"
const BAD_CREDS = "Invalid login credentials"

beforeEach(() => {
  mocks.store.clear()
  mocks.redirectedTo.length = 0
  for (const fn of Object.values(mocks.auth)) fn.mockReset()
})

describe("signInAction", () => {
  it("answers a wrong email and a wrong password with the identical vague message (covers: AC-11)", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue(failed(BAD_CREDS))
    const wrongPassword = await signInAction(null, {
      email: "a@b.co",
      password: "hunter2x",
    })
    const wrongEmail = await signInAction(null, {
      email: "nobody@b.co",
      password: "hunter2x",
    })
    expect(wrongPassword).toEqual(wrongEmail)
    expect(wrongPassword).toEqual({
      ok: false,
      error: {
        code: "invalid_credentials",
        message: VAGUE_CREDENTIALS_ERROR,
        fieldErrors: undefined,
      },
    })
  })

  it("names an unconfirmed account and offers confirm-first (covers: AC-3)", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue(
      failed("Email not confirmed - please confirm your email"),
    )
    await expect(
      signInAction(null, { email: "a@b.co", password: "hunter2x" }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: "needs_confirmation",
        message: CONFIRM_FIRST_MESSAGE,
        fieldErrors: undefined,
      },
    })
  })

  it("rejects a too-short email with field errors, before calling Supabase", async () => {
    const result = await signInAction(null, {
      email: "ab",
      password: "hunter2x",
    })
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "invalid_input",
        fieldErrors: { email: [expect.any(String)] },
      },
    })
    expect(mocks.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it("sends the trimmed lowercase email to Supabase", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue(failed(BAD_CREDS))
    await signInAction(null, { email: "  A@B.Co  ", password: "hunter2x" })
    expect(mocks.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.co",
      password: "hunter2x",
    })
  })

  it("drops the pending signup and lands on /app after a successful sign-in (covers: AC-2)", async () => {
    mocks.store.set(PENDING_SIGNUP_COOKIE, "a%40b.co")
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    await expectRedirect(
      signInAction(null, { email: "a@b.co", password: "hunter2x" }),
      "/app",
    )
    expect(mocks.store.has(PENDING_SIGNUP_COOKIE)).toBe(false)
  })

  it("honors a safe relative next param", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    await expectRedirect(
      signInAction(null, {
        email: "a@b.co",
        password: "hunter2x",
        next: "/app/plan-1",
      }),
      "/app/plan-1",
    )
  })

  it("falls back to /app when next is a foreign site (covers: AC-9)", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    await expectRedirect(
      signInAction(null, {
        email: "a@b.co",
        password: "hunter2x",
        next: "https://evil.example",
      }),
      "/app",
    )
  })

  it("falls back to /app for a protocol-relative path wrapped in the own origin (covers: AC-9)", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({
      data: { session: {} },
      error: null,
    })
    await expectRedirect(
      signInAction(null, {
        email: "a@b.co",
        password: "hunter2x",
        next: "http://127.0.0.1:3000//evil.example",
      }),
      "/app",
    )
  })
})

describe("signUpAction", () => {
  it("stores the pending signup email in a 15 minute httpOnly cookie and shows verify-email (covers: AC-1, AC-3)", async () => {
    mocks.auth.signUp.mockResolvedValue({ data: {}, error: null })
    await expectRedirect(
      signUpAction(null, { email: "A@B.co", password: "hunter2x" }),
      "/verify-email",
    )
    expect(mocks.store.get(PENDING_SIGNUP_COOKIE)).toBe(
      encodeURIComponent("a@b.co"),
    )
    expect(mocks.setCookie).toHaveBeenCalledWith(
      PENDING_SIGNUP_COOKIE,
      "a%40b.co",
      expect.objectContaining({ httpOnly: true, maxAge: 60 * 15 }),
    )
  })

  it("routes a taken email to verify-email anyway, with no reveal (covers: AC-1, AC-11)", async () => {
    mocks.auth.signUp.mockResolvedValue(
      failed("User with this email already registered"),
    )
    await expectRedirect(
      signUpAction(null, { email: "a@b.co", password: "hunter2x" }),
      "/verify-email",
    )
  })

  it("states a rate limit as the only non-vague error (covers: AC-3)", async () => {
    mocks.auth.signUp.mockResolvedValue(failed(THROTTLE))
    await expect(
      signUpAction(null, { email: "a@b.co", password: "hunter2x" }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: "rate_limited",
        message: THROTTLED_MESSAGE,
        fieldErrors: undefined,
      },
    })
    expect(mocks.store.has(PENDING_SIGNUP_COOKIE)).toBe(false)
  })

  it("states an unreachable service as retryable instead of a fake success (covers: AC-3)", async () => {
    mocks.auth.signUp.mockResolvedValue({
      data: null,
      error: {
        name: "AuthUnknownError",
        message: "Unexpected error during signup",
      },
    })
    await expect(
      signUpAction(null, { email: "a@b.co", password: "hunter2x" }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: "unavailable",
        message: UNAVAILABLE_MESSAGE,
        fieldErrors: undefined,
      },
    })
    expect(mocks.store.has(PENDING_SIGNUP_COOKIE)).toBe(false)
    expect(mocks.redirectedTo).toHaveLength(0)
  })

  it("rejects a 7 character password with field errors (covers: AC-1)", async () => {
    const result = await signUpAction(null, {
      email: "a@b.co",
      password: "short",
    })
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "invalid_input",
        fieldErrors: { password: [expect.any(String)] },
      },
    })
    expect(mocks.auth.signUp).not.toHaveBeenCalled()
  })

  it("points the confirmation link at the callback with type signup (covers: AC-9)", async () => {
    mocks.auth.signUp.mockResolvedValue({ data: {}, error: null })
    await signUpAction(null, { email: "a@b.co", password: "hunter2x" }).catch(
      () => {},
    )
    expect(mocks.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          emailRedirectTo: "http://127.0.0.1:3000/auth/callback?type=signup",
        },
      }),
    )
  })
})

describe("resendFromSignInAction", () => {
  it("gives known and unknown emails the same answer (covers: AC-11)", async () => {
    mocks.auth.resend.mockResolvedValue(failed("Email not found"))
    const unknown = await resendFromSignInAction(null, { email: "nobody@b.co" })
    mocks.auth.resend.mockResolvedValue({ data: {}, error: null })
    const known = await resendFromSignInAction(null, { email: "a@b.co" })
    expect(known).toEqual({
      ok: true,
      data: SENT_ANYWAY_MESSAGE,
    })
    expect(unknown).toEqual(known)
  })

  it("reports a throttled resend as wait-a-minute (covers: AC-3)", async () => {
    mocks.auth.resend.mockResolvedValue(failed(THROTTLE))
    await expect(
      resendFromSignInAction(null, { email: "a@b.co" }),
    ).resolves.toMatchObject({
      error: { code: "rate_limited", message: THROTTLED_MESSAGE },
    })
  })
})

describe("resendConfirmationAction", () => {
  it("asks the person to confirm from the sign-in screen when no pending signup cookie exists (covers: AC-3)", async () => {
    await expect(resendConfirmationAction(null, {})).resolves.toMatchObject({
      ok: false,
      error: {
        code: "no_pending_signup",
        message: "Confirm your email first from the sign-in screen.",
      },
    })
    expect(mocks.auth.resend).not.toHaveBeenCalled()
  })

  it("resends to the decoded email from the cookie (covers: AC-3)", async () => {
    mocks.store.set(PENDING_SIGNUP_COOKIE, encodeURIComponent("a@b.co"))
    mocks.auth.resend.mockResolvedValue({ data: {}, error: null })
    await expect(resendConfirmationAction(null, {})).resolves.toEqual({
      ok: true,
      data: SENT_ANYWAY_MESSAGE,
    })
    expect(mocks.auth.resend).toHaveBeenCalledWith(
      expect.objectContaining({ type: "signup", email: "a@b.co" }),
    )
  })

  it("reports a throttled resend as wait-a-minute (covers: AC-3)", async () => {
    mocks.store.set(PENDING_SIGNUP_COOKIE, encodeURIComponent("a@b.co"))
    mocks.auth.resend.mockResolvedValue(failed(THROTTLE))
    await expect(resendConfirmationAction(null, {})).resolves.toMatchObject({
      error: { code: "rate_limited", message: THROTTLED_MESSAGE },
    })
  })
})

describe("startOverAction", () => {
  it("clears the pending signup and returns to sign-up (covers: AC-3)", async () => {
    mocks.store.set(PENDING_SIGNUP_COOKIE, "a%40b.co")
    await expectRedirect(startOverAction(), "/sign-up")
    expect(mocks.store.has(PENDING_SIGNUP_COOKIE)).toBe(false)
  })
})

describe("recoverAction", () => {
  it("answers known and unknown emails identically that a link is on its way (covers: AC-11, AC-4)", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    })
    const known = await recoverAction(null, { email: "a@b.co" })
    mocks.auth.resetPasswordForEmail.mockResolvedValue(
      failed("Email not found"),
    )
    const unknown = await recoverAction(null, { email: "nobody@b.co" })
    expect(known).toEqual({ ok: true, data: RECOVER_SENT_MESSAGE })
    expect(unknown).toEqual(known)
  })

  it("points the recovery link at the callback with type recovery (covers: AC-9)", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null,
    })
    await recoverAction(null, { email: "a@b.co" })
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.co", {
      redirectTo: "http://127.0.0.1:3000/auth/callback?type=recovery",
    })
  })

  it("reports a throttled recovery as wait-a-minute", async () => {
    mocks.auth.resetPasswordForEmail.mockResolvedValue(failed(THROTTLE))
    await expect(
      recoverAction(null, { email: "a@b.co" }),
    ).resolves.toMatchObject({
      error: { code: "rate_limited", message: THROTTLED_MESSAGE },
    })
  })
})

describe("resetPasswordAction", () => {
  const payload = { password: "newsecret1", confirm: "newsecret1" }

  it("lands signed in on /app through the recovery session (covers: AC-4)", async () => {
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } })
    mocks.auth.updateUser.mockResolvedValue({ data: {}, error: null })
    await expectRedirect(resetPasswordAction(null, payload), "/app")
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({
      password: "newsecret1",
    })
  })

  it("answers a lost session with the signed-out message (covers: AC-12, AC-4)", async () => {
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: {} } })
    await expect(resetPasswordAction(null, payload)).resolves.toMatchObject({
      ok: false,
      error: { code: "session_expired", message: SIGNED_OUT_MESSAGE },
    })
    expect(mocks.auth.updateUser).not.toHaveBeenCalled()
  })

  it("rejects mismatched passwords with a confirm field error, before touching Supabase (covers: AC-4)", async () => {
    const result = await resetPasswordAction(null, {
      password: "newsecret1",
      confirm: "other",
    })
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "invalid_input",
        fieldErrors: { confirm: ["The passwords do not match."] },
      },
    })
    expect(mocks.auth.getClaims).not.toHaveBeenCalled()
  })

  it("surfaces an update failure as a retryable error", async () => {
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } })
    mocks.auth.updateUser.mockResolvedValue(
      failed("password must be at least 8 characters"),
    )
    await expect(resetPasswordAction(null, payload)).resolves.toMatchObject({
      ok: false,
      error: { code: "update_failed" },
    })
  })

  it("maps a throttled update to wait-a-minute", async () => {
    mocks.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } })
    mocks.auth.updateUser.mockResolvedValue(failed(THROTTLE))
    await expect(resetPasswordAction(null, payload)).resolves.toMatchObject({
      error: { code: "rate_limited" },
    })
  })
})

describe("signOutAction", () => {
  it("calls Supabase signOut, clears every auth cookie, and returns to sign-in (covers: AC-5)", async () => {
    mocks.store.set("sb-ref-auth-token.0", "chunk1")
    mocks.store.set("sb-ref-auth-token.1", "chunk2")
    mocks.store.set(PENDING_SIGNUP_COOKIE, "a%40b.co")
    mocks.store.set("theme", "dark")
    mocks.auth.signOut.mockResolvedValue({ error: null })
    await expectRedirect(signOutAction(new FormData()), "/sign-in")
    expect(mocks.auth.signOut).toHaveBeenCalled()
    expect([...mocks.store.keys()]).toEqual(["theme"])
  })
})
