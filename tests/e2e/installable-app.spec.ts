import { expect, test, type BrowserContext, type Page } from "@playwright/test"

// Spec 0001: phone layout, manifest, and the service worker's offline rules.
// Page copy is placeholder until features 5 and 16, so offline checks compare
// against what the page showed online instead of asserting its text.

const cacheKeys = (page: Page) => page.evaluate(() => caches.keys())
const pageCaches = async (page: Page) =>
  (await cacheKeys(page)).filter((k) => k.startsWith("pages-"))
const tell = (page: Page, message: { type: string; id?: string }) =>
  page.evaluate(
    (m) => navigator.serviceWorker.controller!.postMessage(m),
    message,
  )
const heading = (page: Page) => page.getByRole("heading", { level: 1 })

// /app is behind the session guard as of spec 0006, so an anonymous navigation
// there redirects, and a redirect is never cached. These tests are about the
// worker's per-user cache rules, so the signed-in page is answered here instead.
// Callers must drop the fake before going offline: the offline read is only
// meaningful when the real network fails and the worker falls back to its cache.
const APP_HTML =
  '<!DOCTYPE html><html lang="en"><body><h1>Your pitch (cached)</h1></body></html>'

async function fakeAppPage(context: BrowserContext) {
  // Context level: the worker issues the navigation fetch, not the page.
  await context.route("**/app", (route) =>
    route.fulfill({ contentType: "text/html", body: APP_HTML }),
  )
}

async function realAppPage(context: BrowserContext) {
  await context.unroute("**/app")
}

declare global {
  interface Window {
    // Set by the addInitScript below in the "new version" test.
    __registered?: Promise<ServiceWorkerRegistration>
  }
}

// First load installs the worker; the reload is the first page it controls.
async function controlled(page: Page, path = "/") {
  await page.goto(path)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
    )
    .toContain("/sw.js?v=")
}

test.describe("phone layout", () => {
  for (const path of ["/", "/app", "/offline"]) {
    test(`${path} has no horizontal scroll at phone width`, async ({
      page,
    }) => {
      await page.goto(path)
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
    })
  }

  test("text renders in Space Grotesk", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => getComputedStyle(document.body).fontFamily),
    ).toMatch(/^"Space Grotesk"/)
    expect(
      await page.evaluate(() => document.fonts.check('1em "Space Grotesk"')),
    ).toBe(true)
  })
})

test.describe("manifest", () => {
  test("pages link a standalone manifest that opens /app", async ({
    page,
    request,
  }) => {
    await page.goto("/")
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    )
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#1B4638",
    )

    const manifest = await (await request.get("/manifest.webmanifest")).json()
    expect(manifest).toMatchObject({
      start_url: "/app",
      display: "standalone",
      theme_color: "#1B4638",
    })
    expect(
      manifest.icons.some(
        (i: { purpose?: string }) => i.purpose === "maskable",
      ),
    ).toBe(true)
    for (const icon of manifest.icons) {
      const res = await request.get(icon.src)
      expect(res.status(), icon.src).toBe(200)
      expect(res.headers()["content-type"]).toBe("image/png")
    }
  })
})

test.describe("offline", () => {
  test("a public page falls back to its cached copy", async ({
    page,
    context,
  }) => {
    await controlled(page)
    const online = await heading(page).textContent()
    await expect
      .poll(async () =>
        (await cacheKeys(page)).some((k) => k.startsWith("shell-")),
      )
      .toBe(true)

    await context.setOffline(true)
    await page.reload()
    await expect(heading(page)).toHaveText(online!)
  })

  test("a page never visited shows the offline page", async ({
    page,
    context,
  }) => {
    await controlled(page)
    await context.setOffline(true)
    await page.goto("/never-visited")
    await expect(heading(page)).toHaveText("You are offline")
  })

  test("an unknown user caches nothing under /app", async ({
    page,
    context,
  }) => {
    await controlled(page)
    await fakeAppPage(context)
    await page.goto("/app")
    await realAppPage(context)
    await context.setOffline(true)
    await page.goto("/app")
    await expect(heading(page)).toHaveText("You are offline")
    expect(await pageCaches(page)).toEqual([])
  })

  test("a known user's /app is cached for them and works offline", async ({
    page,
    context,
  }) => {
    await controlled(page)
    await fakeAppPage(context)
    await tell(page, { type: "user", id: "a" })
    await page.goto("/app")
    const online = await heading(page).textContent()
    await expect
      .poll(() => pageCaches(page))
      .toEqual([expect.stringMatching(/^pages-.+-a$/)])

    await realAppPage(context)
    await context.setOffline(true)
    await page.goto("/app")
    await expect(heading(page)).toHaveText(online!)
  })

  test("switching user drops the last user's pages", async ({
    page,
    context,
  }) => {
    await controlled(page)
    await fakeAppPage(context)
    await tell(page, { type: "user", id: "a" })
    await page.goto("/app")
    await expect.poll(() => pageCaches(page)).toHaveLength(1)

    await tell(page, { type: "user", id: "b" })
    await expect.poll(() => pageCaches(page)).toEqual([])
    await realAppPage(context)
    await context.setOffline(true)
    await page.goto("/app")
    await expect(heading(page)).toHaveText("You are offline")
  })

  test("sign out clears every pages cache", async ({ context, page }) => {
    await controlled(page)
    await fakeAppPage(context)
    await tell(page, { type: "user", id: "a" })
    await page.goto("/app")
    await expect.poll(() => pageCaches(page)).toHaveLength(1)

    await tell(page, { type: "sign-out" })
    await expect.poll(() => pageCaches(page)).toEqual([])
  })
})

test.describe("design system demo", () => {
  // Spec 0005: the page proves the system in dev and never ships.
  test("/design-system is not served from a production build", async ({
    request,
  }) => {
    expect((await request.get("/design-system")).status()).toBe(404)
  })
})

test.describe("new version", () => {
  // A real deploy changes the commit SHA in /sw.js?v=. Registering a new URL
  // from the page takes the same update path without a second build.
  test("asks before switching, then moves to the new worker and drops old caches", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const sw = navigator.serviceWorker
      const register = sw.register.bind(sw)
      sw.register = (...args) => {
        const registration = register(...args)
        window.__registered = registration
        return registration
      }
    })
    await controlled(page)
    // SwRegister attaches its update listener when its register() resolves.
    await page.waitForFunction(() => window.__registered)
    await page.evaluate(() => window.__registered)
    const oldStatic = (await cacheKeys(page)).find((k) =>
      k.startsWith("static-"),
    )
    expect(oldStatic).toBeDefined()

    await page.evaluate(() =>
      navigator.serviceWorker.register("/sw.js?v=e2e-next", {
        updateViaCache: "none",
      }),
    )
    const prompt = page
      .getByRole("status")
      .filter({ hasText: "A new version is ready." })
    await expect(prompt).toBeVisible()
    // No silent skipWaiting: the old worker still runs this page.
    expect(
      await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
    ).not.toContain("e2e-next")

    await Promise.all([
      page.waitForEvent("load"),
      prompt.getByRole("button", { name: "Refresh" }).click(),
    ])
    expect(
      await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
    ).toContain("v=e2e-next")
    await expect.poll(() => cacheKeys(page)).not.toContain(oldStatic)
  })
})
