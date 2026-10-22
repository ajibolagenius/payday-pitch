// Auth Server Actions (spec 0006 API surface). Sign in, sign up, recover, and
// resend are the documented exemption from the claims guard; they compose the
// same helpers (parsePayload, actionOk, actionError) and share its
// ActionResult shape. Expected failures are returned, never thrown. A success
// that navigates ends in redirect(), which never returns.
"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  actionError,
  actionOk,
  parsePayload,
  requireClaims,
  type ActionFailure,
  type ActionResult,
} from "@/lib/actions"
import { supabaseEnv } from "@/lib/env"
import { PENDING_SIGNUP_COOKIE } from "@/features/auth/cookies"
import {
  CONFIRM_FIRST_MESSAGE,
  RECOVER_SENT_MESSAGE,
  SENT_ANYWAY_MESSAGE,
  SIGNED_OUT_MESSAGE,
  THROTTLED_MESSAGE,
  UNAVAILABLE_MESSAGE,
  VAGUE_CREDENTIALS_ERROR,
} from "@/features/auth/messages"
import {
  emailInput,
  passwordInput,
  resetPasswordSchema,
} from "@/features/auth/schemas"
import { resolveRedirect } from "@/features/auth/redirect"

const signInSchema = z.object({
  email: emailInput,
  password: z.string().min(1),
  next: z.string().optional(),
})

const signUpSchema = z.object({
  email: emailInput,
  password: passwordInput,
})

const emailSchema = z.object({ email: emailInput })
const emptySchema = z.object({})

function isThrottled(message: string): boolean {
  return /rate limit|frequency|only request this after/i.test(message)
}

// A failure about the request rather than the account: the service could not be
// reached at all. AC-11 only asks to hide account-shaped outcomes, so these are
// stated honestly instead of being masked as a success.
function isTransportFailure(error: {
  name?: string
  message: string
}): boolean {
  return (
    error.name === "AuthUnknownError" ||
    /fetch|network|timed out|timeout|econn|unexpected error|service unavailable|bad gateway/i.test(
      error.message,
    )
  )
}

// The answer shared by every email-sending action when the request itself
// failed: wait-a-minute for a rate limit, try-again for a transport failure,
// null when the error is about the account and stays the caller's to mask.
function requestFailure(
  error: { name?: string; message: string } | null,
): ActionFailure | null {
  if (!error) return null
  if (isThrottled(error.message))
    return actionError("rate_limited", THROTTLED_MESSAGE)
  if (isTransportFailure(error))
    return actionError("unavailable", UNAVAILABLE_MESSAGE)
  return null
}

// PKCE email links land on the callback with ?code=; the type query lets the
// callback pick the fixed per-link target (spec 0006: links carry no next).
function callbackUrl(type: "signup" | "recovery"): string {
  return `${supabaseEnv().siteUrl}/auth/callback?type=${type}`
}

export async function signInAction(
  _prev: ActionResult<null> | null,
  payload: FormData | Record<string, unknown>,
): Promise<ActionResult<null>> {
  const parsed = await parsePayload(signInSchema, payload)
  if (!parsed.ok) return parsed.result
  const { input, client } = parsed
  const { data, error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) {
    // Supabase's one honest leak: an unconfirmed account is named, and
    // answered with a working resend (spec 0006 AC-3). Everything else stays
    // the identical vague message (AC-11).
    if (/not confirmed/i.test(error.message)) {
      return actionError("needs_confirmation", CONFIRM_FIRST_MESSAGE)
    }
    return actionError("invalid_credentials", VAGUE_CREDENTIALS_ERROR)
  }
  if (!data.session) {
    return actionError("invalid_credentials", VAGUE_CREDENTIALS_ERROR)
  }
  const store = await cookies()
  store.delete(PENDING_SIGNUP_COOKIE)
  return redirect(resolveRedirect(input.next, supabaseEnv().siteUrl))
}

export async function signUpAction(
  _prev: ActionResult<null> | null,
  payload: FormData | Record<string, unknown>,
): Promise<ActionResult<null>> {
  const parsed = await parsePayload(signUpSchema, payload)
  if (!parsed.ok) return parsed.result
  const { input, client } = parsed
  const { error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: { emailRedirectTo: callbackUrl("signup") },
  })
  // Taken, unknown, or unconfirmed: every path lands on /verify-email; the
  // response never reveals which (AC-1, no enumeration). Only a failure about
  // the request, a rate limit or an unreachable service, is stated.
  const throttledOrDown = requestFailure(error)
  if (throttledOrDown) return throttledOrDown
  const store = await cookies()
  store.set(PENDING_SIGNUP_COOKIE, encodeURIComponent(input.email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === "production",
  })
  return redirect("/verify-email")
}

