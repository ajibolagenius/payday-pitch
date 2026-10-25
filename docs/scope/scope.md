# Scope: Payday Pitch

A mobile friendly web app that turns your monthly salary into a football lineup. You pick a formation (4-4-2, 4-3-3, 3-5-2, and more), and each one splits your money differently across goalkeeper (emergency fund), defenders (fixed living costs), midfield (debt, upskilling, short term goals), forwards (wealth building), and bench (guilt free spending). It serves salary earners in Nigeria first, including people with several income streams, and switches tactics as life changes: a "Park the Bus" formation while you clear a debt, an "Attacking 4-3-3" once you are free of it. The goal is building wealth; the lineup is the method. It plans and tracks only. It never connects to a bank or moves money.

**Build approach:** Tracer Bullet (one thin, real thread through the whole loop first, then each slice thickens one segment end to end).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| #   | Feature                              | Phase      | Status      |
| --- | ------------------------------------ | ---------- | ----------- |
| 1   | Stack & architecture                 | Foundation | done        |
| 2   | Coding standards & tooling           | Foundation | in-progress |
| 3   | Data model                           | Foundation | in-progress |
| 4   | Design system & UI foundation        | Foundation | in-progress |
| 5   | Sign in & accounts                   | Slice 1    | in-progress |
| 6   | First match loop                     | Slice 1    | in-progress |
| 7   | Tactics board                        | Slice 2    | done        |
| 8   | Debt mode (Park the Bus)             | Slice 3    | planned     |
| 9   | Season view                          | Slice 4    | planned     |
| 10  | Payday reminders                     | Slice 5    | planned     |
| 11  | Calendar export                      | Slice 5    | planned     |
| 12  | Forward line guidance                | Slice 6    | planned     |
| 13  | Error monitoring & product analytics | Slice 7    | planned     |
| 14  | Legal & data rights                  | Slice 7    | planned     |
| 15  | Free formation calculator            | Slice 7    | planned     |
| 16  | Landing page                         | Slice 7    | planned     |
| 17  | Production plans & limits            | Slice 7    | planned     |

## Foundations

### 1. Stack & architecture

Decide the stack for a mobile friendly, installable web app and scaffold a runnable project so every later slice builds on real structure.
**Done when:** the stack is recorded in a spec, and the empty scaffold boots locally, passes build, and loads well on a phone screen.
spec [0001](../specs/0001-stack-architecture/index.md) · code in `src/`, `public/sw.js`

- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Verify it: `/check verify stack & architecture`
- [x] Test it: `/test stack & architecture` (`tests/e2e/`)

### 2. Coding standards & tooling

Capture conventions, then install lint, format, and pre commit enforcement from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, and pre commit run clean.
spec [0003](../specs/0003-coding-standards-tooling/index.md) · code in `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `lefthook.yml`, `vitest.config.mts`, `.github/workflows/ci.yml`, `src/domain/`

- [x] Capture conventions + tooling choices: `/audit`
- [x] Build the toolchain: `/develop coding standards & tooling` (the spec 0003 standard: ESLint, Prettier, lefthook, one CI job, Vitest harness)
- [ ] Verify it: `/check verify coding standards & tooling` (AC-1 to AC-10)
- [x] Test it: `/test coding standards & tooling`

### 3. Data model

Core entities every slice builds on: users, income streams (amount and payday), fixed costs (real amounts, not a share of income), formations (the built in list plus custom tactics) and their positions with percentages, monthly matches (what you actually put where), debts, and goals. Money stays exact and carries its currency, so more currencies can come later.
**Done when:** the entities support every slice through investment guidance (formation switches, debt payoff, season history, reminders) without a breaking migration, and no amount is stored as an approximate number.
spec [0004](../specs/0004-data-model.md) · code in `supabase/migrations/`, `src/domain/`, `src/features/profile/`, `src/lib/supabase/`

- [x] Design it (spec): `/architect data model`
- [x] Build it: `/develop data model`
  - [x] One migration: eleven tables, constraints, indexes, grants, RLS policies (AC-1 to AC-3, AC-6 structure)
  - [x] Triggers in `private` plus the six formation seeds from `src/domain/formations.ts` (AC-4, AC-5)
  - [x] Progress views and the profile upsert helper (AC-8, AC-10)
  - [x] Local Supabase run, generated types, CI drift check (AC-1)
  - [x] Vitest isolation tests per table and constraint probes (AC-3, AC-7, AC-9)
- [ ] Verify it: `/check verify data model` (AC-1 to AC-10)
- [x] Test it: `/test data model`

### 4. Design system & UI foundation

The visual language from the references in `~/docs/assets`: pitch green `#1B4638`, electric yellow `#F5FF6B`, near black surfaces, Space Grotesk, analytics style stat tiles and radar charts (UI_2), and the hand drawn football sticker style (DES_1 to DES_3). Includes the pitch view component every money screen uses.
**Done when:** `design.md` covers type, color, spacing, and components; every color pair passes WCAG AA contrast (yellow text on light surfaces needs checking); base components handle focus, keyboard, and screen readers; the pitch view shows a formation with amounts.
**Candidates to weigh:** Motion (animation library for the whole app) · DiceBear (generated player avatars in the sticker style) · Impeccable or Taste Skill (AI design skill, pick one) · sharp (one off script to generate manifest icons). Decided in spec 0005: Motion adopted, DiceBear declined, impeccable adopted, sharp adopted.

- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation` (spec [0005](../specs/0005-design-system-ui-foundation.md))
  - [x] Tokens, theming, shadcn base (AC-2, AC-7): spike, two layer token layer, dark default, type scale, ThemeToggle
  - [x] Starter component kit (AC-1, AC-2, AC-4): restyled primitives, MoneyText, StatTile
  - [x] Visual assets (AC-8): sticker set, RuneIcons vendoring, master SVG icons with the sharp generator
  - [x] Pitch view (AC-5, AC-6): slot coordinates in the domain, SVG field, bench strip, Motion layout transitions
  - [x] Demo route and contrast gates (AC-1, AC-3, AC-4): dev only page, token pair test, axe, keyboard and reduced motion checks, design.md
- [ ] Verify it: `/check verify design system & UI foundation` (AC-1 to AC-8)
- [x] Test it: `/test design system & UI foundation`

## Slice 1: First match (the core loop, also the walking skeleton)

### 5. Sign in & accounts · GA

Real accounts from day one, so a person's formation and history are private, saved, and follow them across devices.
**Done when:** a user can sign up, sign in, sign out, and recover access; nobody can read another user's financial data; sessions survive a phone browser restart.
spec [0006](../specs/0006-sign-in-and-accounts.md)
**Candidates to weigh:** react-email (sign up and recovery email templates, rendered to HTML for Supabase Auth). Decided in spec 0006: react-email adopted, Supabase MCP and Resend MCP connected by hand.

- [x] Design it (spec): `/architect sign in & accounts`
- [x] Build it: `/develop sign in & accounts` (spec 0006)
  - [x] Cookie clients, env, form schemas, redirect validator (AC-2, AC-7, AC-9)
  - [x] Proxy gate and `(app)` layout guard with lazy profile creation (AC-2, AC-8)
  - [x] Five auth screens with their Server Actions, callback route, reset password, logout cache clear (AC-1, AC-3, AC-4, AC-5, AC-9, AC-11, AC-12)
  - [x] Local auth config flip, confirmed test users, react-email templates (AC-1, AC-3, AC-6, AC-10)
  - [x] Playwright auth suite and unit tests for the validator and schemas (AC-1 to AC-12)
- [ ] Verify it: `/check verify sign in & accounts` (AC-1 to AC-12)
- [x] Test it: `/test sign in & accounts`
- [x] Review it (fresh model): `/check review sign in & accounts`
- [x] Document it: `/document sign in & accounts`

### 6. First match loop

The thinnest real thread: add your income streams, pick a formation, and get a split that fits it. Each formation has its own style and money split: 4-4-2 balanced, 4-3-3 attacking (more to investments), 3-5-2 midfield heavy (more to upskilling and goals), 4-2-3-1 steady builder, 5-3-2 defensive (high fixed costs), 5-4-1 Park the Bus (debt first). Defenders are your real fixed costs (rent, food, transport, utilities) entered as amounts; a formation shapes what is left, it never shrinks your rent. Then log this month's match (what you actually put in each position) and see it saved. No custom percentages, debts, or reminders yet.
**Done when:** a signed in user enters one or more incomes, picks any formation from the list, and sees the players arranged in that shape on the pitch with each position's amount in naira and a one line "when to play it"; switching formation updates the split right away but never drops defense below the fixed costs entered (a formation that cannot cover them says so instead); the logged match keeps the formation it was played in and is still there after reloading; empty and error states render.
**Candidates to weigh:** Motion layout animations (players slide to new positions on a formation switch) · Driver.js (short first match tour explaining each position). Decided in spec 0007: Motion already ships in the pitch view, Driver.js adopted for a one time tour on the pitch step.
spec [0007](../specs/0007-first-match-loop.md) · code in `src/domain/`, `src/features/`, `src/components/walk/`, `src/lib/actions.ts`, `supabase/migrations/`, `tests/e2e/walk.spec.ts`

- [x] Design it (spec): `/architect first match loop`
- [x] Build it: `/develop first match loop` (spec 0007)
  - [x] Domain: split engine with tie break, naira parsing, Lagos dates, stale comment fix (AC-2, AC-4, AC-5, AC-6 maths)
  - [x] Write path: `authedAction()` helper, income and cost CRUD actions (AC-1, AC-2, AC-9)
  - [x] Database: `play_match` function migration, atomic play and correction, isolation tests (AC-5, AC-6)
  - [x] Walk screens: four steps, formation picker with live preview and unable to cover states, pitch review, returning user states (AC-1, AC-3, AC-5, AC-8, AC-10)
  - [x] Tour and proofs: Driver.js one time pitch tour, Playwright loop tests, a11y pass (AC-7, AC-10)
- [x] Verify it: `/check verify first match loop` (AC-1 to AC-10)
- [x] Test it: `/test first match loop`

## Slice 2: Tactics

### 7. Tactics board

Start from any formation and tune it: adjust each position's percentage yourself, save it as your own tactic, and get coaching nudges when the shape gets risky. A suggested formation based on your situation (debt, thin emergency fund, high fixed costs) lives here too.
**Done when:** a user edits percentages on top of a chosen formation and saves it as a custom tactic; the total always reaches 100% before it saves; a warning shows when defense passes 50% of income or the goalkeeper drops to 0%; once the emergency fund reaches 3 to 6 months of fixed costs, the app suggests moving the goalkeeper's share to the forwards; the app suggests a formation that fits the user's numbers; the next match uses the new shape.
spec [0008](../specs/0008-tactics-board.md) · code in `src/domain/tactics.ts`, `src/features/tactics/`, `src/components/pitch/`, `src/app/(app)/app/tactics/`, `src/lib/schemas.ts`, `supabase/migrations/`

- [x] Design it (spec): `/architect tactics board`
- [x] Build it: `/develop tactics board` (spec 0008)
  - [x] Database: `deleted_at`, the fund view, `play_match` replaced with the tactic branch and its grants, isolation tests (AC-3, AC-8, AC-9, AC-10, AC-11)
  - [x] Domain: share rules both ways, the two warnings, fund months, suggestion order (AC-4, AC-5, AC-6, AC-7)
  - [x] Actions and read: save, rename, delete, play, the page read with its params (AC-2, AC-3, AC-11)
  - [x] Board UI: page, nav entry, pitch editor with live amounts and the locked pool label (AC-1, AC-5, AC-12)
  - [x] One card, play path, and cleanup: suggestion states, shortfall refusal, delete confirm, empty states, Playwright spec (AC-6, AC-7, AC-9, AC-10, AC-12)
- [x] Verify it: `/check verify tactics board` (AC-1 to AC-12)
- [x] Test it: `/test tactics board`

## Slice 3: Debt mode

### 8. Debt mode (Park the Bus) · needs a decision

Add a debt with its balance and target date; the app works out the monthly hit, moves you into a defensive formation, tracks each payment, and calls the Final Whistle when it is cleared, then suggests the attacking formation.
**Done when:** a user adds a debt and sees the monthly amount needed to clear it by the target date; the plan always budgets at least that full amount (the original chat budgeted 357,500 against 360,000 needed), and when income cannot cover it the app shows the shortfall instead of a plan that quietly falls short; logged payments reduce the balance; clearing it prompts a switch to an attacking formation; more than one debt is handled.

- [ ] Design it (spec): `/architect debt mode`

## Slice 4: Season view

### 9. Season view · needs a decision

The dashboard: match history month by month, planned versus actual per position, emergency fund progress toward 3 to 6 months of defense costs, and a stats view in the UI_2 analytics style.
**Done when:** a user with several logged matches sees history, planned versus actual, and emergency fund progress; a brand new user sees a helpful empty state; it stays readable on a phone.

- [ ] Design it (spec): `/architect season view`

## Slice 5: Matchday rhythm

### 10. Payday reminders · needs a decision

Nudges on the real rhythm of your money: a Payday Whistle when each income stream should land, a Match Kickoff to make the split 1 to 2 days after the last stream of the month lands (not the first), and a monthly Tactical Review.
**Done when:** each income stream's payday triggers a reminder, including a payday on the 29th to 31st in a shorter month (it lands on the last day); the kickoff follows the last payday and the review follows the kickoff; reminders fire at the stated Lagos time; users can turn each one off, and nothing fires for a deleted income stream.
**Candidates to weigh:** WhatsApp Cloud API (official, where Nigerians read messages; not OpenWA, which is unofficial and risks number bans) · Telegram bot via telegraf.js (free, official) · react-email (reminder email templates) · Upstash QStash (scheduler fallback if Supabase Cron falls short)

- [ ] Design it (spec): `/architect payday reminders`

### 11. Calendar export

Download your reminder schedule as a calendar file that imports into Google Calendar or Apple Calendar, like the one in the original chat.
**Done when:** the downloaded file imports cleanly into both calendars with the right recurring dates and descriptions that match the user's real amounts; every reminder from feature 10 is in it; events show at the intended Lagos time (not shifted by an hour); a payday on the 29th to 31st still appears in February, on the last day.

- [ ] Build it: `/develop calendar export`

## Slice 6: Forward line

### 12. Forward line guidance · needs a decision · GA

Explain and split the forward allocation across Nigerian options (Treasury Bills, money market funds, dollar funds, equity funds) by risk, with a suggested split you can adjust. Education, never a recommendation to buy a specific product.
**Done when:** a user sees each option explained with its risk level, a suggested split of their forward amount in naira, can adjust it, and sees a clear not financial advice notice and when any quoted rate was last updated.

- [ ] Design it (spec): `/architect forward line guidance`

## Slice 7: Go public

### 13. Error monitoring & product analytics · needs a decision

Catch crashes, and measure the one signal that matters: whether people come back and log a match after their next payday. Also signups and how far people get through the first match.
**Done when:** errors are captured with enough context to fix them and no financial amounts are sent; the monthly check in rate and the signup to first match funnel are visible on a dashboard.

- [ ] Design it (spec): `/architect error monitoring & product analytics`

### 14. Legal & data rights · needs a decision · GA

What a public product handling personal financial data needs in Nigeria: a not financial advice notice, privacy policy and terms, consent at signup, and Nigeria Data Protection Act basics (export your data, delete your account).
**Done when:** signup records consent to current terms; the notice shows wherever guidance appears; a user can export all their data and delete their account, and deletion really removes it.

- [ ] Design it (spec): `/architect legal & data rights`

### 15. Free formation calculator · needs a decision

A public page where anyone types a salary and sees their formation on the pitch, no account needed, with an easy path to sign up and keep it.
**Done when:** a visitor sees their split without signing in; signing up carries their numbers into the new account; the page has search metadata and a social card.
**Candidates to weigh:** Upstash Ratelimit (only if bots abuse the public page or signup handoff)

- [ ] Design it (spec): `/architect free formation calculator`

### 16. Landing page · needs a decision

The marketing page in the UI_1 style that explains the formation idea in seconds and sends people to the calculator or signup.
**Done when:** the page explains the idea, links to the calculator and signup, has search metadata, a sitemap, and social cards, loads fast on a mid range phone, and passes WCAG AA.
**Candidates to weigh:** GSAP (only if the page needs scroll storytelling Motion cannot do) · Animata.design (animated Tailwind components, as inspiration rather than a dependency)

- [ ] Design it (spec): `/architect landing page`

### 17. Production plans & limits · from spec 0001

Move off free tiers before real users' money data arrives: Vercel Pro with a hard spend cap, Supabase Pro (backups, no pausing), and a verified Resend sending domain sized for launch day sign ups.
**Done when:** both paid plans are active with a spend cap set, the Resend domain passes SPF and DKIM, and no real user's data sits on a free tier project.

- [ ] Do it: follow the checklist in spec [0001](../specs/0001-stack-architecture/index.md) `## Follow-up`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **Bank data sync**: pull income and spending in automatically · needs a decision · GA
- **Automated money moves**: actually split and send money (licensed money flow) · needs a decision · GA
- **Premium plan & billing**: paid tier once check ins prove the habit · needs a decision · GA
- **Partner referrals**: fund manager or bank partnerships with disclosure · needs a decision
- **Native mobile apps**: store apps for stronger payday notifications · needs a decision · candidate: Capacitor (wraps the existing web app, no rewrite)
- **Offline logging**: save a match with no connection and sync later · needs a decision · candidate: Dexie.js (IndexedDB)
- **More currencies & countries**: beyond naira and Nigerian instruments · needs a decision
- **Nigerian Pidgin copy**: a second language that fits the tone · needs a decision
- **Staging environment**: a hosted staging Supabase project, previews pointed at it, automated migration deploys; once real users exist · from spec 0001

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State                        | Set by                                                                                 | The feature shows                                                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planned` · needs a decision | `/scope`                                                                               | one box: `Design it (spec): /architect <feature>`                                                                                                                                                                                            |
| `in-progress` (designed)     | **`/architect` at spec capture**                                                       | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled                     |
| `in-progress` (building)     | `/develop`                                                                             | milestone sub boxes tick one by one; code pointer filled                                                                                                                                                                                     |
| `in-progress` (verified)     | `/check verify`                                                                        | `Build it` + milestones ticked; `Verify it` ticked                                                                                                                                                                                           |
| `done`                       | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Candidates to weigh** lists tools that might fit a feature. Nothing is adopted yet: `/architect` decides each one (adopt or skip) during that feature's design, and the spec records the outcome.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
