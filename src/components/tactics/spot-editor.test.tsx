// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SpotEditor } from "@/components/tactics/spot-editor"
import type { SplitPosition } from "@/domain/money"

afterEach(cleanup)

// Spec 0008 AC-1, AC-12, at the level of one spot's controls. The board suite
// covers the draft wiring; this pins what only the editor owns: the stepper
// step size and names, the zero floor wording, the field and its ceiling note
// staying linked, and integer math on a typed share.

const striker: SplitPosition = {
  role: "FWD",
  spotIndex: 9,
  label: "Striker",
  basisPoints: 750,
}

function renderEditor(over: Partial<Parameters<typeof SpotEditor>[0]> = {}) {
  const onStep = vi.fn()
  const onSet = vi.fn()
  render(
    <SpotEditor
      spot={striker}
      amountKobo={3_750_000}
      currency="NGN"
      ceilingBps={6000}
      lockedPoolKobo={null}
      stoppedAtBps={null}
      onStep={onStep}
      onSet={onSet}
      {...over}
    />,
  )
  return { onStep, onSet }
}

const shareField = () => screen.getByLabelText("Exact share")

describe("the steppers (AC-1)", () => {
  it("offer exactly half a percent in each direction, named for the spot", () => {
    renderEditor()
    expect(
      screen.getByRole("button", { name: "Raise Striker by 0.5%" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Lower Striker by 0.5%" }),
    ).toBeInTheDocument()
  })

  it("send the domain step to the draft and nothing else", async () => {
    const user = userEvent.setup()
    const { onStep, onSet } = renderEditor()
    await user.click(screen.getByRole("button", { name: /Raise/ }))
    expect(onStep).toHaveBeenCalledWith(50)
    expect(onSet).not.toHaveBeenCalled()
  })

  it("clear a typed share when a stepper is tapped (the field settles on the plan)", async () => {
    const user = userEvent.setup()
    const { onStep } = renderEditor()
    await user.clear(shareField())
    await user.paste("12")
    expect(shareField()).toHaveValue("12")
    await user.click(screen.getByRole("button", { name: /Raise/ }))
    // The typed draft is done with: the field shows the share the plan holds,
    // and the stepper only ever asks for the step.
    expect(shareField()).toHaveValue("7.5%")
    expect(onStep).toHaveBeenCalledWith(50)
  })
})

describe("typing an exact share (AC-1)", () => {
  it("turns a typed percent into integer basis points", async () => {
    const user = userEvent.setup()
    const { onSet } = renderEditor()
    await user.clear(shareField())
    await user.paste("12.5%")
    await user.tab()
    expect(onSet).toHaveBeenCalledWith(1250)
  })

  it("rounds a share finer than a basis point to the nearest one", async () => {
    const user = userEvent.setup()
    const { onSet } = renderEditor()
    await user.clear(shareField())
    await user.paste("7.567%")
    await user.tab()
    expect(onSet).toHaveBeenCalledWith(757)
  })

  it("keeps junk in the field without moving the plan", async () => {
    const user = userEvent.setup()
    const { onSet } = renderEditor()
    await user.clear(shareField())
    await user.paste("abc")
    expect(onSet).not.toHaveBeenCalled()
    expect(shareField()).toHaveValue("abc")
    await user.tab()
    expect(shareField()).toHaveValue("7.5%")
  })

  it("echoes a typed share above the ceiling at the ceiling", async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.clear(shareField())
    await user.paste("61%")
    expect(shareField()).toHaveValue("60%")
  })
})

describe("the clamp note and its link (AC-1, AC-12)", () => {
  it("names the ceiling figure when the spot sits at it", () => {
    renderEditor({
      spot: { ...striker, basisPoints: 6000 },
      stoppedAtBps: 6000,
    })
    const note = screen.getByRole("status")
    expect(note).toHaveTextContent(
      "60% is the most this spot can hold. Your costs hold the rest.",
    )
    expect(shareField()).toHaveAccessibleDescription(
      /the most this spot can hold/,
    )
  })

  it("says the zero floor when a lowering was cut short above it", () => {
    renderEditor({ stoppedAtBps: 50 })
    expect(screen.getByRole("status")).toHaveTextContent(
      "A share cannot go below zero.",
    )
  })

  it("links nothing while no clamp has bitten", () => {
    renderEditor()
    expect(shareField()).not.toHaveAccessibleDescription()
  })
})

describe("the locked defence pool (AC-4, premise note)", () => {
  it("names the pool a defender is moving shares inside of, in money", () => {
    renderEditor({
      spot: { ...striker, role: "DEF", label: "Right Back" },
      lockedPoolKobo: 15_000_000,
    })
    expect(
      screen.getByText(/Defence holds your costs, here/),
    ).toHaveTextContent("₦150,000.00")
    expect(
      screen.getByText(/never how much of your pay goes to defence/),
    ).toBeInTheDocument()
  })

  it("stays out of the way for a spot outside the pool", () => {
    renderEditor()
    expect(
      screen.queryByText(/Defence holds your costs/),
    ).not.toBeInTheDocument()
  })
})

it("renders the planned amount through the shared money format", () => {
  renderEditor()
  expect(screen.getByText(/this month/)).toHaveTextContent("₦37,500.00")
})
