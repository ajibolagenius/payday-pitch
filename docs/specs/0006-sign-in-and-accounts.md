# 0006. Sign in and accounts: Supabase Auth with email and password

**Date**: 2026-10-22
**Status**: In Progress

## Summary

Real accounts for Payday Pitch, built entirely on the Supabase Auth already chosen in spec 0001. People sign up with email and password, confirm the email through a branded link, and sign in on any device. Sessions live in cookies and last about a year with automatic renewal, so the installed app survives a phone browser restart. The app ships five screens (sign in, sign up, recover, set a new password, check your email) plus one callback route, and every money table stays private through the row level security already tested in spec 0004.

## Context

Slice 1 starts with the first match loop, and that loop needs a signed in person. Until accounts exist there is no owner for a formation, no privacy for financial data, and no way to follow a user across devices. Spec 0001 already fixed the platform (Supabase Auth, cookie sessions via `@supabase/ssr`, `getClaims()` for identification, Resend as the SMTP sender) and explicitly deferred to this spec: the sign in methods, the callback route, the redirect allow list, cookie lifetime, and how the profile row comes to exist. Spec 0004 already built the eleven tables, RLS policies, and the lazy `ensureProfile()` helper.

The audience shapes the choices. Salary earners in Nigeria on phones, many on modest devices and metered data, installing the app to the home screen. A session that dies on browser restart breaks the core habit loop (plan on payday, check in monthly). The data behind the account is personal financial information, so signup must prove the person owns the email, and the login surface must not confirm which emails have accounts. The build is one person on free tiers, so anything that adds a hosted moving part costs real attention.

What is _not_ decided here stays delegated: password and email change, account deletion, and consent records belong to feature 14 (Legal & data rights); a public landing and the free calculator are features 16 and 15.

## Requirements

**User stories**:

- As a new person, I want to create an account with my email so that my formation is saved and private.
- As a returning user, I want to stay signed in on my phone so that opening the installed app goes straight to my pitch.
- As a user who forgot a password, I want an email link to set a new one so that I never lose access to my history.
- As a person sharing a device, I want to sign out so that my money numbers vanish from the screen.

**Acceptance criteria** (the contract `/develop` builds to and `/check verify` checks):

