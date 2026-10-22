// Session refresh and /app gate (spec 0006 AC-8). Convenience, not the guard:
// the (app) layout re-checks with getClaims(). Node runtime, so the cookie
// based @supabase/ssr client works here.
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { supabaseEnv } from "@/lib/env"

// Host canonicalization (spec 0006): session cookies, the PKCE verifier, and
// the email redirect allow list are pinned to the exact SITE_URL origin. The
// dev server is reachable through both `localhost` and `127.0.0.1`, and a
// browser treats them as separate cookie jars: a signup started on the alias
// stores its verifier there, while the email link lands on the canonical host
// and reads an empty jar, answering "link invalid or expired". Page requests
// arriving on an alias of the SITE_URL host redirect to the canonical origin
// before any cookie is set, so one journey always uses one jar.
const HOST_ALIASES = new Set(["localhost", "127.0.0.1"])

/** The canonical origin to redirect to, or null when this host is fine. */
export function canonicalOrigin(
  host: string | null,
  siteUrl: string,
): string | null {
  if (!host) return null
  let incoming: URL
  let site: URL
  try {
    incoming = new URL(`http://${host}`)
    site = new URL(siteUrl)
  } catch {
    return null
  }
  if (incoming.host === site.host) return null
  if (!HOST_ALIASES.has(incoming.hostname) || !HOST_ALIASES.has(site.hostname))
    return null
  if (incoming.port !== site.port) return null
  return site.origin
}

// @supabase/ssr writes chunked HttpOnly cookies named sb-<ref>-auth-token(.0, .1).
// The session chunks are the only sb- cookies that carry "signed in" state;
// the flow cookies sb-<ref>-auth-token-code-verifier and
// sb-<ref>-auth-token-expires-at exist during PKCE signups only. Match those
// exact hyphenated suffixes: a code verifier literally reads as a session
// against a bare "auth-token" substring test, cannot refresh, and answers
// every page with reason=expired.
function hasSessionCookie(request: NextRequest): boolean {
  return [...request.cookies.getAll()].some(
    (c) =>
      c.name.startsWith("sb-") &&
      c.name.includes("auth-token") &&
      !c.name.includes("code-verifier") &&
      !c.name.includes("expires-at") &&
      c.value.length > 0,
  )
}

function signInRedirect(request: NextRequest, params: Record<string, string>) {
  // The Host header is the host the browser actually used. request.nextUrl.origin
  // can report the server's own default (localhost) while the request arrived on
  // 127.0.0.1, and a host crossing would drop the session cookies. The proxy
  // layer refuses a relative Location, so the URL has to be absolute.
  const host = request.headers.get("host") ?? request.nextUrl.host
  const proto = request.headers.get("x-forwarded-proto") ?? "http"
  const url = new URL("/sign-in", `${proto}://${host}`)
  const next = request.nextUrl.pathname
  const search = request.nextUrl.searchParams.toString()
  url.searchParams.set("next", search ? `${next}?${search}` : next)
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value)
  return NextResponse.redirect(url, 307)
}

export async function proxy(request: NextRequest) {
  const canonical = canonicalOrigin(
    request.headers.get("host"),
    supabaseEnv().siteUrl,
  )
  if (canonical) {
    // Next's middleware adapter rewrites an absolute Location whose host it
    // judges equal to the request's into a relative one (it resolves the
    // request against the server's own origin, not the Host header), which
    // would loop the alias to itself. A meta refresh carries the crossing in
    // the body, where nothing normalizes it. Only plain page GETs land here:
    // once on the canonical origin, everything else stays on it.
    const target = canonical + request.nextUrl.pathname + request.nextUrl.search
    // The request path and query are echoed into HTML: escape, always.
    const safe = target.replace(/[&<>"']/g, (c) =>
      c === "&"
        ? "&amp;"
        : c === "<"
          ? "&lt;"
          : c === ">"
            ? "&gt;"
            : c === '"'
              ? "&quot;"
              : "&#39;",
    )
    return new Response(
      `<!doctype html><meta http-equiv="refresh" content="0;url=${safe}">` +
        `<a href="${safe}">Continue</a>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
    )
  }

  const withPathname = (base: NextResponse) => {
    base.headers.set("x-app-pathname", request.nextUrl.pathname)
    return base
  }
  let response = withPathname(NextResponse.next({ request }))
  let sessionPresent = hasSessionCookie(request)

  if (sessionPresent) {
    const { url, publishableKey } = supabaseEnv()
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value)
            response = withPathname(NextResponse.next({ request }))
            response.cookies.set(name, value, options)
          }
        },
      },
    })
    // getClaims verifies and refreshes locally (spec 0001: never getSession).
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims?.sub) {
      // A session was presented but cannot be refreshed: revoked or expired.
      // Send the visitor to the sign-in screen once, never from the sign-in
      // screen to itself: that loop re-hits the same dead cookie every hop.
      if (
        hasSessionCookie(request) &&
        !request.nextUrl.pathname.startsWith("/sign-in")
      ) {
        return signInRedirect(request, { reason: "expired" })
      }
      sessionPresent = false
    }
  }

  if (!sessionPresent && request.nextUrl.pathname.startsWith("/app")) {
    return signInRedirect(request, {})
  }

  return response
}

export const config = {
  // The gate only needs /app, but canonicalization must catch every page
  // (a signup started on /sign-up sets its verifier cookie). Static and
  // dotted asset paths skip the proxy; assets carry no cookies.
  matcher: ["/((?!_next/|.*\\..*).*)"],
}
