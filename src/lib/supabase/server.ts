// Server-side Supabase client factory for the signed in user's role, so RLS
// is the isolation guarantee (spec 0001). Feature 5 wires the cookie based
// client from @supabase/ssr; this factory covers server code that already
// holds a token or needs the anon role.
import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"

export function supabaseServerClient(accessToken?: string) {
  const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321"
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!anonKey) {
    throw new Error("SUPABASE_ANON_KEY is not set")
  }
  return createClient<Database>(url, anonKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { persistSession: false },
  })
}
