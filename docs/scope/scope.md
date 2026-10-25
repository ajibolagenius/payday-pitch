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
| 4   | Design system & visual identity      | Foundation | in-progress |
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
| 18  | Matchday experience                  | Slice 4    | planned     |

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

### 4. Design system & visual identity

The system shipped in spec 0005 (tokens, two layer theming, component kit, pitch view, sticker set) stays; its **skin is reopened**. The old look (pitch green `#1B4638`, electric yellow `#F5FF6B`, near black surfaces, Space Grotesk) is the single most AI-generated-app signature in the market: dark canvas, one neon accent, one grotesque. The new direction commands formality first and sport second.

**Type:** Melodrama (high contrast display serif, 300 to 700) for headings and hero money figures, the voice of a private banking report · Switzer (neo grotesque, 100 to 900, true italics) for UI copy and body, the neutral precision the first pick was meant to give · Tabular (a family built for tabular figures, 300 to 700, italics) for every amount, so money columns align by design rather than by an OpenType toggle · Teko (condensed, 300 to 700) as an accent on the pitch only, for shirt numbers and formation labels. All four checked against the live Fontshare catalog on 2026-10-25 through `api.fontshare.com`, loaded through `next/font/local`, subset to the weights actually used because this app has to open fast on a Nigerian data plan.
**Color:** paper first. Warm paper surfaces, deep forest as the brand hue, amber gold as the single money accent, terracotta and slate reserved for state. Dark is kept as a theme with its own written out token layer, no longer the default; the app opens on paper. Every pair passes WCAG AA in both themes, and the amber gold gets checked on paper, not only on near black.
**Icons:** Phosphor replaces the vendored RuneIcons set across the whole app, including the pitch and stickers, using its regular and fill weights.
**Motion:** unchanged. Motion stays the only animation library, and every animated property stays gated on `prefers-reduced-motion`.
**Anti-slop rules** the refresh must hold, and `design.md` must state: no gradient headline text, no glassmorphism, no emoji as icons, no purple or blue-violet brand hue, no default shadcn radius or shadow left visible, no centered hero with three feature cards, no neon on near black, and no accent color used as body text. Banned families, all of them free on Fontshare and all of them the current AI default, so availability is not a reason to pick them: Inter, Space Grotesk, Poppins, Geist, Plus Jakarta Sans, Manrope, Outfit, Sora, Montserrat.
**Done when:** `design.md` and the token layer in `src/app/globals.css` describe the new system; every screen in the UI inventory below renders on it and passes the AA gate in both themes; Phosphor replaces RuneIcons with no orphaned imports; the pitch view reads as the same product under the new skin; `pnpm check:hex` and the contrast test stay green.
**Candidates to weigh:** Phosphor icons (adopted above, confirm the weight and licensing in the spec) · Zodiak and Gambetta as the fallback serifs if Melodrama reads too decorative at small sizes (both verified in the catalog, both with italics, which Melodrama lacks) · the Fontshare license for self hosting (every font on the service is free for personal and commercial use; confirm the current terms and vendor the files rather than hot linking the CDN) · Highcharts versus Recharts versus hand built SVG for the analytics tiles (Highcharts is commercial, spec 0005 already draws the pitch as SVG) · DiceBear, declined again in spec 0005, stays declined.

- [x] Design it: `/architect design system & UI foundation` (spec [0005](../specs/0005-design-system-ui-foundation.md), the shipped system; its palette and type are superseded by the box below)
- [x] Build it: `/develop design system & UI foundation` (spec 0005)
  - [x] Tokens, theming, shadcn base (AC-2, AC-7): spike, two layer token layer, dark default, type scale, ThemeToggle
  - [x] Starter component kit (AC-1, AC-2, AC-4): restyled primitives, MoneyText, StatTile
  - [x] Visual assets (AC-8): sticker set, RuneIcons vendoring, master SVG icons with the sharp generator
  - [x] Pitch view (AC-5, AC-6): slot coordinates in the domain, SVG field, bench strip, Motion layout transitions
  - [x] Demo route and contrast gates (AC-1, AC-3, AC-4): dev only page, token pair test, axe, keyboard and reduced motion checks, design.md
