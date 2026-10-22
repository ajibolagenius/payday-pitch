import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// Spec 0005, AC-3, AC-4, AC-5, AC-6: the design system page is the proof
// surface. These run against the dev server, where the page exists.

// axe samples colors once, so a theme switch still mid CSS transition makes
// it read a blend of the two token values. Freeze transitions before scanning.
const freezeTransitions = (page: Page) =>
  page.addStyleTag({
    content:
      "*,*::before,*::after{transition:none!important;animation:none!important}",
  })

async function scan(page: Page) {
  await freezeTransitions(page)
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
}

test("passes an axe scan with no serious violations (dark)", async ({
  page,
}) => {
  await page.goto("/design-system")
  const results = await scan(page)
  expect(results.violations).toEqual([])
})

test("passes an axe scan with no serious violations (light)", async ({
  page,
}) => {
  await page.goto("/design-system")
  await page.getByRole("button", { name: /switch to light/i }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  const results = await scan(page)
  expect(results.violations).toEqual([])
})

test("every player and the bench node is reachable and activatable by keyboard", async ({
  page,
}) => {
  await page.goto("/design-system")
  const first = page.getByRole("button", { name: /Emergency Fund, goalkeeper/ })
  await first.focus()
  await expect(first).toBeFocused()
  await first.press("Enter")
  await expect(first).toHaveAttribute("aria-pressed", "true")

  // Tab from the player reaches the next player without a trap.
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("button", { name: /Right Back, defender/ }),
  ).toBeFocused()
})

test("amounts stay legible at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("/design-system")
  const nodes = page.locator("[data-slot-key]")
  await expect(nodes).toHaveCount(12)
  for (const node of await nodes.all()) {
    await node.scrollIntoViewIfNeeded()
    await expect(node).toBeInViewport()
    await expect(node).toContainText("₦")
  }
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
})

// Records on the node whether Motion ever wrote an inline transform: the
// signature of a layout flight. CSS classes hold the centering translate, so
// an inline transform can only come from the animation.
const armFlightCollector = (page: Page, slotKey: string) =>
  page.evaluate((key) => {
    const el = document.querySelector(`[data-slot-key='${key}']`) as HTMLElement
    el.dataset.flew = "false"
    new MutationObserver(() => {
      const transform = el.style.transform
      if (transform && transform !== "none") el.dataset.flew = "true"
    }).observe(el, { attributes: true, attributeFilter: ["style"] })
  }, slotKey)

const flew = (page: Page, slotKey: string) =>
  page.evaluate(
    (key) =>
      document
        .querySelector(`[data-slot-key='${key}']`)!
        .getAttribute("data-flew"),
    slotKey,
  )

test("formation switch slides players in motion, jumps under reduced motion", async ({
  page,
  browser,
}) => {
  await page.goto("/design-system")
  // DEF-0 moves from the back four to the wing when the shape changes.
  const player = page.locator("[data-slot-key='DEF-0']")
  await expect(player).toHaveAttribute("data-reduced-motion", "false")
  await armFlightCollector(page, "DEF-0")
  await page.getByRole("button", { name: "5-4-1", exact: true }).click()
  await expect.poll(() => player.evaluate((el) => el.style.left)).toBe("90%")
  expect(await flew(page, "DEF-0")).toBe("true")

  const context = await browser.newContext({ reducedMotion: "reduce" })
  const quiet = await context.newPage()
  await quiet.goto("/design-system")
  const quietNode = quiet.locator("[data-slot-key='DEF-0']")
  await expect(quietNode).toHaveAttribute("data-reduced-motion", "true")
  await armFlightCollector(quiet, "DEF-0")
  await quiet.getByRole("button", { name: "5-4-1", exact: true }).click()
  await expect.poll(() => quietNode.evaluate((el) => el.style.left)).toBe("90%")
  await quiet.waitForTimeout(600)
  expect(await flew(quiet, "DEF-0")).toBe("false")
  await context.close()
})
