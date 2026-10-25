"use client"

import { useActionState } from "react"

import { FormError } from "@/components/auth/auth-form"
import {
  resendConfirmationAction,
  startOverAction,
} from "@/features/auth/actions"
import type { ActionResult } from "@/lib/actions"
import { formAction, submitAction } from "@/components/auth/use-form-action"

export function VerifyEmailActions() {
  const idle: ActionResult<string | null> = { ok: true, data: null }
  const [state, action] = useActionState<ActionResult<string | null>>(
    formAction<string | null>(resendConfirmationAction),
    idle,
  )

  return (
    <div className="space-y-4">
      <form action={action}>
        <button
          type="submit"
          className="text-accent-text text-sm underline underline-offset-4"
        >
          Send the link again
        </button>
      </form>
      {state?.ok && state.data ? (
        <p role="status" className="text-muted-foreground text-sm">
          {state.data}
        </p>
      ) : null}
      {state && !state.ok ? <FormError message={state.error.message} /> : null}
      <form action={submitAction(startOverAction)}>
        <button
          type="submit"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          Wrong email? Start over
        </button>
      </form>
    </div>
  )
}
