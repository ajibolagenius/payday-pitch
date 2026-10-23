// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { ComponentProps, JSX } from "react"

import { PitchReview, type ReviewLine } from "@/components/walk/pitch-review"
import type { Formation } from "@/domain/formations"

afterEach(cleanup)

const PitchView = vi.hoisted(() =>
  vi.fn<
    (props: {
      formation: unknown
      amounts: { amountMinorUnits: number; currency: string }[]
    }) => JSX.Element
  >(() => <div data-testid="pitch" />),
)
vi.mock("@/components/pitch/pitch-view", () => ({ PitchView }))

// Spec 0007 AC-6, AC-7. The grass itself is PitchView's own surface; here we
// pin what the review adds: planned amounts, the optional actuals, and the
// difference between "not logged" and "moved nothing".

const formation: Formation = {
  name: "4-4-2",
  style: "Balanced classic",
  whenToPlay: "Steady life.",
  positions: [
    { role: "GK", label: "Emergency Fund", basisPoints: 1000 },
    { role: "DEF", label: "Right Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Centre Back", basisPoints: 1000 },
    { role: "DEF", label: "Left Back", basisPoints: 1000 },
    { role: "MID", label: "Debt Repayment", basisPoints: 750 },
    { role: "MID", label: "Upskilling", basisPoints: 750 },
    { role: "MID", label: "Short-Term Goals", basisPoints: 750 },
    { role: "MID", label: "Left Mid", basisPoints: 750 },
    { role: "FWD", label: "Striker", basisPoints: 750 },
    { role: "FWD", label: "Target Man", basisPoints: 750 },
    { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
  ],
}

const lines: ReviewLine[] = formation.positions.map((position, spotIndex) => ({
  role: position.role,
  spotIndex,
  label: position.label,
  plannedMinorUnits: 1_000_000 + spotIndex,
  actualMinorUnits: null,
}))

type Props = ComponentProps<typeof PitchReview>

function renderReview(props: Partial<Props> = {}) {
  const full: Props = {
    formation,
    lines,
    currency: "NGN",
    editable: true,
    actuals: {},
    onActual: vi.fn(),
    onPlay: vi.fn(),
    pending: false,
    ...props,
  }
  render(<PitchReview {...full} />)
  return full
}

describe("PitchReview draft (AC-6)", () => {
  it("hands the pitch one aligned amount per planned line", () => {
    renderReview()
    expect(PitchView).toHaveBeenCalledTimes(1)
    const { amounts } = PitchView.mock.calls[0]![0]
    expect(amounts).toHaveLength(12)
    expect(amounts[5].amountMinorUnits).toBe(1_000_005)
  })

  it("shows a Moved box per slot and reports typing with its spot index", () => {
    const props = renderReview()
    const moved = screen.getAllByLabelText("Moved")
    expect(moved).toHaveLength(12)
    expect(moved[0]).toHaveAttribute("name", "actual-0")
    fireEvent.change(moved[6], { target: { value: "12500" } })
    expect(props.onActual).toHaveBeenCalledWith(6, "12500")
  })

  it("pre-fills a Moved box from the stored draft text", () => {
    renderReview({ actuals: { 3: "800" } })
    expect(screen.getAllByLabelText("Moved")[3]).toHaveValue("800")
  })

  it("plays the match on request", async () => {
    const user = userEvent.setup()
    const props = renderReview()
    await user.click(screen.getByRole("button", { name: "Play the match" }))
    expect(props.onPlay).toHaveBeenCalledTimes(1)
  })

  it("locks the button while the write is in flight", () => {
    renderReview({ pending: true })
    const button = screen.getByRole("button", { name: /Playing/ })
    expect(button).toBeDisabled()
  })
})

describe("PitchReview saved month (AC-6, AC-7)", () => {
  it("shows planned against actual per line, no inputs", () => {
    const saved = lines.map((line, i) => ({
      ...line,
      actualMinorUnits: i === 0 ? null : i === 1 ? 0 : 500_000,
    }))
    renderReview({ editable: false, lines: saved })
    expect(screen.queryByLabelText("Moved")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Play the match/ }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByText("not logged")).toHaveLength(1)
  })

  it("renders a saved zero as money, distinct from not logged (AC-6)", () => {
    const saved = lines.map((line, i) => ({
      ...line,
      actualMinorUnits: i === 0 ? 0 : null,
    }))
    renderReview({ editable: false, lines: saved })
    expect(screen.getAllByText("not logged")).toHaveLength(11)
    expect(screen.getAllByText("₦0.00")).toHaveLength(1)
  })
})
