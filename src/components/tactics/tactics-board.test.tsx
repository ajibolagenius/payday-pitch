// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import {
  fireEvent,
  render,
  screen,
  within,
  cleanup,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TacticsBoard } from "@/components/tactics/tactics-board"
import type { BoardContext, BoardSource } from "@/features/tactics/board"
import { playSavedTactic, saveTactic } from "@/features/tactics/actions"
import type { SaveTacticInput } from "@/features/tactics/schema"

afterEach(cleanup)

// Spec 0008 AC-1, AC-2, AC-5, AC-8, AC-9. The board is the draft and the
// preview: what a person sees while editing is the split the stored month will
// carry, so these tests follow the amounts on the grass, not the shares alone.

const hoisted = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  push: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("sonner", () => ({ toast: hoisted.toast }))
vi.mock("next/navigation", () => ({ useRouter: () => hoisted }))
vi.mock("@/features/tactics/actions", () => ({
  saveTactic: vi.fn(),
  playSavedTactic: vi.fn(),
}))
vi.mock("@/components/tactics/suggestion-card", () => ({
  SuggestionCard: () => <div data-testid="card" />,
}))

// A stand in for the grass that keeps the real slot key format, prints each
// spot's amount, and requires one amount per position, exactly as PitchView
// does, so the board cannot hand it a short list here and crash in the browser.
vi.mock("@/components/pitch/pitch-view", () => ({
  PitchView: ({
    formation,
    amounts,
    selectedSlotKey,
    onSelectSlot,
  }: {
    formation: {
      name: string
      positions: { role: string; label: string; basisPoints: number }[]
    }
    amounts: { amountMinorUnits: number }[]
    selectedSlotKey?: string
    onSelectSlot?: (slotKey: string) => void
  }) => {
    if (amounts.length !== formation.positions.length) {
      throw new Error("the grass needs one amount per position")
    }
    return (
      <div
        data-testid="pitch"
        data-shape={formation.name}
        data-selected={selectedSlotKey}
      >
        {formation.positions.map((position, at) => {
          const withinRole = formation.positions
            .slice(0, at)
            .filter((other) => other.role === position.role).length
          return (
            <button
              key={at}
              type="button"
              onClick={() => onSelectSlot?.(`${position.role}-${withinRole}`)}
            >
              {position.role}-{withinRole} {amounts[at]?.amountMinorUnits}
            </button>
          )
        })}
      </div>
    )
  },
}))

const seed = [
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
] as const

function librarySource(over: Partial<BoardSource> = {}): BoardSource {
  return {
    baseShapeName: "4-4-2",
    title: "4-4-2",
    style: "Balanced classic",
    whenToPlay: "Your default shape when life is steady.",
    positions: seed.map((spot, spotIndex) => ({ ...spot, spotIndex })),
    tacticId: null,
    versionId: null,
    ...over,
  }
}

function boardContext(over: Partial<BoardContext> = {}): BoardContext {
  return {
    source: librarySource(),
    tactics: [],
    incomeKobo: 45_000_000, // ₦450,000
    costKobo: 15_000_000, // ₦150,000, inside the 40 percent defence share
    currency: "NGN",
    fundMonthsValue: 0,
    suggestion: null,
    ...over,
  }
}

/** The pitch stand in prints raw kobo, which is enough to follow one edit. */
const spot = (slotKey: string) =>
  within(screen.getByTestId("pitch")).getByRole("button", {
    name: new RegExp(`^${slotKey} `),
  })

const shareField = () => screen.getByLabelText("Exact share")

function renderBoard(board = boardContext()) {
  render(<TacticsBoard board={board} />)
  return board
}

beforeEach(() => {
  vi.mocked(saveTactic)
    .mockReset()
    .mockResolvedValue({
      ok: true,
      data: { tacticId: 7, versionId: 9 },
    })
  vi.mocked(playSavedTactic)
    .mockReset()
    .mockResolvedValue({
      ok: true,
      data: { matchId: 3, period: "2026-10-01" },
    })
})

