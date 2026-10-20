# 0001. Rationale: Next.js and Supabase stack

Decision record for [index.md](index.md). `/develop` skips this file.

## Context

Payday Pitch turns a monthly salary into a football formation and tracks each month's split. Its users are salary earners in Nigeria, mostly on mid range Android phones with patchy connections, some on iPhone. It must be installable from the browser, open on a bad network, and hold personal financial data privately behind real accounts (sign in is a GA feature). It only plans and tracks; it never touches a bank.

The forces that shaped the stack:

- **One builder, with AI help.** Every extra service, language, or deployable is time not spent on the product.
- **Free tiers first.** Cost should be $0 until monthly check ins prove the habit, with a known, capped bill at launch.
- **Exact money and strict isolation.** Amounts must never be approximate (scope feature 3), and nobody may read another user's data (feature 5).
- **Public pages too.** The landing page and free calculator (Slice 7) need search metadata and must survive a traffic spike, for example a viral post.
- **Delivery by Tracer Bullet.** The scaffold must take one thin thread through every layer (UI, write, database, auth) early, so the stack must make that thread cheap.
- **Later needs, not built now:** payday reminders (scheduled jobs, web push), calendar export, and possibly native apps.

Without a recorded stack, every slice would make its own framework, data access, and security choices, and isolation would depend on each query remembering a filter.

## Options considered

Full stacks, compared as wholes.

### Option 1: Next.js 16 + Supabase on Vercel

One Next.js app with Server Actions; Supabase provides Postgres, Auth, and RLS; Vercel hosts. (basis: monolith first for a team of one; relational database as the default)

**Pros**: isolation enforced in the database; auth, recovery, and email hooks built in; server rendering for public pages; the largest ecosystem and the most AI fluency; $0 to start.
**Cons**: coupled to Supabase Auth; free project pauses after 7 idle days with a 500 MB cap; Vercel Hobby forbids commercial use, so going public costs about $20/mo; Next.js bundles are heavier on low end phones.

### Option 2: Next.js 16 + Neon Postgres + Better Auth on Vercel

The same app, with Neon for the database (1 GB free, no pausing, sleeps after 5 minutes idle) and Better Auth as a self hosted TypeScript auth library.

**Pros**: no vendor auth lock in; auth code you can read; Neon's storage is larger and branching is useful.
**Cons**: isolation must be enforced in app code or hand built RLS; more moving parts to wire and secure (sessions, email, rate limits) for a solo builder; a cold database adds latency on the first request.

### Option 3: SvelteKit + Supabase on Cloudflare Workers

The same data platform, with a lighter framework on Cloudflare's network.

**Pros**: the smallest client bundles (kind to mid range Android); the cheapest at any traffic spike (no egress fees); commercial use allowed from the $5 plan.
**Cons**: smaller ecosystem and weaker AI fluency; the free plan's 10 ms CPU cap is too tight for server rendering, so $5/mo from day one; Workers' runtime differs from Node in ways that cost a solo builder time.

### Option 4: Vite single page app + Supabase, static hosting

A client only React app talking straight to Supabase, with RLS as the only server side guard.

**Pros**: the simplest and cheapest hosting; fewest layers.
**Cons**: business rules and validation live in the browser or in SQL; public pages need a separate site for SEO; every write path is exposed directly to the client.

## Rationale

Option 1 is the only stack that satisfies **exact money and strict isolation** without the builder writing security plumbing: RLS makes isolation a database property, and Supabase Auth covers sign up, recovery, and sessions that a **solo builder** would otherwise assemble (Option 2's main cost). Server Actions give one validated server side gate per write, which Option 4 lacks, and server rendering covers the **public pages** without a second site.

The engineer asked which host is best long term for a sudden traffic spike. Cloudflare (Option 3) is the cheapest per request under a spike, and that is a real advantage. It loses here because the likely spike targets (the landing page and calculator) are static and served from the CDN on either host, the real bottleneck under growth is the database tier rather than the host, and Next.js on Vercel needs no adapter. The portability rule (no Vercel only runtime APIs) keeps a move to Cloudflare through OpenNext a small job if bills ever justify it. The spend cap on Vercel Pro bounds the downside.

Supporting choices follow the same forces: integer kobo with no money library (exactness with zero dependencies), a hand written service worker over Serwist (Serwist's docs target the webpack build, and Next 16 builds with Turbopack by default), and a full offline sync engine rejected in favor of an offline shell (much less complexity for the one feature that needs writes offline). For **Tracer Bullet** delivery, this stack makes the first thread short: one route, one Server Action, one table with RLS, one sign in.

## References

**Project sources** (verifiable, in this repo):
- [docs/scope/scope.md](../../scope/scope.md): product intent, features 1, 3, 5, 10, 13, 15, 16, Tracer Bullet approach
- `supabase` community skill (`~/.claude/skills/supabase/`): RLS, grants, views, `security definer`, key exposure rules

**Practices & standards**:
- Monolith first for small teams
- Relational database as the default primary store
- Defense in depth: authorization enforced in the data layer (row level security)
- Integer minor units for money; largest remainder allocation
- Network first for pages, cache first for content hashed assets (service worker caching)

**Links** (web verified during the October 2026 landscape check):
- Supabase pricing: https://supabase.com/pricing
- Neon pricing: https://neon.com/pricing
- Better Auth: https://better-auth.com/
- Vercel Hobby plan (non commercial use): https://vercel.com/docs/plans/hobby
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Serwist for Next.js: https://serwist.pages.dev/docs/next/getting-started
- Web push for web apps on iOS and iPadOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

## Evidence: landscape check (2026-10-20)

- **Supabase free**: pauses after 7 idle days; 2 active projects; 500 MB database; 50,000 monthly active users for auth. Nearest region not confirmed from pricing; London assumed, check at project creation.
- **Neon free**: 1 GB per project; 100 compute hours a month; scales to zero after 5 minutes (cannot be disabled on free); Neon Auth up to 60k monthly users.
- **Better Auth**: a self hosted TypeScript auth framework, announced as joining Vercel.
- **Next.js**: the 16.x line is current; Next 15 support ends 2026-10-21.
- **Vercel Hobby**: personal, non commercial use only; a business app needs Pro ($20 per seat per month).
- **Cloudflare Workers free**: 100,000 requests a day, 10 ms CPU per request. OpenNext readiness was not confirmed.
- **Serwist**: its documented Next.js setup targets webpack; dev mode is reported disabled under Turbopack.
- **iOS web push**: iOS 16.4 and later, only for apps added to the Home Screen, permission requested from a user gesture.
- **Drizzle**: stable 1.0 not confirmed (1.0 beta); not chosen in any case.
- **Unconfirmed**: a reported Supabase Data API change requiring explicit grants on new tables. The convention in index.md (explicit grants in every table migration) holds either way.
