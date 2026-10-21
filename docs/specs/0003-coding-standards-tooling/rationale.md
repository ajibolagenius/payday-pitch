# 0003. Coding standards & tooling · rationale

_Decision record history for [index.md](index.md): the context, the options weighed, and why Option 1 won. Split out when `/develop` promoted the spec to a directory on 2026-10-21._

## Context

The scaffold came from spec 0001, which set the language rules (TypeScript strict, `kebab-case`, the `@/` alias, money as integer kobo) but left "Lint / format: Decided by `/audit` in feature 2". Those rules currently live only as prose. Prose conventions drift: an agent or a tired human writes a file at 5pm, nobody checks it, and three months later the repo holds four competing styles and every diff carries noise on top of real change.

Spec 0001 also promised CI that proves every PR ("CI on every PR: typecheck, Vitest, build, a Playwright job"), and named one CI job as feature 2's work: the lint job. `.github/` does not exist yet.

Forces at play:

- **Solo builder.** Every tool must be operable by one person on a Tuesday evening. A rule set nobody understands gets deleted, not followed.
- **AI agents write much of this code.** Agents do not remember prose conventions across sessions. They follow what the linter enforces and what the formatter produces. Automation is the only durable enforcement here.
- **Money correctness.** A float creeping into a money path, or a mutation the type checker rejects under `strict-type-checked`, is the failure mode this app genuinely cannot afford. Lint is a poor tool for that; TypeScript and tests are better.
- **A phone-first installable app.** The Playwright suite already exists and the build must stay fast. Heavy CI that takes ten minutes per push teaches you to stop reading it.
- **Free tiers.** GitHub-hosted runners give 2000 minutes a month on a private repo. At one developer's push volume that is ample and $0.

Not deciding means: no gate before `main`, conventions that live only in `AGENTS.md`, and a Vitest choice (recorded in `test-preferences.json`) that has never actually run.

## Options considered

### Option 1: ESLint 9 (flat config) with eslint-config-next, plus Prettier

Two tools with clear jobs. ESLint finds real problems (unused variables, React Hooks rule violations, missing `key` props, `alt` text, `next/image` misuse) using the official `eslint-config-next` preset. Prettier owns layout: line breaks, quotes, and, through `prettier-plugin-tailwindcss`, a canonical order for Tailwind classes. The formatter runs first on staged files, the linter with `--fix` second, and only rule findings that are not about layout can remain.

**Pros**:

- `eslint-config-next` carries the Next and React rules that matter here, already written and maintained by Vercel, including the Hooks rules that catch real bugs.
- The pair is the most documented, most AI-legible setup in this ecosystem. An agent has seen it a thousand times, so it writes compliant code on the first try.
- Tailwind class sorting is solved by the official plugin rather than by review.
- Each tool is replaceable on its own. Swapping Prettier for Biome later touches formatting only.

**Cons**:

- Two config files and two dependencies to keep current.
- Configuring Prettier to stop fighting ESLint's stylistic rules is a small, well-known ritual (`eslint-config-prettier`) that still has to happen.
- ESLint 9 flat config plus the eslintrc-shaped Next preset needs the `@eslint/eslintrc` bridge, one extra line that reads oddly.

### Option 2: Biome alone

One Rust binary does lint and format with almost no config and is extremely fast.

**Pros**:

- One tool, one config file, one dependency. Formatting is roughly 20x faster than Prettier.
- Formatter behavior is deterministic with little tuning.

**Cons**:

- No `eslint-config-next` equivalent. The React Hooks rules and the Next specific rules (`no-html-link-for-pages`, `image` rules) either are absent, experimental, or must be hand-assembled, and the Hooks rules are the single most valuable thing this project wants from a linter.
- Tailwind class sorting needs its own organizer, configured separately, and is newer than the Prettier plugin.
- A less common stack in this ecosystem, so both human guides and AI training data are thinner. The "just works" property that matters for an agent written repo is weaker.

### Option 3: Prettier plus Oxlint

Prettier formats; Oxlint, a Rust linter, runs checks fast.

**Pros**:

- Fastest linting available, near-zero config.
- Prettier keeps Tailwind sorting and the familiar formatting.

**Cons**:

- Oxlint does not run the `eslint-config-next` ruleset or the full TypeScript plugin rules, so the framework specific coverage this project needs is simply missing.
- Two tools again, so Option 1's main cost is paid without buying its main benefit.
- You would end up keeping ESLint anyway for the rules Oxlint lacks, which is the worst of both.

### Enforcement and rollout framing

| Approach                                                         | Strength                                                      | Blast radius here                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| Document plus enforce from day one (lint rule plus hook plus CI) | Automatic, fails CI, survives agents and absences             | 8 files to reformat once, then nothing |
| Document plus migrate later                                      | Style debt compounds silently; the second migration is bigger | Defers, does not avoid, the same work  |
| Document only, review by eye                                     | Weakest; prose does not survive an agent run                  | Already tried, it is where we are      |

## Rationale

The engineer expressed a preference for ESLint plus Prettier, and the honest answer is that this is also the right call rather than merely acceptable. The decisive force is that this repo is written substantially by AI agents: the standard has to be the one with the deepest footprint in training data and documentation, which is the ESLint plus Prettier pair, and it has to be enforced mechanically rather than by memory. Option 1 is also the only option that gives you `eslint-config-next` and the React Hooks rules for free, which is where a linter earns its keep in a React app.

Biome is the strongest runner up and the right answer for a project that wants one tool and can live without framework rules. It loses here on one rule family: `react-hooks` has no mature Biome equivalent, and hook order bugs are exactly the class of defect that is invisible in review and painful in production. Tailwind sorting also lands more cleanly on the Prettier plugin today.

Baseline strictness is a deliberate call, not an omission. `eslint-config-next` already brings `typescript-eslint` recommended rules, which covers the highest value per false positive. Turning on `strict-type-checked` on day one invites a wave of violations that get disabled in frustration, which is how linters die. The rule for adding one later is: a real bug or a repeated review comment names it, then it gets turned on, with a written reason.

For enforcement, the pre-commit hook must stay fast, so it formats and lints staged files only and never typechecks or builds. CI carries the full weight (lint, format check, typecheck, build, unit, e2e) because that is the gate `main` actually passes through. Vitest 5 is pinned by what the installed skill documents (Vitest 5, Vite as a required peer, Node 22.12 or higher, all satisfied by the Node 24 pin).
