// The real guard (spec 0006 AC-8): claims checked server-side on every render,
// profile row created lazily on first authenticated read. The worker never
// caches /app, so signed-in money pages cannot outlive the session on disk.
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { safeRedirectPath } from "@/features/auth/redirect"
import { ensureProfile } from "@/features/profile/profile"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    // This client cannot refresh (read-only cookies): a render that skipped the
    // proxy hop would lose an expired-but-refreshable token here. The proxy
    // matcher covers every page GET, so that stays theoretical.
    // The proxy attaches the requested path; this fallback covers renders the
    // proxy did not gate. safeRedirectPath keeps it site-relative.
    const pathname = (await headers()).get("x-app-pathname")
    const next = safeRedirectPath(pathname)
    return redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  // The cookie client carries the user's access token, so RLS sees them.
  // ensureProfile never throws; a null profile is a placeholder, not a failure.
  await ensureProfile(claims.sub, supabase)

  return <>{children}</>
}
