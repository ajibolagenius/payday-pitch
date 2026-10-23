# 0007. First match loop: the guided walk from income to a played match

**Date**: 2026-10-23
**Status**: In Progress

## Summary

This is the app's core loop, the first thin thread a real user walks end to end. A signed in person adds their incomes and real fixed costs, picks one of the six formations, sees every position's naira amount on the pitch, optionally records what they actually put in each spot, and plays the match. One database operation writes the whole month, so a half written match cannot exist. Switching formations previews instantly (nothing is saved until the person confirms), picking again to fix a month keeps the history honest, and a guided tour explains the positions once. No new tables: spec 0004 already stores everything this needs.

## Context

The placeholder at `/app` says "your formation will show here". Features 1 to 5 built the ground: the eleven table schema with RLS and seeded formations (spec 0004), the design system and the pitch view that already animates between formations (spec 0005), and real accounts with a guarded app layout (spec 0006). What does not exist yet: the money split maths, any write path for incomes, costs, or matches, and any signed in screen beyond the placeholder.

The forces that shape the design. Money must stay exact: integer kobo, no floats, defense (the fixed cost zone) must always be fully funded, and a formation that cannot cover a person's rent must say so rather than shrink it (the scope's hard rule). History must not move: the match stores a frozen copy of every amount, so editing rent later never rewrites a past month (spec 0004). The write must be honest under failure: a match and its twelve lines are all or nothing, and the database enforces sums and uniqueness with triggers whose raw errors mean nothing to a user. One engineer plus agents builds this, so fewer moving parts and constraints doing the guarding beat discipline.

Not deciding means the split gets invented per screen, the supersede path ships unused, and the friendly error mapping spec 0004 explicitly owes here stays owed.

## Requirements

**User stories**:

- As a salary earner, I want to walk through my money once and see it lined up on a pitch, so that the plan is real, visible, and saved in a few minutes.
- As a salary earner, I want to correct a month I logged wrong, so that my history shows what actually happened without pretending it never changed.
- As a builder, I want one atomic write for a played match and frozen snapshots, so that half written months and moving history are impossible.

**Acceptance criteria**:

- **AC-1**: A signed in user completes a four step guided walk: incomes, fixed costs, formation picker, pitch review and play. Each income row takes a name, a naira amount, and a payday day from 1 to 31. Each cost row takes a name and a naira amount. Every entry saves immediately; reopening `/app` re-derives the current step from the stored data (no separate progress pointer).
- **AC-2**: Amount parsing accepts whole naira or up to two decimal places, converts to integer kobo in `src/domain/` (never in a component), and rejects more precision, negatives, zero, and non numbers with a field error. Stored rows are `bigint` kobo with currency NGN; the forms expose no currency selector.
- **AC-3**: The formation picker lists all six library shapes from the `formation_shape` and `formation_position` tables (name, style line, "when to play" line, zone shares). It reads from the database, not the static `FORMATIONS` array, and ignores deprecated shapes for new picks.
- **AC-4**: The split follows spec 0004's two step rule: the DEF zone total equals the current fixed cost sum, allocated across DEF spots by intra zone basis points with largest remainder; income left after defense splits across GK, MID, FWD, and BENCH spots by basis points with largest remainder. The lines sum to the income exactly, kobo for kobo. Choosing a formation previews the new split at once without writing anything.
- **AC-5**: When a shape's DEF basis point share of income (integer floor of `income * DEF_bps / 10000`) falls below the fixed cost total, that formation renders as unable to cover, states the shortfall in naira, and its play action refuses with a friendly error. Defense never drops below the entered costs. When income cannot cover costs at all, every shape shows unable to cover with its shortfall, play stays disabled, and the picker carries a notice explaining the gap (there is no silent dead end).
- **AC-6**: Confirming plays the match: one operation inserts the `match` row (period derived server side from `Africa/Lagos`, never from client input) and all twelve `match_line` rows with frozen role, spot index, label, basis points, planned amount, and currency, in one transaction. Actuals are optional per slot on the confirm step; a slot left blank stores null (not logged) and an entered 0.00 stores zero (moved nothing). Replaying the current month marks the old match `superseded` and inserts the new one in the same transaction, copying each entered actual to the matching slot key (role plus position within role, ordered by spot index); spots with no match start empty for review.
- **AC-7**: The played match renders through the existing `PitchView` with `<MoneyText>` on every slot, Motion layout animation on formation switch gated by `prefers-reduced-motion`, and full keyboard reach. A Driver.js tour spotlights GK, DEF, MID, FWD, and BENCH once, guarded by a localStorage flag, with inline copy on every step and no tour blocking.
- **AC-8**: A returning user sees the right state: an active match in the current Lagos month shows the saved pitch with a "Play this month again" correction entry, and the pitch and picker carry an "update your numbers" entry back to the walk's first two steps whenever incomes or costs are empty. No current match but a recent one shows the last pitch with "Start this month" opening the formation step; missing incomes or costs open the walk at the first empty step.
- **AC-9**: Every write is a Server Action built with a new `authedAction()` helper (Zod validated, returns `ActionResult`, expected failures never throw, no `user_id` from the client), unit tested like spec 0001 requires. Raw database errors (unique violation 23505, trigger failures, mixed currency refusal) map to the enumerated friendly codes: `ok`, `shape_not_found`, `shape_deprecated`, `no_income`, `unable_to_cover`, `mixed_currency`, `conflict` (a concurrent second tab loses on the one active index and shows "this month was just played, reload"), `validation`, `not_found`, and `unexpected` for anything unmapped.
- **AC-10**: Empty, loading, and error states render for every surface: no incomes yet, no costs yet, no match yet, all shapes unable to cover, an action failure shows a `sonner` toast with the friendly message.

