// The profile row is created lazily by upsert (spec 0004, AC-10). Feature 5
// calls ensureProfile from the first authenticated read path. Reads tolerate a
// missing row until then: the user's currency is simply NGN, the table default.
import { supabaseServerClient } from "@/lib/supabase/server"

export type ProfileRow = {
  user_id: string
  default_currency: string
  created_at: string
}

export async function ensureProfile(
  userId: string,
  client = supabaseServerClient(),
): Promise<ProfileRow | null> {
  const { error } = await client
    .from("profile")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: true },
    )
  if (error) {
    return null
  }
  const { data, error: readError } = await client
    .from("profile")
    .select("user_id, default_currency, created_at")
    .eq("user_id", userId)
    .maybeSingle()
  if (readError || !data) {
    return null
  }
  return data
}
