"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  AuthCard,
  AuthField,
  FormError,
  SubmitButton,
} from "@/components/auth/auth-form"
import { resendFromSignInAction, signInAction } from "@/features/auth/actions"
import type { ActionResult } from "@/lib/actions"
import { formAction } from "@/components/auth/use-form-action"

type Data = string | null

export function SignInForm({ next }: { next?: string }) {
  const idle: ActionResult<Data> = { ok: true, data: null }
  const [state, runSignIn] = useActionState<ActionResult<Data>>(
    formAction<Data>(signInAction),
    idle,
  )
  const [resendState, resendAction] = useActionState<ActionResult<Data>>(
    formAction<Data>(resendFromSignInAction),
    idle,
  )
  const needsConfirmation =
    !state.ok && state.error.code === "needs_confirmation"
  const error = state.ok ? undefined : state.error

  return (
    <AuthCard title="Sign in" description="Your season starts on payday.">
      <form action={runSignIn} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
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
          autoComplete="current-password"
          error={error?.fieldErrors?.password}
        />
        {error && !needsConfirmation ? (
          <FormError message={error.message} />
        ) : null}
        {needsConfirmation ? (
          <div className="space-y-3 rounded-md border p-3">
            <p role="status" className="text-sm">
              {error?.message}
            </p>
            <button
              type="submit"
              formAction={resendAction}
              className="text-accent-text text-sm underline underline-offset-4"
            >
              Send the confirmation link again
            </button>
            {resendState.ok && resendState.data ? (
              <p role="status" className="text-muted-foreground text-sm">
                {resendState.data}
              </p>
            ) : null}
            {!resendState.ok ? (
              <FormError message={resendState.error.message} />
            ) : null}
          </div>
        ) : null}
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      </form>
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/recover"
          className="text-accent-text underline underline-offset-4"
        >
          Forgot password?
        </Link>
        <Link
          href="/sign-up"
          className="text-accent-text underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </AuthCard>
  )
}
