# Review, feat/sign-in-and-accounts, 2026-10-22

**Reviewed by**: qoder-review (author on qoder)
**Scope**: 65 files, uncommitted (sign-in & accounts feature; `.agents/skills/react-email/**`, `pnpm-lock.yaml`, `skills-lock.json` skimmed only)
**Verdict**: Blocked

## Summary

This wires real Supabase email/password accounts end to end: cookie sessions via `@supabase/ssr`, five auth screens, a single `/auth/callback` route, a `src/proxy.ts` gate, enumeration-safe messages, RLS-backed `getClaims()` guarding in the `(app)` layout, and react-email templates that keep Supabase's own placeholders. Overall the code is disciplined and closely tracks spec 0006; the invariants that matter most (no client-supplied `user_id`, `getClaims()` not `getSession()`, vague credentials) are all honored. The merge is stopped by one genuine open redirect / session-leak hole in the redirect validator that AC-9 explicitly says must be closed; two specced-but-missing security tests (the AC-6 cross-user API probe and the AC-12 revoked-session path) should also land before merge.

## Blockers

### 🔴 Open redirect (with SameSite=Lax session leak) in `resolveRedirect`, `src/features/auth/redirect.ts:28`

**Problem**: The absolute-URL branch accepts any `next` whose `origin` equals `siteUrl` and returns `target.pathname + target.search + target.hash` **without re-validating that path**. A path beginning with `//` survives URL parsing: `resolveRedirect("http://127.0.0.1:3000//evil.com", "http://127.0.0.1:3000")` returns `"//evil.com"` (I confirmed this in Node; note `/\evil.com` normalizes to the same `//evil.com`). That protocol-relative value is handed straight to `redirect()` in `signInAction` (`src/features/auth/actions.ts:81`), and the browser resolves `//evil.com` to `https://evil.com`.
**Why it matters**: AC-9's whole purpose is "`//evil.example` … rejected" and the key invariant "Every redirect the auth flows honor passes the relative path rule … No open redirects." This is the exact bypass. Worse, `next` is fully attacker-controlled via `/sign-in?next=http://<own-host>//evil.com` (the sign-in page echoes `params.next` into the hidden input at `sign-in-form.tsx:35`), and the redirect fires **immediately after a successful password login**. The Supabase auth cookies are `SameSite=Lax`, which the browser sends on a top-level cross-site GET navigation — so the freshly minted session cookie is delivered to the attacker's host. It is a credential/session theft vector on a money app, not just a phishing redirect. `redirect.test.ts` never exercises the `//` path, so the suite is green while the hole is open.
**Suggested fix**: After computing the origin-relative string, run it back through `isSafeRelativePath` and only return it when it passes; otherwise fall through to `DEFAULT_TARGET`. (Or: rebuild the redirect from `target.pathname` only after asserting `isSafeRelativePath(target.pathname)`.) Add the AC-9 cases `//evil.example` and `/\evil.example` to `redirect.test.ts` so the regression is pinned.

## Major

### 🟠 AC-6 cross-user data-API probe was specced but not built, `tests/e2e/auth.spec.ts`

