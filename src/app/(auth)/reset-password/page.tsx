import { redirect } from "next/navigation"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type AmrEntry = { method?: string }

export default async function ResetPasswordPage() {
  // Reachable only with the recovery session the callback just established:
  // live claims plus GoTrue's authentication-method record, which lists
  // `recovery` for a session created by a recovery link and `password` for a
  // normal one.
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims as { sub?: string; amr?: AmrEntry[] } | undefined
  const viaRecovery =
    claims?.amr?.some((entry) => entry.method === "recovery") ?? false
  if (!claims?.sub || !viaRecovery) {
    return redirect("/recover")
  }

  return <ResetPasswordForm />
}
