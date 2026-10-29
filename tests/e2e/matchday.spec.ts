import { expect, test, type Page } from "@playwright/test"

// Spec 0011: the public Matchday sample, signed out, on the production build.
// Everything lives in memory: no data request, no storage, no URL change.

const PATH = "/prototype/matchday"

async function step(page: Page, label: string) {
  await page
    .getByRole("navigation", { name: "Sample steps" })
    .getByRole("button", { name: label })
    .click()
}

async function editMisc(page: Page, naira: string) {
  await step(page, "4. Builder")
  await page.getByRole("tab", { name: "List" }).click()
  await page.getByRole("button", { name: "Edit Miscellaneous" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Planned for November").fill(naira)
  await dialog.getByRole("button", { name: "Save amount" }).click()
  await expect(dialog).toBeHidden()
}

const miscRow = (page: Page) =>
  page
    .getByRole("region", { name: "Midfield" })
    .getByRole("listitem")
    .filter({ hasText: "Miscellaneous" })

test("loads signed out, kept out of search (AC-1)", async ({ page }) => {
  await page.goto(PATH)
  await expect(page.getByText("Fictional sample")).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex.*nofollow/,
  )
})

test("a full pass sends no data and stores nothing (AC-13)", async ({
  page,
  context,
}) => {
  await page.goto(PATH)
  await page.waitForLoadState("networkidle")
  const sent: string[] = []
  page.on("request", (r) => {
    if (["fetch", "xhr"].includes(r.resourceType()) || r.method() !== "GET") {
      sent.push(`${r.method()} ${r.url()}`)
    }
  })

  await page.getByRole("button", { name: /Explore the sample/ }).click()
  await page
    .getByRole("button", { name: "Continue with fictional figures" })
    .click()
  await editMisc(page, "30000")
  await step(page, "5. Review")
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Save sample plan" }).click()
  await expect(
    page.getByRole("heading", { name: /Your money has not moved/ }),
  ).toBeVisible()
  await step(page, "7. Today")
  await page.getByLabel("Total paid toward transport").fill("20000")
  await page
    .getByRole("listitem")
    .filter({ hasText: "Total paid toward transport" })
    .getByRole("button", { name: "Record" })
    .click()
  await step(page, "8. Report")

  expect(sent).toEqual([])
  expect(new URL(page.url()).pathname).toBe(PATH)
  expect(new URL(page.url()).search).toBe("")
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0])
  expect(await context.cookies()).toEqual([])
})

test("leaving and coming back restores the default fixture (AC-1, AC-13)", async ({
  page,
}) => {
  await page.goto(PATH)
  await editMisc(page, "30000")
  await expect(miscRow(page)).toContainText("₦30,000.00")

  await page.goto("/")
  await page.goBack()

  await step(page, "4. Builder")
  await page.getByRole("tab", { name: "List" }).click()
  await expect(miscRow(page)).toContainText("₦35,000.00")
})

test("no sideways scroll at 320px with doubled text (AC-10)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto(PATH)
  await page.addStyleTag({ content: "html { font-size: 200% !important }" })

  const overflow = () =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )

  for (const label of [
    "1. Sample",
    "2. Account",
    "3. Setup",
    "4. Builder",
    "5. Review",
    "6. Saved",
    "7. Today",
    "8. Report",
  ]) {
    await step(page, label)
    expect(await overflow(), label).toBeLessThanOrEqual(0)
  }

  await step(page, "4. Builder")
  await page.getByRole("tab", { name: "List" }).click()
  await page.getByRole("button", { name: "Edit Food" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  expect(await overflow(), "food dialog").toBeLessThanOrEqual(0)
})
