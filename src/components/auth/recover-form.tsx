"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  AuthCard,
  AuthField,
  FormError,
  SubmitButton,
} from "@/components/auth/auth-form"
import { recoverAction } from "@/features/auth/actions"
import type { ActionResult } from "@/lib/actions"
import { formAction } from "@/components/auth/use-form-action"

export function RecoverForm() {
  const idle: ActionResult<string | null> = { ok: true, data: null }
  const [state, action] = useActionState<ActionResult<string | null>>(
    formAction<string | null>(recoverAction),
    idle,
  )
  const error = !state.ok ? state.error : undefined

  return (
    <AuthCard
      title="Recover access"
      description="Tell us your email. We send a link to set a new password."
    >
      <form action={action} className="space-y-4">
        <AuthField
          label="Email"
          name="email"
          autoComplete="email"
          error={error?.fieldErrors?.email}
        />
        {error ? <FormError message={error.message} /> : null}
        {state?.ok && state.data ? (
          <p role="status" className="text-sm">
            {state.data}
          </p>
        ) : null}
        <SubmitButton pendingText="Sending…">Send recovery link</SubmitButton>
      </form>
      <div className="text-sm">
        <Link
          href="/sign-in"
          className="text-accent-text underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  )
}
