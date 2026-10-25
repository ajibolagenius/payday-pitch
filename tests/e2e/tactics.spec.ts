// Tactics board e2e (spec 0008). Same setup as walk.spec.ts: the dev server on
// 127.0.0.1:3000, local Supabase and Mailpit up, one fresh account signed in
// through its own verification email. Serial order, because each test leaves
// the state the next one reads, which is how the save, play, and delete path
// gets proved without setting the data up twice.
import { test, expect, type BrowserContext, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const MAILPIT = "http://127.0.0.1:54324"
const account = {
  email: `tactics-${Date.now()}@paydaypitch.test`,
  password: "str0ng-pass-8",
}

// Income 450,000 with costs at 150,000: the 4-4-2 defence share of 40 percent
// covers them, and 300,000 is left to split across the other seven spots.
const INCOME = "450000"
const COST = "150000"
const EXTRA_COST = "100000"

const tacticName = "My 4-4-2"
const renamedName = "Lean 4-4-2"

const toast = (page: Page, text: string) =>
  expect(page.locator("[data-sonner-toast]", { hasText: text })).toBeVisible()

const step = (page: Page, label: string) =>
  page.getByRole("button", { name: label, exact: true })

async function saveEntry(
  page: Page,
  name: string,
  amount: string,
  paydayDay?: string,
) {
  await page.getByLabel("What is it").fill(name)
  await page.getByLabel("Amount").fill(amount)
  if (paydayDay) await page.getByLabel(/Payday day/).fill(paydayDay)
  await page.getByRole("button", { name: "Save", exact: true }).click()
}

/** A player on the grass, by its slot key. The board selects through these,
 *  exactly as the walk's pitch tour does. */
const slot = (page: Page, slotKey: string) =>
  page.locator(`[data-slot-key="${slotKey}"] button`)

const shareField = (page: Page) => page.getByLabel("Exact share")
const raise = (page: Page) => page.getByRole("button", { name: /^Raise / })
const lower = (page: Page) => page.getByRole("button", { name: /^Lower / })
const editorLine = (page: Page) => page.locator("p", { hasText: "this month" })
const notice = (page: Page, text: string) =>
  page.locator('[role="status"]').filter({ hasText: text })
const tacticRow = (page: Page, name: string) =>
  page
    .locator('section[aria-labelledby="saved-tactics"]')
    .locator("li")
    .filter({ hasText: name })
/** While a row is being renamed its name lives in a field, not as text, so the
 *  open editor is the only way to find that row. */
const renamingRow = (page: Page) =>
  page
    .locator('section[aria-labelledby="saved-tactics"]')
    .locator("li")
    .filter({ has: page.getByLabel("New name") })
const heading = (page: Page, name: string | RegExp) =>
  page.getByRole("heading", { level: 1, name })

/** The board's own heading is the source name; reset the draft by re-reading it. */
async function openBoard(page: Page) {
  await page.goto("/app/tactics")
  await expect(shareField(page)).toBeVisible()
}

const freeze = (page: Page) =>
  page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none!important;animation:none!important}",
  })

