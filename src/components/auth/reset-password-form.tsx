"use client"

import { useActionState } from "react"

import {
  AuthCard,
  AuthField,
  FormError,
  SubmitButton,
} from "@/components/auth/auth-form"
import { formAction } from "@/components/auth/use-form-action"
import { resetPasswordAction } from "@/features/auth/actions"
import type { ActionResult } from "@/lib/actions"

export function ResetPasswordForm() {
  const idle: ActionResult<null> = { ok: true, data: null }
  const [state, action] = useActionState<ActionResult<null>>(
    formAction<null>(resetPasswordAction),
    idle,
  )
  const error = state.ok ? undefined : state.error

  return (
    <AuthCard
      title="Set a new password"
      description="Pick at least 8 characters you have not used here before."
    >
      <form action={action} className="space-y-4">
        <AuthField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={error?.fieldErrors?.password}
        />
        <AuthField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          error={error?.fieldErrors?.confirm}
        />
        {error ? <FormError message={error.message} /> : null}
        <SubmitButton pendingText="Saving…">Save password</SubmitButton>
      </form>
    </AuthCard>
  )
}
