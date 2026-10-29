// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MatchdaySample } from "@/features/matchday-prototype/matchday-sample"

afterEach(cleanup)

// Spec 0011: the sample shell drives every screen from one in memory fixture.
// These walk the screens the way a participant would, through roles and text.

let reduceMotion = false

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return query.includes("reduce") && reduceMotion
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  vi.stubGlobal("scrollTo", () => {})
})

function setup() {
  const user = userEvent.setup()
  render(<MatchdaySample />)
  return user
}

async function goTo(user: ReturnType<typeof userEvent.setup>, step: RegExp) {
  const nav = screen.getByRole("navigation", { name: "Sample steps" })
  await user.click(within(nav).getByRole("button", { name: step }))
}

async function loadScenario(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
) {
  await user.click(screen.getByRole("button", { name: /Sample scenario/ }))
  const dialog = await screen.findByRole("dialog")
  await user.click(within(dialog).getByRole("button", { name: label }))
}

async function editInList(
  user: ReturnType<typeof userEvent.setup>,
  purpose: string,
  naira: string,
) {
  await user.click(screen.getByRole("tab", { name: "List" }))
  await user.click(screen.getByRole("button", { name: `Edit ${purpose}` }))
  const dialog = await screen.findByRole("dialog")
  const field = within(dialog).getByLabelText("Planned for November")
  await user.clear(field)
  await user.type(field, naira)
  await user.click(within(dialog).getByRole("button", { name: "Save amount" }))
}

function listRow(line: string, purpose: string) {
  const section = screen.getByRole("region", { name: line })
  return within(section).getByText(purpose).closest("li") as HTMLElement
}

describe("entry (AC-1)", () => {
  it("labels the sample as fictional and asks for no credentials", async () => {
    const user = setup()
    expect(screen.getByText("Fictional sample")).toBeInTheDocument()
    expect(
      screen.getByText(/Every figure here is invented/),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Explore the sample/ }))

    expect(
      screen.getByText("In the real app you would create an account here."),
    ).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(document.querySelector('input[type="password"]')).toBeNull()
    expect(document.querySelector('input[type="email"]')).toBeNull()
  })

  it("moves focus to the new screen's heading after a step change", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    expect(
      screen.getByRole("heading", { level: 2, name: "November 2026" }),
    ).toHaveFocus()
  })
})

describe("reset and restore (AC-1, AC-13)", () => {
  it("Reset brings back the default fixture after an edit", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    await editInList(user, "Miscellaneous", "30000")
    expect(listRow("Midfield", "Miscellaneous")).toHaveTextContent("₦30,000.00")

    await user.click(screen.getByRole("button", { name: /Reset/ }))
    await goTo(user, /Builder/)
    await user.click(screen.getByRole("tab", { name: "List" }))

    expect(listRow("Midfield", "Miscellaneous")).toHaveTextContent("₦35,000.00")
  })

  it("a page restored from the back/forward cache starts over", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    await editInList(user, "Miscellaneous", "30000")

    act(() => {
      const event = new Event("pageshow") as PageTransitionEvent
      Object.defineProperty(event, "persisted", { value: true })
      window.dispatchEvent(event)
    })

    expect(
      screen.getByRole("heading", {
        name: "See where your pay goes before it goes.",
      }),
    ).toBeInTheDocument()
    await goTo(user, /Builder/)
    await user.click(screen.getByRole("tab", { name: "List" }))
    expect(listRow("Midfield", "Miscellaneous")).toHaveTextContent("₦35,000.00")
  })
})

describe("builder (AC-2, AC-3)", () => {
  it("shows the baseline headline figures", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Received remainder 70,000 naira")
    expect(screen.getByText("₦70,000.00")).toBeInTheDocument()
    expect(screen.getByText("₦270,000.00")).toBeInTheDocument()
    expect(screen.getByText("-₦200,000.00")).toBeInTheDocument()
    expect(screen.getByText(/Overall funding gap/)).toHaveTextContent(
      "₦200,000.00",
    )
    expect(screen.queryByText(/Essentials are short/)).toBeNull()
  })

  it("shows the same edited amount in pitch and list views", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    await editInList(user, "Transport", "40000")

    expect(screen.getByRole("button", { name: "Edit Transport" })).toHaveFocus()
    expect(listRow("Defence", "Transport")).toHaveTextContent(
      "Short of required by ₦10,000.00",
    )

    await user.click(screen.getByRole("tab", { name: "Pitch" }))
    const plate = screen.getByRole("button", { name: /Transport.*edit amount/ })
    expect(plate).toHaveTextContent("₦40,000.00")
    expect(plate).toHaveTextContent("Short of required by ₦10,000.00")
  })

  it("keeps the old value and shows the error on invalid input", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    await user.click(screen.getByRole("tab", { name: "List" }))
    await user.click(screen.getByRole("button", { name: "Edit Miscellaneous" }))
    const dialog = await screen.findByRole("dialog")
    const field = within(dialog).getByLabelText("Planned for November")
    await user.clear(field)
    await user.type(field, "1.234")
    await user.click(
      within(dialog).getByRole("button", { name: "Save amount" }),
    )

    expect(within(dialog).getByText(/up to two decimals/)).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(listRow("Midfield", "Miscellaneous")).toHaveTextContent("₦35,000.00")
  })
})

