// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, cleanup } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AmountField } from "@/components/walk/amount-field"

// No globals in this Vitest config, so Testing Library cannot auto register
// cleanup between files' tests. Do it here.
afterEach(cleanup)

// Spec 0007 AC-2: typed naira stays a raw string here; parsing to kobo
// happens in the action's Zod schema, never in the component.

describe("AmountField", () => {
  it("renders a labeled decimal input with the currency code shown (AC-2)", () => {
    render(
      <AmountField
        label="Amount"
        value="4500"
        onChange={vi.fn()}
        currency="NGN"
      />,
    )
    const input = screen.getByLabelText("Amount")
    expect(input).toHaveValue("4500")
    expect(input).toHaveAttribute("inputmode", "decimal")
    expect(input).toHaveAttribute("name", "amountNaira")
    expect(screen.getByText("NGN")).toBeInTheDocument()
  })

  it("reports the raw typed string, not a parsed number (AC-2)", () => {
    const onChange = vi.fn()
    render(
      <AmountField
        label="Amount"
        value=""
        onChange={onChange}
        currency="NGN"
      />,
    )
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "1,234.5x" },
    })
    expect(onChange).toHaveBeenCalledWith("1,234.5x")
  })

  it("uses a custom name when given", () => {
    render(
      <AmountField
        label="Moved"
        name="actual-3"
        value=""
        onChange={vi.fn()}
        currency="NGN"
      />,
    )
    expect(screen.getByLabelText("Moved")).toHaveAttribute("name", "actual-3")
  })

  it("wires an error to the input via aria and announces it (AC-10)", () => {
    render(
      <AmountField
        label="Amount"
        value="abc"
        onChange={vi.fn()}
        currency="NGN"
        error="Enter an amount in naira."
      />,
    )
    const input = screen.getByLabelText("Amount")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input.getAttribute("aria-describedby")).toBe(`${input.id}-error`)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Enter an amount in naira.")
    expect(alert.id).toBe(input.getAttribute("aria-describedby"))
  })

  it("leaves the input unflagged without an error", () => {
    render(
      <AmountField
        label="Amount"
        value="4500"
        onChange={vi.fn()}
        currency="NGN"
      />,
    )
    const input = screen.getByLabelText("Amount")
    expect(input).not.toHaveAttribute("aria-invalid")
    expect(input).not.toHaveAttribute("aria-describedby")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
