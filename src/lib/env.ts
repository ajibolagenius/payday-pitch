// Supabase environment, validated lazily at first client creation so public
// pages render without keys (spec 0001). Never import this from a browser
// component that runs before the server has read the values; the callers are
// all server-side or the auth screens.
import { z } from "zod"

const LOCAL_URL = "http://127.0.0.1:54321"

// The public demo key every fresh `supabase start` project ships with. Safe to
// name in source: it only ever guards the local database on 127.0.0.1. Used as
// a fallback so local dev and the e2e suite run without an env file; a
// production build never reaches it.
const LOCAL_DEMO_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

const envSchema = z.object({
  url: z.url().default(LOCAL_URL),
  publishableKey: z.string().min(1),
  secretKey: z.string().optional(),
  siteUrl: z.url().default("http://127.0.0.1:3000"),
})

export type SupabaseEnv = z.infer<typeof envSchema>

let cached: SupabaseEnv | undefined

export function supabaseEnv(): SupabaseEnv {
  if (!cached) {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      LOCAL_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      (url === LOCAL_URL && process.env.NODE_ENV !== "production"
        ? LOCAL_DEMO_KEY
        : undefined)
    const parsed = envSchema.safeParse({
      url,
      publishableKey: key,
      secretKey:
        process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY,
      siteUrl: process.env.SITE_URL ?? undefined,
    })
    if (!parsed.success) {
      throw new Error(
        "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example)",
      )
    }
    cached = parsed.data
  }
  return cached
}
