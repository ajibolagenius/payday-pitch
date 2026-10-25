// The tactics board (spec 0008). The URL names the source, the server reads it,
// and the client only ever holds shares: so a bookmarked tactic, a suggestion tap,
// and a plain visit to this page all resolve through one read. A failed read is an
// error state here, not a crash, because nothing on another route can fix it.
import Link from "next/link"
import { redirect } from "next/navigation"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { TacticsBoard } from "@/components/tactics/tactics-board"
import { readBoardContext } from "@/features/tactics/board"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function only(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null
}

export default async function TacticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect("/sign-in")

  const params = await searchParams
  const result = await readBoardContext(supabase, userId, {
    shape: only(params.shape),
    tactic: only(params.tactic),
  }).then(
    (board) => ({ board, failed: false }),
    () => ({ board: null, failed: true }),
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          Back to the pitch
        </Link>
        <SignOutButton />
      </div>
      <main className="flex-1">
        {result.board ? (
          <TacticsBoard board={result.board} />
        ) : result.failed ? (
          <div className="bg-muted rounded-lg p-4">
            <h1 className="text-lg font-bold">Could not load the board</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              The numbers did not come through. Reload to try again.
            </p>
            <Link
              href="/app/tactics"
              className="text-accent mt-3 inline-block text-sm underline underline-offset-4"
            >
              Reload
            </Link>
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-4">
            <h1 className="text-lg font-bold">That plan is not here</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              A tactic you deleted, or a shape the library no longer carries.
            </p>
            <Link
              href="/app/tactics"
              className="text-accent mt-3 inline-block text-sm underline underline-offset-4"
            >
              Open the board
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
