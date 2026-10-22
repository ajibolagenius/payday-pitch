"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(callback: () => void) {
  const query = window.matchMedia(QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}

// Subscribed rather than read once at mount (Motion's useReducedMotion does):
// React cannot patch a hydration mismatch on an attribute derived from it.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
