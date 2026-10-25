// The signed in home: the first match loop (spec 0007). One round of reads
// decides where the walk opens, so the state of the data is the progress. The
// (app) layout already checked claims and created the profile row; the guard
// here only narrows the user id.
import Link from "next/link"
import { redirect } from "next/navigation"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { Walk } from "@/components/walk/walk"
import { loadWalk } from "@/features/match/queries"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function AppHome() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect("/sign-in")

  // A failed read is an error state on this screen, not a crash: nothing here
  // can be fixed by retrying a different route.
  const walk = await loadWalk(supabase, userId).catch(() => null)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          Payday Pitch
        </Link>
        {/* The board is the loop's second door: the walk plays a shape, the
            board makes one yours. Same link styling as the shipped nav. */}
        <Link
          href="/app/tactics"
          className="text-accent text-sm underline underline-offset-4"
        >
          Tactics board
        </Link>
        <SignOutButton />
      </div>
      <main className="flex-1">
        {walk ? (
          <Walk walk={walk} />
        ) : (
          <div className="bg-muted rounded-lg p-4">
            <h1 className="text-lg font-bold">Could not load your season</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              The numbers did not come through. Reload to try again.
            </p>
            <Link
              href="/app"
              className="text-accent mt-3 inline-block text-sm underline underline-offset-4"
            >
              Reload
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
