# Verify: Coding standards & tooling · spec 0003 · updated 2026-10-21

_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Commands

- [ ] `pnpm lint` → exit 0 on the whole repo → AC-1
- [ ] `pnpm format:check` → exit 0, and it skips `pnpm-lock.yaml`, `next-env.d.ts`, `docs/assets`, `AGENTS.md`, `CLAUDE.md` (generated and churn-prone files untouched) → AC-1
- [ ] plant a temporary bad `src/app/bad.tsx` (unused variable plus `console.log`) → `pnpm lint` exits non zero on it → delete it → `pnpm lint` exits 0 again → AC-1
- [ ] `pnpm format && pnpm lint && pnpm typecheck && pnpm build` → all exit 0 → AC-2
- [ ] `grep -r "eslint-disable" src tests` → zero hits, no rule switched off → AC-2
- [ ] `pnpm test` → Vitest 5 green; `src/domain/money.test.ts` sits beside `src/domain/money.ts` and imports it through the `@/` alias → AC-7
- [ ] `ls eslint.config.mjs .prettierrc.json .prettierignore lefthook.yml vitest.config.mts pnpm-workspace.yaml .github/workflows/ci.yml` → all exist → AC-9

## Git hooks (manual, in a throwaway clone, never against a real branch)

- [ ] clone the repo to a temp directory → `pnpm install` → the pre-commit hook is installed with no extra command → AC-8
- [ ] stage one badly formatted (but lint clean) `.ts` file → `git commit` → the committed blob is formatted, `git status` shows the file clean right after the commit, the hook log shows no typecheck, build, or test → AC-3, AC-4
- [ ] stage a file with a lint warning → `git commit` → the commit is blocked → AC-3
- [ ] commit one already clean file on a warm checkout → lefthook summary under 5 seconds → AC-4

## CI

- [ ] `.github/workflows/ci.yml` → one `quality` job, runs on `pull_request`, `ubuntu-latest`, Node 24, steps cover lint, format check, typecheck, unit tests, build, Playwright e2e → AC-5
- [ ] `grep secrets .github/workflows/ci.yml` → zero hits, the workflow needs no Supabase keys → AC-6
- [ ] on GitHub: the CI run for the adopting PR is green end to end → AC-5, AC-6

## Manual (GitHub settings, outside the repo)

- [ ] branch protection on `main` requires the `quality` status check, with bypassing off → AC-10

## Acceptance-criteria coverage

- AC-1 covered by the lint and format check steps plus the bad file proof · AC-2 by the four commands green and the no `eslint-disable` grep · AC-3 by the throwaway clone hook steps · AC-4 by the clean commit timing · AC-5 by the workflow shape and a green PR run · AC-6 by the no-secrets check and the green run · AC-7 by `pnpm test` · AC-8 by the fresh clone install · AC-9 by the config file listing · AC-10 by the branch protection check