describe("editing a share (AC-1, AC-4)", () => {
  it("opens on a forward with the amount its share of what is left", () => {
    renderBoard()
    expect(
      screen.getByRole("heading", { level: 3, name: "Striker" }),
    ).toBeInTheDocument()
    expect(shareField()).toHaveValue("7.5%")
    // 750 of the 6000 basis points outside defence, of ₦300,000 left to work.
    expect(spot("FWD-0")).toHaveTextContent("3750000")
    expect(spot("BENCH-0")).toHaveTextContent("2500000")
    expect(screen.getByTestId("pitch")).toHaveAttribute("data-shape", "4-4-2")
  })

  it("moves the money live: the forward gains, the bench pays, nothing is written", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getByRole("button", { name: /^Raise / }))

    expect(shareField()).toHaveValue("8%")
    expect(spot("FWD-0")).toHaveTextContent("4000000")
    expect(spot("BENCH-0")).toHaveTextContent("2250000")
    expect(saveTactic).not.toHaveBeenCalled()
  })

  it("lets the person pick another player from the grass", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(spot("DEF-0"))

    expect(screen.getByTestId("pitch")).toHaveAttribute(
      "data-selected",
      "DEF-0",
    )
    expect(
      screen.getByRole("heading", { level: 3, name: "Right Back" }),
    ).toBeInTheDocument()
    // A defender names the pool it is locked to, in money.
    expect(
      screen.getByText(/Defence holds your costs, here/),
    ).toHaveTextContent("₦150,000.00")
  })

  it("stops a share at its ceiling and names the figure", () => {
    renderBoard()
    fireEvent.change(shareField(), { target: { value: "61%" } })

    expect(shareField()).toHaveValue("60%")
    expect(
      screen.getByText(/is the most this spot can hold/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/The plan always adds up to the whole:/),
    ).toHaveTextContent("100%")
  })

  it("keeps what is being typed until the field is left", () => {
    renderBoard()
    // Each keystroke lands on its own: the recomputed share never rewrites the
    // number under the cursor, so "12.5%" is 12.5 and not 12%5.
    for (const value of ["1", "12", "12.", "12.5", "12.5%"]) {
      fireEvent.change(shareField(), { target: { value } })
      expect(shareField()).toHaveValue(value)
    }
    expect(spot("FWD-0")).toHaveTextContent("6250000")
    fireEvent.blur(shareField())
    expect(shareField()).toHaveValue("12.5%")
  })
})

describe("warnings (AC-5)", () => {
  it("says so when costs are more than half of income", () => {
    renderBoard(boardContext({ costKobo: 25_000_000 }))
    expect(screen.getByText(/costs are more than half/)).toBeInTheDocument()
  })

  it("says so when the keeper spot is drained to nothing", () => {
    renderBoard()
    fireEvent.change(shareField(), { target: { value: "60%" } })
    expect(
      screen.getByText(/Nothing goes to the keeper spot/),
    ).toBeInTheDocument()
  })

  it("stays quiet on a steady plan", () => {
    renderBoard()
    expect(screen.queryByText(/costs are more than half/)).toBeNull()
    expect(screen.queryByText("Nothing goes to the keeper spot")).toBeNull()
  })
})

describe("saving (AC-2, AC-8)", () => {
  it("sends the draft shares with the base shape, and opens the new tactic", async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getByRole("button", { name: /^Raise / }))
    // The board prefills the name with the shape it opened on, so the person
    // replaces it rather than adding to it.
    await user.clear(screen.getByLabelText("Name"))
    await user.type(screen.getByLabelText("Name"), "My 4-4-2")
    await user.click(screen.getByRole("button", { name: "Save tactic" }))

    const payload = vi.mocked(saveTactic).mock.calls[0]?.[0] as SaveTacticInput
    expect(payload.name).toBe("My 4-4-2")
    expect(payload.baseShapeName).toBe("4-4-2")
    expect(payload.tacticId).toBeUndefined()
    expect(payload.split).toHaveLength(12)
    expect(payload.split[9]).toEqual({
      role: "FWD",
      spot_index: 9,
      label: "Striker",
      basis_points: 800,
    })
    expect(hoisted.push).toHaveBeenCalledWith("/app/tactics?tactic=7")
    expect(hoisted.toast.success).toHaveBeenCalledWith("Saved as My 4-4-2.")
  })

  it("offers no play path for a plan that was never saved", () => {
    renderBoard()
    expect(
      screen.getByText("Save it first, then it can be played."),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Play this month" })).toBeNull()
  })

  it("sends the tactic's own name when editing it, which has no name field", async () => {
    const user = userEvent.setup()
    renderBoard(
      boardContext({
        source: librarySource({ title: "My 4-4-2", tacticId: 7, versionId: 9 }),
      }),
    )
    await user.click(screen.getByRole("button", { name: /^Raise / }))
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    const payload = vi.mocked(saveTactic).mock.calls[0]?.[0] as SaveTacticInput
    expect(payload.name).toBe("My 4-4-2")
    expect(payload.tacticId).toBe(7)
    expect(hoisted.push).not.toHaveBeenCalled()
    expect(hoisted.toast.success).toHaveBeenCalledWith(
      "Saved. Your tactic keeps this plan as a new version.",
    )
  })

  it("reports a refused save as a toast and keeps the draft", async () => {
    const user = userEvent.setup()
    vi.mocked(saveTactic).mockResolvedValueOnce({
      ok: false,
      error: { code: "name_taken", message: "You already use that name." },
    })
    renderBoard()
    await user.click(screen.getByRole("button", { name: /^Raise / }))
    await user.click(screen.getByLabelText("Name"))
    await user.keyboard("Taken")
    await user.click(screen.getByRole("button", { name: "Save tactic" }))

    expect(hoisted.toast.error).toHaveBeenCalledWith(
      "You already use that name.",
    )
    expect(shareField()).toHaveValue("8%")
    expect(hoisted.push).not.toHaveBeenCalled()
  })
})

