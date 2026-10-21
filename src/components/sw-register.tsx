"use client"

import { useEffect, useState } from "react"

// Registers /sw.js (production builds only, so dev never serves stale files)
// and shows a refresh prompt when a new version is waiting. No silent skipWaiting.
export function SwRegister({ version }: { version: string }) {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .register(`/sw.js?v=${version}`, { updateViaCache: "none" })
      .then((reg) => {
        // A controller means an older version runs this page; no controller is a first install.
        if (reg.waiting && navigator.serviceWorker.controller)
          setWaiting(reg.waiting)
        reg.addEventListener("updatefound", () => {
          const next = reg.installing
          next?.addEventListener("statechange", () => {
            if (
              next.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(next)
            }
          })
        })
      })
  }, [version])

  if (!waiting) return null

  function refresh() {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    )
    waiting?.postMessage({ type: "skip-waiting" })
  }

  return (
    <div
      role="status"
      className="bg-foreground text-background fixed inset-x-4 bottom-4 mx-auto flex max-w-md items-center justify-between gap-4 rounded-lg px-4 py-3 shadow-lg"
    >
      <span>A new version is ready.</span>
      <button
        type="button"
        onClick={refresh}
        className="bg-background text-foreground rounded-md px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Refresh
      </button>
    </div>
  )
}
