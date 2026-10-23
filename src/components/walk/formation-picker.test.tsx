// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, within, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FormationPicker } from "@/components/walk/formation-picker"
import type { LibraryFormation } from "@/features/match/library"

afterEach(cleanup)

// Spec 0007 AC-3, AC-4, AC-5. Cards are previews: choosing one only calls
// back, it writes nothing.

const balanced: LibraryFormation = {
  id: 1,
  name: "4-4-2",
  style: "Balanced classic",
  whenToPlay: "Your default shape when life is steady.",
  positions: [
    { role: "GK", label: "Emergency Fund", basisPoints: 1000 },
    { role: "DEF", label: "Right Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Left Back", basisPoints: 1000 },
    { role: "MID", label: "Right Mid", basisPoints: 750 },
    { role: "MID", label: "Central Mid", basisPoints: 750 },
    { role: "MID", label: "Central Mid", basisPoints: 750 },
    { role: "MID", label: "Left Mid", basisPoints: 750 },
    { role: "FWD", label: "Striker", basisPoints: 750 },
    { role: "FWD", label: "Second Striker", basisPoints: 750 },
    { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
  ],
}

const narrowDefense: LibraryFormation = {
  id: 2,
  name: "4-3-3",
  style: "Attacking",
  whenToPlay:
    "When your costs are covered and you want to build wealth faster.",
  positions: [
    { role: "GK", label: "Emergency Fund", basisPoints: 500 },
    { role: "DEF", label: "Right Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Left Back", basisPoints: 1000 },
    { role: "MID", label: "Defensive Mid", basisPoints: 667 },
    { role: "MID", label: "Central Mid", basisPoints: 666 },
    { role: "MID", label: "Attacking Mid", basisPoints: 667 },
    { role: "FWD", label: "Right Wing", basisPoints: 1000 },
    { role: "FWD", label: "Striker", basisPoints: 1000 },
    { role: "FWD", label: "Left Wing", basisPoints: 1000 },
    { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
  ],
}

function renderPicker(
  props: Partial<Parameters<typeof FormationPicker>[0]> = {},
) {
  const full = {
    formations: [balanced, narrowDefense],
    incomeMinorUnits: 50_000_000, // ₦500,000
    costMinorUnits: 15_000_000, // ₦150,000, inside a 40% defence share
    currency: "NGN",
    selectedId: balanced.id,
    onSelect: vi.fn(),
    ...props,
  }
  render(<FormationPicker {...full} />)
  return full
}

describe("FormationPicker cards (AC-3)", () => {
  it("renders one card per library formation with its zones", () => {
    renderPicker()
    const cards = screen.getAllByRole("button")
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent("4-4-2")
    expect(cards[0]).toHaveTextContent("Balanced classic")
    expect(cards[0]).toHaveTextContent(
      "Your default shape when life is steady.",
    )
    expect(cards[0]).toHaveTextContent("Keeper 10%")
    expect(cards[0]).toHaveTextContent("Defence 40%")
    expect(cards[0]).toHaveTextContent("Midfield 30%")
    expect(cards[0]).toHaveTextContent("Attack 15%")
    expect(cards[0]).toHaveTextContent("Bench 5%")
  })

  it("marks the chosen card pressed and the others not (AC-4)", () => {
    renderPicker()
    expect(screen.getByRole("button", { name: /4-4-2/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(screen.getByRole("button", { name: /4-3-3/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
  })

  it("choosing a card only calls back with its id (AC-4: nothing is written)", async () => {
    const user = userEvent.setup()
    const props = renderPicker({ selectedId: null })
    await user.click(screen.getByRole("button", { name: /4-3-3/ }))
    expect(props.onSelect).toHaveBeenCalledWith(narrowDefense.id)
    expect(props.onSelect).toHaveBeenCalledTimes(1)
  })

  it("says so when the library did not load (AC-3)", () => {
    renderPicker({ formations: [] })
    expect(
      screen.getByText(
        "The formation library did not load. Reload the page to try again.",
      ),
    ).toBeInTheDocument()
  })
})

describe("FormationPicker shortfall (AC-5)", () => {
  it("badges a shape whose defence zone cannot hold the costs", () => {
    // Costs ₦250,000; both shapes defend 40% of ₦500,000 = ₦200,000.
    renderPicker({ costMinorUnits: 25_000_000 })
    const card = screen.getByRole("button", { name: /4-4-2/ })
    expect(within(card).getByText(/Short by/)).toHaveTextContent(/50,000/)
    expect(within(card).getByText(/Short by/)).toBeInTheDocument()
  })

  it("leaves a covering shape unbadged", () => {
    renderPicker()
    const card = screen.getByRole("button", { name: /4-4-2/ })
    expect(within(card).queryByText(/Short by/)).not.toBeInTheDocument()
  })

  it("warns up front when no shape can cover (AC-5)", () => {
    renderPicker({ costMinorUnits: 65_000_000 }) // more than 40% of income
    const notice = screen.getByRole("status")
    expect(notice).toHaveTextContent("Your costs are more than you earn.")
    expect(notice).toHaveTextContent(/650,000/)
    expect(notice).toHaveTextContent(/500,000/)
  })

  it("stays quiet when at least one shape covers", () => {
    renderPicker()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