describe("playing a saved tactic (AC-5, AC-8, AC-9)", () => {
  const saved = () =>
    boardContext({
      source: librarySource({ title: "My 4-4-2", tacticId: 7, versionId: 9 }),
      tactics: [{ id: 7, name: "My 4-4-2", shapeName: "4-4-2" }],
    })

  it("shows the plan line by line, then plays the stored version", async () => {
    const user = userEvent.setup()
    renderBoard(saved())
    await user.click(screen.getByRole("button", { name: "Play this month" }))

    const card = screen.getByRole("region", { name: "Save this plan" })
    expect(within(card).getAllByRole("listitem")).toHaveLength(12)
    expect(
      within(card).getByText("Keeper · Emergency Fund"),
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Play it" }))

    // The play call carries only the tactic id: the version and every amount
    // come from the server.
    expect(playSavedTactic).toHaveBeenCalledWith({ tacticId: 7 })
    expect(hoisted.toast.success).toHaveBeenCalledWith(
      "Played. 2026-10-01 is on the books.",
    )
  })

  it("repeats the warning on the review step", async () => {
    const user = userEvent.setup()
    renderBoard({ ...saved(), costKobo: 25_000_000 })
    await user.click(screen.getByRole("button", { name: "Play this month" }))

    expect(
      screen.getByText(/your costs are over half of what you earn/),
    ).toBeInTheDocument()
  })

  it("shows the shortfall and surfaces the refusal instead of failing quietly", async () => {
    const user = userEvent.setup()
    vi.mocked(playSavedTactic).mockResolvedValueOnce({
      ok: false,
      error: {
        code: "unable_to_cover",
        message: "This shape holds ₦70,000.00 short of your costs.",
      },
    })
    renderBoard({ ...saved(), costKobo: 25_000_000 })

    expect(screen.getByText(/This shape cannot cover/)).toHaveTextContent(
      "₦70,000.00",
    )
    expect(
      screen.getByText(/Start from a base shape with a wider defence/),
    ).toBeInTheDocument()
    // The grass still shows the shape, with zero at every spot. splitMatch
    // writes no lines when the plan cannot cover, and the board still owes the
    // pitch one figure per position.
    expect(spot("GK-0")).toHaveTextContent("GK-0 0")

    await user.click(screen.getByRole("button", { name: "Play this month" }))
    await user.click(screen.getByRole("button", { name: "Play it" }))
    expect(hoisted.toast.error).toHaveBeenCalledWith(
      "This shape holds ₦70,000.00 short of your costs.",
    )
    // The draft survives the refusal, so the person can act on it.
    expect(
      screen.getByRole("heading", { level: 1, name: "My 4-4-2" }),
    ).toBeInTheDocument()
  })
})

describe("a month with nothing to split", () => {
  it("says why the amounts are empty", () => {
    renderBoard(boardContext({ incomeKobo: 0 }))
    expect(
      screen.getByText("You have not added what you earn yet."),
    ).toBeInTheDocument()
  })

  it("names a missing cost the same way", () => {
    renderBoard(boardContext({ costKobo: 0 }))
    expect(
      screen.getByText("You have not added a cost yet."),
    ).toBeInTheDocument()
  })
})
