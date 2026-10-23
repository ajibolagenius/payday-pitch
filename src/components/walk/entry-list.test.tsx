// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { EntryList } from "@/components/walk/entry-list"

afterEach(cleanup)

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock("sonner", () => ({ toast }))

const OK = { ok: true, data: null } as const

// Spec 0007 AC-1, AC-2, AC-10. Money entry: add, edit in place, remove, and
// what happens when the action says no.

const incomeEntries = [
  {
    id: 1,
    name: "Salary",
    amountMinorUnits: 45_000_000,
    currency: "NGN",
    paydayDay: 25,
  },
  { id: 2, name: "Side hustle", amountMinorUnits: 5_000_000, currency: "NGN" },
]

function renderList(overrides: Record<string, unknown> = {}) {
  const props = {
    entries: incomeEntries,
    currency: "NGN",
    payday: true,
    totalLabel: "Total in each month",
    emptyTitle: "Nothing logged yet",
    emptyHint: "Add your first income to start the walk.",
    nameLabel: "What is it",
    namePlaceholder: "Salary",
    add: vi.fn().mockResolvedValue(OK),
    update: vi.fn().mockResolvedValue(OK),
    remove: vi.fn().mockResolvedValue(OK),
    ...overrides,
  }
  render(<EntryList {...props} />)
  return props
}

beforeEach(() => {
  toast.success.mockClear()
  toast.error.mockClear()
})

describe("EntryList rows", () => {
  it("lists each entry with its amount and payday day, and the total (AC-1)", () => {
    renderList()
    const rows = screen.getAllByTestId("entry-row")
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent("Salary")
    expect(rows[0]).toHaveTextContent("Pays on day 25")
    expect(rows[0]).toHaveTextContent(/450,000/)
    expect(rows[1]).not.toHaveTextContent("Pays on day")
    expect(screen.getByText("Total in each month")).toBeInTheDocument()
    expect(screen.getByText(/500,000/)).toBeInTheDocument()
  })

  it("shows the empty state when there is nothing yet (AC-1)", () => {
    renderList({ entries: [] })
    expect(screen.getByText("Nothing logged yet")).toBeInTheDocument()
    expect(
      screen.getByText("Add your first income to start the walk."),
    ).toBeInTheDocument()
    expect(screen.queryByText("Total in each month")).not.toBeInTheDocument()
  })

  it("offers no currency selector anywhere (AC-2)", () => {
    renderList()
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })
})

describe("EntryList add", () => {
  it("sends name, amount and payday day to the add action and confirms (AC-1)", async () => {
    const user = userEvent.setup()
    const props = renderList()
    await user.type(screen.getByLabelText("What is it"), "Bonus")
    await user.type(screen.getByLabelText("Amount"), "80000")
    await user.type(screen.getByLabelText("Payday day (1 to 31)"), "3")
    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(props.add).toHaveBeenCalled())
    expect(props.add).toHaveBeenCalledWith({
      name: "Bonus",
      amountNaira: "80000",
      paydayDay: "3",
    })
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Saved."))
    expect(screen.getByLabelText("What is it")).toHaveValue("")
  })

  it("sends no payday day for costs (AC-1)", async () => {
    const user = userEvent.setup()
    const props = renderList({
      payday: false,
      entries: [
        { id: 5, name: "Rent", amountMinorUnits: 8_000_000, currency: "NGN" },
      ],
    })
    expect(screen.queryByText("Payday day (1 to 31)")).not.toBeInTheDocument()
    await user.type(screen.getByLabelText("What is it"), "Data")
    await user.type(screen.getByLabelText("Amount"), "25000")
    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(props.add).toHaveBeenCalled())
    expect(props.add).toHaveBeenCalledWith({
      name: "Data",
      amountNaira: "25000",
    })
  })
})

describe("EntryList edit", () => {
  it("preloads the row, clears the amount, and updates by id (AC-1)", async () => {
    const user = userEvent.setup()
    const props = renderList()
    await user.click(screen.getByRole("button", { name: "Edit Side hustle" }))
    expect(
      screen.getByRole("form", { name: "Edit an entry" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("What is it")).toHaveValue("Side hustle")
    expect(screen.getByLabelText("Amount")).toHaveValue("")
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument()
    await user.type(screen.getByLabelText("Amount"), "60000")
    await user.click(screen.getByRole("button", { name: "Update" }))
    await waitFor(() => expect(props.update).toHaveBeenCalled())
    expect(props.update).toHaveBeenCalledWith({
      name: "Side hustle",
      amountNaira: "60000",
      paydayDay: "",
      id: 2,
    })
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Updated."))
  })

  it("cancel leaves the editor without calling anything (AC-1)", async () => {
    const user = userEvent.setup()
    const props = renderList()
    await user.click(screen.getByRole("button", { name: "Edit Salary" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(
      screen.getByRole("form", { name: "Add an entry" }),
    ).toBeInTheDocument()
    expect(props.update).not.toHaveBeenCalled()
  })
})

describe("EntryList remove", () => {
  it("removes by id and confirms (AC-1)", async () => {
    const user = userEvent.setup()
    const props = renderList()
    await user.click(screen.getByRole("button", { name: "Remove Salary" }))
    await waitFor(() => expect(props.remove).toHaveBeenCalledWith({ id: 1 }))
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Removed."))
  })
})

describe("EntryList failures (AC-10)", () => {
  it("shows field errors inline when validation rejects, with no toast", async () => {
    const user = userEvent.setup()
    renderList({
      add: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          code: "validation",
          message: "Check the highlighted fields.",
          fieldErrors: { amountNaira: ["Enter an amount above zero."] },
        },
      }),
    })
    await user.type(screen.getByLabelText("What is it"), "Gift")
    await user.type(screen.getByLabelText("Amount"), "0")
    await user.click(screen.getByRole("button", { name: "Save" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Enter an amount above zero.")
    expect(screen.getByLabelText("Amount")).toHaveAttribute(
      "aria-invalid",
      "true",
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("toasts the server message for a non validation failure", async () => {
    const user = userEvent.setup()
    renderList({
      remove: vi.fn().mockResolvedValue({
        ok: false,
        error: { code: "conflict", message: "That entry changed. Try again." },
      }),
    })
    await user.click(screen.getByRole("button", { name: "Remove Salary" }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "That entry changed. Try again.",
      ),
    )
  })
})
