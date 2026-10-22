# Payday Pitch

A mobile friendly, installable web app that helps salary earners build wealth by lining up each month's pay as a football formation. Fixed costs as real amounts, debts fully covered, the rest put to work.

Your monthly salary becomes a lineup: goalkeeper (emergency fund), defenders (fixed living costs), midfield (debt, upskilling, short term goals), forwards (wealth building), and bench (guilt free spending). Pick a formation — 4-4-2 balanced, 4-3-3 attacking, 5-4-1 Park the Bus while you clear a debt — and each one splits your money differently. A formation shapes what is left; it never shrinks your rent. It plans and tracks only. It never connects to a bank or moves money.

Built for salary earners in Nigeria first, including people with several income streams.

## Status

Early build. Foundations (stack, tooling, data model, design system) are done or nearly done; the first user-facing slice (sign in, then the first match loop) is in progress. The live plan is [docs/scope/scope.md](docs/scope/scope.md).

## Stack

- TypeScript (strict), Node 24, pnpm 11
- Next.js 16 App Router (Turbopack), React 19
- Tailwind CSS v4 (design tokens in `src/app/globals.css`), shadcn/ui
- Motion (`motion/react`) for all animation
- Supabase: Postgres with RLS, Auth
- Vitest (unit, tests beside source), Playwright (e2e), ESLint + Prettier + lefthook

Full decisions: [spec 0001](docs/specs/0001-stack-architecture/index.md).

## Getting started

Prerequisites: Node 24 (see `.nvmrc`) and pnpm 11 (`corepack enable` or `npm i -g pnpm@11`). Docker must be running for local Supabase.

```bash
pnpm install
pnpm install                   # runs lefthook install via the prepare script
supabase start               # local Postgres + Auth at http://127.0.0.1:54321; prints the API keys
supabase db reset            # apply migrations and seed formations
# put SUPABASE_URL + SUPABASE_ANON_KEY from the output above into .env.local
pnpm dev                     # http://localhost:3000
```

### Environment

| Variable            | Purpose                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`      | Supabase project URL. Defaults to the local stack (`http://127.0.0.1:54321`) when unset.                                     |
| `SUPABASE_ANON_KEY` | Anon key for the browser/server client. Required.                                                                            |
| `TEST_SUPABASE`     | Set to `1` plus `SUPABASE_TEST_ANON_KEY` / `SUPABASE_TEST_SERVICE_KEY` to run the RLS isolation tests against a local stack. |

### Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # Vitest unit tests
pnpm test:db      # RLS isolation tests (needs local Supabase + test keys)
pnpm test:e2e     # Playwright, specs in tests/e2e
pnpm lint         # ESLint, --max-warnings 0
pnpm format       # Prettier
pnpm check:hex    # no hex color literals outside the allowed carve outs
pnpm db:types     # regenerate Supabase types from the local schema
pnpm icons        # regenerate app icons with sharp
```

## Project structure

```
src/
  app/                # Next.js App Router ((marketing), (app), (internal), offline)
  components/         # ui/ (shadcn base), pitch/, stickers/, icons/
  domain/             # pure TypeScript: money, formations — no framework imports
  features/           # feature slices (profile, ...)
  lib/                # supabase clients, helpers
supabase/
  migrations/         # schema, RLS policies, triggers, seeds
tests/e2e/            # Playwright specs
docs/
  specs/              # architecture specs (0001 is binding)
  scope/scope.md      # the living product plan
```

## Ways of working

- One feature per branch (`feat/`, `fix/`, `chore/`), merged only by PR — nothing reaches `main` directly.
- No automatic commits: draft the message, get approval, then commit.
- Every write is a Server Action built with `authedAction()` (Zod validated, returns `ActionResult`). Actions never accept a `user_id` from the client.
- Money is integer minor units (kobo) with an ISO currency code, handled only in `src/domain/money.ts`. No floats. "This month" computes in `Africa/Lagos`.
- Every amount on screen renders through `<MoneyText>`.
- Identify users with `supabase.auth.getClaims()`, never `getSession()`. Every table gets RLS, explicit grants to `authenticated`, and a Vitest isolation test in the same PR.
- No hex color literals outside `src/app/globals.css` and the artwork carve out; `pnpm check:hex` enforces it.
- Motion is gated by `prefers-reduced-motion`.
- No Vercel-only runtime APIs (portability rule).

## Documentation

- [AGENTS.md](AGENTS.md) — the context file for humans and AI agents: stack, golden rules, conventions.
- [design.md](design.md) — the design system: tokens, type, components, voice.
- [docs/specs/](docs/specs/) — architecture specs, one directory or file per numbered slice.
- [docs/scope/scope.md](docs/scope/scope.md) — feature plan and status.

## Not financial advice

Payday Pitch is a planning and tracking tool. Its formations and guidance are educational, not financial advice, and it never touches your money.
