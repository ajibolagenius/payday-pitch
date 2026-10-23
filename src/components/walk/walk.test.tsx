// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Walk } from "@/components/walk/walk"
import type { WalkState } from "@/features/match/queries"

afterEach(cleanup)

const hoisted = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  addIncomeAction: vi.fn(),
  updateIncomeAction: vi.fn(),
  deleteIncomeAction: vi.fn(),
  addFixedCostAction: vi.fn(),
  updateFixedCostAction: vi.fn(),
  deleteFixedCostAction: vi.fn(),
  playMatchAction: vi.fn(),
}))

vi.mock("sonner", () => ({ toast: hoisted.toast }))
vi.mock("@/features/streams/actions", () => ({
  addIncomeAction: hoisted.addIncomeAction,
  updateIncomeAction: hoisted.updateIncomeAction,
  deleteIncomeAction: hoisted.deleteIncomeAction,
}))
vi.mock("@/features/costs/actions", () => ({
  addFixedCostAction: hoisted.addFixedCostAction,
  updateFixedCostAction: hoisted.updateFixedCostAction,
  deleteFixedCostAction: hoisted.deleteFixedCostAction,
}))
vi.mock("@/features/match/actions", () => ({
  playMatchAction: hoisted.playMatchAction,
}))
vi.mock("@/components/pitch/pitch-view", () => ({
  PitchView: vi.fn(() => <div data-testid="pitch" />),
}))
vi.mock("@/components/walk/pitch-tour", () => ({ PitchTour: () => null }))

// Spec 0007 AC-1, AC-6, AC-8, AC-9, AC-10. Where the walk opens, how the
// steps connect, and what playing the match reports back.

const positions442 = [
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
] as const

const shape442 = {
  id: 1,
  name: "4-4-2",
  style: "Balanced classic",
  whenToPlay: "Your default shape when life is steady.",
  positions: positions442.map((p) => ({ ...p })),
}

const shapeWidest = {
  id: 2,
  name: "5-4-1",
  style: "Park the bus",
  whenToPlay: "When costs must be covered no matter what.",
  positions: [
    { role: "GK", label: "Emergency Fund", basisPoints: 200 },
    { role: "DEF", label: "Right Back", basisPoints: 1040 },
    { role: "DEF", label: "Centre Back", basisPoints: 1040 },
    { role: "DEF", label: "Centre Back", basisPoints: 1040 },
    { role: "DEF", label: "Centre Back", basisPoints: 1040 },
    { role: "DEF", label: "Left Back", basisPoints: 1040 },
    { role: "MID", label: "Debt Repayment", basisPoints: 2500 },
    { role: "MID", label: "Upskilling", basisPoints: 500 },
    { role: "MID", label: "Short-Term Goals", basisPoints: 500 },
    { role: "MID", label: "Left Mid", basisPoints: 500 },
    { role: "FWD", label: "Target Man", basisPoints: 400 },
    { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 200 },
  ],
}

function snapshot() {
  return {
    id: 9,
    period: "2026-10-01",
    shapeId: 1,
    shapeName: "4-4-2",
    currency: "NGN",
    lines: positions442.map((p, i) => ({
      role: p.role,
      spotIndex: i,
      label: p.label,
      basisPoints: p.basisPoints,
      plannedMinorUnits: 1_000_000 + i,
      actualMinorUnits: i === 0 ? null : 500_000,
    })),
  }
}

function money() {
  return {
    incomes: [
      {
        id: 1,
        name: "Salary",
        amountMinorUnits: 45_000_000,
        currency: "NGN",
        paydayDay: 25,
      },
      {
        id: 2,
        name: "Side hustle",
        amountMinorUnits: 5_000_000,
        currency: "NGN",
      },
    ],
    costs: [
      { id: 3, name: "Rent", amountMinorUnits: 15_000_000, currency: "NGN" },
    ],
    incomeMinorUnits: 50_000_000,
    costMinorUnits: 15_000_000,
    currency: "NGN",
  }
}

function walkState(overrides: Partial<WalkState> = {}): WalkState {
  return {
    ...money(),
    formations: [shape442, shapeWidest] as never,
    active: null,
    last: null,
    ...overrides,
  } as WalkState
}

function renderWalk(overrides: Partial<WalkState> = {}) {
  const utils = render(<Walk walk={walkState(overrides)} />)
  return utils
}

beforeEach(() => {
  hoisted.toast.success.mockClear()
  hoisted.toast.error.mockClear()
  hoisted.playMatchAction.mockReset()
})

