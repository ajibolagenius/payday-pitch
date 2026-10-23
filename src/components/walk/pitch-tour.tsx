"use client"

// The one time pitch tour (spec 0007 AC-7). It spotlights the five zones on
// the grass, once: the flag lives in localStorage, never in a table, because
// it says nothing about the person's money. Closing, skipping, Escape and
// finishing all set it; being navigated away mid tour does not, so an
// unfinished tour can come back.
import { useEffect } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const SEEN_KEY = "pp.pitch-tour.seen"

/** The first node of each zone: the slot key is `${role}-${index}`. */
const ZONES = [
  {
    slotKey: "GK-0",
    title: "Keeper: the emergency fund",
    description:
      "Cash you do not touch. It saves the month when something breaks.",
    side: "bottom" as const,
  },
  {
    slotKey: "DEF-0",
    title: "Defenders: what you must pay",
    description:
      "Rent, data, transport, fees. Defence takes your fixed costs in full, every month.",
    side: "bottom" as const,
  },
  {
    slotKey: "MID-0",
    title: "Midfield: the work",
    description:
      "Debt you are clearing, upskilling, goals within a year. This is where the game is won.",
    side: "bottom" as const,
  },
  {
    slotKey: "FWD-0",
    title: "Forwards: put it to work",
    description:
      "Savings and investments. Money that keeps scoring while you are off the pitch.",
    side: "top" as const,
  },
  {
    slotKey: "BENCH-0",
    title: "Bench: spend without guilt",
    description: "You planned this money. Use it, and the season still holds.",
    side: "top" as const,
  },
]

// Safari in private mode throws on both sides of storage, and a tour flag is
// not worth crashing the walk over.
function tourSeen(): boolean {
  try {
    return Boolean(window.localStorage.getItem(SEEN_KEY))
  } catch {
    return false
  }
}

function markTourSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1")
  } catch {
    // The tour shows again next visit. Nothing else depends on it.
  }
}

export function PitchTour() {
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (tourSeen()) return
    // Only start once the grass is on screen with its players. A step that
    // renders no pitch (no shape yet, or a shape that cannot cover) leaves the
    // flag alone, so the tour is still owed.
    if (!document.querySelector(`[data-slot-key="${ZONES[0].slotKey}"]`)) return

    const tour = driver({
      steps: ZONES.map((zone) => ({
        element: `[data-slot-key="${zone.slotKey}"]`,
        popover: {
          title: zone.title,
          description: zone.description,
          side: zone.side,
          align: "center",
        },
      })),
      animate: !reduceMotion,
      smoothScroll: !reduceMotion,
      // A player stays tappable mid tour: the tour explains, it never locks.
      disableActiveInteraction: false,
      allowClose: true,
      overlayClickBehavior: "close",
      overlayOpacity: 0.55,
      stagePadding: 8,
      stageRadius: 10,
      popoverOffset: 10,
      popoverClass: "tour-popover",
      showProgress: true,
      nextBtnText: "Next",
      doneBtnText: "Got it",
      closeBtnLabel: "Skip the tour",
      onDestroyed: (_element, _step, { reason }) => {
        if (reason === "api" || reason === "replaced") return
        markTourSeen()
      },
    })
    tour.drive()

    return () => {
      if (tour.isActive()) tour.destroy()
    }
  }, [reduceMotion])

  return null
}
