// First match loop e2e (spec 0007). Runs against the dev server on
// 127.0.0.1:3000, the SITE_URL origin the session needs, with local Supabase
// and Mailpit up (same setup as auth.spec.ts). One account, one context,
// serial order: each test leaves the state the next one walks on from, which
// is what makes the whole loop cheap to prove end to end.
import { test, expect, type BrowserContext, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const MAILPIT = "http://127.0.0.1:54324"
const account = {
  email: `walk-${Date.now()}@paydaypitch.test`,
  password: "str0ng-pass-8",
}

const INCOME = "450000"
const COST = "150000"

// axe samples colors once, so a scan mid CSS transition reads a blend of two
// token values. Freeze transitions first (same as design-system.spec.ts).
const freeze = (page: Page) =>
  page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none!important;animation:none!important}",
  })

async function scan(page: Page) {
  await freeze(page)
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
}

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

const toast = (page: Page, text: string) =>
  expect(page.locator("[data-sonner-toast]", { hasText: text })).toBeVisible()

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

const step = (page: Page, label: string) =>
  page.getByRole("button", { name: label, exact: true })

const card = (page: Page, shape: string) =>
  page.getByRole("button", { name: new RegExp(`^${shape}`) })

const review = (page: Page) =>
  page.getByRole("button", { name: "Review the pitch" })

test.describe.configure({ mode: "serial" })

