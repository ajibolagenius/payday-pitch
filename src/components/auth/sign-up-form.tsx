"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  AuthCard,
  AuthField,
  FormError,
  SubmitButton,
} from "@/components/auth/auth-form"
import { signUpAction } from "@/features/auth/actions"
import type { ActionResult } from "@/lib/actions"
import { formAction } from "@/components/auth/use-form-action"

export function SignUpForm() {
  const idle: ActionResult<null> = { ok: true, data: null }
  const [state, action] = useActionState<ActionResult<null>>(
    formAction<null>(signUpAction),
    idle,
  )
  const error = state?.ok ? undefined : state?.error

  return (
    <AuthCard
      title="Create an account"
      description="Your formation stays private to your email."
    >
      <form action={action} className="space-y-4">
        <AuthField
          label="Email"
          name="email"
          autoComplete="email"
          error={error?.fieldErrors?.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={error?.fieldErrors?.password}
        />
        {error ? <FormError message={error.message} /> : null}
        <SubmitButton pendingText="Creating your account…">
          Sign up
        </SubmitButton>
      </form>
      <p className="text-muted-foreground text-sm">
        At least 8 characters. We send one confirmation link, then the pitch is
        yours.
      </p>
      <div className="text-sm">
        <Link
          href="/sign-in"
          className="text-accent-text underline underline-offset-4"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </AuthCard>
  )
}
