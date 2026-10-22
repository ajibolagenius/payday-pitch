"use client"

// Tells the service worker who is signed in (spec 0001 offline rule) so cached
// pages land in that user's cache, and a different user's cache is dropped.
import { useEffect } from "react"

export function SignedInUser({ userId }: { userId: string }) {
  useEffect(() => {
    navigator.serviceWorker?.ready
      .then((reg) => reg.active?.postMessage({ type: "user", id: userId }))
      .catch(() => {})
  }, [userId])

  return null
}
