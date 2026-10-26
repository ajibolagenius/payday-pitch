import { test, expect } from "@playwright/test"
import type { Locator } from "@playwright/test"

// Spec 0010, AC-1, AC-2, AC-8: the brand grid on /design-system is the proof
// surface for the formation marks. Runs against the dev server, where the
// demo route exists (same project as design-system.spec.ts).

test("both chip rows render every tier at every inline size", async ({
  page,
}) => {
  await page.goto("/design-system")
  for (const row of ["brand-chip-forest", "brand-chip-paper"]) {
    const marks = page.getByTestId(row).locator("svg")
    await expect(marks).toHaveCount(10)
    // Rows are ordered primary, reduced, then the size ladder (reduced under
    // 48). Eleven dots is the primary tier, six the reduced one.
    const expectedDots = [11, 6, 11, 6, 11, 6, 11, 6, 6, 6]
    for (let i = 0; i < expectedDots.length; i++) {
      await expect(marks.nth(i)).toHaveAttribute("viewBox", "0 0 512 512")
      await expect(marks.nth(i).locator("circle")).toHaveCount(expectedDots[i])
    }
  }
})

test("the raster ladder loads as real files at its pinned sizes", async ({
  page,
}) => {
  await page.goto("/design-system")
  const images = page.getByTestId("brand-rasters").locator("img")
  await expect(images).toHaveCount(7)
  const expected = [512, 192, 180, 64, 48, 32, 16]
  for (let i = 0; i < expected.length; i++) {
    const img = images.nth(i)
    await expect(img).toBeVisible()
    // Playwright types the subject as SVGElement | HTMLElement; this is an img.
    const natural = await img.evaluate((el) => {
      const node = el as HTMLImageElement
      return { w: node.naturalWidth, h: node.naturalHeight }
    })
    expect(natural).toEqual({ w: expected[i], h: expected[i] })
  }
})

test("the maskable master sits inside the safe circle crop", async ({
  page,
}) => {
  await page.goto("/design-system")
  const sim = page.getByTestId("brand-maskable")
  await expect(sim.locator("img")).toHaveJSProperty("complete", true)
  await expect(sim.locator("img")).toHaveAttribute(
    "src",
    "/icons/icon-maskable-512.png",
  )
  // Full bleed: the raster fills the square before the circle clips it.
  const box = await sim.locator("img").boundingBox()
  expect(box?.width).toBeCloseTo(box?.height ?? 0, 1)
})

test("the generated lockup and the line-up asset render", async ({ page }) => {
  await page.goto("/design-system")
  const lockup = page.getByTestId("brand-lockup")
  await expect(lockup).toHaveJSProperty("complete", true)
  const ratio = await lockup.evaluate((el) => {
    const img = el as HTMLImageElement
    return img.naturalWidth / img.naturalHeight
  })
  expect(ratio).toBeCloseTo(736 / 160, 2)
  await expect(page.getByTestId("brand-lineup")).toBeVisible()
})

// AC-4 and AC-7: the header marks read --brand-chip, so a theme switch is a
// token swap on the same geometry. The chip values are the layer 1 hexes:
// forest #1c4534, paper #fffdf8, gold 200 #f0c75e, gold 600 #b07f1b.
const CHIP = {
  light: {
    chip: "rgb(28, 69, 52)",
    dots: "rgb(240, 199, 94)",
    keeper: "rgb(255, 253, 248)",
  },
  dark: {
    chip: "rgb(255, 253, 248)",
    dots: "rgb(176, 127, 27)",
    keeper: "rgb(28, 69, 52)",
  },
} as const

/** The three painted fills of a rendered mark, resolved by the browser. */
function markFills(mark: Locator) {
  return mark.evaluate((el) => {
    const paint = (node: Element | null) =>
      node ? getComputedStyle(node).fill : ""
    const circles = el.querySelectorAll("circle")
    return {
      chip: paint(el.querySelector("rect")),
      dots: paint(circles[0]),
      keeper: paint(circles[circles.length - 1]),
    }
  })
}

