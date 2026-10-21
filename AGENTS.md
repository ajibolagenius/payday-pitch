# Payday Pitch

A mobile friendly, installable web app that helps salary earners build wealth by lining up each month's pay as a football formation: fixed costs as real amounts, debts fully covered, the rest put to work. Plan: [docs/scope/scope.md](docs/scope/scope.md). Stack and architecture: [docs/specs/0001-stack-architecture/index.md](docs/specs/0001-stack-architecture/index.md).

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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