async function verifyLink(context: BrowserContext, to: string) {
  let href = ""
  await expect
    .poll(
      async () => {
        const res = await context.request.get(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(to)}&limit=5`,
        )
        const list = await res.json()
        for (const message of list.messages ?? []) {
          const detail = await context.request.get(
            `${MAILPIT}/api/v1/message/${message.ID}`,
          )
          const html = (await detail.json()).HTML ?? ""
          const link = html.match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&")
          if (link?.includes("/auth/v1/verify")) {
            href = link
            return true
          }
        }
        return false
      },
      { timeout: 90_000 },
    )
    .toBe(true)
  return href
}

test.describe.configure({ mode: "serial" })

test.describe("the tactics board", () => {
  let context: BrowserContext
  let page: Page
  /** The tactic created in the save test. A global sequence, so the id is read
   *  from the URL the board pushes rather than assumed. */
  let tacticId = 0
  const tacticUrl = () => `/app/tactics?tactic=${tacticId}`

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    // The walk's pitch tour covers the month page the first time a month
    // exists, and it owns its own spec. Mark it seen so these tests can click
    // the controls underneath it.
    await context.addInitScript(() =>
      localStorage.setItem("pp.pitch-tour.seen", "1"),
    )
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test("AC-12, AC-1, AC-4: the board is one tap away, and a share edit moves real money", async () => {
    test.setTimeout(150_000)
    await page.goto("/sign-up")
    await page.getByLabel("Email").fill(account.email)
    await page.getByLabel("Password").fill(account.password)
    await page.getByRole("button", { name: "Sign up" }).click()
    await expect(page).toHaveURL(/\/verify-email$/)
    await page.goto(await verifyLink(context, account.email))
    await expect(page).toHaveURL(/\/app$/)

    await saveEntry(page, "Salary", INCOME, "25")
    await toast(page, "Saved.")
    await step(page, "2. Costs").click()
    await saveEntry(page, "Rent", COST)
    await toast(page, "Saved.")

    // One tap from the app home reaches the board (AC-12).
    await page.getByRole("link", { name: "Tactics board" }).click()
    await expect(page).toHaveURL(/\/app\/tactics$/)
    // With no param the board opens the first library shape.
    await expect(heading(page, "4-4-2")).toBeVisible()

    // The editor opens on a forward: 7.5 percent of the plan, 37,500 naira.
    await expect(shareField(page)).toHaveValue("7.5%")
    await expect(editorLine(page)).toContainText("37,500.00")

    // One raise: the forward gains half a point and the bench pays for it.
    await raise(page).click()
    await expect(shareField(page)).toHaveValue("8%")
    await expect(editorLine(page)).toContainText("40,000.00")
    await expect(slot(page, "BENCH-0")).toContainText("22,500.00")

    // Push the same spot past everything it can hold. It stops at the ceiling,
    // the plan still reads a whole, and no spot goes under zero.
    await shareField(page).fill("61%")
    await expect(shareField(page)).toHaveValue("60%")
    await expect(page.getByText("is the most this spot can hold")).toBeVisible()
    await expect(
      page.getByText("The plan always adds up to the whole:"),
    ).toContainText("100%")
    // The keeper spot was drained to nothing, so that warning fires inline.
    await expect(
      page.getByText("Nothing goes to the keeper spot"),
    ).toBeVisible()

    // A draft is nobody's history: re-reading the board puts the seed back.
    await openBoard(page)
    await expect(shareField(page)).toHaveValue("7.5%")
    await expect(slot(page, "BENCH-0")).toContainText("25,000.00")
  })

  test("AC-1: a defender's share redistributes the locked cost pool, it never resizes it", async () => {
    await slot(page, "DEF-0").click()
    await expect(
      page.getByRole("heading", { level: 3, name: "Right Back" }),
    ).toBeVisible()
    await expect(
      page.getByText("Defence holds your costs, here"),
    ).toContainText("150,000.00")

    await raise(page).click()
    // The back four still holds the full cost total, and the second defender
    // gave up exactly what the first one took.
    await expect(
      page.getByText("Defence holds your costs, here"),
    ).toContainText("150,000.00")
    await expect(slot(page, "DEF-0")).toContainText("39,375.00")
    await expect(slot(page, "DEF-1")).toContainText("35,625.00")
  })

  test("AC-2: saving names the tactic, and a second tactic cannot take that name", async () => {
    await openBoard(page)
    await raise(page).click()
    await page.getByLabel("Name").fill(tacticName)
    await page.getByRole("button", { name: "Save tactic" }).click()
    await toast(page, `Saved as ${tacticName}.`)

    // The board is now editing that tactic, so the URL carries it and the next
    // save is an edit rather than a second tactic.
    await page.waitForURL(/[?&]tactic=\d+$/)
    tacticId = Number(new URL(page.url()).searchParams.get("tactic"))
    expect(tacticId).toBeGreaterThan(0)
    await expect(heading(page, tacticName)).toBeVisible()
    await expect(tacticRow(page, tacticName)).toBeVisible()
    await expect(page.getByText("1 of 5 used")).toBeVisible()
    // A saved tactic can be played; a library draft cannot.
    await expect(
      page.getByRole("button", { name: "Play this month" }),
    ).toBeVisible()

    // The same name on a new tactic is refused, and nothing is written.
    await openBoard(page)
    await page.getByLabel("Name").fill(tacticName)
    await page.getByRole("button", { name: "Save tactic" }).click()
    await toast(page, "You already use that name.")
    await expect(page.getByText("1 of 5 used")).toBeVisible()
  })

  test("AC-3, AC-5, AC-8: the review lists the plan as it will be written, and a later edit cannot rewrite it", async () => {
    await page.goto(tacticUrl())
    await expect(heading(page, tacticName)).toBeVisible()
    await page.getByRole("button", { name: "Play this month" }).click()

    const saveCard = page
      .locator("section")
      .filter({ hasText: "This month, as it will be written" })
    await expect(saveCard.getByRole("listitem")).toHaveCount(12)
    // Keeper keeps its share of what is left after costs.
    await expect(
      saveCard.getByRole("listitem").filter({ hasText: "Keeper" }),
    ).toContainText("50,000.00")

    await page.getByRole("button", { name: "Play it" }).click()
    await toast(page, "is on the books")

    // The month is on the pitch page, wearing the tactic's base shape.
    await page.goto("/app")
    await expect(
      page.getByRole("heading", { name: "This month" }),
    ).toBeVisible()
    await expect(page.getByText(/^Played for/)).toBeVisible()
    const played = page.getByRole("figure", { name: /^4-4-2 formation/ })
    await expect(played).toContainText("40,000.00")

    // A second save is a new version. The month already played keeps the
    // amounts it was written with, even though the plan on the board moved.
    await page.goto(tacticUrl())
    await raise(page).click()
    await expect(shareField(page)).toHaveValue("8.5%")
    await page.getByRole("button", { name: "Save changes" }).click()
    await toast(page, "keeps this plan as a new version")
    await page.goto("/app")
    await expect(played).toContainText("40,000.00")
    await expect(played).not.toContainText("42,500.00")
  })

  test("AC-5, AC-7, AC-9: costs over half warns, the card names a wider shape, and an uncoverable play refuses", async () => {
    // Costs at 250,000 against 450,000 income: over half, and past what the
    // tactic's defence share can hold (180,000).
    await page.goto("/app")
    await step(page, "2. Costs").click()
    await saveEntry(page, "School fees", EXTRA_COST)
    await toast(page, "Saved.")

    await page.goto(tacticUrl())
    await expect(page.getByText(/costs are more than half/)).toBeVisible()
    await expect(notice(page, "This shape cannot cover")).toContainText(
      "70,000.00",
    )
    await expect(
      page.getByText("Start from a base shape with a wider defence"),
    ).toBeVisible()

    // One card, in its suggestion state, naming the shape and its own reason.
    const card = page.getByRole("region", {
      name: "A shape that fits your numbers",
    })
    await expect(card).toBeVisible()
    await expect(card).toContainText(
      "When your fixed costs are high and the month needs to bend around them.",
    )
    await card.getByRole("link", { name: "Load 5-3-2 onto the board" }).click()
    await expect(page).toHaveURL(/\?shape=5-3-2$/)
    await expect(heading(page, "5-3-2")).toBeVisible()

    // Back on the tactic: the review repeats the warning, and the play itself
    // is refused with the shortfall in the message.
    await page.goto(tacticUrl())
    await page.getByRole("button", { name: "Play this month" }).click()
    await expect(
      page.getByText("your costs are over half of what you earn"),
    ).toBeVisible()
    await page.getByRole("button", { name: "Play it" }).click()
    await toast(page, "short of your costs")

    // No partial month: the month played before the refusal is still the one
    // on the books, with the amounts it was written with.
    await page.goto("/app")
    await expect(
      page.getByRole("figure", { name: /^4-4-2 formation/ }),
    ).toContainText("40,000.00")
    await expect(page.getByText(/^Played for/)).toBeVisible()

    // Back to a month the shape can cover, for the tests that follow.
    await step(page, "2. Costs").click()
    await page.getByRole("button", { name: "Remove School fees" }).click()
    await toast(page, "Removed.")
  })

  test("AC-2: the cap refuses a sixth tactic with a message naming it", async () => {
    for (const name of ["Second", "Third", "Fourth", "Fifth"]) {
      await openBoard(page)
      await page.getByLabel("Name").fill(`${name} plan`)
      await page.getByRole("button", { name: "Save tactic" }).click()
      await toast(page, `Saved as ${name} plan.`)
    }
    await expect(page.getByText("5 of 5 used")).toBeVisible()

    await openBoard(page)
    await page.getByLabel("Name").fill("Sixth plan")
    await page.getByRole("button", { name: "Save tactic" }).click()
    await toast(page, "You keep 5 tactics. Delete one to save another.")
    await expect(page.getByText("5 of 5 used")).toBeVisible()
  })

  test("AC-10: rename, delete behind a confirmation, and the deleted name stays reserved", async () => {
    await page.goto(tacticUrl())
    await tacticRow(page, "Fifth plan")
      .getByRole("button", { name: "Rename" })
      .click()
    await renamingRow(page).getByLabel("New name").fill(renamedName)
    await renamingRow(page)
      .getByRole("button", { name: "Save", exact: true })
      .click()
    await expect(tacticRow(page, renamedName)).toBeVisible()

    await tacticRow(page, renamedName)
      .getByRole("button", { name: "Delete" })
      .click()
    const dialog = page.getByRole("dialog")
    await expect(
      dialog.getByText("Any month you already played keeps its own copy"),
    ).toBeVisible()
    await dialog.getByRole("button", { name: "Delete" }).click()
    await toast(page, `Deleted ${renamedName}. Its name stays reserved.`)

    // The list and the cap count both drop it.
    await expect(tacticRow(page, renamedName)).toHaveCount(0)
    await expect(page.getByText("4 of 5 used")).toBeVisible()

    // The month played from another tactic is untouched by that delete.
    await page.goto("/app")
    await expect(
      page.getByRole("figure", { name: /^4-4-2 formation/ }),
    ).toBeVisible()

    // The reserved name cannot come back.
    await openBoard(page)
    await page.getByLabel("Name").fill(renamedName)
    await page.getByRole("button", { name: "Save tactic" }).click()
    await toast(page, "Names stay reserved even after a delete.")
  })

  test("AC-12: the board is usable by keyboard, and passes axe on a phone", async () => {
    await openBoard(page)
    await slot(page, "GK-0").click()
    await expect(shareField(page)).toHaveValue("10%")
    await lower(page).focus()
    await page.keyboard.press("Enter")
    await expect(shareField(page)).toHaveValue("9.5%")
    await expect(slot(page, "GK-0")).toContainText("47,500.00")

    await freeze(page)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test("AC-12: the layout holds under reduced motion", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await openBoard(page)
    await expect(
      page.locator('[data-reduced-motion="true"]').first(),
    ).toBeVisible()
    await expect(shareField(page)).toHaveValue("7.5%")
    await expect(slot(page, "FWD-0")).toContainText("37,500.00")
    await page.emulateMedia({ reducedMotion: "no-preference" })
  })
})
