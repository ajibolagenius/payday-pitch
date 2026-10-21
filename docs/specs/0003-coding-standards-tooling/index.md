# 0003. ESLint, Prettier, lefthook, CI gate, and a Vitest harness

**Date**: 2026-10-21
**Status**: In Progress

_Rationale, context, and the options weighed are in [rationale.md](rationale.md)._

## Summary

This decides the tooling that keeps the code clean and checks itself: a linter (ESLint with the Next.js rules), a formatter (Prettier, which also sorts Tailwind class lists), a pre-commit hook (lefthook) that formats and lints only the files you staged, a GitHub Actions workflow that runs the same checks on every pull request, and a Vitest harness so unit tests can exist beside the code they test. Nothing exists today: no lint config, no formatter, no hook, no CI. The project is small enough right now (8 source files) that adopting a standard costs one reformat pass, so this is the cheap moment to lock it.

## Requirements

Feature 2 is "Coding standards & tooling". Its `Done when` line, plus the checks that make it verifiable:

**Acceptance criteria**:

- **AC-1**: `pnpm lint` and `pnpm format:check` exit 0 on the whole repo. Every file under `src/` is linted and formatted, which the build proves by dropping in a deliberately bad `.tsx` file (an unused variable, a floating promise) and confirming `pnpm lint` fails on it, since a flat config with missing `files` patterns can silently lint only `.js`. `pnpm format:check` must not reach generated or binary files, which is what `.prettierignore` is for.
- **AC-2**: `pnpm format`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass after the adopting PR reformats the existing source files, with no lint rule turned off and no `eslint-disable` comment.
- **AC-3**: a `pre-commit` hook fires on a normal `git commit`, formats and lints only the staged files, and a fix the hook makes lands in the commit instead of leaving the working tree dirty.
- **AC-4**: the hook stays light. It runs no typecheck, no build, and no test, and a commit of one already clean file adds under 5 seconds. (Measure by hand on a warm checkout; this is a design constraint with a loose bound, not a CI assertion.)
- **AC-5**: `.github/workflows/ci.yml` runs on every pull request on GitHub hosted `ubuntu-latest`, with Node 24, in one job that covers lint, format check, typecheck, unit tests, build, and the Playwright e2e suite, so nothing builds twice.
- **AC-6**: CI passes with no Supabase keys present. Note this is true today because no signed in path exists yet; spec 0001 wants Supabase dependent jobs added when feature 3 lands, which is a planned divergence, not an oversight.
- **AC-7**: `pnpm test` runs Vitest 5 green against one smoke test that sits beside a real pure module: the adopting PR creates `src/domain/money.ts` holding only the amount type and one small function (a kobo formatter), plus `src/domain/money.test.ts` beside it. This proves the harness, the `@/` alias, and the Node 24 pin without pulling in React or jsdom. Feature 3 owns the rest of the money module.
- **AC-8**: a fresh clone needs no undocumented setup to get hooks: `"prepare": "lefthook install"` runs on `pnpm install`, verified by cloning into a temp directory and committing a file.
- **AC-9**: the baseline is real and recorded where later work reads it: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `lefthook.yml`, `vitest.config.ts`, `pnpm-workspace.yaml` entries, and `.github/workflows/ci.yml` exist and run. This is format plus lint baseline only: the `kebab-case` filename rule, the `@/` alias rule, and `src/domain` import purity stay prose in `AGENTS.md` until a named rule turns them on (see Follow-up).
- **AC-10**: `main` protection is on by hand, so green checks actually block a merge. This is a GitHub repository setting, not code, and it is a manual step in this feature.

