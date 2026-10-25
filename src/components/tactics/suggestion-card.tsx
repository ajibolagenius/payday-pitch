"use client"

// One card, two states (spec 0008 AC-6, AC-7). The domain already decided which
// rule fires, in the fixed debt then fund then costs order, so a comfortable
// fund and a live debt can never appear on screen as opposite advice. Tapping
// the card only loads a shape into the board through the URL: nothing is
// written, and the user's own save is what makes it theirs.
import Link from "next/link"

import { FUND_COMFORT_MONTHS, FUND_SHAPE } from "@/domain/tactics"
import type { TacticSuggestion } from "@/domain/tactics"
import { buttonVariants } from "@/components/ui/button"

export function SuggestionCard({
  suggestion,
  fundMonthsValue,
}: {
  suggestion: TacticSuggestion
  fundMonthsValue: number
}) {
  // The fund rule is the only one that names 4-3-3, so the shape identifies it.
  const comfortable = suggestion.shapeName === FUND_SHAPE
  return (
    <section
      aria-labelledby="tactic-suggestion"
      className="bg-card text-card-foreground rounded-xl border p-4"
    >
      <h2
        id="tactic-suggestion"
        className="text-accent-text text-lg font-bold tracking-tight"
      >
        {comfortable
          ? `Your fund covers ${Math.min(fundMonthsValue, 99)} months`
          : "A shape that fits your numbers"}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {comfortable
          ? `With ${FUND_COMFORT_MONTHS} months of costs saved, the keeper spot is doing less work. `
          : ""}
        {suggestion.reason}
      </p>
      <Link
        href={`/app/tactics?shape=${encodeURIComponent(suggestion.shapeName)}`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "mt-3",
        })}
      >
        Load {suggestion.shapeName} onto the board
      </Link>
    </section>
  )
}
