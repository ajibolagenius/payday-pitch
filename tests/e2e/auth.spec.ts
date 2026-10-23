// Sign in & accounts e2e (spec 0006). Runs against the dev server at
// 127.0.0.1:3000 (the SITE_URL origin) with local Supabase running
// (`supabase start`). Email links are read from Mailpit (127.0.0.1:54324).
// The journey shares one browser context so the session a test establishes is
// the state the next test starts from. PKCE keeps one pending code verifier per
// browser, so a signup is confirmed before the next signup or resend touches
// the jar: the unconfirmed account behaviors run in their own throwaway
// context instead.
import {
  test,
  expect,
  type BrowserContext,
  type Page,
  type APIRequestContext,
} from "@playwright/test"

import {
  CONFIRM_FIRST_MESSAGE,
  EXPIRED_LINK_MESSAGE,
  RECOVER_SENT_MESSAGE,
  VAGUE_CREDENTIALS_ERROR,
} from "../../src/features/auth/messages"
import { supabaseEnv } from "../../src/lib/env"

const MAILPIT = "http://127.0.0.1:54324"
const stamp = Date.now()
const userA = {
  email: `e2e-a-${stamp}@paydaypitch.test`,
  password: "str0ng-pass-8",
  newPassword: "n3w-passw0rd",
}
const userB = {
  email: `e2e-b-${stamp}@paydaypitch.test`,
  password: "str0ng-pass-8",
}
// The second confirmed account for the AC-6 isolation probe. It is never
// merged into userB: that one stays unconfirmed on purpose for AC-3.
const userC = {
  email: `e2e-c-${stamp}@paydaypitch.test`,
  password: "str0ng-pass-8",
}

async function findLink(
  context: BrowserContext,
  to: string,
  mustContain: string,
): Promise<string> {
  const res = await context.request.get(
    `${MAILPIT}/api/v1/search?query=${encodeURIComponent(to)}&limit=5`,
  )
  const list = await res.json()
  for (const message of list.messages ?? []) {
    const detail = await context.request.get(
      `${MAILPIT}/api/v1/message/${message.ID}`,
    )
    const html = (await detail.json()).HTML ?? ""
    const href = html.match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&")
    if (href?.includes(mustContain)) return href
  }
  return ""
}

async function latestLink(
  context: BrowserContext,
  to: string,
): Promise<string> {
  let href = ""
  await expect
    .poll(
      async () => {
        href = await findLink(context, to, "/auth/v1/verify")
        return href !== ""
      },
      { timeout: 60_000 },
    )
    .toBe(true)
  return href
}

// GoTrue keeps one email per address per max_frequency window (1m locally) and
// still answers the request with the same neutral message, whether it sent or
// not. Re-request until the link actually lands.
async function recoveryLink(
  context: BrowserContext,
  page: Page,
  to: string,
): Promise<string> {
  const deadline = Date.now() + 150_000
  for (;;) {
    await page.getByRole("button", { name: "Send recovery link" }).click()
    await expect(page.getByText(RECOVER_SENT_MESSAGE)).toBeVisible()
    const href = await findLink(context, to, "type=recovery")
    if (href) return href
    if (Date.now() > deadline) throw new Error(`no recovery link reached ${to}`)
    await page.waitForTimeout(15_000)
  }
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto("/sign-up")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign up" }).click()
  await expect(page).toHaveURL(/\/verify-email$/)
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
}

// A live session for direct data API calls, over the same transport RLS has to
// hold against (spec 0006 AC-6). These use Playwright's isolated `request`
// context, so they never disturb the journey browser's cookies.
async function tokenFor(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const { url, publishableKey } = supabaseEnv()
  const res = await request.post(`${url}/auth/v1/token?grant_type=password`, {
    headers: { apikey: publishableKey },
    data: { email, password },
  })
  expect(res.ok(), `password grant failed: ${await res.text()}`).toBeTruthy()
  return res.json() as Promise<{ access_token: string; user: { id: string } }>
}