- **AC-1**: A person can sign up with an email and a password of at least 8 characters. Supabase sends a confirmation email, and the account cannot sign in until the link is clicked.
- **AC-2**: A confirmed user can sign in with email and password and lands on `/app`; a signed out visitor to any `/app` path is redirected to `/sign-in`.
- **AC-3**: Right after signup the person sees a check-your-email screen showing the address used, with a resend button. Repeated resends are throttled (Supabase `max_frequency`, 1 minute), and a link click confirms the account and reaches `/app`. A person who returns before confirming, with no pending signup left in the cookie, gets a "confirm your email first" message on `/sign-in` with a working resend for the address they typed.
- **AC-4**: A person who requests recovery gets an email link; through it they reach a set-a-new-password screen, submit a password of at least 8 characters, and land signed in; the link is single use and expires within 24 hours.
- **AC-5**: Sign out clears the session cookies; a protected page opened afterwards redirects to `/sign-in`.
- **AC-6**: No signed-in user can read or write another user's rows, proven by the existing per-table Vitest isolation suite, plus a Playwright probe where user B requests user A's rows through the data API and receives nothing. (A same-browser empty-state check joins this criterion when feature 6 puts real data on `/app`.)
- **AC-7**: A session survives a full phone browser restart: the auth cookie is persistent (`persistSession: true` on the browser client, chunked HttpOnly cookies from `@supabase/ssr`), and the refresh token lifetime is about 1 year with rolling renewal. Rolling renewal means an actively used account is never forced to sign in again by age alone; see Consequences for the accepted risk.
- **AC-8**: `src/proxy.ts` (Next 16's name for middleware, Node runtime) refreshes the cookie and gates `/app` by cookie presence; the `(app)` layout re-checks with `getClaims()` and creates the profile row lazily via `ensureProfile()`. The proxy is convenience, the layout check is the guard.
- **AC-9**: Email links resolve through one route, `/auth/callback`. Its redirect target must exactly match an allow list (the environment's own origin), and any `next` parameter must pass the relative path rule: it starts with `/`, its second character is neither `/` nor `\`, and it carries no scheme or host. `//evil.example` and `https://evil.example` are both rejected. A foreign or malformed target falls back to `/app`. Email links themselves never carry `next`: a confirmation link lands `/app`, a recovery link lands `/reset-password`.
- **AC-10**: Confirmation and recovery emails are the branded templates built with react-email: local Supabase serves them from `supabase/templates/` through `config.toml`, production receives the rendered HTML pasted into the dashboard, with the same file as the source of truth. The rendered HTML keeps Supabase's own placeholders (`{{ .ConfirmationURL }}`, `{{ .RecoveryURL }}`) as the link target; the render script substitutes nothing.
- **AC-11**: Sign-in and recovery forms give one identical vague message for a wrong email or wrong password (Supabase enumeration protection on), and a dead or already-used link lands on `/sign-in?reason=expired` with a clear "the link is invalid or has expired" message.
- **AC-12**: A session that cannot be refreshed (revoked or expired refresh token) lands on `/sign-in?reason=expired` showing "You were signed out. Sign in again.", never a bare redirect.

## Options considered

### Option 1: Supabase Auth, email and password, `@supabase/ssr` cookies

Use the BaaS the project already runs. Signup sends a confirmation email, sign-in exchanges the password for a JWT pair stored in chunked HttpOnly cookies, `getClaims()` verifies locally, recovery is a built-in flow. All configuration is dashboard and `config.toml` values plus the app's own routes.

**Pros**:

- Zero new services, zero extra cost, and the RLS and isolation tests from spec 0004 already assume exactly this identity model.
- Confirmation, recovery, throttling, and enumeration protection are product features of Supabase, not code to write and secure.

**Cons**:

- Auth settings live half in the dashboard and half in `config.toml`, and the dashboard half is not versioned, so drift is possible.
- Coupling: leaving Supabase later means rewriting auth and every RLS policy (already noted in spec 0001).

### Option 2: Supabase Auth, magic link only

No passwords; every sign-in is an emailed one-time link.

**Pros**:

- No password to forget, recovery becomes trivial (just another link).

**Cons**:

- Every sign-in depends on email delivery speed, and on a phone the hop from mail app to browser is clunky; a user offline with a dead link is locked out of an app meant to be opened on payday.

### Option 3: Auth.js (NextAuth) with Supabase Postgres

A dedicated auth library in the app, storing sessions in the existing database.

**Pros**:

- Provider-agnostic and portable if the project ever leaves Supabase.

**Cons**:

- Self-hosted session, CSRF, and token rotation code on a financial product, plus a second identity store to keep consistent with `auth.users` that RLS already depends on. This duplicates what Option 1 gives for free.

### Option 4: A hosted auth provider (Clerk, Auth0, Stytch)

A separate managed service with polished components and dashboard knobs.

**Pros**:

- The best turnkey UX for social logins and MFA when those arrive.

**Cons**:

- A monthly cost that scales with users, a second vendor holding identity data for financial users, and RLS policies would need token verification reworked around its JWTs.

## Decision

**Chosen option**: Option 1: Supabase Auth, email and password, `@supabase/ssr` cookies

Sign in is email plus password only, email confirmation required before access, sessions persistent with a rolling ~1 year refresh token, and the four flows (sign up, sign in, sign out, recover) are the whole account surface for this slice.

**Implementation skills**: `react-email` (`resend/react-email`, `.agents/skills/react-email/`) · `resend` (`resend/resend-skills`, `.claude/skills/resend/`) · `email-best-practices` (`resend/email-best-practices`, `.claude/skills/email-best-practices/`) · `vitest` (`antfu/skills`, `.claude/skills/vitest/`)

## Rationale

Option 1 is the only option that adds no service, no cost, and no new security code, while every force in Context pulls the same way: RLS policies already check `auth.uid()` (spec 0004), spec 0001 pre-committed the platform and named this feature as the place its details get decided, and a solo builder should not own session crypto on a money app. The known failure pattern "reinventing auth" is exactly what Options 3 and 4 flirt with. Email plus password over magic link because the habit loop demands instant access offline from mail, and a password is the one credential a Nigerian user already manages for banking apps; magic link can be added later as a second door without schema change. The dashboard drift con is accepted and countered by a checklist in Follow-up.

RECOMMEND calls made with the engineer's answers fixed: sign-in and sign-up plus the recovery and resend steps are the only Server Actions exempt from `authedAction()` (spec 0001 rule); the recovery email address input gives the same vague success as a real request (enumeration protection); the `(app)` layout is the guard, the proxy only makes it feel fast; email links carry no destination at all, so the one place an attacker could plant a redirect inside a message a user trusts is closed off entirely; the pending signup email travels in a short httpOnly cookie rather than the URL, where a screenshot or a shared link could leak it.

react-email stays even though two emails could be hand-written HTML: feature 10 (Payday reminders) needs the same component system for reminder mail, and the design.md voice and tokens come along for free, so the toolchain is built once here and reused twice there.

## Feature design

**Data model sketch** (no new tables, no migration; the confirmed target is spec 0004's):

- `auth.users` (managed by Supabase): email, encrypted password, confirmation and recovery metadata. The app never reads it directly except through Auth APIs.
- `public.profile`: `user_id` PK ref `auth.users` cascade, `default_currency` char(3) default `NGN`, `created_at`. Created lazily by `ensureProfile()` on first authenticated read (AC-8), as planned in spec 0004 AC-10. No trigger on `auth.users`.

**State transitions** (account, as seen by the app):

`signed up (unconfirmed)` → `confirmed` (email link clicked) → `active` (signed in) ; `active` → `signed out` (explicit) ; `any` → `recovering` (reset link verified, session held for the password step only) → `active` (new password saved). Supabase owns these states; the app only observes them.

**API surface**:

| Surface                                                                   | Kind                                  | Key inputs                                                                       | Key outputs / behavior                                                                                                                                                  | Auth                                  | Key errors                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/sign-up` (in `(auth)`)                                                  | Page + `signUpAction` (Server Action) | email:string (req, trimmed and lowercased), password:string (req, min 8, max 72) | Sets the `pending-signup` cookie, redirects to `/verify-email`                                                                                                          | public                                | email already used: still routes to `/verify-email` (no enumeration)                                   |
| `/sign-in` (in `(auth)`)                                                  | Page + `signInAction`                 | email:string (req), password:string (req)                                        | PKCE password exchange inside the action, cookies set on the response, redirect to validated `next` or `/app`                                                           | public                                | wrong email or wrong password: one identical vague message (enumeration protection)                    |
| `/sign-in` (same page)                                                    | `resendFromSignInAction`              | email:string (req)                                                               | Resends confirmation for the typed address when Supabase reports the account is unconfirmed                                                                             | public                                | throttled: "wait a minute and try again"; unknown email: the same vague message as a failed sign-in    |
| `/recover` (in `(auth)`)                                                  | Page + `recoverAction`                | email:string (req)                                                               | Always "if that email has an account, a link is on its way"                                                                                                             | public                                | none surfaced                                                                                          |
| `/verify-email` (in `(auth)`)                                             | Page + `resendConfirmationAction`     | none (email read from the `pending-signup` cookie)                               | Shows the address, offers resend, offers "wrong email? start over" back to `/sign-up`                                                                                   | public                                | throttled: "wait a minute and try again"; cookie missing: "confirm your email from the sign-in screen" |
| `/reset-password` (in `(auth)`)                                           | Page + `resetPasswordAction`          | password:string (req, min 8, max 72), confirm:string (req)                       | `updateUser` with the new password under the session the callback just established, then lands on `/app`                                                                | authenticated (recovery session only) | weak or mismatched password: field error; session lost mid-flow: back to `/recover`                    |
| `/auth/callback` (`src/app/auth/callback/route.ts`, outside route groups) | Route handler (GET)                   | `token_hash`:string, `type`:signup or recovery, `next`:string (opt)              | Verify the link with `verifyOtp`, establish the session, redirect (confirmation to `/app`, recovery to `/reset-password`)                                               | public (single-use token)             | dead, reused, or expired link: redirect `/sign-in?reason=expired`                                      |
| Header (signed in)                                                        | `signOutAction`                       | none                                                                             | `signOut()` plus removal of all auth cookies, then redirect `/sign-in`                                                                                                  | authenticated                         | none                                                                                                   |
| `src/proxy.ts`                                                            | Middleware (Node runtime)             | request cookies                                                                  | Refresh the session, then gate on cookie presence: no `sb-` auth cookie (chunked names like `sb-<ref>-auth-token.0`) on an `/app` path redirects to `/sign-in?next=...` | n/a                                   | session cannot be refreshed: `/sign-in?reason=expired`                                                 |
| `src/app/(app)/layout.tsx`                                                | Server Component                      | cookies                                                                          | `getClaims()` (the real guard), `ensureProfile(sub)`, render slot                                                                                                       | authenticated                         | no claims: redirect `/sign-in?next=path`                                                               |

One mechanism per flow, deliberately: email links carry `token_hash` and are verified with `verifyOtp`, so the callback holds no PKCE code path; the PKCE code exchange happens only inside `signInAction` for the password form. The browser client (`src/lib/supabase/client.ts`) sets `persistSession: true`; the server client uses `@supabase/ssr` cookie storage.

Forms use `useActionState` and return `ActionResult` (spec 0001 write convention). The browser Supabase client appears only on the four auth screens, per spec 0001.

**Value sourcing**:

| Action                    | Value produced / displayed          | Source                                                                                                                                                              |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| signUpAction              | email shown on `/verify-email`      | the validated signup input, written to the httpOnly `pending-signup` cookie (maxAge 15 minutes) and read back there, never on the URL                               |
| signUpAction              | the new user's id                   | Supabase signup response; discarded by this slice (nothing reads it yet), email only                                                                                |
| resendConfirmationAction  | the email to resend to              | the `pending-signup` cookie, passed to Supabase `resend(email, "signup")`, throttled by `max_frequency`                                                             |
| resendConfirmationAction  | throttle state                      | Supabase returns the rate-limit error when `max_frequency` has not passed; surfaced as the `ActionResult` error "wait a minute and try again"                       |
| resendFromSignInAction    | the email to resend to              | the address typed into the sign-in form, used server-side only, after Supabase reports the account is unconfirmed                                                   |
| signInAction              | post-signin destination             | `next` query param through the relative path validator, else `/app`                                                                                                 |
| signInAction              | session                             | Supabase PKCE password exchange via the `@supabase/ssr` server client, cookies set on the response                                                                  |
| authedAction (all writes) | `userId`                            | `getClaims()` and its `sub` claim, never a client param (spec 0001)                                                                                                 |
| (app) layout              | profile row existence               | `ensureProfile(sub)` (src/features/profile/profile.ts)                                                                                                              |
| /auth/callback            | user identity                       | `verifyOtp(token_hash, type)` against Supabase Auth; no other identity source                                                                                       |
| /auth/callback            | redirect target                     | fixed per link type by this spec (confirmation to `/app`, recovery to `/reset-password`); a `next` param is honored only on in-app navigations, never from an email |
| resetPasswordAction       | whose password changes              | the session the callback established for the recovery link, read through `getClaims()`                                                                              |
| resetPasswordAction       | the new password                    | form input, Zod validated (min 8, max 72, confirm match)                                                                                                            |
| signOutAction             | the cookies to remove               | `cookieOptions` from `@supabase/ssr` plus the `pending-signup` cookie                                                                                               |
| signOutAction             | the cached pages to drop            | a `signed-out` message posted to the service worker from the client that submitted the form (spec 0001 offline rule)                                                |
| proxy gate                | "is there a session"                | presence of a `sb-` prefixed auth cookie, matching the chunked names (`...-auth-token.0`, `.1`) that `@supabase/ssr` writes                                         |
| emails                    | confirmation and recovery link URLs | Supabase builds them from the project site URL into `/auth/callback`; the template only places `{{ .ConfirmationURL }}` or `{{ .RecoveryURL }}` as the href         |
| reason=expired            | message text                        | static copy keyed on the query param value                                                                                                                          |

Form schemas (Zod, shared in `src/features/auth/schemas.ts`): email is trimmed and lowercased before validation and before it reaches Supabase (case consistency is what keeps enumeration protection and the e2e suite honest), min length 3, max 254. Password is min 8, max 72 (Supabase's own bcrypt ceiling; a longer value would be silently truncated on the server).

**Key invariants**:

- A write path never trusts a client supplied `user_id`; identity comes only from `getClaims()` (spec 0001 rule).
- Every redirect the auth flows honor passes the relative path rule (starts with `/`, second character is neither `/` nor `\`, no scheme or host) or exactly matches the environment's own origin. `//evil.example` fails it. No open redirects, and email links carry no destination at all.
- Authorization never reads `user_metadata` (users can edit it).
- The service worker never caches auth routes or Server Action POSTs (spec 0001 offline rule, already written into `public/sw.js`); verify it stays true.
- Signing out also clears the signed-in navigations from the service worker cache, through the `signed-out` message, before the redirect completes. Cached money pages must not survive logout in the same browser profile.
- The `pending-signup` cookie holds an email address only, lives at most 15 minutes, and is dropped on confirmation, on successful sign-in, and on sign out.
- Passwords are only ever sent over the server (Server Action), never compared in the browser.

**Security model**:

Each authenticated user sees only their own rows, enforced by the RLS policies and grants shipped in spec 0004 and re-proven by its isolation suite (AC-6). Roles: `anon` (auth endpoints only, no data grants) and `authenticated` (data grants, all policies ownership-checked). No admin or user-facing role beyond these; service role stays server-side for tests and feature 14. One honest exception to enumeration protection: Supabase itself distinguishes an unconfirmed account at password sign-in, and this spec surfaces that as "confirm your email first" with a resend (AC-3) rather than fight it. It reveals only that an unconfirmed signup exists, it does not confirm a working account, and the dead-end it would otherwise create is worse than the signal. Compliance: NDPR basics (consent capture, export, deletion) are feature 14's scope; this feature lays its foundation by proving email ownership at signup and protecting against account enumeration (AC-11). Supabase built-in per-IP and per-user throttling guards the auth endpoints; no CAPTCHA for now, revisit at Slice 7 with Upstash Ratelimit (spec 0002 roadmap).

**Configuration required**:

- `SITE_URL`: server-only, this environment's public origin (`http://127.0.0.1:3000` locally). Used for the callback allow list and passed to Supabase auth options for email redirects. Added to `.env.example` and validated in `src/lib/env.ts` lazily, at first Supabase client creation, so public pages still render without keys (spec 0001 rule).
- `supabase/config.toml` (local): `[auth] site_url = "http://127.0.0.1:3000"`; `[auth.email] enable_confirmations = true` (spec 0001 states confirmation is on locally; the scaffold currently ships `false`, this feature flips it), `max_frequency = "1m"`, `otp_length = 8`, `otp_expiry = 86400` (one 24 hour lifetime shared by confirmation and recovery links, since both are email OTPs); `[auth.email.template.confirmation]` and `[auth.email.template.recovery]` `content_path` → `supabase/templates/*.html`.
- Flipping `enable_confirmations` locally means every test user must be created already confirmed: the spec 0004 isolation helper switches to `supabase.auth.admin.createUser({ email_confirm: true })` in this same PR, or that suite fails the moment the flag changes.
- Production Supabase dashboard (manual, checklist in Follow-up): confirmation required, minimum password length 8, refresh token validity ~1 year with rolling renewal on, email link and OTP expiry 24 hours, enumeration protection on, Site URL set to the deployed origin.
- No new `NEXT_PUBLIC_` variables; existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` cover the browser client.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: signup → confirmation email read in the local mail viewer (Inbucket) → link click → signed in on `/app` → restart the browser process → still signed in. Verifies **AC-1**, **AC-3**, **AC-7**.
- Happy path (recovery): request a reset → open the link → land on `/reset-password` → set a new password of at least 8 characters → arrive signed in on `/app`, and the old password no longer works. Verifies **AC-4**.
- Failure case: sign in with a wrong email, then with a real email and a wrong password, then request recovery for an unknown email: all three give the same vague message; open an already-used or expired link: `/sign-in?reason=expired`. Verifies **AC-11**, **AC-4**.
- Failure case (unconfirmed return): sign up, close the browser, let the `pending-signup` cookie expire or be cleared, then sign in: the "confirm your email first" message with a resend button that delivers a working link. Verifies **AC-1**, **AC-3**.
- Auth/permission: user B, authenticated, requests user A's rows through the data API (a `profile` row and one money table by A's id): both come back empty, and the Vitest isolation suite passes unchanged. Verifies **AC-2**, **AC-6**.
- Edge case (open redirect): a `next` value of `https://evil.example`, `//evil.example`, or `/\evil.example` is replaced by `/app`, in the sign-in action, the layout redirect, and the proxy gate alike. Verifies **AC-9**.
- Edge case (logout hygiene): sign out, then reload a previously visited `/app` path with the network down: no cached money page appears, and the signed-out service worker cache is empty of `/app` navigations. Verifies **AC-5**.
- Stale session: with the refresh token revoked through the admin API, navigate to `/app`: `/sign-in?reason=expired` shows "You were signed out. Sign in again." Verifies **AC-8**, **AC-12**.

## Build plan

Tracer Bullet ordering: one thin real thread (client plumbing → gate → forms → email loop) first, then the branded surface, then proof. This is the slice 1 thread spec 0001 envisioned.

1. Add `@supabase/ssr` cookie clients (`src/lib/supabase/client.ts` with `persistSession: true`, extend `server.ts` with the cookie-based server client), `SITE_URL` in `src/lib/env.ts` and `.env.example`, and the shared Zod schemas plus the relative path validator in `src/features/auth/`. Satisfies **AC-2**, **AC-7**, **AC-9**
2. Create `src/proxy.ts` session refresh plus cookie-presence gate (matching the chunked `sb-` cookie names), and the `(app)` layout guard: `getClaims()`, redirect with a validated relative `next`, `ensureProfile()` call. Satisfies **AC-2**, **AC-8**
3. Build the five auth screens with their Server Actions (`signUpAction` with the `pending-signup` cookie, `signInAction`, `resendFromSignInAction`, `signOutAction`, `recoverAction`, `resendConfirmationAction`) using `useActionState` and `ActionResult`; wire the `reason=expired` banner and the "wrong email? start over" affordance on `/verify-email`. Satisfies **AC-1**, **AC-3**, **AC-5**, **AC-11**, **AC-12**
4. Implement `/auth/callback` (`verifyOtp` against `token_hash` for the signup and recovery types, recovery landing on `/reset-password`, exact-origin allow list, relative path rule for any in-app `next`), then `resetPasswordAction` behind it. Satisfies **AC-1**, **AC-4**, **AC-9**
5. Make sign out post a `signed-out` message to the service worker and confirm `public/sw.js` drops `/app` navigations, so no cached money page outlives the session (spec 0001 offline rule). Satisfies **AC-5**
6. Flip local auth settings in `supabase/config.toml` (confirmations on, `max_frequency` 1m, OTP length 8 and expiry 24h, template paths) and switch the spec 0004 isolation helper to `createUser({ email_confirm: true })` in the same change. Satisfies **AC-1**, **AC-3**, **AC-6**
7. Build react-email templates (confirmation, recovery) as small components plus a render script producing `supabase/templates/*.html`, keeping `{{ .ConfirmationURL }}` and `{{ .RecoveryURL }}` as literal hrefs; match design.md voice and tokens. Satisfies **AC-10**
8. Playwright e2e against local Supabase: signup, confirm, sign in, browser restart, recovery through `/reset-password`, sign out with the cache check, plus the cross-user API isolation probe and the open-redirect cases; keep a Vitest unit test for the `next` validator and the form schemas. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-9**, **AC-11**, **AC-12**

## Consequences

**Positive**:

- Real private accounts with zero new services and zero new cost; the whole GA workflow (Playwright, isolation suite) runs against local Supabase.
- Installed-app feel: one-year rolling sessions survive restarts, which is what the payday habit loop needs.
- Every later feature inherits a working identity: reminders (feature 10), legal flows (feature 14), and the public calculator handoff (feature 15) all hang off `auth.uid()`.

**Negative / tradeoffs**:

- Production auth settings live in the dashboard and are not versioned; a new project or an accidental click silently changes security behavior. Mitigated by the checklist below, not by code.
- Email confirmation adds a step between signup and first value; a user whose confirmation mail lands in spam is stuck until they use resend or recovery. The dedicated check-your-email screen (AC-3) is the mitigation.
- Enumeration protection makes the form deliberately vague, so a person who mistypes their email at signup sees "check your email" for an address they do not own, and recovery stays equally vague, which means they cannot discover the typo by probing. Mitigated by the "wrong email? start over" affordance on `/verify-email` (AC-3), not solved: accepted for a financial product where account discovery is the bigger risk.
- A rolling one year session has no absolute ceiling: an account in daily use is never forced to re-authenticate by age alone, which OWASP discourages for financial data on a phone that may be shared. Supabase offers no separate absolute timeout, and turning rolling renewal off would give a worse experience (a hard logout one year from login regardless of use). The risk is accepted in writing here; the mitigations are device passcode, explicit sign out on shared devices (AC-5), and the service worker cache clear on logout.
- Local Supabase auth rate limits (per-IP) are strict; the e2e suite must reuse one browser context per user story and confirm users through the mail viewer rather than hammering endpoints.
- The proxy refreshes the session on every `/app` navigation, which adds one network round trip to Supabase on top of the page render. On a metered Lagos connection that is a real cost in milliseconds, bought for the sake of a session that quietly renews itself instead of logging people out.

**Neutral**:

- First authenticated surface after this slice remains the placeholder `/app` page until feature 6 (First match loop) fills it.
- `src/features/auth/` joins the feature-folder layout; auth actions are the only ones exempt from `authedAction()` (spec 0001 rule made explicit here).

## Follow-up

- [ ] Production Supabase dashboard checklist before first real sign up: Site URL, confirmation required, min password length 8, refresh token ~1 year rolling, email link and OTP expiry 24 hours, enumeration protection on, Resend SMTP enabled (spec 0001 already notes domain verification), paste both template HTML files into Auth → Email templates.
- [ ] When feature 6 puts real data on `/app`, extend the e2e suite with the same-browser check that user B sees an empty state rather than user A's numbers (the API-level probe in this spec covers the isolation half until then).
- [ ] The `react-email` skill is now installed (`resend/react-email`, at `.agents/skills/react-email/`) but not yet listed in root `AGENTS.md` `## Skills`; `/sync` owns that edit. The two MCP servers picked (Supabase at `https://mcp.supabase.com/mcp`, Resend at `https://resend.com/mcp`) are connected in the user's own CLI settings and would then belong on that section's `MCP servers:` line.
- [ ] Slice 7 (Go Public): revisit CAPTCHA on auth forms and Upstash Ratelimit for auth endpoints, per the spec 0002 hardening roadmap.
- [ ] Feature 14 (Legal & data rights): change password, change email, delete account (needs `SUPABASE_SECRET_KEY`), consent timestamp on signup, NDPR export.
- [ ] Decide later whether "Continue with Google" gets added; email plus password first keeps this slice honest.

## References

**Project sources**:

- Spec 0001 `## Architecture conventions` (auth gating, `getClaims()`, `authedAction()` exemptions, browser client only on auth screens, SMTP via Resend, `src/proxy.ts`)
- Spec 0004 (profile lazy upsert AC-10, RLS isolation suite, `ensureProfile()` in `src/features/profile/profile.ts`)
- Spec 0002 (rate limiting and CAPTCHA deferred to Slice 7)
- Root `AGENTS.md` golden rules and conventions (Zod, ActionResult, no client `user_id`)
- `design.md` (voice and tokens for the auth emails and screens)

**Practices & standards**:

- OWASP session management guidance (persistent secure HttpOnly cookies, revocation on logout; its absolute session lifetime advice is consciously deviated from, with the reason recorded in Consequences)
- OWASP account enumeration prevention (uniform responses on sign-in and recovery)
- Open redirect defense: allow list plus relative-path-only rule for any redirect parameter
- BaaS-first recommendation (prefer the platform's built-in auth over adding a provider or library)
