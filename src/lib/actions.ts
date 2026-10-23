// Server Action framework (spec 0001 Writes convention). A "use server" file
// may only export async functions, so these are plain server-side helpers:
// the ActionResult shape for expected failures, the Zod parse for form
// payloads (parsePayload), the claims guard (requireClaims), and the composed
// write path (authedAction). Action modules compose them into exported async
// functions. Nothing here throws on an expected failure; it returns one.
import { z } from "zod"

import { createSupabaseActionClient } from "@/lib/supabase/server"

export type FieldErrors = Record<string, string[]>

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | {
      ok: false
      error: { code: string; message: string; fieldErrors?: FieldErrors }
    }

// The failure arm on its own: what a rejected payload always returns, so a
// caller can read `.error` without re-narrowing the union.
export type ActionFailure = Extract<ActionResult<never>, { ok: false }>

export function actionOk<T = null>(data?: T): ActionResult<T> {
  return { ok: true, data: (data ?? null) as T }
}

export function actionError(
  code: string,
  message: string,
  fieldErrors?: FieldErrors,
): ActionFailure {
  return { ok: false, error: { code, message, fieldErrors } }
}

function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    ;(fields[key] ??= []).push(issue.message)
  }
  return fields
}

export type ActionClient = Awaited<
  ReturnType<typeof createSupabaseActionClient>
>

// Parses a form payload with the action's schema. On failure returns the
// invalid_input ActionResult instead of parsed data (never throws).
export async function parsePayload<In>(
  schema: z.ZodType<In>,
  payload: FormData | Record<string, unknown> | undefined,
): Promise<
  | { ok: true; client: ActionClient; input: In }
  | { ok: false; result: ActionFailure }
> {
  const plain =
    payload instanceof FormData
      ? Object.fromEntries(payload.entries())
      : payload
  const parsed = schema.safeParse(plain)
  if (!parsed.success) {
    return {
      ok: false,
      result: actionError(
        "invalid_input",
        "Please correct the highlighted fields.",
        fieldErrorsFrom(parsed.error),
      ),
    }
  }
  const client = await createSupabaseActionClient()
  return { ok: true, client, input: parsed.data }
}

// Identity for an authenticated write: claims from the session cookies, never
// a client-supplied user id (spec 0001). Returns the user id and a client that
// carries their session, or null when the session is gone; the caller then
// answers actionError("session_expired", SIGNED_OUT_MESSAGE).
export async function requireClaims(): Promise<{
  userId: string
  client: ActionClient
} | null> {
  const client = await createSupabaseActionClient()
  const userId = (await client.auth.getClaims()).data?.claims?.sub
  if (!userId) return null
  return { userId, client }
}

// The one write path (spec 0001, spec 0007 AC-9): every authenticated Server
// Action is authedAction(schema, handler). Payload validated with Zod, identity
// from claims only, expected failures returned as codes and never thrown. The
// handler returns the ActionResult directly (actionOk or actionError); an
// exception escaping it, the unmapped case, answers "unexpected" after a
// server-side log, so a raw database error never reaches a user.
export function authedAction<In, Out = null>(
  schema: z.ZodType<In>,
  handler: (ctx: {
    userId: string
    client: ActionClient
    input: In
  }) => Promise<ActionResult<Out>>,
): (
  payload?: FormData | Record<string, unknown>,
) => Promise<ActionResult<Out>> {
  return async (payload) => {
    const parsed = await parsePayload(schema, payload)
    if (!parsed.ok) {
      return {
        ok: false,
        error: { ...parsed.result.error, code: "validation" },
      }
    }
    const auth = await requireClaims()
    if (!auth) {
      return actionError(
        "session_expired",
        "You are signed out. Sign in again.",
      )
    }
    try {
      return await handler({
        userId: auth.userId,
        client: auth.client,
        input: parsed.input,
      })
    } catch (cause) {
      console.error("[action] unexpected failure", cause)
      return actionError("unexpected", "Something went wrong. Try again.")
    }
  }
}