test.describe("the first match loop", () => {
  let context: BrowserContext
  let page: Page

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test("AC-1, AC-10: a brand new account opens the walk on incomes, in its empty state", async () => {
    test.setTimeout(150_000)
    await page.goto("/sign-up")
    await page.getByLabel("Email").fill(account.email)
    await page.getByLabel("Password").fill(account.password)
    await page.getByRole("button", { name: "Sign up" }).click()
    await expect(page).toHaveURL(/\/verify-email$/)
    await page.goto(await verifyLink(context, account.email))
    await expect(page).toHaveURL(/\/app$/)

    // No progress pointer anywhere: the stored data decides the opening step.
    await expect(
      page.getByRole("heading", { name: "What comes in" }),
    ).toBeVisible()
    await expect(page.getByText("Nothing logged yet")).toBeVisible()
    await expect(
      page.getByText("Add your first income to start the walk."),
    ).toBeVisible()
    await expect(step(page, "3. Shape")).toBeDisabled()
    await expect(step(page, "4. Pitch")).toBeDisabled()
  })

  test("AC-2: an income saves and answers with a toast; a zero or a blank amount is refused on the field", async () => {
    await saveEntry(page, "Salary", INCOME, "25")
    await toast(page, "Saved.")
    await expect(
      page.getByRole("listitem").filter({ hasText: "Salary" }),
    ).toContainText("450,000.00")
    await expect(page.getByText("Pays on day 25")).toBeVisible()

    await saveEntry(page, "Grass", "0", "5")
    await expect(
      page.getByText("Enter a positive amount in naira"),
    ).toBeVisible()
    await expect(page.locator('[name="amountNaira"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    )

    await saveEntry(page, "", "10000", "5")
    await expect(page.getByText("Give it a name.")).toBeVisible()

    // Clear the rejected draft so the next step starts clean.
    await page.getByLabel("What is it").fill("")
    await page.getByLabel("Amount").fill("")
    await page.getByLabel(/Payday day/).fill("")
  })

  test("AC-1: the fixed cost step saves, and the money summary follows", async () => {
    await step(page, "2. Costs").click()
    await expect(
      page.getByRole("heading", { name: "What must go out" }),
    ).toBeVisible()
    await saveEntry(page, "Rent", COST)
    await toast(page, "Saved.")
    await expect(page.getByText("Total out each month")).toBeVisible()

    await step(page, "3. Shape").click()
    await expect(
      page.getByRole("heading", { name: "Pick your shape" }),
    ).toBeVisible()
    const summary = page.locator("p", { hasText: "Left to work" })
    await expect(summary.locator("span", { hasText: "Income" })).toContainText(
      "450,000.00",
    )
    await expect(summary.locator("span", { hasText: "Costs" })).toContainText(
      "150,000.00",
    )
    await expect(
      summary.locator("span", { hasText: "Left to work" }),
    ).toContainText("300,000.00")
  })

  test("AC-5: a shape whose defence cannot hold the costs is badged and cannot be reviewed", async () => {
    const short = card(page, "3-5-2")
    await expect(short).toContainText(/Short by/)
    await expect(card(page, "4-4-2")).not.toContainText(/Short by/)

    await short.click()
    await expect(review(page)).toBeDisabled()

    await card(page, "4-4-2").click()
    await expect(card(page, "4-4-2")).toHaveAttribute("aria-pressed", "true")
    await expect(review(page)).toBeEnabled()
  })

  test("AC-7: the pitch tour spotlights the five zones once, and never again", async () => {
    await review(page).click()
    await expect(
      page.getByRole("button", { name: "Play the match" }),
    ).toBeVisible()

    const popover = page.locator(".driver-popover")
    await expect(popover).toBeVisible()
    await expect(page.locator(".driver-popover-title")).toHaveText(
      "Keeper: the emergency fund",
    )
    await expect(page.locator(".driver-popover-progress-text")).toHaveText(
      "1 of 5",
    )

    const zones = ["GK-0", "DEF-0", "MID-0", "FWD-0", "BENCH-0"]
    const spotlight = () =>
      page.evaluate(
        () =>
          document
            .querySelector(".driver-active-element")
            ?.getAttribute("data-slot-key") ?? "",
      )
    await expect.poll(spotlight).toBe(zones[0])
    for (const zone of zones.slice(1)) {
      // The key press travels inside the poll: driver.js ignores a press while
      // its highlight transition is still running (about 400ms), so a single
      // press sent right after the popover appears can be swallowed. Press,
      // read, and press again only while the spotlight has not moved.
      await expect
        .poll(async () => {
          await page.keyboard.press("ArrowRight")
          return spotlight()
        })
        .toBe(zone)
    }

    // Skip never blocks: the person can leave at any point and the flag is set.
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("pp.pitch-tour.seen")),
      )
      .toBeNull()
    await page.getByRole("button", { name: "Got it" }).click()
    await expect(popover).toHaveCount(0)
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("pp.pitch-tour.seen")),
      )
      .toBe("1")

    // Back through the picker and onto the pitch again: nothing shows.
    await step(page, "3. Shape").click()
    await card(page, "4-4-2").click()
    await review(page).click()
    await expect(
      page.getByRole("button", { name: "Play the match" }),
    ).toBeVisible()
    await expect(popover).toHaveCount(0)
  })

  test("AC-6, AC-7: actuals are keyboard reachable, zero is a real answer, and the month survives a reload", async () => {
    const first = page.locator('[name="actual-0"]')
    await first.focus()
    await expect(first).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(page.locator('[name="actual-1"]')).toBeFocused()
    await page.locator('[name="actual-11"]').focus()
    await page.keyboard.press("Tab")
    await expect(
      page.getByRole("button", { name: "Play the match" }),
    ).toBeFocused()

    await first.fill("49000")
    await page.locator('[name="actual-1"]').fill("0")
    await page.getByRole("button", { name: "Play the match" }).click()
    await toast(page, "is on the books")
    await expect(
      page.getByRole("heading", { name: "This month" }),
    ).toBeVisible()

    await page.reload()
    await expect(page.getByText(/^Played for/)).toBeVisible()
    const lines = page.getByRole("list").last().getByRole("listitem")
    await expect(lines.filter({ hasText: "49,000.00" })).toHaveCount(1)
    // A recorded zero and an untouched blank are two different stored answers.
    await expect(lines.filter({ hasText: /\b0\.00\b/ })).toHaveCount(1)
    await expect(lines.filter({ hasText: "not logged" })).toHaveCount(10)
  })

  test("AC-8: a played month offers the correction entry and the way back to the numbers", async () => {
    const again = page.getByRole("button", { name: "Play this month again" })
    const numbers = page.getByRole("button", { name: "Update your numbers" })
    await expect(again).toBeVisible()
    await expect(numbers).toBeVisible()

    // The way back to the money from the saved pitch.
    await numbers.click()
    await expect(
      page.getByRole("heading", { name: "What comes in" }),
    ).toBeVisible()

    // The correction entry: replay the month that is already on the books in a
    // wider defence. One fresh actual is typed (AC-6): what you enter now
    // wins, what you leave blank carries forward from the saved match, and
    // the shape on the grass is the new one.
    await step(page, "4. Pitch").click()
    await again.click()
    await expect(
      page.getByRole("heading", { name: "Pick your shape" }),
    ).toBeVisible()
    await card(page, "5-3-2").click()
    await review(page).click()
    await page.locator('[name="actual-9"]').fill("15000")
    await page.getByRole("button", { name: "Play the match" }).click()
    await toast(page, "is on the books")
    await expect(
      page.getByRole("figure", { name: /^5-3-2 formation/ }),
    ).toBeVisible()
    const lines = page.getByRole("list").last().getByRole("listitem")
    // The typed correction and both carried values are all on the new match.
    await expect(lines.filter({ hasText: "15,000.00" })).toHaveCount(1)
    await expect(lines.filter({ hasText: "49,000.00" })).toHaveCount(1)
    await expect(lines.filter({ hasText: /\b0\.00\b/ })).toHaveCount(1)
    await expect(lines.filter({ hasText: "not logged" })).toHaveCount(9)
  })

  test("AC-7, AC-10: the new screens pass axe", async () => {
    expect((await scan(page)).violations).toEqual([])

    await step(page, "3. Shape").click()
    expect((await scan(page)).violations).toEqual([])

    await card(page, "4-4-2").click()
    await review(page).click()
    await expect(
      page.getByRole("heading", { name: "This month" }),
    ).toBeVisible()
    expect((await scan(page)).violations).toEqual([])
  })

  test("AC-5, AC-10: when costs pass income every shape is badged and the picker says so", async () => {
    await step(page, "2. Costs").click()
    await saveEntry(page, "Everything", "900000")
    await toast(page, "Saved.")
    await step(page, "3. Shape").click()

    await expect(
      page.getByText("Your costs are more than you earn."),
    ).toBeVisible()
    await expect(page.getByText(/Short by/)).toHaveCount(6)
    await expect(review(page)).toBeDisabled()

    // Back to a playable month, then to no costs at all: the walk will not let
    // the person into a step with nothing to line up. Rows are edited on the
    // costs step, so each removal goes back there first.
    await step(page, "2. Costs").click()
    await page.getByRole("button", { name: "Remove Everything" }).click()
    await toast(page, "Removed.")
    await step(page, "3. Shape").click()
    await expect(page.getByText(/Short by/)).toHaveCount(1)
    await expect(
      page.getByText("Your costs are more than you earn."),
    ).toHaveCount(0)

    await step(page, "2. Costs").click()
    await page.getByRole("button", { name: "Remove Rent" }).click()
    await toast(page, "Removed.")
    await expect(page.getByText("Nothing logged yet")).toBeVisible()
    await expect(step(page, "3. Shape")).toBeDisabled()
    await expect(step(page, "4. Pitch")).toBeDisabled()
  })
})
