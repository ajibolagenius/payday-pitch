// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen, within, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TacticList } from "@/components/tactics/tactic-list"
import { deleteTactic, renameTactic } from "@/features/tactics/actions"

afterEach(cleanup)

// Spec 0008 AC-2, AC-10. The list is the cap readout and the door to each saved
// plan: opening one is a link, so the board re-reads the pinned version on the
// server rather than trusting the browser.

const hoisted = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("sonner", () => ({ toast: hoisted.toast }))
vi.mock("@/features/tactics/actions", () => ({
  renameTactic: vi.fn(),
  deleteTactic: vi.fn(),
}))

const live = [
  { id: 1, name: "My 4-4-2", shapeName: "4-4-2" },
  { id: 2, name: "Debt shield", shapeName: "5-4-1" },
]

function renderList(props: Partial<Parameters<typeof TacticList>[0]> = {}) {
  const full = { tactics: live, activeId: null as number | null, ...props }
  render(<TacticList {...full} />)
  return full
}

/** One row, found through the link that opens it. */
const rowOf = (name: string) =>
  screen.getByRole("link", { name }).closest("li")!

beforeEach(() => {
  vi.mocked(renameTactic)
    .mockReset()
    .mockResolvedValue({ ok: true, data: null })
  vi.mocked(deleteTactic)
    .mockReset()
    .mockResolvedValue({ ok: true, data: null })
})

describe("the tactic list (AC-2, AC-10)", () => {
  it("reads the cap out of the five it allows", () => {
    renderList()
    expect(screen.getByText("2 of 5 used")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Your tactics" }),
    ).toBeInTheDocument()
  })

  it("says so when nothing is saved yet, and the cap still reads zero", () => {
    renderList({ tactics: [] })
    expect(
      screen.getByText(
        "Nothing saved yet. Move a share below and save it as your own plan.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText("0 of 5 used")).toBeInTheDocument()
  })

  it("opens a tactic through the URL, not through a client side draft", () => {
    renderList({ activeId: 2 })
    const link = screen.getByRole("link", { name: "Debt shield" })
    expect(link).toHaveAttribute("href", "/app/tactics?tactic=2")
    expect(link).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "My 4-4-2" })).not.toHaveAttribute(
      "aria-current",
    )
  })

  it("names the base shape it was built from", () => {
    renderList()
    expect(rowOf("My 4-4-2")).toHaveTextContent("4-4-2")
    expect(rowOf("Debt shield")).toHaveTextContent("5-4-1")
  })

  it("renames in place and only sends the id and the new name", async () => {
    const user = userEvent.setup()
    renderList()
    const item = rowOf("Debt shield")
    await user.click(within(item).getByRole("button", { name: "Rename" }))
    await user.clear(screen.getByLabelText("New name"))
    await user.type(screen.getByLabelText("New name"), "Shield")
    await user.click(within(item).getByRole("button", { name: "Save" }))

    expect(renameTactic).toHaveBeenCalledWith({ tacticId: 2, name: "Shield" })
    expect(within(item).queryByLabelText("New name")).toBeNull()
  })

  it("keeps the old name when the rename is refused", async () => {
    const user = userEvent.setup()
    vi.mocked(renameTactic).mockResolvedValueOnce({
      ok: false,
      error: { code: "name_taken", message: "You already use that name." },
    })
    renderList()
    const item = rowOf("My 4-4-2")
    await user.click(within(item).getByRole("button", { name: "Rename" }))
    await user.clear(screen.getByLabelText("New name"))
    await user.type(screen.getByLabelText("New name"), "Debt shield")
    await user.click(within(item).getByRole("button", { name: "Save" }))

    expect(hoisted.toast.error).toHaveBeenCalledWith(
      "You already use that name.",
    )
    // The row stays open with what they typed, so they can pick another name.
    expect(screen.getByLabelText("New name")).toHaveValue("Debt shield")
  })

  it("asks before a delete, and says what a delete does not touch", async () => {
    const user = userEvent.setup()
    renderList()
    const item = rowOf("My 4-4-2")
    await user.click(within(item).getByRole("button", { name: "Delete" }))

    const dialog = screen.getByRole("dialog")
    expect(
      within(dialog).getByRole("heading", { name: "Delete My 4-4-2?" }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(
        /Any month you already played keeps its own copy/,
      ),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/The name stays reserved/),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Keep it" }))
    expect(deleteTactic).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("deletes behind the confirmation and reports the reserved name", async () => {
    const user = userEvent.setup()
    renderList()
    const item = rowOf("Debt shield")
    await user.click(within(item).getByRole("button", { name: "Delete" }))
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete",
      }),
    )

    expect(deleteTactic).toHaveBeenCalledWith({ tacticId: 2 })
    expect(hoisted.toast.success).toHaveBeenCalledWith(
      "Deleted Debt shield. Its name stays reserved.",
    )
  })

  it("offers the way back to a library shape", () => {
    renderList()
    expect(
      screen.getByRole("link", { name: "Start from a library shape" }),
    ).toHaveAttribute("href", "/app/tactics")
  })
})