**Problem**: AC-6 and build step 8 require "a Playwright probe where user B requests user A's rows through the data API and receives nothing." `auth.spec.ts` covers signup, confirm, sign-in, sign-out, recovery, gate, expired link, and host aliasing, but never authenticates a second user against the first user's rows over the data API. The two-user fixture (`userB`) is created only to exercise the unconfirmed-return path.
**Why it matters**: This is the one acceptance criterion that proves RLS actually holds over the transport the app uses. The existing `rls.test.ts` Vitest suite (which I confirmed already uses `createUser({ email_confirm: true })`, so the `enable_confirmations` flip won't break it) covers the DB-level half, but the end-to-end API probe is the part of AC-6 this PR is responsible for and it is absent. A merge ships a spec criterion marked done that isn't verified.
**Suggested fix**: Add the user-B-fetches-A's-rows probe against local Supabase, or explicitly defer it in the PR description so `/check verify` does not treat AC-6 as met.

### 🟠 Revoked-session path (AC-12) and the proxy refresh/gate branch have no test, `src/proxy.ts:97`–`126`

**Problem**: The security-relevant branching in `proxy.ts` — `hasSessionCookie`'s chunk-name matching, the "session present but cannot be refreshed → `/sign-in?reason=expired`" hop, and the `/app` cookie-presence gate — is exercised only indirectly by e2e for the _signed-out_ gate. The spec's "Stale session: refresh token revoked through the admin API → `/sign-in?reason=expired`, never a bare redirect" (AC-12, a listed critical test scenario) has neither a unit test (`proxy.test.ts` only tests `canonicalOrigin`) nor an e2e case.
**Why it matters**: This is the code that decides whether a dead-but-present cookie sends a user to a clear "You were signed out" screen versus looping or leaking; an untested conditional here is exactly where a regression (e.g. a future cookie rename, or the loop-guard at line 117 changing) silently ships. Under `TESTS = configured`, untested security branching is a finding in its own right.
**Suggested fix**: Unit-test `proxy()` for (a) expired/revoked session → `reason=expired`, (b) no session on `/app` → `/sign-in?next=…`, (c) the `code-verifier`/`expires-at` cookies not counting as a session; and add the revoked-token e2e scenario.

## Minor

### 🟡 `signUpAction` masks every non-throttle failure as a fake success, `src/features/auth/actions.ts:99`

**Problem**: Only a throttled error is surfaced; any other `signUp` error (Supabase unreachable, weak/breached-password rejection, malformed server-side validation) falls through to set the `pending-signup` cookie and `redirect("/verify-email")`, telling the user a confirmation link is on its way when none was sent.
**Why it matters**: The enumeration rule only requires hiding "email already registered". Extending that to swallow transport/integrity errors turns a real, retryable failure into a dead-end ("I never got the email") with no signal to the user or the logs. The `/verify-email` resend affordance partially mitigates it, which is why this is Minor rather than Major, but the masking is broader than AC-11 intends.
**Suggested fix**: Keep the vague path for the already-registered case specifically; for genuine network/server errors return a retryable `actionError`.

### 🟡 `(app)` layout reads claims on a write-disabled client, `src/app/(app)/layout.tsx:17`–`27`, `src/lib/supabase/server.ts:33`

**Problem**: `createSupabaseServerClient` sets `setAll: () => {}` (read-only). `getClaims()` verifies the access token locally, so a request that reaches the layout with an expired access token but a still-valid refresh token (i.e. one that did not pass through the proxy's refresh hop) fails the claim check and redirects to `/sign-in`.
**Why it matters**: Low probability because the proxy matcher covers every non-asset page GET and refreshes first, but it makes the guard depend on the proxy having run; a direct entry that skips the proxy would log an active user out. This is the "proxy is convenience, layout is the guard" line doing slightly less than advertised. Worth a conscious note, not a rewrite.
**Suggested fix**: Document the dependency, or let the layout tolerate a verification miss by falling back to a refresh-capable read before redirecting.

## Nits

- ⚪ `tests/e2e/auth.spec.ts:21`, imports reach `src/...` with a relative path instead of the `@/` alias the project rules mandate (understandable for Playwright's own resolver, but inconsistent).
- ⚪ `src/components/auth/sign-in-form.tsx:17`, `type Data = typeof CONFIRM_FIRST_MESSAGE | string | null` — `typeof` of a string literal is just `string`, so the union is redundant.
- ⚪ `src/proxy.ts:80`, the canonicalization meta-refresh reflects the request path/query into HTML relying solely on the inline `[&<>"']` escape; it is localhost-alias-only and correctly escaped today, but it is the kind of hand-rolled reflection a shared escaper would make safer.

## Strengths

- The enumeration posture is genuinely careful and well-tested: sign-in, resend, and recovery all collapse to one vague message (`AC-11`), and the sole honest leak (unconfirmed account) is named _and_ answered with a working resend — matching the spec exactly rather than fighting it.
- `hasSessionCookie` in `src/proxy.ts:43` gets a subtle real thing right: it excludes the `…-code-verifier` and `…-expires-at` chunk names so a mid-PKCE signup is not mistaken for a live session (the comment explains the failure mode it prevents). Host canonicalization for the `localhost`/`127.0.0.1` cookie-jar split is the same caliber of catch.
- The identity/write discipline holds: `requireClaims()` sources `sub` only from `getClaims()`, no action accepts a client `user_id`, and the callback route establishes identity solely via `exchangeCodeForSession`/`verifyOtp`. Emails keep `{{ .ConfirmationURL }}` literal (verified in the rendered templates), and `src/emails/*` carries no hex outside the sanctioned `scripts/render-emails.mts`, so `check:hex` and the ESLint rule stay green.

## Test coverage

Unit coverage for the feature is strong and meaningful (schema normalization, vague-message equality, cookie set/delete, callback Location + pending-signup spend, `requireClaims` null cases) and the auth e2e journey is thorough. The gaps are the two security assertions the spec itself names: the AC-6 cross-user data-API probe and the AC-12 revoked-session path — neither built. The blocker is invisible to the suite because `redirect.test.ts` never feeds `resolveRedirect` a `//`-prefixed own-origin URL; adding that case is both the regression test and the proof the fix works. Everything specced-and-present otherwise maps to a criterion.

## Fix status, same day

All findings except the three nits are fixed and verified. `pnpm typecheck`, `pnpm lint`, `pnpm test` (171 unit tests) and the auth e2e project (7 tests, including the new probe) all pass against local Supabase.

- **Blocker, open redirect**: `resolveRedirect` now runs the stripped own-origin path back through `isSafeRelativePath`, so `//evil.example` and `/\evil.example` fall to `/app`. Pinned by new cases in `redirect.test.ts` and an end-to-end action case in `actions.test.ts`.
- **Major, AC-6 probe**: `tests/e2e/auth.spec.ts` now signs up and confirms a third account in its own context (confirming a PKCE link in a different browser than the signup is what made the first attempt answer `reason=expired`), then asks for user A's `profile` row through PostgREST with B's token and gets `[]`, with a positive control that A reads their own row.
- **Major, proxy tests**: `src/proxy.test.ts` covers the live-session pass-through, a revoked session on `/app` landing on `?reason=expired`, no bounce from `/sign-in` back to itself, the `/app` gate with no cookies, a mid-PKCE verifier cookie counting as no session rather than a revoked one, and an unprotected page left alone.
- **Minor, signup masking**: `requestFailure()` in `src/features/auth/actions.ts` states an unreachable service as a retryable `unavailable` error (`UNAVAILABLE_MESSAGE`) instead of a fake success. Applied to sign up, both resends, recovery, and the password update, so account-shaped outcomes stay vague exactly as AC-11 asks.
- **Minor, layout guard**: `src/app/(app)/layout.tsx` now documents that its read-only client cannot refresh, and why the proxy matcher makes that theoretical.
- **Type cleanup**: the redundant `Data` union in `sign-in-form.tsx` is now `string | null`; `actionError` and `parsePayload` return the new `ActionFailure` type, which also fixed a pre-existing `pnpm typecheck` error at `src/lib/actions.test.ts:84`.
- **Left as reported**: the e2e suite's relative imports (Playwright's own resolver), and the hand-rolled escape in the localhost canonicalization response, which is localhost-only and correctly escaped.
