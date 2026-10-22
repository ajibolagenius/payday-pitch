import { cookies } from "next/headers"
import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-form"
import { VerifyEmailActions } from "@/components/auth/verify-email-actions"
import { PENDING_SIGNUP_COOKIE } from "@/features/auth/cookies"

export default async function VerifyEmailPage() {
  const store = await cookies()
  const raw = store.get(PENDING_SIGNUP_COOKIE)?.value

  if (!raw) {
    return (
      <AuthCard
        title="Confirm your email"
        description="No pending signup is open in this browser."
      >
        <p className="text-sm">
          Sign in with your email and password, and we can send the link again
          from there.
        </p>
        <Link
          href="/sign-in"
          className="text-accent text-sm underline underline-offset-4"
        >
          Go to sign in
        </Link>
      </AuthCard>
    )
  }

  const email = decodeURIComponent(raw)
  return (
    <AuthCard
      title="Check your email"
      description="One link stands between you and the pitch."
    >
      <p className="text-sm">
        We sent a confirmation link to{" "}
        <span className="font-medium">{email}</span>. Open it to confirm the
        address, then sign in. The link stays valid for 24 hours.
      </p>
      <VerifyEmailActions />
    </AuthCard>
  )
}
