# Payday Pitch

A mobile friendly, installable web app that helps salary earners build wealth by lining up each month's pay as a football formation: fixed costs as real amounts, debts fully covered, the rest put to work. Plan: [docs/scope/scope.md](docs/scope/scope.md). Stack and architecture: [docs/specs/0001-stack-architecture/index.md](docs/specs/0001-stack-architecture/index.md).

## Stack

TypeScript strict, Node 24 (`.nvmrc`, `engines`), pnpm 11, Next.js 16 App Router with Turbopack, React 19, Tailwind CSS v4 (tokens in `src/app/globals.css`). Supabase (Postgres, RLS, Auth), Zod 4, shadcn/ui, Vitest, Playwright: decided in spec 0001, all installed and in use. Full table: [spec 0001](docs/specs/0001-stack-architecture/index.md).

## Build approach

Tracer Bullet: one thin, real thread through the whole loop first, then each slice thickens one segment end to end. Workflow level Beta (`/check verify`, then `/test`). From [the scope header](docs/scope/scope.md).

## Golden rules

These govern every change, by any person or agent. They override any skill or tool default.

1. **Every feature is built on its own branch.** Branch off an up to date `main` before writing code, named `feat/<feature-slug>` (for example `feat/first-match-loop`); use `fix/<slug>` for bug fixes and `chore/<slug>` for tooling. One feature per branch.
2. **Nothing reaches `main` except through a pull request.** Never `git push` to `main`, never force push it, never merge locally into it. Push the branch and open a PR. The only exception is the single initial commit that creates `main` in an empty repo.
3. **No automatic commits.** Never run `git commit`, `git push`, or open or merge a PR on your own initiative. First draft the message, show it, and wait for explicit approval:
   - **Commit:** a title (imperative, 72 characters or fewer, for example `Add income stream form`) and a body that says what changed and why.
   - **PR:** a title and a body covering what changed, why, how it was verified, and the linked spec or scope feature.

   Approval covers that one commit or PR only, not the ones after it.

## Skills

Mandatory skills for this project. Read a skill's `SKILL.md` before doing any work it covers.

| Skill | Path | When to activate |
|---|---|---|
| **secure-me** | `~/.gemini/config/skills/secure-me/SKILL.md` | Any time code is reviewed, audited, or hardened for security; when touching auth, RLS policies, Server Actions, secrets, CSP headers, rate limiting, or any banking/payment integration; when the user mentions OWASP, vulnerability, penetration test, or compliance. Also activate proactively before writing any new code that touches auth, database access, money, or user data. |
| **ponytail** | `~/.gemini/config/plugins/ponytail/skills/ponytail/SKILL.md` | Any coding task: writing, adding, refactoring, fixing, reviewing, or designing code, and choosing libraries or dependencies. Also activate when the user says "ponytail", "be lazy", "lazy mode", "simplest solution", "minimal solution", "yagni", "do less", "shortest path", or complains about over-engineering, bloat, boilerplate, or unnecessary dependencies. Supports intensity levels: `lite` · `full` (default) · `ultra`. |

Project local skills in `.claude/skills/`, add a row when you touch their area:

- [resend](.claude/skills/resend/): `resend/resend-skills`, email sending and templates.
- [email-best-practices](.claude/skills/email-best-practices/): `resend/email-best-practices`, deliverability rules for auth and reminder emails.
- [vitest](.claude/skills/vitest/): `antfu/skills`, unit test conventions (tests sit beside source as `*.test.ts`).

Installed elsewhere, load when the area comes up:

- [sharp](.agents/skills/sharp/): `clasen/skills`, image work behind `pnpm icons` (resize, SVG to PNG, composite, metadata).
- ask-sonner (global, `~/.claude/skills/ask-sonner/`): `emilkowalski/skills`, toast conventions for `sonner` (mount the Toaster once, promise and loading toasts, avoid double toasts and modal z-index clashes).
- impeccable (global, `~/.agents/skills/impeccable/`): the AI design skill adopted by spec 0005; activate when designing, reshaping, or critiquing any UI surface.
- supabase (global): Supabase clients, auth, RLS, and SSR integration guidance.
- react-email (global): email templates and rendering for `src/emails/` (sign up and recovery).
- MCP servers: Supabase (connected), Resend (connected), per spec 0006.

## Commands

```bash
pnpm install
pnpm dev          # dev server (re-adds the next rules block below; keep it committed)
pnpm build
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # Vitest unit tests (tests beside source as *.test.ts)
pnpm test:db      # RLS isolation suite (needs the local Supabase stack running)
pnpm db:types     # regenerate src/lib/supabase/database.types.ts after a migration
pnpm test:e2e     # Playwright, specs in tests/e2e
pnpm lint         # ESLint, --max-warnings 0
pnpm check:hex    # no hex color literals outside globals.css and the artwork carve out
pnpm icons        # regenerate app icons from public/icons/master*.svg (sharp)
```

## Specs

Architecture specs live in `docs/specs/NNNN-slug/index.md`. The living product plan lives in `docs/scope/scope.md`. Spec 0001 is binding: its conventions section governs every slice.

## Rules

- One feature per branch (`feat/`, `fix/`, `chore/`), merged only by PR, no automatic commits (see Golden rules).
- Files are `kebab-case`, imports use the `@/` alias for `src/`.
- `src/domain/` is pure TypeScript: no imports from next, react, or supabase.
- Money is integer minor units (kobo) with an ISO currency code, handled only in `src/domain/money.ts`. No floats. "This month" computes in `Africa/Lagos`, never from the server UTC clock.
- Every write is a Server Action built with `authedAction()` (Zod validated, returns `ActionResult`, expected failures never throw). Actions never accept a `user_id` from the client.
- Identify users with `supabase.auth.getClaims()`, never `getSession()`. Every table gets RLS plus explicit grants to `authenticated`, and a Vitest isolation test, in the same PR.
- No hex color literals outside the raw layer of `src/app/globals.css` and the artwork carve out (`src/components/pitch/**`, `src/components/stickers/**`, `src/lib/brand.ts`). `pnpm check:hex` and the ESLint rule enforce it.
- Every amount on screen renders through `<MoneyText>` (formats integer kobo via `src/domain/money.ts`). No component formats money by hand.
- Motion (`motion/react`) is the only animation library. Every animated property is gated by `prefers-reduced-motion` (hook: `src/lib/use-prefers-reduced-motion.ts`).
- The service worker never caches signed in pages under `/app` (Cache Storage is shared by the whole origin, so a stored money page could leak to the next person on the device). Offline `/app` shows the offline page. Only public pages and the shell are cached. This supersedes the per user page cache described in spec 0001 (pending /architect reconciliation).
- No Vercel only runtime APIs (portability rule, spec 0001). The service worker version comes from the `GIT_SHA` build env var, never a Vercel env var.

## Context files

- Spec 0001 `## Architecture conventions` is the offline and service worker guide for `public/sw.js` (registry at [docs/scope/scope.md](docs/scope/scope.md)).
- Design system: build all UI to [design.md](design.md) (tokens, type, components, voice); token values live only in `src/app/globals.css`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
