// Cookie-based Supabase server clients (spec 0006). Three shapes, because Next 16
// only allows writing cookies in Server Actions and Route Handlers:
//   createSupabaseServerClient  - reads only, for Server Components and the proxy.
//   createSupabaseActionClient  - reads and writes, for actions (PKCE signups
//                                 must be able to store the code verifier).
//   createSupabaseCookieClient  - reads and writes on a Route Handler response.
// The PKCE flow type makes email links land on /auth/callback with ?code=;
// implicit links deliver their session in a URL fragment the server cannot see.
// All validate env lazily via supabaseEnv(), so public pages render without
// keys (spec 0001).
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

import { supabaseEnv } from "@/lib/env"
import type { Database } from "@/lib/supabase/database.types"

const pkce = { auth: { flowType: "pkce" } } as const

// Legacy anon/bearer factory (spec 0004): server code that already holds a
// token, or needs the anon role without a cookie store.
export function supabaseServerClient(accessToken?: string) {
  const { url, publishableKey } = supabaseEnv()
  return createClient<Database>(url, publishableKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { persistSession: false },
  })
}

export async function createSupabaseServerClient() {
  const { url, publishableKey } = supabaseEnv()
  const store = await cookies()
  return createServerClient<Database>(url, publishableKey, {
    ...pkce,
    cookies: {
      getAll: () => store.getAll(),
      setAll: () => {},
    },
  })
}

export async function createSupabaseActionClient() {
  const { url, publishableKey } = supabaseEnv()
  const store = await cookies()
  return createServerClient<Database>(url, publishableKey, {
    ...pkce,
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          store.set(name, value, options)
        }
      },
    },
  })
}

// For route handlers, where cookies ride on the response object rather than
// the headers store (the proxy builds its own variant of this inline).
export function createSupabaseCookieClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, publishableKey } = supabaseEnv()
  return createServerClient<Database>(url, publishableKey, {
    ...pkce,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        }
      },
    },
  })
}