- [x] Design it (spec): `/architect visual identity refresh` (spec [0009](../specs/0009-visual-identity-refresh.md), the refresh: type, palette, theme default, icon swap, anti-slop rules)
- [ ] Build it: `/develop visual identity refresh` (spec 0009)
  - [ ] Type and tokens: Fontshare files vendored with the byte budget, `globals.css` two layer flip to paper first, light default, pair contract reshaped and green (AC-2 to AC-6)
  - [ ] Icon swap: Phosphor across app code, RuneIcons deleted, lucide confined to shadcn internals (AC-7)
  - [ ] Skin pass and e2e rewrite: pitch, every surface in the inventory, both themes, spec assertions moved onto the new identity (AC-8, AC-10, AC-11)
  - [ ] Peripheral color and gates: `brand-palette.ts` feeding emails, manifest, and app icons; `design.md` rewritten; full gate set (AC-1, AC-9, AC-11)
- [ ] Verify it: `/check verify design system & visual identity` (spec 0005 AC-1 to AC-8 plus the refresh acceptance criteria)
- [x] Test it: `/test design system & UI foundation` (refresh tests land with the new spec)

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

### 18. Matchday experience

What makes the app worth opening twice a month instead of once. Four mechanics, all built on data the earlier slices already store, none of them a points system or a badge wall.
**The matchday ritual.** Logging a match is an event, not a form submit: the squad is announced, players slide into their slots, amounts land, and a thin whistle tone marks the moment (short audio through the Web Audio API, no library, off by default in settings, gated on reduced motion). The first log of a season and a full 100% allocation get a stronger celebration than a routine one.
**Man of the Month.** When the forwards or goalkeeper hit their target for the month, the app names the position that earned it and says why in one line tied to the user's own numbers.
**Team sheet card.** One tap turns this month's lineup into a shareable image (formation name, eleven positions, amounts, the user's handle), drawn from the same SVG the pitch view already renders, sized for WhatsApp status and X. No amounts leave the device unless the user chooses to include them, and a hidden toggle strips money for people who want to share the shape only.
**Consistency and the season ladder.** Months in a formation, consecutive paydays logged, and progress toward the emergency fund's 3 to 6 months of defense, shown as a season bar rather than a streak counter that punishes a miss. A missed month reads as an injury, not a broken chain.
**Transfer window.** Once per month, after the split is logged, the user can move money between positions mid-cycle; each move is recorded against the match and shown in planned versus actual.
**Five season projection.** A view that takes the current formation and projects wealth five years out, then shows the same line under one aggressive change and one defensive change, with the assumptions on screen and a not financial advice notice. It reuses the forward line explanations from feature 12 and never quotes a live rate without a last updated date.
**Done when:** logging a match plays the ritual and can be skipped without losing the log; the team sheet card downloads and shares with correct amounts and degrades to a text summary when the image fails; a user who logs three consecutive months sees the ladder advance and a user who misses one sees no punishment; a transfer window move appears in planned versus actual for the month it happened; the projection states its rate assumption and updates when the formation changes; every animated element honors `prefers-reduced-motion`; the sound is off by default and a settings toggle controls it.
**Candidates to weigh:** howler.js (audio playback for the whistle and cheer, only if raw Web Audio proves too fiddly across browsers) · canvas-confetti (declined: Motion can do the celebration, and the anti-slop rules in feature 4 forbid the effect) · satori or `@vercel/og` (server side image generation for the team sheet card) · Motion plus (paid component set, only if the ritual needs something Motion free cannot do)

- [ ] Design it (spec): `/architect matchday experience`

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

## UI inventory

Every surface the product needs, so the visual refresh in feature 4 has a checklist to skin and each later feature knows where it lands. **Built** means the route or component exists in `src/`; **planned** names the feature that owns it.

### Pages and screens