Out of scope for this feature, deliberately: the `pnpm db:types` drift job and RLS isolation tests (they need feature 3's database), the design system tokens (feature 4), and any refactor of existing code beyond what the formatter does.

## Decision

**Chosen option**: Option 1: ESLint 9 (flat config) with eslint-config-next, plus Prettier, enforced by lefthook pre-commit and a GitHub Actions PR gate, with a Vitest 5 harness.

This is a standard definition, not an implementation plan: `/develop` derives the task list when it builds feature 2.

**Implementation skills**: `linting-neostandard-eslint9` (`mcollina/skills`, `.claude/skills/linting-neostandard-eslint9/`) · `github-actions-templates` (`wshobson/agents`, `.claude/skills/github-actions-templates/`) · `playwright-best-practices` (`currents-dev/playwright-best-practices-skill`, `.claude/skills/playwright-best-practices/`) · `vitest` (`antfu/skills`, `.claude/skills/vitest/`)

The ESLint skill is guidance for flat config wiring and migration, not the rule set: its preset is neostandard, and this project keeps `eslint-config-next`. Treat it as config shape help only.

**MCP servers** (recommended, connect them yourself in your MCP settings; not something a repo change can do): `@eslint/mcp` (official, needs ESLint 9.26 or later) and `vercel/next-devtools-mcp` (official, attaches an agent to your running dev server). GitHub MCP and Playwright MCP were already recommended by spec 0001.

## Standard definition

**Canonical pattern** (the shape of every tooling file in the repo):

```ts
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import prettierConfig from "eslint-config-prettier/flat"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "test-results/**",
      ".vitest/**",
      "next-env.d.ts",
      "src/lib/supabase/database.types.ts",
    ],
  },
  js.configs.recommended,
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),
  { rules: { "no-console": ["warn", { allow: ["warn", "error"] }] } },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        caches: "readonly",
        clients: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
  },
  prettierConfig, // last, so layout rules never fight Prettier
]
```

Build time check before committing to the bridge: `eslint-config-next` v16 may already ship a native flat export. If it does, drop `@eslint/eslintrc` and spread the imported config directly. Verify against the installed `next@16.4.2`, do not copy this snippet blindly.

```json
// .prettierrc.json
{ "semi": false, "plugins": ["prettier-plugin-tailwindcss"] }
```

`semi: false` matches the style the scaffold already uses (see `src/app/layout.tsx`, no semicolons). Prettier's other defaults stay: 80 column print width, double quotes, 2 space indent, trailing commas. The whole repo is reformatted once in the adopting PR, so the formatter's defaults then become the facts.

```text
# .prettierignore. ESLint's ignore list does not apply to Prettier, so this
# must be its own file.
node_modules
.next
out
build
test-results
playwright-report
.vitest
pnpm-lock.yaml
next-env.d.ts
*.tsbuildinfo
docs/assets
AGENTS.md
CLAUDE.md
```

`AGENTS.md` and `CLAUDE.md` are excluded on purpose: `next dev` rewrites the Next.js rules block in `AGENTS.md` on every run, so a formatter that touches it produces permanent dirty tree churn.

```yaml
# lefthook.yml
pre-commit:
  parallel: false
  commands:
    format:
      glob: "*.{ts,tsx,js,mjs,json,md,yml,yaml}"
      stage_fixed: true
      run: pnpm exec prettier --write {staged_files}
    lint:
      glob: "*.{ts,tsx,js,mjs}"
      stage_fixed: true
      run: pnpm exec eslint --fix --max-warnings 0 {staged_files}
```

One definition owns the hook. There is no `lint-staged` block: lefthook already passes `{staged_files}`, and a second config nothing invokes is just a second place for the rules to drift.

```json
// package.json, scripts block
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "lefthook install"
  }
}
```

```yaml
# pnpm-workspace.yaml. This file, not a pnpm block in package.json: pnpm 10 and
# 11 read settings from the workspace file, which already exists here with an
# allowBuilds block.
onlyBuiltDependencies:
  - lefthook
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": new URL("./src/", import.meta.url).pathname } },
  test: {
    dir: "src",
    include: ["**/*.test.{ts,tsx}"],
    environment: "node",
    clearMocks: true,
    coverage: { provider: "v8", include: ["src/**/*.ts"] },
  },
})
```

```yaml
# .github/workflows/ci.yml
# on: pull_request, and push to main
# actions/checkout@v4 · pnpm/action-setup@v4 · actions/setup-node@v4
#   with node-version: 24 and cache: pnpm
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - pnpm install --frozen-lockfile
      - pnpm lint
      - pnpm format:check
      - pnpm typecheck
      - pnpm test
      - pnpm build
      - pnpm exec playwright install --with-deps chromium
      - pnpm test:e2e # the suite's own webServer starts the app; no second build
```

**Dependencies added** (the committed pnpm lockfile is the pin, per spec 0001's "versions pinned" rule; major floors noted where behavior depends on them):

- Lint: `eslint` (9), `eslint-config-next`, `@eslint/eslintrc` (only if the compat bridge is still needed, see the build time check), `@eslint/js`, `eslint-config-prettier`.
- Format: `prettier` (3), `prettier-plugin-tailwindcss`.
- Hook: `lefthook`.
- Unit: `vitest` (5), `vite` (Vitest 5 requires it as a peer), `@vitest/coverage-v8`, `typescript` (already present).
- CI: nothing installed; the workflow file only.

That is about ten new dev dependencies. `@types/node` and `@types/react` are already there.

**Replaces**:

- Unformatted, unlinted code committed straight from an agent run with no gate (the current state: no config of any kind exists).
- Convention-by-prose, where `AGENTS.md` rules rely on every reader remembering them.
- Any thought of a later "big style migration PR". The migration is the adopting PR, while the repo is about eight files.

**Enforcement**:

- Lint rule: ESLint 9 flat config, `eslint.config.mjs`, running `next/core-web-vitals` plus `next/typescript`, with `eslint-config-prettier` spread last so layout rules never fight the formatter. `--max-warnings 0`, so a warning fails.
- Format: Prettier 3 with `prettier-plugin-tailwindcss`, checked by `format:check`, with its own `.prettierignore` (ESLint's ignore list does not carry over).
- Local gate: lefthook `pre-commit`, staged files only, `stage_fixed: true` so a hook fix lands in the commit rather than leaving the file dirty.
- Remote gate: `.github/workflows/ci.yml` on every PR, GitHub hosted `ubuntu-latest`, Node 24. This is the gate `main` actually passes through, because golden rule 2 makes a PR the only way in.
- Merge block: required status checks on `main`, turned on by hand in GitHub settings. Green checks alone do not stop a merge.
- Type level: TypeScript `strict` (already on) stays the primary defense for money and nullability bugs. Lint does not duplicate it.

**Rollout**:
Immediate, in one PR, on new and existing code at once. The adopting PR installs the dependencies, adds the config files above, creates the `src/domain/money.ts` seed module with its test, runs `pnpm format` across the repo (it is about eight source files), and turns on CI. Existing violations are not tracked as debt: there is no existing code with substance yet. Hooks install themselves through the `prepare` script on the first `pnpm install`.

**Exceptions**:

- Generated files are excluded from lint and format by the ignore list: `next-env.d.ts`, and once it exists, `src/lib/supabase/database.types.ts`. Generated code is regenerated, not fixed.
- `public/sw.js` is plain JavaScript with service worker globals, handled by an explicit override rather than by disabling lint for it.
- `eslint-disable` is allowed only with a following comment naming the rule and the reason. A bare suppression is a review defect.
- No exceptions elsewhere. Every `.ts` and `.tsx` file under `src/` is linted and formatted from the adopting PR forward.

## Build plan

Built by `/develop` on 2026-10-21. The spec names no plan (a standard definition, task list derived at build time); this is the derived record, ticked for what landed and verified green.

- [x] Install the toolchain dev dependencies, eslint 9 and @eslint/js pinned to major 9 (eslint 10 breaks the Next plugin peers), plus eslint-config-next, eslint-config-prettier, prettier, prettier-plugin-tailwindcss, lefthook, vitest 5, vite, @vitest/coverage-v8 → satisfies AC-2, AC-7
- [x] `eslint.config.mjs`: the build time check ran, `eslint-config-next` 16.4.2 ships native flat array exports, so the `@eslint/eslintrc` bridge is dropped and the configs are spread directly → satisfies AC-1, AC-9
- [x] `.prettierrc.json`, `.prettierignore` → satisfies AC-1, AC-9
- [x] `lefthook.yml` staged-only format plus lint with `stage_fixed` → satisfies AC-3, AC-4, AC-9
- [x] `vitest.config.mts` (`.mts` because `package.json` is CommonJS and the `.ts` file loads with a module format warning) and the `package.json` scripts block (`lint` carries `--max-warnings 0`, the spec's `## Enforcement` rule that a warning fails, applied to the shared entry point and CI, not only the hook) → satisfies AC-7, AC-9
- [x] `pnpm-workspace.yaml`: `allowBuilds: { lefthook: true }`, pnpm 11.21's key for build script approval (the spec's `onlyBuiltDependencies` is the pnpm 10 shape and is not read here) → satisfies AC-8, AC-9
- [x] `src/domain/money.ts` seed (Amount type plus a kobo formatter) and `src/domain/money.test.ts` beside it, imported through the `@/` alias → satisfies AC-7
- [x] `.gitignore`: add `/.vitest/` (`test-results/` and `playwright-report/` were already listed) → satisfies AC-9
- [x] `.github/workflows/ci.yml`: one `quality` job, pull_request plus push to main, ubuntu-latest, Node 24, no secrets → satisfies AC-5, AC-6, AC-9
- [x] Adoption pass: `pnpm format` over the repo; fixed three real lint findings (typed the e2e `window.__registered` slot instead of `any`, named the eslint config default export, excluded the vendored `.agents` and `.claude` skill trees from lint and format the way the spec excludes generated files; the formatter had rewritten 127 of them, restored byte for byte) → satisfies AC-2
- [x] Hook proven in a throwaway clone: fresh `pnpm install` installs the hook via `prepare`, a bad commit is blocked, a formatter fix lands in the commit with a clean tree, one clean file costs 2 to 4 seconds → satisfies AC-3, AC-4, AC-8
- [ ] Branch protection on `main` with the `quality` check required (AC-10: a manual GitHub setting, not code)

## Configuration required

No new environment variables. The CI workflow needs no secrets for this slice: it builds and lints without Supabase keys, matching spec 0001's rule that public paths render without keys.

Two settings live outside the repo, and both are manual:

- GitHub repository: branch protection on `main`, with the CI job as a required status check, and "do not allow bypassing" on.
- Local: nothing beyond `pnpm install`, since `prepare` installs the hooks.

## Consequences

**Positive**:

- `AGENTS.md` rules become mechanically checkable, which is the only form that survives an agent written repo.
- Every PR carries proof, not trust: lint, format, types, unit, build, and the phone viewport e2e must be green.
- Tailwind class order stops being a review comment.
- The Vitest choice recorded in `test-preferences.json` becomes real, so feature 3's money maths can ship tests beside source on day one.
- Adopting now costs one reformat pass of 8 files. The same decision in Slice 4 costs a diff that hides real change.

**Negative / tradeoffs**:

- Two tools to maintain (ESLint and Prettier) plus a hook runner and CI: six new or edited config files, about ten new dev dependencies. That is the honest price of Option 1's framework coverage.
- Every commit attempt now runs node twice on staged files, and a cold ESLint start through the compat bridge is not instant. The bound is under 5 seconds, and it is deliberate that the hook does no typecheck, build, or test.
- Prettier's 80 column default will rewrap lines in `src/app/manifest.ts` and `layout.tsx` that were written wider on purpose. That is the cost of letting the formatter own layout.
- ESLint 9 flat config with the eslintrc shaped Next preset may need the `@eslint/eslintrc` compat bridge. Online examples are split between two formats, so agents reach for the deprecated `.eslintrc.json` shape. The `ignores` block and this spec are the tiebreaker. (Build outcome: not needed, the v16 preset ships native flat exports.)
- Baseline strictness means `strict-type-checked` class bugs (unnecessary assertions, floating promises) are not caught by lint. They are caught by TypeScript and by tests instead. Accepting this is the choice that keeps the rule set alive.
- One CI job keeps the build down to once, but it also means the browser install (roughly a minute) runs before e2e on every PR rather than in parallel. Free runners make this fine at one developer's volume and annoying at a team's.
- AC-1 and AC-7 make the tooling PR do slightly more than pure tooling: it creates the first real module under `src/domain/`. Small, but it is the one place this spec reaches into product code, and it is there because a harness with nothing to test is unproven.

**Neutral**:

- `.github/workflows/ci.yml` becomes the project's first CI file, and the place later jobs attach: `pnpm db:types` drift, RLS isolation against local Supabase, and the Vercel deploy check.
- Vitest 5 requires `vite` as a peer dependency and puts run artifacts in `.vitest/`, which needs a `.gitignore` entry.
- `no-console: warn` means a stray `console.log` fails CI rather than being deleted in review.
- pnpm settings now have one home, `pnpm-workspace.yaml`. A `pnpm` block in `package.json` would be read inconsistently on pnpm 10 and 11.
- The formatting decision is reversible in isolation: replacing Prettier with Biome later touches `.prettierrc.json`, `.prettierignore`, the lefthook command, and one reformat pass, not the linter.

## Follow-up

- [ ] After `/develop` builds feature 2: the lint, format, and test commands and the CI file belong in root `AGENTS.md` `## Commands`, and the three skills installed for this spec belong in its `## Skills` table (`/sync` or `/audit` own those edits, not this spec).
- [ ] Turn the prose rules into lint when each earns it, in this order: `src/domain` import purity (`no-restricted-imports`), then `kebab-case` filenames (a filename rule plugin), then the `@/` alias preference. Each gets a named rule and a reason in the commit that turns it on.
- [ ] Add the `pnpm db:types` drift check and the Vitest RLS isolation job to `ci.yml` when feature 3 (data model) creates the Supabase project. Spec 0001 both promised and specified them. Until then, AC-6's no keys CI is a temporary shape, not an oversight.
- [x] Add `.vitest/`, `test-results/`, and `playwright-report/` to `.gitignore` if not already present. (`/.vitest/` added; the other two were already listed.)
- [ ] Turn on `typescript-eslint` `strict-type-checked`, or a named single rule, when a real bug or a repeated review comment justifies it. Record the reason in the commit that turns it on.
- [ ] Consider a secret scanning hook (gitleaks, or lefthook's scan stage via `pnpm exec lefthook add scan -d pre-push`) before Supabase keys land in `.env.local` during feature 3. Cheap now, valuable the day a real key exists.
- [ ] Consider an `.editorconfig` and a `.vscode/settings.json` (format on save, Prettier as the default formatter) if you want editors to agree with the CLI. Not required: the CLI is the gate.
- [ ] Connect the two recommended MCP servers (see `## Decision`): `@eslint/mcp` needs ESLint 9.26 or later, `vercel/next-devtools-mcp` attaches an agent to the running dev server. Connecting is a setting you change, not a repo change.
- [ ] If the e2e step's browser install becomes the slowest part of the queue, cache the Playwright browser path through `actions/cache` or pass `--only-shell`. Do not add a self-hosted runner for this alone.