describe("Where the walk opens (AC-1, AC-8)", () => {
  it("opens on incomes when nothing is logged", () => {
    renderWalk({
      incomes: [],
      costs: [],
      incomeMinorUnits: 0,
      costMinorUnits: 0,
    })
    expect(
      screen.getByRole("heading", { name: "What comes in" }),
    ).toBeInTheDocument()
  })

  it("opens on costs when income exists but costs do not", () => {
    renderWalk({ costs: [], costMinorUnits: 0 })
    expect(
      screen.getByRole("heading", { name: "What must go out" }),
    ).toBeInTheDocument()
  })

  it("opens on the pitch once both totals exist", () => {
    renderWalk()
    expect(
      screen.getByRole("heading", { name: "Your pitch" }),
    ).toBeInTheDocument()
  })

  it("reopens on the saved month when one is active (AC-8)", () => {
    renderWalk({ active: snapshot() as never })
    expect(
      screen.getByRole("heading", { name: "This month" }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Played for 2026-10-01/)).toBeInTheDocument()
  })

  it("shows the last match when a month was played before (AC-8)", () => {
    renderWalk({ last: snapshot() as never })
    expect(
      screen.getByText(/Your last match: 4-4-2, played for 2026-10-01/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Your pitch" }),
    ).toBeInTheDocument()
  })

  it("offers to pick a shape when no match has been played", () => {
    renderWalk()
    expect(screen.getByText("No match played yet")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Pick a shape" }),
    ).toBeInTheDocument()
  })

  it("blocks the shape and pitch steps while money is missing (AC-1)", () => {
    renderWalk({
      incomes: [],
      costs: [],
      incomeMinorUnits: 0,
      costMinorUnits: 0,
    })
    expect(screen.getByRole("button", { name: "3. Shape" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "4. Pitch" })).toBeDisabled()
  })
})

describe("Walking to the draft pitch (AC-3, AC-4)", () => {
  it("shows totals once money is in, then the picker, then the review", async () => {
    const user = userEvent.setup()
    renderWalk()
    await user.click(screen.getByRole("button", { name: "Pick a shape" }))
    expect(
      screen.getByRole("heading", { name: "Pick your shape" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Income")).toBeInTheDocument()
    expect(screen.getByText("Left to work")).toBeInTheDocument()
    expect(screen.getByText(/₦500,000\.00/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /4-4-2/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    await user.click(screen.getByRole("button", { name: "Review the pitch" }))
    expect(
      screen.getByRole("button", { name: "Play the match" }),
    ).toBeInTheDocument()
  })

  it("plays a saved month again from its review (AC-8)", async () => {
    const user = userEvent.setup()
    renderWalk({ active: snapshot() as never })
    await user.click(
      screen.getByRole("button", { name: "Play this month again" }),
    )
    expect(
      screen.getByRole("heading", { name: "Pick your shape" }),
    ).toBeInTheDocument()
  })
})

describe("Playing the match (AC-6, AC-9, AC-10)", () => {
  async function toDraftPlay(user: ReturnType<typeof userEvent.setup>) {
    renderWalk()
    await user.click(screen.getByRole("button", { name: "Pick a shape" }))
    await user.click(screen.getByRole("button", { name: "Review the pitch" }))
    await user.click(screen.getByRole("button", { name: "Play the match" }))
  }

  it("sends the shape and twelve actual slots, then confirms on the books", async () => {
    const user = userEvent.setup()
    hoisted.playMatchAction.mockResolvedValue({
      ok: true,
      data: { id: 10, period: "2026-10-01" },
    })
    await toDraftPlay(user)
    expect(hoisted.playMatchAction).toHaveBeenCalledWith({
      shapeId: 1,
      actuals: positions442.map((_, spotIndex) => ({
        spotIndex,
        actualNaira: "",
      })),
    })
    await waitFor(() =>
      expect(hoisted.toast.success).toHaveBeenCalledWith(
        "Played. 2026-10-01 is on the books.",
      ),
    )
  })

  it("carries a typed actual into the payload", async () => {
    const user = userEvent.setup()
    hoisted.playMatchAction.mockResolvedValue({
      ok: true,
      data: { id: 10, period: "2026-10-01" },
    })
    renderWalk()
    await user.click(screen.getByRole("button", { name: "Pick a shape" }))
    await user.click(screen.getByRole("button", { name: "Review the pitch" }))
    await user.type(screen.getAllByLabelText("Moved")[5], "12500")
    await user.click(screen.getByRole("button", { name: "Play the match" }))
    await waitFor(() => expect(hoisted.playMatchAction).toHaveBeenCalled())
    const payload = hoisted.playMatchAction.mock.calls[0]![0] as {
      actuals: { spotIndex: number; actualNaira: string }[]
    }
    expect(payload.actuals[5]).toEqual({ spotIndex: 5, actualNaira: "12500" })
    expect(payload.actuals[0]).toEqual({ spotIndex: 0, actualNaira: "" })
  })

  it("surfaces the friendly failure message instead of claiming a play (AC-10)", async () => {
    const user = userEvent.setup()
    hoisted.playMatchAction.mockResolvedValue({
      ok: false,
      error: {
        code: "unable_to_cover",
        message:
          "This shape holds ₦50,000.00 short of your costs. Choose a wider defense or trim them.",
      },
    })
    await toDraftPlay(user)
    await waitFor(() =>
      expect(hoisted.toast.error).toHaveBeenCalledWith(
        "This shape holds ₦50,000.00 short of your costs. Choose a wider defense or trim them.",
      ),
    )
    expect(hoisted.toast.success).not.toHaveBeenCalled()
  })
})

describe("A draft shape that cannot cover (AC-5)", () => {
  it("names the shortfall on the pitch and offers the shapes back", async () => {
    const user = userEvent.setup()
    renderWalk({
      costMinorUnits: 25_000_000,
      costs: [
        { id: 3, name: "Loan", amountMinorUnits: 25_000_000, currency: "NGN" },
      ],
      active: snapshot() as never,
    })
    await user.click(
      screen.getByRole("button", { name: "Play this month again" }),
    )
    await user.click(screen.getByRole("button", { name: "4. Pitch" }))
    expect(
      screen.getByText("This shape cannot cover your costs"),
    ).toBeInTheDocument()
    expect(screen.getByText(/It is short by/)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Back to shapes" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Play the match" }),
    ).not.toBeInTheDocument()
  })

  it("disables the pitch review button while the chosen shape is short", async () => {
    const user = userEvent.setup()
    renderWalk({
      costMinorUnits: 25_000_000,
      costs: [
        { id: 3, name: "Loan", amountMinorUnits: 25_000_000, currency: "NGN" },
      ],
    })
    await user.click(screen.getByRole("button", { name: "Pick a shape" }))
    expect(
      screen.getByRole("button", { name: "Review the pitch" }),
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: /4-4-2/ })).toHaveTextContent(
      /Short by/,
    )
  })
})