| Surface                                                      | Route                               | State                             |
| ------------------------------------------------------------ | ----------------------------------- | --------------------------------- |
| Marketing home                                               | `/`                                 | built, placeholder for feature 16 |
| Sign in                                                      | `/sign-in`                          | built (feature 5)                 |
| Sign up                                                      | `/sign-up`                          | built (feature 5)                 |
| Email verification sent                                      | `/verify-email`                     | built (feature 5)                 |
| Recover account                                              | `/recover`                          | built (feature 5)                 |
| Reset password                                               | `/reset-password`                   | built (feature 5)                 |
| Auth callback                                                | `/auth/callback`                    | built (feature 5)                 |
| Home / this month                                            | `/app`                              | built (feature 6, 7)              |
| First match walk (4 steps: income, costs, formation, review) | `/app` walk flow                    | built (feature 6)                 |
| Tactics board                                                | `/app/tactics`                      | built (feature 7)                 |
| Offline                                                      | `/offline`                          | built (feature 1)                 |
| Design system proof page                                     | `/design-system` (dev only)         | built (feature 4)                 |
| Season view dashboard                                        | `/app/season`                       | planned (feature 9)               |
| Match history month list and detail                          | `/app/season/[month]`               | planned (feature 9)               |
| Debts list, add, and payoff progress                         | `/app/debts`                        | planned (feature 8)               |
| Goals list and detail                                        | `/app/goals`                        | planned (feature 12)              |
| Forward line guidance                                        | `/app/forward-line`                 | planned (feature 12)              |
| Settings (theme, reminders, sound, units)                    | `/app/settings`                     | planned (features 10, 14, 18)     |
| Profile and income streams management                        | `/app/profile`                      | planned (features 3, 10)          |
| Data export and account deletion                             | `/app/settings/data`                | planned (feature 14)              |
| Free formation calculator (public, no account)               | `/calculator`                       | planned (feature 15)              |
| Legal: privacy, terms, not financial advice                  | `/privacy`, `/terms`, `/disclaimer` | planned (feature 14)              |

### Modals, sheets, and overlays

| Surface                                                       | State                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| Add or edit an income stream                                  | built (feature 6)                                           |
| Add or edit a fixed cost                                      | built (feature 6)                                           |
| Formation preview on pick, with the unable to cover shortfall | built (feature 6)                                           |
| First match pitch tour (Driver.js spotlight, one time)        | built (feature 6)                                           |
| Save tactic, rename tactic, delete tactic confirm             | built (feature 7)                                           |
| Coaching suggestion card and its apply action                 | built (feature 7)                                           |
| Position share editor with the 100% lock                      | built (feature 7)                                           |
| Log this month's match, and the confirmation ritual           | built (feature 6), ritual planned (feature 18)              |
| Transfer window allocation mover                              | planned (feature 18)                                        |
| Team sheet card preview and share                             | planned (feature 18)                                        |
| Debt add or edit, with the monthly hit and shortfall          | planned (feature 8)                                         |
| Goal add or edit                                              | planned (feature 12)                                        |
| Reminder onboarding and per reminder opt out                  | planned (feature 10)                                        |
| Consent at signup, and the not financial advice notice        | planned (feature 14)                                        |
| Toasts (success, error, promise)                              | built (feature 4, sonner)                                   |
| Tooltip and popover layer                                     | built (feature 4)                                           |
| Global nav, mobile tab bar, and the app shell header          | built (feature 5 layout guard), tab bar planned (feature 9) |

### Reusable components

| Component                                                  | State                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Button, Card, Input, Badge, Tabs, Dialog, Tooltip, Toaster | built (feature 4)                                              |
| MoneyText (every amount on screen)                         | built (feature 4)                                              |
| StatTile (label, figure, delta)                            | built (feature 4)                                              |
| ThemeToggle                                                | built (feature 4), default flips in the refresh                |
| PitchView, PitchField, PlayerNode, zone math               | built (feature 4)                                              |
| Sticker set (hand drawn player art)                        | built (feature 4), re-skinned in the refresh                   |
| Icon set                                                   | built as vendored RuneIcons, Phosphor swap planned (feature 4) |
| AmountField, EntryList, FormationPicker, PitchReview       | built (feature 6)                                              |
| TacticsBoard, SpotEditor, SuggestionCard, TacticList       | built (feature 7)                                              |
| AuthForm and its sign in, sign up, recover, reset variants | built (feature 5)                                              |
| Radar chart (position balance, UI_2 style)                 | planned (feature 9)                                            |
| Progress bar and fund months meter                         | planned (features 9, 7)                                        |
| Planned versus actual bar pair                             | planned (feature 9)                                            |
| Sparkline and season trend line                            | planned (features 9, 18)                                       |
| Projection chart with assumption caption                   | planned (feature 18)                                           |
| Empty state, loading skeleton, and error state primitives  | built per feature, promote to shared in the refresh            |
| Position legend and bench strip                            | built (feature 4)                                              |
| Share card canvas                                          | planned (feature 18)                                           |