describe("review and save (AC-4)", () => {
  it("blocks a save with a gap until the box is ticked", async () => {
    const user = setup()
    await goTo(user, /Review/)
    await user.click(screen.getByRole("button", { name: "Save sample plan" }))
    expect(screen.getByRole("alert")).toHaveTextContent(/Tick the box/)

    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: "Save sample plan" }))

    expect(
      screen.getByRole("heading", {
        name: "Sample plan saved for this visit. Your money has not moved.",
      }),
    ).toBeInTheDocument()
  })

  it("returns a saved plan to draft and clears the tick on any edit", async () => {
    const user = setup()
    await goTo(user, /Review/)
    await user.click(screen.getByRole("checkbox"))
    await user.click(screen.getByRole("button", { name: "Save sample plan" }))

    await goTo(user, /Builder/)
    await editInList(user, "Miscellaneous", "30000")
    expect(screen.getByText("Draft")).toBeInTheDocument()

    await goTo(user, /Review/)
    expect(screen.getByRole("checkbox")).not.toBeChecked()
  })

  it("names the optional purposes that could close a shortfall, without a button", async () => {
    const user = setup()
    await loadScenario(user, "Salary shortfall")
    await goTo(user, /Review/)
    expect(
      screen.getByText(/you could reduce Extra debt repayment, Miscellaneous/),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /reduce/i })).toBeNull()
  })
})

describe("scenario panel", () => {
  it("asks before discarding edits, and keeps them on request", async () => {
    const user = setup()
    await goTo(user, /Builder/)
    await editInList(user, "Miscellaneous", "30000")

    await loadScenario(user, "Report complete")
    const dialog = screen.getByRole("dialog")
    expect(
      within(dialog).getByText("Load Report complete?"),
    ).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole("button", { name: "Keep my edits" }),
    )
    await user.keyboard("{Escape}")

    expect(listRow("Midfield", "Miscellaneous")).toHaveTextContent("₦30,000.00")
  })
})

describe("today records (AC-5)", () => {
  async function recordTransport(
    user: ReturnType<typeof userEvent.setup>,
    naira: string,
  ) {
    const field = screen.getByLabelText("Total paid toward transport")
    await user.clear(field)
    if (naira) await user.type(field, naira)
    const row = field.closest("li") as HTMLElement
    await user.click(within(row).getByRole("button", { name: "Record" }))
    return row
  }

  it("keeps partial, full, unknown and zero distinct", async () => {
    const user = setup()
    await goTo(user, /Today/)

    let row = await recordTransport(user, "20000")
    expect(row).toHaveTextContent("Partly paid")
    expect(row).toHaveTextContent("still due ₦30,000.00")

    row = await recordTransport(user, "50000")
    expect(row).toHaveTextContent("Paid in full")
    expect(row).toHaveTextContent("Recorded so far: ₦50,000.00")

    row = await recordTransport(user, "")
    expect(row).toHaveTextContent("Recorded so far: Not recorded")

    row = await recordTransport(user, "0")
    expect(row).toHaveTextContent("Recorded so far: ₦0.00")
  })
})

describe("report (AC-5, AC-10)", () => {
  it("withholds an award before the month ends", async () => {
    const user = setup()
    await goTo(user, /Report/)
    expect(screen.getByText("Month not finished")).toBeInTheDocument()
    expect(screen.queryByText("Clean sheet")).toBeNull()
  })

  it("awards a clean sheet with reduced motion on", async () => {
    reduceMotion = true
    const user = setup()
    await loadScenario(user, "Report complete")
    await goTo(user, /Report/)
    expect(screen.getByText("Clean sheet")).toBeVisible()
  })

  it("says still due when a required payment is short", async () => {
    const user = setup()
    await loadScenario(user, "Report incomplete")
    await goTo(user, /Report/)
    expect(screen.getAllByText("Still due").length).toBeGreaterThan(0)
    expect(screen.queryByText("Clean sheet")).toBeNull()
  })

  it("asks for information when a required payment is unknown", async () => {
    const user = setup()
    await loadScenario(user, "Report unknown")
    await goTo(user, /Report/)
    expect(screen.getByText("Not enough information")).toBeInTheDocument()
  })
})

describe("extras (AC-9)", () => {
  async function openExtra(
    user: ReturnType<typeof userEvent.setup>,
    name: RegExp,
  ) {
    await goTo(user, /Today/)
    await user.click(screen.getByRole("button", { name }))
  }

  it("previews four reminders, all off, toggled only by the switch", async () => {
    const user = setup()
    await openExtra(user, /Reminders/)
    const switches = screen.getAllByRole("switch")
    expect(switches).toHaveLength(4)
    for (const s of switches) expect(s).toHaveAttribute("aria-checked", "false")

    await user.click(screen.getByRole("switch", { name: "Month review" }))
    expect(
      screen.getByRole("switch", { name: "Month review" }),
    ).toHaveAttribute("aria-checked", "true")
    expect(
      screen.getByText("30 November: review your month."),
    ).toBeInTheDocument()
  })

  it("shares only the shape: percentages, no amounts or purpose names", async () => {
    const user = setup()
    await openExtra(user, /Share preview/)
    const figure = screen.getByRole("figure")
    for (const pct of ["13.33%", "55.00%", "19.17%", "12.50%"]) {
      expect(within(figure).getByText(pct)).toBeInTheDocument()
    }
    const html = figure.outerHTML
    expect(html).not.toMatch(/₦|NGN/)
    for (const name of [
      "Transport",
      "Food",
      "Miscellaneous",
      "Course",
      "Emergency",
      "debt",
    ]) {
      expect(html).not.toContain(name)
    }
  })

  it("moves goal progress only when a contribution is recorded", async () => {
    const user = setup()
    await openExtra(user, /Course goal/)
    const title = () => screen.getByRole("heading", { level: 3, name: /of ₦/ })
    expect(title()).toHaveTextContent("₦50,000.00 of ₦300,000.00")

    await user.type(
      screen.getByLabelText("Total put toward the course this month"),
      "75000",
    )
    await user.click(screen.getByRole("button", { name: "Record" }))

    expect(title()).toHaveTextContent("₦125,000.00 of ₦300,000.00")
  })
})
