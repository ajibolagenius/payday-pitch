# Scope: Payday Pitch

A mobile friendly web app that turns your monthly salary into a football lineup. You pick a formation (4-4-2, 4-3-3, 3-5-2, and more), and each one splits your money differently across goalkeeper (emergency fund), defenders (fixed living costs), midfield (debt, upskilling, short term goals), forwards (wealth building), and bench (guilt free spending). It serves salary earners in Nigeria first, including people with several income streams, and switches tactics as life changes: a "Park the Bus" formation while you clear a debt, an "Attacking 4-3-3" once you are free of it. It plans and tracks only. It never connects to a bank or moves money.

**Build approach:** Tracer Bullet (one thin, real thread through the whole loop first, then each slice thickens one segment end to end).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Data model | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | Sign in & accounts | Slice 1 | planned |
| 6 | First match loop | Slice 1 | planned |
| 7 | Tactics board | Slice 2 | planned |
| 8 | Debt mode (Park the Bus) | Slice 3 | planned |
| 9 | Season view | Slice 4 | planned |
| 10 | Payday reminders | Slice 5 | planned |
| 11 | Calendar export | Slice 5 | planned |
| 12 | Forward line guidance | Slice 6 | planned |
| 13 | Error monitoring & product analytics | Slice 7 | planned |
| 14 | Legal & data rights | Slice 7 | planned |
| 15 | Free formation calculator | Slice 7 | planned |
| 16 | Landing page | Slice 7 | planned |
| 17 | Production plans & limits | Slice 7 | planned |

## Foundations

### 1. Stack & architecture
Decide the stack for a mobile friendly, installable web app and scaffold a runnable project so every later slice builds on real structure.
**Done when:** the stack is recorded in a spec, and the empty scaffold boots locally, passes build, and loads well on a phone screen.
spec [0001](../specs/0001-stack-architecture/index.md) · code in `src/`, `public/sw.js`
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
- [ ] Verify it: `/check verify stack & architecture`
- [ ] Test it: `/test stack & architecture`

### 2. Coding standards & tooling
Capture conventions, then install lint, format, and pre commit enforcement from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, and pre commit run clean.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. Data model · needs a decision
Core entities every slice builds on: users, income streams (amount and payday), formations (the built in list plus custom tactics) and their positions with percentages, monthly matches (what you actually put where), debts, and goals. Money stays exact and carries its currency, so more currencies can come later.
**Done when:** the entities support every slice through investment guidance (formation switches, debt payoff, season history, reminders) without a breaking migration, and no amount is stored as an approximate number.
- [ ] Design it (spec): `/architect data model`

### 4. Design system & UI foundation · needs a decision
The visual language from the references in `~/Downloads/assets/`: pitch green `#1B4638`, electric yellow `#F5FF6B`, near black surfaces, Space Grotesk, analytics style stat tiles and radar charts (UI_2), and the hand drawn football sticker style (DES_1 to DES_3). Includes the pitch view component every money screen uses.
**Done when:** `design.md` covers type, color, spacing, and components; every color pair passes WCAG AA contrast (yellow text on light surfaces needs checking); base components handle focus, keyboard, and screen readers; the pitch view shows a formation with amounts.
**Candidates to weigh:** Motion (animation library for the whole app) · DiceBear (generated player avatars in the sticker style) · Impeccable or Taste Skill (AI design skill, pick one) · sharp (one off script to generate manifest icons)
- [ ] Design it (spec): `/architect design system & UI foundation`

## Slice 1: First match (the core loop, also the walking skeleton)

### 5. Sign in & accounts · needs a decision · GA
Real accounts from day one, so a person's formation and history are private, saved, and follow them across devices.
**Done when:** a user can sign up, sign in, sign out, and recover access; nobody can read another user's financial data; sessions survive a phone browser restart.
**Candidates to weigh:** react-email (sign up and recovery email templates, rendered to HTML for Supabase Auth)
- [ ] Design it (spec): `/architect sign in & accounts`

### 6. First match loop · needs a decision
The thinnest real thread: add your income streams, pick a formation, and get a split that fits it. Each formation has its own style and money split: 4-4-2 balanced, 4-3-3 attacking (more to investments), 3-5-2 midfield heavy (more to upskilling and goals), 4-2-3-1 steady builder, 5-3-2 defensive (high fixed costs), 5-4-1 Park the Bus (debt first). Then log this month's match (what you actually put in each position) and see it saved. No custom percentages, debts, or reminders yet.
**Done when:** a signed in user enters one or more incomes, picks any formation from the list, and sees the players arranged in that shape on the pitch with each position's amount in naira and a one line "when to play it"; switching formation updates the split right away; the logged match keeps the formation it was played in and is still there after reloading; empty and error states render.
**Candidates to weigh:** Motion layout animations (players slide to new positions on a formation switch) · Driver.js (short first match tour explaining each position)
- [ ] Design it (spec): `/architect first match loop`

## Slice 2: Tactics

### 7. Tactics board · needs a decision
Start from any formation and tune it: adjust each position's percentage yourself, save it as your own tactic, and get coaching nudges when the shape gets risky. A suggested formation based on your situation (debt, thin emergency fund, high fixed costs) lives here too.
**Done when:** a user edits percentages on top of a chosen formation and saves it as a custom tactic; the total always reaches 100% before it saves; a warning shows when defense passes 50% of income or the goalkeeper drops to 0%; the app suggests a formation that fits the user's numbers; the next match uses the new shape.
- [ ] Design it (spec): `/architect tactics board`

## Slice 3: Debt mode

### 8. Debt mode (Park the Bus) · needs a decision
Add a debt with its balance and target date; the app works out the monthly hit, moves you into a defensive formation, tracks each payment, and calls the Final Whistle when it is cleared, then suggests the attacking formation.
**Done when:** a user adds a debt and sees the monthly amount needed to clear it by the target date; logged payments reduce the balance; clearing it prompts a switch to an attacking formation; more than one debt is handled.
- [ ] Design it (spec): `/architect debt mode`

## Slice 4: Season view

### 9. Season view · needs a decision
The dashboard: match history month by month, planned versus actual per position, emergency fund progress toward 3 to 6 months of defense costs, and a stats view in the UI_2 analytics style.
**Done when:** a user with several logged matches sees history, planned versus actual, and emergency fund progress; a brand new user sees a helpful empty state; it stays readable on a phone.
- [ ] Design it (spec): `/architect season view`

## Slice 5: Matchday rhythm

### 10. Payday reminders · needs a decision
Nudges on the real rhythm of your money: a Payday Whistle when each income stream should land, a Match Kickoff to make the split, and a monthly Tactical Review.
**Done when:** each income stream's payday triggers a reminder, the kickoff and review reminders follow it, users can turn each one off, and nothing fires for a deleted income stream.
**Candidates to weigh:** WhatsApp Cloud API (official, where Nigerians read messages; not OpenWA, which is unofficial and risks number bans) · Telegram bot via telegraf.js (free, official) · react-email (reminder email templates) · Upstash QStash (scheduler fallback if Supabase Cron falls short)
- [ ] Design it (spec): `/architect payday reminders`

### 11. Calendar export
Download your reminder schedule as a calendar file that imports into Google Calendar or Apple Calendar, like the one in the original chat.
**Done when:** the downloaded file imports cleanly into both calendars with the right recurring dates and descriptions that match the user's real amounts.
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

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Candidates to weigh** lists tools that might fit a feature. Nothing is adopted yet: `/architect` decides each one (adopt or skip) during that feature's design, and the spec records the outcome.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
