// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { SuggestionCard } from "@/components/tactics/suggestion-card"
import { COSTS_SHAPE, DEBT_SHAPE, FUND_SHAPE } from "@/domain/tactics"
import type { TacticSuggestion } from "@/domain/tactics"

afterEach(cleanup)

// Spec 0008 AC-6, AC-7. One card, one rule: the domain already decided which
// rule owns the slot, so the card only has to say it and offer the shortcut.
// The tap is a plain link, so loading a shape writes nothing.

function renderCard(suggestion: TacticSuggestion, fundMonthsValue = 0) {
  render(
    <SuggestionCard
      suggestion={suggestion}
      fundMonthsValue={fundMonthsValue}
    />,
  )
}

describe("the suggestion card (AC-7)", () => {
  it("names the shape and gives that shape's own reason", () => {
    renderCard({
      shapeName: COSTS_SHAPE,
      reason:
        "When your fixed costs are high and the month needs to bend around them.",
    })
    expect(
      screen.getByRole("region", { name: "A shape that fits your numbers" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/When your fixed costs are high/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: `Load ${COSTS_SHAPE} onto the board` }),
    ).toHaveAttribute("href", "/app/tactics?shape=5-3-2")
  })

  it("carries the debt rule in the same slot", () => {
    renderCard({
      shapeName: DEBT_SHAPE,
      reason: "When a debt must fall: everything shields the defense.",
    })
    expect(
      screen.getByRole("link", { name: `Load ${DEBT_SHAPE} onto the board` }),
    ).toHaveAttribute("href", "/app/tactics?shape=5-4-1")
  })

  it("counts the months the fund covers when the fund rule owns the card", () => {
    renderCard(
      { shapeName: FUND_SHAPE, reason: "When your costs are covered." },
      4,
    )
    expect(
      screen.getByRole("region", { name: "Your fund covers 4 months" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/With 3 months of costs saved, the keeper spot/),
    ).toBeInTheDocument()
    // The shortcut is still only a shortcut: a link, and nothing else.
    expect(
      screen.getByRole("link", { name: `Load ${FUND_SHAPE} onto the board` }),
    ).toHaveAttribute("href", "/app/tactics?shape=4-3-3")
  })

  it("does not shout a month count nobody can believe", () => {
    renderCard(
      { shapeName: FUND_SHAPE, reason: "When your costs are covered." },
      400,
    )
    expect(
      screen.getByRole("region", { name: "Your fund covers 99 months" }),
    ).toBeInTheDocument()
  })
})
