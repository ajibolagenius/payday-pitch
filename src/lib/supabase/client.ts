// Browser Supabase client. Used only on the auth screens (spec 001 rule).
// @supabase/ssr persists the session in cookies, and persistSession is the
// library default for browser clients; stated here because AC-7 depends on it.
"use client"

import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/lib/supabase/database.types"

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    { auth: { flowType: "pkce" } },
  )
}