async function profileRows(
  request: APIRequestContext,
  accessToken: string,
  filter = "select=user_id",
) {
  const { url, publishableKey } = supabaseEnv()
  const res = await request.get(`${url}/rest/v1/profile?${filter}`, {
    headers: { apikey: publishableKey, authorization: `Bearer ${accessToken}` },
  })
  expect(res.ok(), `profile select failed: ${await res.text()}`).toBeTruthy()
  return res.json() as Promise<{ user_id: string }[]>
}

test.describe.configure({ mode: "serial" })

test.describe("account journey", () => {
  let context: BrowserContext
  let page: Page

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test("AC-1, AC-9, AC-7: signup shows check-your-email; the link resolves through /auth/callback into a session on /app", async () => {
    await signUp(page, userA.email, userA.password)
    await expect(page.getByText(userA.email)).toBeVisible()

    const link = await latestLink(context, userA.email)
    expect(link).toContain("/auth/v1/verify")
    await page.goto(link)
    await expect(page).toHaveURL(/\/app$/)
    // The app home for a brand new account is the walk, which opens on incomes
    // (spec 0007 AC-1). Its heading is the match loop's business, so this spec
    // proves the session landed by the account control the home always carries.
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible()

    // Persistent session cookie (AC-7): maxAge around a year.
    const authCookie = (await context.cookies()).find(
      (c) =>
        c.name.startsWith("sb-") &&
        c.name.includes("auth-token") &&
        c.value.length > 0,
    )
    expect(authCookie).toBeDefined()
    expect(authCookie!.expires * 1000).toBeGreaterThan(
      Date.now() + 300 * 24 * 3600 * 1000,
    )
  })

  // Own context: a second signup in the journey context would overwrite userA's
  // session and rotate the pending PKCE verifier.
  test("AC-1, AC-3: an unconfirmed account cannot sign in; resend answers without revealing and start over works", async ({
    page: fresh,
  }) => {
    await signUp(fresh, userB.email, userB.password)

    // Resend gives one safe answer either way: the cooldown message or the
    // neutral sent message, never which addresses exist (AC-3, AC-11).
    await fresh.getByRole("button", { name: "Send the link again" }).click()
    await expect(
      fresh.getByText(
        /Wait a minute and try again\.|If that email needs it, a link is on its way\./,
      ),
    ).toBeVisible()

    // Unconfirmed account cannot sign in (AC-1); the message offers a resend.
    await fresh.goto("/sign-in")
    await fresh.getByLabel("Email").fill(userB.email)
    await fresh.getByLabel("Password").fill(userB.password)
    await fresh.getByRole("button", { name: "Sign in" }).click()
    await expect(fresh.getByText(CONFIRM_FIRST_MESSAGE)).toBeVisible()

    await fresh.goto("/verify-email")
    await fresh.getByRole("button", { name: "Wrong email? Start over" }).click()
    await expect(fresh).toHaveURL(/\/sign-up$/)
  })

  // Signup and confirmation happen in this one throwaway context: PKCE keeps
  // the code verifier where the signup started, so confirming a link in a
  // different browser answers "link invalid or expired". userA's session in the
  // journey context stays untouched.
  test("AC-6: a second account gets nothing when it asks for user A's rows through the data API", async ({
    page: fresh,
    context: freshContext,
    request,
  }) => {
    test.setTimeout(120_000)
    await signUp(fresh, userC.email, userC.password)
    const link = await latestLink(freshContext, userC.email)
    await fresh.goto(link)
    await expect(fresh).toHaveURL(/\/app$/)

    const userASession = await tokenFor(request, userA.email, userA.password)
    const userCSession = await tokenFor(request, userC.email, userC.password)

    // Positive control: A reads their own row. Without it, an empty answer
    // below could be a query that matches nothing rather than RLS holding.
    expect(
      await profileRows(
        request,
        userASession.access_token,
        `select=user_id&user_id=eq.${userASession.user.id}`,
      ),
    ).toEqual([{ user_id: userASession.user.id }])

    // C asks for A's row directly: the row filter yields nothing.
    expect(
      await profileRows(
        request,
        userCSession.access_token,
        `select=user_id&user_id=eq.${userASession.user.id}`,
      ),
    ).toEqual([])

    // And C asking for everything visible sees only their own.
    const visibleToC = await profileRows(request, userCSession.access_token)
    expect(visibleToC.map((row) => row.user_id)).not.toContain(
      userASession.user.id,
    )
    expect(visibleToC.map((row) => row.user_id)).toContain(userCSession.user.id)
  })

  test("AC-5, AC-2, AC-8: sign out clears cookies, /app re-gates, sign in returns", async () => {
    await page.goto("/app")
    await signOut(page)
    const stale = (await context.cookies()).filter(
      (c) =>
        c.name.startsWith("sb-") &&
        c.name.includes("auth-token") &&
        c.value.length > 0,
    )
    expect(stale.length).toBe(0)

    // Protected route gate (AC-2, AC-8): cookie-less visit to /app redirects
    // to sign-in carrying the path.
    await page.goto("/app")
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/)

    await page.getByLabel("Email").fill(userA.email)
    await page.getByLabel("Password").fill(userA.password)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/app$/)
  })

  test("AC-11, AC-9: one vague message for any bad credentials; a dead link lands on reason=expired", async () => {
    await signOut(page)

    await page.getByLabel("Email").fill(userA.email)
    await page.getByLabel("Password").fill("wrong-password-1")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText(VAGUE_CREDENTIALS_ERROR)).toBeVisible()

    await page.getByLabel("Email").fill(`ghost-${Date.now()}@paydaypitch.test`)
    await page.getByLabel("Password").fill("wrong-password-1")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText(VAGUE_CREDENTIALS_ERROR)).toBeVisible()

    await context.clearCookies()
    await page.goto("/auth/callback?code=not-a-real-code&type=signup")
    await expect(page).toHaveURL(/\/sign-in\?reason=expired$/)
    await expect(page.getByText(EXPIRED_LINK_MESSAGE)).toBeVisible()
  })

  test("AC-4, AC-10: recovery link reaches set-a-new-password and the new password signs in", async () => {
    // The cooldown wait (see recoveryLink) puts this test past the default 30s.
    test.setTimeout(240_000)
    await page.goto("/recover")
    await page.getByLabel("Email").fill(userA.email)
    const link = await recoveryLink(context, page, userA.email)
    await page.goto(link)
    await expect(page).toHaveURL(/\/reset-password$/)
    await page.getByLabel("New password").fill(userA.newPassword)
    await page.getByLabel("Confirm password").fill(userA.newPassword)
    await page.getByRole("button", { name: "Save password" }).click()
    await expect(page).toHaveURL(/\/app$/)

    await signOut(page)
    await page.getByLabel("Email").fill(userA.email)
    await page.getByLabel("Password").fill(userA.newPassword)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/app$/)
  })
})

// Regression: browsing by hand usually means http://localhost:3000, an alias
// of the SITE_URL origin with its own cookie jar. Before host
// canonicalization (src/proxy.ts) a signup started there stored its PKCE
// verifier on localhost while the email link landed on 127.0.0.1, and the
// confirmation answered "link invalid or expired".
test("manual browsing on the localhost alias canonicalizes and confirms", async ({
  page,
  context,
}) => {
  const aliasEmail = `e2e-alias-${stamp}@paydaypitch.test`

  await page.goto("http://localhost:3000/sign-up")
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:3000\/sign-up$/)

  await page.getByLabel("Email").fill(aliasEmail)
  await page.getByLabel("Password").fill("str0ng-pass-8")
  await page.getByRole("button", { name: "Sign up" }).click()
  await expect(page).toHaveURL(/\/verify-email$/)

  const link = await latestLink(context, aliasEmail)
  await page.goto(link)
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible()
})
