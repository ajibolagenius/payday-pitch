// Placeholder so the installed app's start_url resolves, inside the (app)
// layout's getClaims() guard. Feature 6 replaces this with the first match
// loop; the sign-out affordance stays.
import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"

export default function AppHome() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-16">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          Payday Pitch
        </Link>
        <SignOutButton />
      </div>
      <main className="flex flex-1 flex-col justify-center gap-4">
        <h1 className="text-3xl font-bold">Your pitch</h1>
        <p>Your formation will show here.</p>
      </main>
    </div>
  )
}