## Options considered

### Option 1: Guided walk with a draft preview, one atomic RPC per played match

Four steps derive their position from the stored data. Incomes and costs write through ordinary RLS backed actions. The played match goes through one Postgres function (`public.play_match`, the API exposes only `public`) that re checks the invariants, supersedes if needed, and writes the match and all twelve lines inside one call, returning a small result object with a code.

**Pros**:

- All or nothing by construction: the batch sum triggers see the complete twelve line statement, the one active match index is enforced, and the whole write lives or dies inside the function's single call.
- The defense floor, the mixed currency refusal, and the supersede copy live next to the data, so no client or script can write a dishonest month.
- Friendly error codes come straight out of the function instead of being scraped from raw 23505 or trigger text.

**Cons**:

- One more database function to write, migrate, and test, and its security definer surface needs care (explicit ownership filter, locked search path).
- The payload (twelve actual values) crosses as JSONB, which typed actions must shape.

### Option 2: Application level chain under RLS

The action issues the inserts itself: match first, then lines fetched back through a subselect insert, supersede as a prior update, all under the user's own RLS policies.

**Pros**:

- No new database code; every rule reads as ordinary TypeScript.

**Cons**:

- Server Actions are not one database transaction: a failure between the match insert and the lines insert leaves a match with no lines (each request commits on its own, and the batch sum trigger rejects any per request line write), and a second tab or a retry can interleave a supersede with a fresh insert. This is the exact half written month the design must make impossible.

### Option 3: Client draft state, per line RLS writes

The browser holds the draft and, on confirm, writes each line as its own request under RLS.

**Pros**:

- Least new server code.

**Cons**:

- Twelve round trips, no atomicity, and the client could tamper with planned amounts, breaking the snapshot promise. Named only to be rejected.

## Decision

**Chosen option**: Option 1: Guided walk with a draft preview, one atomic RPC per played match

The loop is a four step data derived walk; incomes, costs, and the formation library read and write through RLS backed actions; playing or correcting a month is one `public.play_match` Postgres function called by a single Server Action.

**Implementation skills**: `supabase` (global, `~/.claude/skills/supabase/`) · `vitest` (`antfu/skills`, `.claude/skills/vitest/`) · `ask-sonner` (global, `~/.claude/skills/ask-sonner/`) · `impeccable` (global, `~/.agents/skills/impeccable/`)

## Rationale

Option 2 fails the one requirement this feature cannot compromise: a match and its lines are all or nothing, and a Server Action is a sequence of separate PostgREST calls, not a transaction. Per request line inserts would even be rejected mid batch by the statement level sum trigger (it checks after each write, so a partial batch fails), which is honest but useless to a user: only one call holding the whole write gives a real all or nothing. Option 3 trades the snapshot's honesty (planned amounts computed on a client) for less server code, which is the wrong side of the trade. The walk shape and the draft preview follow the conversation decisions: the state of the data IS the progress, so nothing to store and nothing to go stale; formations come from the library tables so the deprecated flag has one home; defense splits by basis points with largest remainder per spec 0004 (the stale headcount comment in `src/domain/formations.ts` gets corrected by this build, not the spec). The domain owns the arithmetic and the function only re checks it, so there is one maths home (spec 0001) and the database stays the backstop.

Driver.js is adopted (active, MIT, under 8 kB, released this month) for the one time pitch tour, declined for the whole walk: inline copy already exists in the seed data, and a tour over four form steps is more glue than value. The decline for further Driver.js skill or MCP discovery is recorded here so no later stage re-offers it.