for (const [path, name] of [
  ["/", "marketing header"],
  ["/sign-in", "sign in header"],
] as const) {
  test(`the ${name} mark swaps chips with the theme (AC-4, AC-7)`, async ({
    page,
  }) => {
    const mark =
      path === "/"
        ? page.locator("main svg").first()
        : page.getByRole("link", { name: "Payday Pitch" }).locator("svg")
    await page.goto(path)
    await expect(mark).toBeVisible()
    expect(await markFills(mark)).toEqual(CHIP.light)

    // A stored choice wins over the light default, as in design-system.spec.ts.
    await page.addInitScript(() => localStorage.setItem("theme", "dark"))
    await page.goto(path)
    await expect(page.locator("html")).toHaveClass(/dark/)
    expect(await markFills(mark)).toEqual(CHIP.dark)
    // Same geometry, only the paint moved.
    await expect(mark.locator("circle")).toHaveCount(path === "/" ? 11 : 6)
  })
}

test("the offline page carries the primary forest mark (AC-4)", async ({
  page,
}) => {
  await page.goto("/offline")
  const mark = page.getByRole("img", { name: "Payday Pitch" })
  await expect(mark).toBeVisible()
  await expect(mark.locator("circle")).toHaveCount(11)
  expect(await markFills(mark)).toEqual(CHIP.light)
})

test("the headers size the tiers by the rule: primary at 48 and above, reduced below (AC-1)", async ({
  page,
}) => {
  await page.goto("/")
  const primary = page.locator("main svg").first()
  await expect(primary.locator("circle")).toHaveCount(11)
  const primaryBox = await primary.boundingBox()
  expect(primaryBox?.width).toBeGreaterThanOrEqual(48)

  await page.goto("/sign-in")
  const reduced = page
    .getByRole("link", { name: "Payday Pitch" })
    .locator("svg")
  await expect(reduced.locator("circle")).toHaveCount(6)
  const reducedBox = await reduced.boundingBox()
  expect(reducedBox?.width).toBeLessThan(48)
})

/** The live type setting of a wordmark, as the browser resolves it. */
function wordmarkSetting(locator: Locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el)
    const family = style.fontFamily.split(",")[0]!.replace(/["']/g, "").trim()
    return {
      family,
      weight: style.fontWeight,
      tracking: Number.parseFloat(style.letterSpacing),
      loaded: document.fonts.check(`600 32px "${family}"`),
    }
  })
}

/** AC-5: the heading face, not a declared fallback, and no synthesised cut. */
async function expectBrandType(setting: {
  family: string
  weight: string
  tracking: number
  loaded: boolean
}) {
  expect(setting.family).not.toMatch(
    /georgia|serif|helvetica|arial|sans-serif/i,
  )
  expect(setting.loaded).toBe(true)
  expect(setting.weight).toBe("600")
  expect(setting.tracking).toBeLessThan(0)
}

test("the wordmark paints in the vendored Melodrama, not its fallback (AC-5)", async ({
  page,
}) => {
  await page.goto("/")
  const wordmark = page.getByText("Payday Pitch").first()
  await expect(wordmark).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expectBrandType(await wordmarkSetting(wordmark))
})

test("a surface sizing the wordmark keeps the brand setting (AC-5)", async ({
  page,
}) => {
  await page.goto("/design-system")
  await page.evaluate(() => document.fonts.ready)
  for (const row of ["brand-chip-forest", "brand-chip-paper"]) {
    const wordmark = page.getByTestId(row).getByText("Payday Pitch")
    await expect(wordmark).toBeVisible()
    const setting = await wordmarkSetting(wordmark)
    await expectBrandType(setting)
    // The row sizes it with text-xl, which must survive beside the setting.
    expect(await wordmark.evaluate((el) => el.className)).toContain("text-xl")
  }
})
