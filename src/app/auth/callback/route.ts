// Email link landing (spec 0006 AC-4, AC-9, AC-11). One route for every link
// Supabase sends. PKCE is the flow that actually delivers a server-readable
// query: GoTrue redirects to `redirect_to` with ?code=, and the code is
// exchanged for a session here (the verifier cookie stored at signup rides on
// the same request). A token_hash param is also accepted for link shapes that
// carry one, verified with verifyOtp. Links carry no destination; the target
// is fixed per link type. A dead, reused, or expired link lands on
// /sign-in?reason=expired.
import { NextResponse, type NextRequest } from "next/server"

import { PENDING_SIGNUP_COOKIE } from "@/features/auth/cookies"
import { createSupabaseCookieClient } from "@/lib/supabase/server"

const EXPIRED = "/sign-in?reason=expired"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  // Relative Location: resolves against the host the browser actually used.
  // request.nextUrl.origin can report the server's own default (localhost)
  // while cookies were set for 127.0.0.1; crossing hosts would drop them.
  const redirect = (target: string) =>
    new NextResponse(null, { status: 307, headers: { Location: target } })

  if (!code && !token_hash) return redirect(EXPIRED)

  const target = type === "recovery" ? "/reset-password" : "/app"
  const response = redirect(target)
  const supabase = createSupabaseCookieClient(request, response)
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        type: type === "recovery" ? "recovery" : "signup",
        token_hash: token_hash!,
      })
  if (error) {
    return redirect(EXPIRED)
  }
  // The pending signup is spent once the address is confirmed (invariant:
  // dropped on confirmation, sign-in, and sign out).
  if (type !== "recovery") {
    response.cookies.delete(PENDING_SIGNUP_COOKIE)
  }
  return response
}