## Tool list review

The candidate tools from the research list, decided once so no later feature re-litigates them. Each feature's own `Candidates to weigh` line still wins if it names a tool again.

**Adopted:** Driver.js (tours, spec 0007) · Phosphor Icons (replaces RuneIcons in the feature 4 refresh) · Fontshare Melodrama, Switzer, Tabular, Teko (the type system, all four verified in the live catalog) · Motion (already the only animation library) · sharp (icon generation) · react-email (auth email, spec 0006) · impeccable (design skill).

**Fonts weighed and declined, all of them on the Fontshare catalog:** Clash Display and Clash Grotesk (the faces every Fontshare-using site reaches for, so they read as a template) · Satoshi and Chillax (pleasant, no authority for money) · Cabinet Grotesk (too quirky for a bank voice) · Bebas Neue and Oswald (the generic sports-jersey cliché) · JetBrains Mono (the dev-tool cliché, and this app's numbers deserve a purpose built face) · Poppins, Montserrat, Plus Jakarta Sans, Manrope, Outfit, Sora, Space Grotesk (the AI default set, banned in feature 4).

**Declined, with the reason:**

- **react-spring, anime.js, Theatre.js, Popmotion, GSAP, Lenis, barba.js, Locomotive Scroll** · Motion already owns animation in this stack and two libraries fighting over the same properties is the failure mode. GSAP and Lenis stay possible for the landing page only, as feature 16 already notes.
- **Highcharts** · commercial license for a hobby-priced product; the pitch view proves hand built SVG is enough, and Recharts or visx is the fallback if a chart gets too hard to draw by hand.
- **Animata.design** · copy-paste components in the old volt-on-black look; inspiration only.
- **Motion+** · paid examples and components, nothing the app needs.
- **DiceBear, Gravatar** · declined in spec 0005 and it stays declined; the hand drawn sticker set is the identity.
- **MapLibre, luma.gl, Leaflet, Photon, OpenStreetMap, Mapbox** · there is no map in this product.
- **Three.js, Konva, Fabric.js** · a 3D or canvas pitch is a slower path to the same screen the SVG pitch view already reaches. Only the share card in feature 18 might want a canvas, and satori is the cheaper answer.
- **Tippy.js** · shadcn Tooltip already ships the accessible version.
- **Split.js** · no resizable panes on a phone.
- **libphonenumber-js** · no phone numbers anywhere in the product; revisit only if WhatsApp reminders (feature 10) need number validation.
- **OpenWA** · unofficial WhatsApp gateway, the number ban risk is the whole reason feature 10 names WhatsApp Cloud API instead.
- **telegraf.js** · a Telegram bot is one channel in feature 10's decision, not a foundation.
- **gluestack, Nativewind** · React Native and Tailwind-for-native; this is a web app. Capacitor stays the native path in Deferred.
- **Dexie.js, RxDB, WatermelonDB** · offline match logging, already Deferred in the scope.
- **Convex, Turso, Pinecone, Milvus, Temporal, Apinator, Upstash (as a database)** · Supabase is the backend; a vector database and a durable execution engine solve problems this product does not have. Upstash QStash remains live as feature 10's scheduler fallback.
- **Voltra, Tauri, Surge, tldr pages, Material for MkDocs, k1LoW/mo, OverType, free-apis.github.io, Cartesian Sonic-3, HyperFrames, Remotion** · not applicable: an internal component library, desktop shells, static hosting, docs tooling, a markdown reader, a markdown editor, an API directory, a TTS voice, and video generation. HyperFrames and Remotion become relevant only if marketing wants a launch film, which is not a feature here.

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
