"use client"

// Sign out in the order the invariant needs (spec 0006): tell the service
// worker to drop the cached pages first, let the message land, then submit the
// action that clears the cookies and redirects. A cached money page must never
// outlive the session in this browser profile.
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/features/auth/actions"
import { submitAction } from "@/components/auth/use-form-action"

export function SignOutButton() {
  const form = useRef<HTMLFormElement>(null)

  async function handOff() {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "sign-out" })
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(resolve, 250, "waited")),
      ])
    }
    form.current?.requestSubmit()
  }

  return (
    <form ref={form} action={submitAction(signOutAction)} className="contents">
      <Button type="button" variant="outline" onClick={handOff}>
        Sign out
      </Button>
    </form>
  )
}
