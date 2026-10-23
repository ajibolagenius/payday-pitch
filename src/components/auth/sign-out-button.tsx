"use client"

// Sign out in one step: the Server Action clears the cookies and redirects.
// There is no worker hand-off because /app is never cached (spec 0001 offline
// rule, tightened after the 2026-10 audit): no signed-in page outlives the
// session on disk because none is stored at all.
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/features/auth/actions"
import { submitAction } from "@/components/auth/use-form-action"

export function SignOutButton() {
  return (
    <form action={submitAction(signOutAction)} className="contents">
      <Button type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  )
}
