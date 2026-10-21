# 0001. Next.js and Supabase stack for an installable web app

**Date**: 2026-10-20
**Status**: Accepted

## Summary

Payday Pitch will be one TypeScript web app built with Next.js, hosted on Vercel, with Supabase providing the database and sign in. Every table is locked to its owner by row level security (rules inside the database that stop anyone reading another person's money), so a bug in app code cannot leak data. Phones can install it like an app, and it opens offline with your last viewed screens, but saving needs a connection. It runs on free tiers while you build, with about $45 a month planned once it goes public.

## Decision

**Chosen option**: Option 1: Next.js 16 + Supabase on Vercel

One full stack Next.js app (a modular monolith: one deployable, organized by feature) talks to Supabase Postgres through supabase-js as the signed in user, so row level security enforces isolation, with Server Actions behind one auth wrapper for every write and a hand written service worker for install and offline.

**Implementation skills**: `supabase` (`~/.claude/skills/supabase/`) · `supabase-postgres-best-practices` (`~/.claude/skills/supabase-postgres-best-practices/`) · `tailwindcss` (`~/.claude/skills/tailwindcss/`) · `vercel:nextjs` (Vercel plugin) · `vercel:shadcn` (Vercel plugin) · `playwright-cli` (`~/.claude/skills/playwright-cli/`) · `resend` (`resend/resend-skills`, `.claude/skills/resend/`) · `email-best-practices` (`resend/email-best-practices`, `.claude/skills/email-best-practices/`) · `vitest` (`antfu/skills`, `.claude/skills/vitest/`)

## Proposed stack

| Layer              | Choice                                                                                                                                | Reason                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture       | Modular monolith: one Next.js app, single repo                                                                                        | A solo builder ships and debugs one deployable fastest; nothing here needs a separate service.                                                                                  |
| Language / runtime | TypeScript (`strict`), Node 24 LTS                                                                                                    | One language from database types to UI; strict mode catches null and money bugs early.                                                                                          |
| Package manager    | pnpm (lockfile committed, versions pinned)                                                                                            | Fast, strict about undeclared dependencies, supported by Vercel and Actions.                                                                                                    |
| Framework          | Next.js 16, App Router, `src/` directory, Turbopack (default), React Compiler off, `cacheComponents` off                              | Server rendering for the public pages, Server Actions for writes, best AI and ecosystem support. Defaults kept to avoid surprises; revisit the compiler later.                  |
| Styling            | Tailwind CSS v4, CSS first config in `src/app/globals.css`, tokens as CSS variables                                                   | Brand tokens defined once; no runtime cost. Token values come from the design system spec (feature 4).                                                                          |
| Components         | shadcn/ui, copied into `src/components/ui/`                                                                                           | Accessible primitives (focus, keyboard, screen readers) you fully restyle to the football look.                                                                                 |
| Fonts              | Space Grotesk through `next/font`                                                                                                     | Self hosted at build, no layout shift, no third party request.                                                                                                                  |
| Validation         | Zod 4                                                                                                                                 | Validates every Server Action input and the environment variables.                                                                                                              |
| Money              | Integer minor units (kobo) + ISO 4217 code, in `src/domain/money.ts`                                                                  | Exact by construction; largest remainder allocation keeps split parts summing to the total; `Intl.NumberFormat` for display. No dependency.                                     |
| Primary DB         | Supabase Postgres, region London (`eu-west-2`) unless the latency test says otherwise                                                 | Relational data with constraints; London has short routes from Lagos.                                                                                                           |
| DB access          | `supabase-js` + `@supabase/ssr`, types committed to `src/lib/supabase/database.types.ts`                                              | Queries run as the user, so RLS is the isolation guarantee, not app code. Complex reads use SQL views (`security_invoker`) or functions.                                        |
| Migrations         | Supabase CLI SQL files in `supabase/migrations/`                                                                                      | Tables, constraints, grants, and RLS policies live together in plain SQL.                                                                                                       |
| Auth               | Supabase Auth (cookie sessions via `@supabase/ssr`), JWT signing keys enabled                                                         | Built in, recovery included, 50k monthly users free. Signing keys let `getClaims()` verify tokens locally. Sign in methods and auth plumbing are decided in the feature 5 spec. |
| Writes             | Server Actions through one `authedAction()` wrapper; forms use `useActionState`                                                       | One enforced server side gate per write; forms work before JavaScript loads on weak phones.                                                                                     |
| Email              | Resend, plugged into Supabase Auth as custom SMTP                                                                                     | Supabase's built in mailer is development only; Resend's free tier covers auth mail now and reminder mail later.                                                                |
| PWA                | `src/app/manifest.ts` + hand written `public/sw.js`                                                                                   | Install plus offline shell in a small file, with no build plugin to fight Turbopack; the same file handles push later.                                                          |
| Background jobs    | None yet. Decided in the Payday reminders spec (feature 10), leaning Supabase Cron                                                    | Nothing is scheduled before Slice 5; Supabase Cron keeps jobs beside the data and inside the portability rule.                                                                  |
| File storage       | None                                                                                                                                  | No feature stores files.                                                                                                                                                        |
| Hosting            | Vercel, functions pinned to the database region (`lhr1` for London). Hobby while building, Pro with a hard spend cap before Go public | Smoothest Next.js host; the spend cap stops a viral day becoming a surprise bill.                                                                                               |
| Environments       | Local Supabase (CLI, Docker) + one hosted production project                                                                          | Keeps the second free project spare; add staging once real users exist.                                                                                                         |
| Testing            | Vitest (domain maths, server logic, RLS isolation against local Supabase) + Playwright (phone viewport, real loop)                    | Fast unit tests for money; browser tests for the GA sign in and the core loop.                                                                                                  |
| CI                 | GitHub + GitHub Actions + Vercel preview deploys                                                                                      | Every PR proves itself before merge; free at this size.                                                                                                                         |
| Observability      | Vercel runtime logs only, until the feature 13 spec picks error tracking                                                              | Pre launch the only user is you; the tool choice belongs with the analytics decision.                                                                                           |
| Lint / format      | Decided by `/audit` in feature 2                                                                                                      | Tooling is chosen against the real scaffold.                                                                                                                                    |

## Architecture conventions

These bind every later slice. `/audit` (feature 2) should carry them into `AGENTS.md`.

**Code layout and routes**

```
src/app/(marketing)/       public pages, landing at /  (scaffold puts a placeholder here)
src/app/(auth)/            /sign-in, /sign-up, /recover
src/app/(app)/app/         every signed in page lives under /app
src/app/offline/           offline fallback page
src/app/manifest.ts        web app manifest
src/domain/                pure TypeScript: money.ts, formations.ts (static formation data), dates.ts
                           no imports from next, react, or supabase
src/features/<feature>/    actions.ts, queries.ts, schemas.ts (Zod), components/
src/lib/actions.ts         authedAction() and ActionResult
src/lib/supabase/          server.ts, client.ts, database.types.ts (generated, committed)
src/lib/env.ts             Zod validated environment
src/components/ui/         shadcn components
src/proxy.ts               session refresh and /app gating (Next 16's name for middleware, Node runtime)
supabase/migrations/       SQL migrations
supabase/seed.sql          local seed data
public/sw.js               service worker
tests/e2e/                 Playwright
```

- Imports use the `@/` alias for `src/`. File names are `kebab-case`. Unit tests sit beside their file as `*.test.ts`.
- Node is pinned through `.nvmrc`, `engines`, and the `packageManager` field.

**Data isolation (non negotiable, personal financial data)**

- Every table in `public` has RLS enabled in the same migration that creates it, with explicit `GRANT`s to `authenticated` only (never `anon`, except for anything feature 15 deliberately makes public).
- Policies use `to authenticated` plus an ownership check: `using ((select auth.uid()) = user_id)`; `UPDATE` policies carry both `using` and `with check`.
- Views are created `with (security_invoker = true)`. A `security definer` function or a trigger on `auth.users` lives in a non exposed `private` schema and checks `auth.uid()` where relevant.
- Every table ships with a Vitest isolation test in the same PR: two users against local Supabase, and user B can neither read nor change user A's rows.
- Server code identifies the user with `supabase.auth.getClaims()`, never `getSession()`. Server Actions never accept a `user_id` from the client.
- The Supabase secret key is server only, never `NEXT_PUBLIC_`, and is used only where RLS cannot apply (account deletion in feature 14) and in tests against local Supabase.
- Authorization never reads `user_metadata` (users can edit it).
- No real person's financial data enters the hosted project until it is on Supabase Pro (backups, no pausing). Data before then is disposable test data.

**Auth gating**

- `src/proxy.ts` refreshes the session cookie and redirects any signed out request under `/app` to `/sign-in`.
- The `(app)` layout checks `getClaims()` again (the proxy is a convenience, not the guard), and every Server Action is guarded by `authedAction()`.
- Callback routes, redirect allow lists, and cookie lifetime belong to the feature 5 spec.

**Writes**

- Every Server Action is built with `authedAction(schema, handler)` from `src/lib/actions.ts`: it parses input with Zod, gets the user with `getClaims()`, and passes the user and a user scoped Supabase client to the handler. No action is exported without it (except sign in and sign up, which feature 5 defines).
- Actions return `ActionResult<T>` = `{ ok: true, data: T } | { ok: false, error: { code: string, message: string, fieldErrors?: Record<string, string[]> } }`. Expected failures are returned, never thrown. Unexpected errors throw to the nearest `error.tsx` and are logged with no amounts.
- After a write, the action calls `revalidatePath` for the affected pages.

**Reads and caching**

- Pages read in Server Components through `features/<feature>/queries.ts`, which maps database rows to domain types.
- Signed in data is never cached on the server (`cacheComponents` off, no `use cache` on user data); signed in routes are dynamic.
- The browser Supabase client is used only on the auth screens.
- Landing page and free calculator are static; the calculator does its maths in the browser with `src/domain`.

**Money**

- In code an amount is `{ minor: number, currency: string }`, where `minor` must be a safe integer (`Number.isSafeInteger`); anything else is rejected. No float anywhere in a money path.
- Percentages are integer basis points (100% = 10000); a split's basis points always sum to 10000.
- Splits use largest remainder allocation so parts sum exactly to the income.
- `src/domain/money.ts` is the only place amounts are created, split, or formatted. Column types and table shapes are set by the data model spec (feature 3).

**Time**

- Calendar dates (paydays) are `date`; moments are `timestamptz`.
- "This month" is the calendar month in `Africa/Lagos`, computed in `src/domain/dates.ts`, never from the server's UTC clock. Display through `Intl`; add a date library only when `Intl` falls short.

**Offline (service worker)**

- The page registers `/sw.js?v=<commit SHA>` (from `VERCEL_GIT_COMMIT_SHA`, or `dev` locally); the worker reads its version from its own URL and names its caches with it. On `activate` it deletes caches from other versions.
- On install it precaches `/offline` and the app icons.
- `/_next/static/*` is cache first (file names are content hashed).
- Only full page navigations (`request.mode === 'navigate'`) are cached: network first, falling back to the cached copy, then `/offline`. Requests for React Server Component payloads (the `_rsc` parameter or `RSC` header), POSTs, Server Actions, and auth routes are never cached.
- Signed in pages go in a cache named for the signed in user. The page tells the worker who is signed in; the worker drops any page cache for a different user, and sign out clears all page caches. This does not rely on `Clear-Site-Data`, which Safari ignores.
- A new worker waits; the page shows a "new version, refresh" prompt and only then tells it to take over (no silent `skipWaiting`).

**Manifest**

- Placeholder values until feature 4: name "Payday Pitch", short name "Payday Pitch", `start_url: /app`, `display: standalone`, `theme_color: #1B4638`, icons 192 and 512 plus a maskable icon, and an `apple-touch-icon`.

**Portability rule**

- No Vercel only runtime APIs: no `@vercel/*` runtime packages, Vercel KV, Edge Config, Blob, or Vercel Cron. Standard Next.js APIs only, so a move to Cloudflare through OpenNext stays cheap. Region and build settings in `vercel.json` are fine.

**Environments, database workflow, and CI**

- `src/lib/env.ts` validates the Supabase variables when a Supabase client is first created, not at startup, so public pages render without keys. `.env.example` is committed; `.env.local` is not.
- Local development and CI run against local Supabase (`supabase start`), seeded from `supabase/seed.sql`. Email confirmation is on locally; auth emails appear in the local mail viewer that `supabase start` runs.
- `pnpm db:types` regenerates `database.types.ts`; CI fails if the committed file differs from the migrations.
- Production migrations are pushed by hand with `supabase db push` before the code that needs them is merged. Migrations stay backward compatible (add first, remove later), so deployed code never breaks mid release.
- Vercel preview deploys get no Supabase keys: they show public pages for visual checks only. Data paths are proven in CI.
- CI on every PR: typecheck, Vitest, `pnpm db:types` drift check, build, and a Playwright job that runs `supabase start`. A lint job is added with feature 2.

## Configuration required

- `NEXT_PUBLIC_SUPABASE_URL`: project URL (local or production).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key for browser and server clients.
- `SUPABASE_SECRET_KEY`: server only. Local value used by tests; the production value is added first by feature 14.
- Resend SMTP credentials live in the Supabase dashboard (Auth → SMTP), not in app env.

## Consequences

**Positive**:

- Isolation lives in the database and is tested per table: a forgotten filter in app code cannot leak another user's money.
- One language, one deployable, one data platform: low operating load for a solo builder.
- Pure `src/domain` is easy to test and is reusable by the free calculator and any future native app.
- $0 while building.

**Negative / tradeoffs**:

- Coupled to Supabase Auth and RLS. The Postgres data moves easily; auth and policies would need rewriting to leave.
- Free tier risks: the production project pauses after 7 idle days before launch, the database caps at 500 MB, and there is no point in time recovery. Hence no real data before Supabase Pro ($25/mo).
- Going public costs about $45/mo (Vercel Pro $20 + Supabase Pro $25), plus any spike overage up to the cap you set.
- Resend's free tier sends 100 emails a day; a busy launch day of sign ups could hit it.
- supabase-js is weaker than an ORM for joins and reports; the Season view will lean on SQL views or functions.
- Server Actions are Next.js specific. A future native app would call supabase-js directly (safe because of RLS) or need route handlers.
- You own the service worker: caching bugs, stale shells, and per user cache clearing are yours to test (offline, back and forward, install on iOS).
- Manual `supabase db push` relies on discipline until a staging project and automated deploys exist.
- Preview deploys cannot exercise signed in flows until a staging project exists.
- Serverless functions have cold starts, and London adds roughly 80 to 120 ms round trip from Lagos.
- No error tracking until Slice 7.

**Neutral**:

- Next.js 16 names middleware `proxy.ts`; many guides online still say `middleware.ts`.
- New tables need explicit grants to be reachable through Supabase's Data API.
- Scheduled jobs, push, charts, error tracking, sign in methods, and table shapes are left to their own feature specs.

## Follow-up

- [ ] Before creating the Supabase project: run a quick latency test from a Nigerian connection to the candidate regions (London, Frankfurt, and Cape Town if offered). Region cannot change without recreating the project; pin Vercel functions to the matching region.
- [ ] Before any real user: verify a sending domain in Resend (SPF, DKIM), plug it into Supabase Auth SMTP, and check the 100 emails a day limit against expected sign ups.
- [ ] Before Go public (Slice 7): upgrade to Vercel Pro and set a hard spend cap; upgrade Supabase to Pro (no pausing, backups).
- [ ] Feature 5 spec (Sign in & accounts): decide the email confirmation and recovery callback route, the redirect allow list per environment, a relative path only rule for any `next` parameter, cookie lifetime (so sessions survive a phone browser restart), and whether a profile row is created by a trigger (in the `private` schema) or lazily.
- [ ] Add a hosted staging Supabase project once real users exist, point Vercel previews at it, and automate migration deploys.
- [ ] Connect the chosen MCP servers in your MCP settings (`claude mcp add …` or `/mcp`): Supabase (official, `https://mcp.supabase.com/mcp`), GitHub (`github/github-mcp-server`), Resend (verify `resend/resend-mcp` is the official repo first), Playwright (`@playwright/mcp`). Record them on the `MCP servers:` line of `AGENTS.md`.
- [ ] Feature 2 (`/audit`): write root `AGENTS.md` from this spec's conventions, and list the implementation skills above (the user level ones are not yet referenced by the project).
- [ ] Feature 4 spec: choose the chart approach for the radar charts and stat tiles, and replace the placeholder manifest icons.
- [ ] Feature 13 spec: choose error tracking and analytics without sending financial amounts.
- [ ] If `public/sw.js` grows past about 150 lines (background sync, push), revisit Serwist.

## Rationale

Reasoning, options compared, and the October 2026 landscape check: see [rationale.md](rationale.md).