## Feature design

**Data model**: no new tables, no migration for the schema itself. Written tables: `income_stream`, `fixed_cost`, `match`, `match_line`. Read tables: `formation_shape`, `formation_position` (library), `profile` (currency). The one new database object is the `play_match` function, shipped in a small additive migration. It lives in `public` because PostgREST exposes only `public` (the local `config.toml` confirms it); `private` stays the home of trigger internals, which must not become API reachable. The domain builds a `Formation` object (the shape `PitchView` already takes) from library rows ordered by `spot_index`, and gets coordinates from `formationSlotCoordinates(name)`, keyed by name, which matches all six seeds.

**State transitions**: none new; this feature is the first real driver of spec 0004's match machine. `match: (none) → active` on play; `active → superseded` only inside the replay transaction, which always inserts the replacement in the same call.

**API surface** (Server Actions, all via `authedAction()`, none accepts a user id):

| Action                                                                   | Key inputs                                                                                                      | Key outputs              | Auth      | Key errors                                                                                                                                                                   |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addIncomeAction`                                                        | name text 1 to 80, amountNaira string, paydayDay int 1 to 31                                                    | new row id               | signed in | validation field errors                                                                                                                                                      |
| `updateIncomeAction`                                                     | id bigint (owned row), same fields                                                                              | ok                       | signed in | not_found, validation                                                                                                                                                        |
| `deleteIncomeAction`                                                     | id bigint                                                                                                       | ok                       | signed in | not_found                                                                                                                                                                    |
| `addFixedCostAction` / `updateFixedCostAction` / `deleteFixedCostAction` | cost shape as income minus paydayDay                                                                            | id / ok                  | signed in | validation, not_found                                                                                                                                                        |
| `playMatchAction`                                                        | shapeId bigint, actuals array of `{ spotIndex int, actualNaira string or null }` (twelve)                       | match id, period         | signed in | `unable_to_cover` (with shortfall), `mixed_currency`, `shape_not_found`, `shape_deprecated`, `no_income`, `conflict` (a concurrent second play lost on the one active index) |
| Reads (page server, not actions)                                         | current incomes, costs, library shapes with positions, active match for current Lagos period, most recent match | typed props for the walk | signed in | none (empty arrays render empty states)                                                                                                                                      |

`play_match(p_shape_id bigint, p_lines jsonb)`, in `public`: `security definer`, owned by `postgres` (the migration owner, which already owns every table, so the body needs no extra table grants), `set search_path = ''`, execute revoked from `public` and `anon`, granted to `authenticated` only (spec 0004's revoke from `authenticated` rule was trigger scoped; an API facing function is the deliberate exception). The action computes every amount in `src/domain/money.ts` and passes the complete twelve line payload (role, spot index, label, basis points, planned kobo, actual kobo or null, currency). The function owns no arithmetic: it resolves the user from `auth.uid()` and filters every read and write by it explicitly, re reads incomes and costs (so the defense floor uses current truth), refuses mixed currencies against the profile currency (NGN default), re checks the invariants against its own re read (the bps sum equals 10000, the planned sum equals the income sum, the DEF planned total equals the cost total, the floor rule, twelve lines, one line per spot), computes the period from `Africa/Lagos` with `timezone('Africa/Lagos', now())`, supersedes any active match for the period (copying entered actuals to matching slot keys via `row_number() over (partition by role order by spot_index)`), inserts the match row, then inserts ALL twelve lines in ONE `INSERT ... SELECT FROM jsonb_to_recordset(...)` statement. That last shape is forced by the shipped database, not preference: the line sum checks are statement level AFTER triggers with transition tables (the migration comment says a deferred constraint trigger would fire before its batch completes), so a line at a time loop would trip the check on a partial batch. A concurrent second play loses on the partial unique index; the function lets 23505 surface and the action maps it to `conflict`. It returns JSONB `{ code, match_id, period }`.

**Value sourcing**:

| Value                         | Source                                                                                                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total monthly income          | Sum of `income_stream.amount_minor` for the user, all NGN (AC-2)                                                                                                                                           |
| Defense zone total            | Sum of `fixed_cost.amount_minor` for the user (AC-4)                                                                                                                                                       |
| Per slot planned              | Two step largest remainder rule in `src/domain/money.ts`, from the two sums plus library basis points (AC-4)                                                                                               |
| Per slot planned              | Two step largest remainder rule in `src/domain/money.ts`, from the two sums plus library basis points; computed by the action, passed in the payload, re checked (never recomputed) by the function (AC-4) |
| Largest remainder tie break   | Remainder descending, then lower spot index first; one rule, stated in code and unit tested, identical in the preview and the stored lines (AC-4)                                                          |
| Shape DEF share (floor check) | `floor(income * DEF_bps / 10000)` integer math, shortfall = cost total minus that share (AC-5)                                                                                                             |
| Currency                      | `profile.default_currency`, NGN when no profile row (spec 0004 AC-10)                                                                                                                                      |
| Period                        | `Africa/Lagos` current month first day, computed in the function and mirrored by `src/domain/dates.ts` for reads; never a client value (AC-6)                                                              |
| Slot key (correction copy)    | role plus index within role, stable per spec 0005; old actual copied to matching new spot (AC-6)                                                                                                           |
| Formations list               | `formation_shape` joined `formation_position` where not deprecated, order by `sort`, `spot_index` (AC-3)                                                                                                   |
| Tour shown flag               | localStorage key `pp.pitch-tour.seen`; no server column (AC-7)                                                                                                                                             |
| Actual per slot               | Confirm step input, parsed naira to kobo, null when left blank (AC-6)                                                                                                                                      |

**Key invariants** (DB enforced unless noted): spec 0004's hold (basis point sums via the statement level batch triggers, one active match per period, snapshot immutability, no floats). Added by this feature, application and function level: DEF planned total equals the fixed cost sum exactly; no line's planned is negative; lines sum to income exactly (largest remainder guarantees it); mixed currency refuses creation; period and user are never client supplied. The domain computes, the function re checks (never recomputes), so the preview and the stored snapshot can only agree or the write refuses. The stale comment in `src/domain/formations.ts` (headcount split) is corrected to the basis point rule in this build.

**Security model**: signed in only, RLS as spec 0004 defines (this feature adds no policy). `play_match` is `security definer` in `public` (the reachability placement above): empty search path, owned by `postgres`, execute for `authenticated` only (revoked from `public` and `anon`), filters every table by `(select auth.uid())` in its own WHERE clauses, and takes no user identifying input. Amounts never reach logs or analytics (none exist yet; feature 13 owns that boundary). The tour flag is cosmetic data in localStorage, no privacy weight.

**Configuration required**: no new environment variables. One new dependency: `driver.js` (npm, MIT). One new migration (the function). `pnpm db:types` regenerates types after it.

**Critical test scenarios** (each maps to an AC):

- Happy path: fresh account walks all four steps, plays 4-4-2 with two incomes and three costs, reloads, and sees the same saved pitch; the lines sum to income kobo for kobo and DEF equals the cost total. Verifies **AC-1**, **AC-4**, **AC-6**, **AC-8**.
- Failure case: costs exceed any 5 defender shape's zone share; the picker marks it unable to cover with the naira shortfall, and forcing the call returns the friendly code. Verifies **AC-5**, **AC-10**.
- Correction: play October, replay with a different formation; the old row is `superseded`, actuals land on matching slot keys, unmatched spots are null, and season reads would show only the active row. Verifies **AC-6**, **AC-8**.
- Atomicity: a play call with a bad shape id, an execute attempt as `anon`, and two concurrent calls for the same period all leave zero orphan rows (never a match without its twelve lines, never two active rows; the loser gets `conflict`), and a hand written partial batch of lines is rejected by the batch sum trigger. Verifies **AC-6**, **AC-9**.
- Amount input: "45000.500" rejected, "-1" rejected, "0" rejected, "45000" stored as 4500000 kobo. Verifies **AC-2**.
- Auth/permission: a second user's action calls read and delete nothing of the first user's rows (RLS), and an anonymous visitor to `/app` is redirected (spec 0006 gate untouched). Verifies **AC-9**.
- UI states: reduced motion switch jumps players with no transform transition; keyboard reaches every node; the Driver.js tour appears once and never again; empty states render for no incomes, no costs, no match. Verifies **AC-7**, **AC-10**.

## Build plan

Tracer Bullet: this slice IS the thread. Domain maths first (pure, testable, no UI), then the write path (helper, actions, function), then the screens that walk the loop, thickening at the end (tour, states, polish).

1. [x] Domain: two step split engine with intra zone largest remainder in `src/domain/money.ts` (tie break: remainder descending, then lower spot index), `parseNaira` to kobo, `src/domain/dates.ts` (current Lagos period, clamped day helpers), correct the stale headcount comment in `formations.ts`, plus Vitest (sums exact, remainder ties identical across runs, floor boundary on the DEF share, parse rejects, Lagos month edge on UTC boundary days). Satisfies **AC-2**, **AC-4**, **AC-5** (maths), **AC-6** (period).
2. [x] `authedAction(schema, handler)` in `src/lib/actions.ts` composing `requireClaims` + `parsePayload` + `ActionResult`: handler receives `{ userId, client, input }` and returns data or a failure; claim and parse failures become codes, anything unmapped returns `unexpected`, no expected failure throws. Unit tests. Satisfies **AC-9**.
3. [ ] Income and fixed cost CRUD actions with Zod schemas (`src/features/streams/`, `src/features/costs/`), RLS backed, sonner friendly errors. Satisfies **AC-1**, **AC-2**, **AC-9**, **AC-10**.
4. [ ] Additive migration: `play_match` in `public` (`security definer`, `search_path = ''`, postgres owned, execute to `authenticated` only, ownership filters on every statement, invariant re checks, supersede plus actuals copy by `row_number()` slot key, match insert then ALL twelve lines in one `INSERT ... SELECT FROM jsonb_to_recordset` statement, JSONB result code), Vitest isolation and atomicity tests, `pnpm db:types`. Satisfies **AC-5**, **AC-6**, **AC-9**.
5. [ ] `playMatchAction` calling the function with domain computed payloads; `listFormations()` read from library tables joined and mapped to domain `Formation[]`; read helpers for incomes, costs, current and last match. Satisfies **AC-3**, **AC-4**, **AC-5**, **AC-8** (reads).
6. [ ] Screens: replace the `/app` placeholder with the data derived walk (steps for incomes, costs, picker, review), AmountInput (naira, numeric keyboard), formation cards with unable to cover badges and live preview split, the all shapes unable to cover notice, the "update your numbers" entry when incomes or costs are empty, confirm step with optional per slot actuals, play and correction entries, returning user states. Satisfies **AC-1**, **AC-3**, **AC-5**, **AC-7** (render), **AC-8**, **AC-10**.
7. [ ] Driver.js pitch tour: client component, spotlight the five zones once per localStorage flag, reduced motion respected for its scrolling, skip never blocks the step. Satisfies **AC-7**.
8. [ ] Playwright: full walk happy path, correction, unable to cover, reload persistence, empty states; a11y pass on the new screens (keyboard, axe). Satisfies **AC-1**, **AC-6**, **AC-7**, **AC-8**, **AC-10**.

## Consequences

**Positive**:

- The product's promise becomes demonstrable: a real person's real money, lined up and saved.
- Honest history by construction from the first user: snapshots, floor rule, and atomic writes all shipped, not promised.
- `authedAction()` stops being convention only; every later slice's writes inherit the shape.
- The play function is the same shape feature 8 (debt mode) and feature 9 (season view) will reuse; they add inputs, not new write paths.

**Negative / tradeoffs**:

- One more `security definer` function to audit; a mistake there is serious, so task 4's isolation tests are not optional.
- Replaying a month burns superseded rows on purpose; storage grows with corrections (trivial at this scale, noted for honesty).
- Draft is client state: closing the tab mid preview loses the draft (never the saved rows). Accepted for a four step walk.
- Driver.js adds its stylesheet globally on the pitch step; a small clash surface with the token layer.
- The picker preview recomputes on the client for the current data; a stale read after an edit shows a stale preview until refetch (sonner plus revalidate covers it).

**Neutral**:

- New pattern for the repo: first `security definer` API function, first JSONB payload action, first third party client library beyond the shadcn set.
- `FORMATIONS` in `formations.ts` stays the seed source and demo material; live screens now read the library. The two must stay name compatible (the coordinates key), guarded by existing Vitest tables.
- Payday day is collected and stored but nothing reads it until feature 10.

## Follow-up

- [ ] Feature 10 (reminders) reads `income_stream.payday_day`; confirm the stored values are real (asked in the form since this feature) and decide the clamp rule.
- [ ] Feature 9 (season view) should read superseded rows as correction history; the data is there from AC-6, the UI is not.
- [ ] `driver.js` declined for Agent Skill and MCP discovery at design time (record so nothing re-offers it).
- [ ] If a tactics board (feature 7) needs to play a custom shape, `play_match` grows a tactic source branch then; its source pairing check already exists in the schema.
- [ ] Run `pnpm db:types` in CI after task 4's migration (spec 0004 follow-up about the drift check still applies).
- [ ] Spec 0004's prose calls the sum checks "deferrable constraint triggers"; the shipped migration uses statement level batch triggers with transition tables (same guarantee for one statement, different mechanism). `/sync` or an `/architect` touch on 0004 should align the wording, and any future per row line write must know the batch rule.