export async function resendFromSignInAction(
  _prev: ActionResult<string | null> | null,
  payload: FormData | Record<string, unknown>,
): Promise<ActionResult<string | null>> {
  const parsed = await parsePayload(emailSchema, payload)
  if (!parsed.ok) return parsed.result
  const { input, client } = parsed
  const { error } = await client.auth.resend({
    type: "signup",
    email: input.email,
    options: { emailRedirectTo: callbackUrl("signup") },
  })
  const throttledOrDown = requestFailure(error)
  if (throttledOrDown) return throttledOrDown
  // Known, unknown, or already confirmed: one answer (AC-11).
  return actionOk<string | null>(SENT_ANYWAY_MESSAGE)
}

export async function resendConfirmationAction(
  _prev: ActionResult<string | null> | null,
  payload?: FormData | Record<string, unknown>,
): Promise<ActionResult<string | null>> {
  const parsed = await parsePayload(emptySchema, payload)
  if (!parsed.ok) return parsed.result
  const store = await cookies()
  const raw = store.get(PENDING_SIGNUP_COOKIE)?.value
  if (!raw) {
    return actionError(
      "no_pending_signup",
      "Confirm your email first from the sign-in screen.",
    )
  }
  const { error } = await parsed.client.auth.resend({
    type: "signup",
    email: decodeURIComponent(raw),
    options: { emailRedirectTo: callbackUrl("signup") },
  })
  const throttledOrDown = requestFailure(error)
  if (throttledOrDown) return throttledOrDown
  return actionOk<string | null>(SENT_ANYWAY_MESSAGE)
}

// Clears the pending signup and starts over, for a mistyped address on
// /verify-email (AC-3's "wrong email? start over"). Wired with submitAction,
// so it takes no action-state params.
export async function startOverAction(): Promise<ActionResult<null>> {
  const store = await cookies()
  store.delete(PENDING_SIGNUP_COOKIE)
  return redirect("/sign-up")
}

export async function recoverAction(
  _prev: ActionResult<string | null> | null,
  payload: FormData | Record<string, unknown>,
): Promise<ActionResult<string | null>> {
  const parsed = await parsePayload(emailSchema, payload)
  if (!parsed.ok) return parsed.result
  const { input, client } = parsed
  const { error } = await client.auth.resetPasswordForEmail(input.email, {
    redirectTo: callbackUrl("recovery"),
  })
  const throttledOrDown = requestFailure(error)
  if (throttledOrDown) return throttledOrDown
  // Known or not, the answer is the same (AC-11).
  return actionOk<string | null>(RECOVER_SENT_MESSAGE)
}

// Runs behind the recovery session the callback established; the claims guard
// covers AC-12 (a session lost mid-flow answers session_expired, and the
// sign-in screen's banner explains it).
export async function resetPasswordAction(
  _prev: ActionResult<null> | null,
  payload: FormData | Record<string, unknown>,
): Promise<ActionResult<null>> {
  const parsed = await parsePayload(resetPasswordSchema, payload)
  if (!parsed.ok) return parsed.result
  const auth = await requireClaims()
  if (!auth) {
    return actionError("session_expired", SIGNED_OUT_MESSAGE)
  }
  const { error } = await auth.client.auth.updateUser({
    password: parsed.input.password,
  })
  if (error) {
    const throttledOrDown = requestFailure(error)
    if (throttledOrDown) return throttledOrDown
    return actionError(
      "update_failed",
      "We could not save that password. Try again.",
    )
  }
  return redirect("/app")
}

// Wired with submitAction on the sign-out form, so the payload arrives as the
// first argument: a plain form action, not a useActionState pair.
export async function signOutAction(
  payload?: FormData | Record<string, unknown>,
): Promise<ActionResult<null>> {
  const parsed = await parsePayload(emptySchema, payload)
  if (!parsed.ok) return parsed.result
  await parsed.client.auth.signOut()
  const store = await cookies()
  for (const cookie of store.getAll()) {
    if (
      cookie.name.startsWith("sb-") ||
      cookie.name === PENDING_SIGNUP_COOKIE
    ) {
      store.delete(cookie.name)
    }
  }
  return redirect("/sign-in")
}
