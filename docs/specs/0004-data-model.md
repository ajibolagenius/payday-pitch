# 0004. Data model: eleven tables that keep money exact and history true

**Date**: 2026-10-21
**Status**: In Progress

## Summary

This is the whole database for Payday Pitch, designed once and built in one migration. Eleven tables cover the money loop end to end: income streams, fixed costs, the formation library, saved custom tactics, logged matches with one row per position, debts, and goals. Amounts are stored as whole kobo (the smallest naira unit) with a currency code on every row, never as approximate numbers. A logged month keeps a frozen copy of everything it was played with, so changing a formation, a debt, or a cost never rewrites history. Every later slice builds screens on these tables and should not need a new migration.

## Context

Every later slice reads and writes the same core facts: what a person earns and when, what they must pay, how a formation splits the rest, what they actually put where each month, what they owe, and what they save toward. Spec 0001 fixed the rules those facts must obey: integer minor units with a currency code, no floats, isolation by RLS (rules inside the database that stop anyone reading another person's money) in every table, Lagos as the calendar clock, migrations as plain SQL. The scope adds one hard test: the model must carry every slice through investment guidance without a breaking migration, which means the decisions that touch future features (currency per row, snapshot shapes, deletable debts) are load bearing today.

The pressure points are honesty and exactness. History must not shift when present data changes: rent rises, a tactic gets edited, a debt is cleared and removed. Money must never round quietly. And the data is personal financial data held by a solo builder on a free tier, so the design has to be operable by one person: few moving parts, and constraints doing the guarding instead of discipline.

Not deciding means each slice invents its own tables and the season view gets assembled from five incompatible shapes, with a rewrite arriving exactly when real users do.

## Requirements

**User stories**:

- As a salary earner, I want my incomes, costs, and logged months stored exactly, so that what I planned and what I did stay truthful over years.
- As a builder, I want one agreed schema for all slices, so that each slice adds screens instead of changing tables.

**Acceptance criteria**:

- **AC-1**: One migration in `supabase/migrations/` creates all eleven tables, their constraints and indexes, and applies cleanly to fresh local Supabase. `pnpm db:types` generates `database.types.ts` from it, and the CI drift check passes.
- **AC-2**: Every money column is `bigint` in minor units with a currency `char(3)` matching an uppercase ISO code, and no amount column uses a float type.
- **AC-3**: Every user owned table has RLS enabled in the same migration, with policies that use `(select auth.uid())` (cached, called once, not per row), an ownership check, and grants to `authenticated` only. The library tables are read only to `authenticated`; no role can write them through the API. A Vitest isolation test per table proves user B can neither read nor change user A's rows.
- **AC-4**: The six built-in formations exist as library rows with their positions, and a database trigger rejects any shape whose basis points (a percentage in hundredths, so 100% is 10000) do not sum to exactly 10000.
- **AC-5**: A match owns one `match_line` row per position spot, freezing role, spot index, label, basis points, planned amount, and currency. Editing or retiring a library shape or a tactic never changes an existing line.
- **AC-6**: One active match per user per calendar month, enforced by a partial unique index. A correction marks the old row `superseded` and inserts a new `active` row for the same period; season reads return active rows only.
- **AC-7**: Deleting a debt or a goal sets its id null on past lines and leaves the copied name on the line, so the month still reads well and no history is lost.
- **AC-8**: Debt balance and goal progress come from `security_invoker` views (queries that respect the row rules rather than bypass them) summing `match_line.actual_minor`. No stored balance or progress column exists anywhere.
- **AC-9**: An income stream carries `payday_day` from 1 to 31, the day of the month a payday falls on. A short month clamps it to the last day at read time; that clamping rule itself is decided in the reminders spec.
- **AC-10**: A user's `profile` row is created lazily by an upsert (insert that updates on conflict), and any read of it tolerates a missing row until feature 5 wires the first write.

## Options considered

### Option 1: Full target schema, one migration, rows as snapshots

Build all eleven tables now in one SQL migration, with the shared formation library seeded by the same migration, history snapshots as real `match_line` rows, tactic version splits in a JSONB column (a flexible structured value), and balances computed by views.

**Pros**:

- Slices 4 to 7 (season view, debt mode, reminders, guidance) add no schema, which is the scope's "no breaking migration" test.
- Relational lines keep the season view aggregations simple SQL.
- One migration, one types generation, one review.

**Cons**:

- Four tables stay unwritten until their slice ships, so early tests cover constraints rather than use.
- The design is fixed a year ahead of some features; a surprise could force a change through `/architect` anyway.

### Option 2: Slice by slice

Create only the Slice 1 tables now; debts, goals, tactics, and versions arrive in their own slices' migrations.

**Pros**:

- Smallest first step; every table earns its place immediately.

**Cons**:

- The scope's done when explicitly requires the full model to support every slice without a breaking migration, so this fails the feature as written.
- Six small migrations instead of one, each re-testing RLS and grants.

### Option 3: Snapshot everything as JSONB

Store the formation shape and each match's lines as JSONB values on the rows.

**Pros**:

- Two tables fewer; the snapshot is trivially flexible.

**Cons**:

- Every season view aggregate becomes JSON parsing in SQL, which is slow to write and easy to get wrong.
- Database level checks (the basis points sum, one line per spot) need JSON surgery instead of plain constraints.

## Decision

**Chosen option**: Option 1: Full target schema, one migration, rows as snapshots

Eleven tables, one migration, money as `bigint` minor units with `char(3)` currency, snapshots as rows, tactic version splits as JSONB, balances as views.

**Implementation skills**: `supabase` (`supabase/agent-skills`, `~/.claude/skills/supabase/`) · `supabase-postgres-best-practices` (`supabase/agent-skills`, `~/.claude/skills/supabase-postgres-best-practices/`) · `vitest` (`antfu/skills`, `.claude/skills/vitest/`)

## Rationale

Option 1 is chosen because the scope's done when line is the contract: support every slice through feature 12 without a breaking migration. Option 2 satisfies each slice on its own day and fails that test; six small migrations also re prove RLS and grants six times. Option 3 looks smaller until the season view runs, where every aggregate parses JSON in SQL and the basis points checks become surgery; rows are what Postgres is boringly good at.

Snapshots as rows follow the honesty pressure directly: a per spot line with copied labels is the cheapest structure where a past month cannot move when library or tactic data changes, and the library stays one shared seed instead of per user copies. Currency on every money row costs one `char(3)` column and buys the deferred multi country path without a migration; user level only would make that a rewrite. Compute on read for balances holds at this scale (one person's dozens of rows) and follows the rule that stored derived values go stale; the views keep it out of app code. Triggers guard the three sums because the 100 percent promise is the product, and a database check fails loudly where app discipline fails quietly.

## Feature design

**Data model**: eleven tables. All ids are `bigint generated always as identity`. Every foreign key column gets an index (Postgres does not add one itself, and cascade deletes need it). Timestamps are `timestamptz`, created_at defaults to now. Currency columns carry a regex check for a 3 letter uppercase ISO code. The user id columns reference `auth.users` with `on delete cascade`, so deleting the account removes everything, which feature 14 requires.

| Table                 | Columns                                                                                                                                                                                                                                                                                                                                                           | Notes                                                                                                                                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile`             | `user_id` PK ref `auth.users` cascade, `default_currency` char(3) default `'NGN'`, `created_at`                                                                                                                                                                                                                                                                   | One row per signed in user; created lazily by upsert; no other table depends on it                                                                                                                                                                                          |
| `income_stream`       | `id`, `user_id`, `name` text, `amount_minor` bigint check `> 0`, `currency`, `payday_day` int check `1..31`, `created_at`, `updated_at`                                                                                                                                                                                                                           | Current value only; a raise edits the row                                                                                                                                                                                                                                   |
| `fixed_cost`          | `id`, `user_id`, `name`, `amount_minor` check `> 0`, `currency`, `created_at`, `updated_at`                                                                                                                                                                                                                                                                       | Real amounts; one current set per user                                                                                                                                                                                                                                      |
| `formation_shape`     | `id`, `name` text unique (like `4-4-2`), `style` text, `when_to_play` text, `sort` int, `deprecated` boolean default false                                                                                                                                                                                                                                        | Built-in library, shared seed data, insert only by migration; a deprecated shape cannot be picked for a new match (the action refuses; history keeps pointing at it)                                                                                                        |
| `formation_position`  | `id`, `shape_id` ref cascade, `role` text check in `GK/DEF/MID/FWD/BENCH`, `spot_index` int, `label` text, `basis_points` int check `0..10000`                                                                                                                                                                                                                    | Unique `(shape_id, spot_index)`; per shape sum equals 10000, enforced by a deferrable constraint trigger; every spot of the shape including the bench gets a row, spot counts come from `src/domain/formations.ts`                                                          |
| `user_tactic`         | `id`, `user_id`, `name` unique per user, `shape_name` text nullable (the built-in it started from, as text), `created_at`, `updated_at`                                                                                                                                                                                                                           | The head row of a saved custom tactic                                                                                                                                                                                                                                       |
| `user_tactic_version` | `id`, `tactic_id` ref cascade, `split` jsonb, `is_current` boolean, `created_at`                                                                                                                                                                                                                                                                                  | Edit inserts a new version and flips the old one; partial unique: one current per tactic; `split` items carry `role`, `spot_index`, `label`, `basis_points` and sum to 10000 (trigger)                                                                                      |
| `match`               | `id`, `user_id`, `period` date check day equals 1, `status` text check `active/superseded`, `source_kind` text check `library/tactic`, `currency` char(3), `library_id` ref `formation_shape` null on delete, `library_name` copy, `tactic_id` ref `user_tactic` restrict, `tactic_version_id` ref `user_tactic_version` cascade, `shape_name` text, `created_at` | Check pairs the source: `library` requires `library_id` and copies `shape_name` from the library row; `tactic` requires `tactic_id` plus `tactic_version_id` and copies `shape_name` from the version's split. Partial unique `(user_id, period)` where `status = 'active'` |
| `match_line`          | `id`, `match_id` ref cascade, `role` (same check), `spot_index`, `label`, `basis_points`, `planned_minor` bigint, `actual_minor` bigint nullable, `currency`, `debt_id` ref set null, `debt_name` copy, `goal_id` ref set null, `goal_name` copy                                                                                                                  | Unique `(match_id, spot_index)`; basis points sum to 10000 per match (deferrable constraint trigger, lines write in one transaction); `currency` equals the match's currency (check); planned set at split, actual set at log                                               |
| `debt`                | `id`, `user_id`, `name`, `principal_minor` check `> 0`, `currency`, `target_date` date nullable, `cleared_at` timestamptz nullable                                                                                                                                                                                                                                | Balance is never stored; computed from lines                                                                                                                                                                                                                                |
| `goal`                | `id`, `user_id`, `name`, `target_minor` check `> 0`, `currency`, `completed_at` timestamptz nullable                                                                                                                                                                                                                                                              | Progress is never stored; computed from lines                                                                                                                                                                                                                               |

Views: `debt_progress (debt_id, paid_minor)` and `goal_progress (goal_id, saved_minor)`, both `security_invoker`, summing `match_line.actual_minor` joined through `match` where `match.status = 'active'` (the active filter source), grouped by the id.

**State transitions**:

- Match: `active → superseded` (terminal; only a correction triggers it). A correction is one transaction: mark the old row `superseded`, insert the new `active` row, and copy every line's `actual_minor`, `debt_id`, `debt_name`, `goal_id`, and `goal_name` onto the matching new spot, so balances and history move together.
- Debt: active, then `cleared_at` set (by the debt mode feature when the computed balance reaches zero, and never before; the field records a fact, the balance stays computed).
- Goal: active, then `completed_at` set, same rule.
- Tactic version: each edit makes the new row `is_current` and clears the previous one, in one transaction.

**Interface contract** (this spec ships no actions; it binds the ones later slices write):

| Rule                                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Writes                               | Every insert, update, and delete to user owned tables goes through a Server Action built with `authedAction()` (spec 0001), never a client side supabase-js write, and never accepts a `user_id` from the client                                                                                                                                                                                                                                                                                                                                                               |
| Allowed updates, exactly             | `match`: only `status` may change, and only `active` to `superseded` (a correction). `match_line`: only `actual_minor`, `debt_id`, `debt_name`, `goal_id`, `goal_name` may change, only on lines of the active match for the current or most recent period; enforced in the action layer, not RLS. `income_stream`, `fixed_cost`, `debt`, `goal`: full edit except `user_id`. `user_tactic`: `name` editable; shape changes go through a new version row, never an update to `split`. `profile`: `default_currency` editable. Everything else is insert only or migration only |
| One transaction writes a whole match | All `match_line` rows for a match insert in the same transaction as the match, so the deferrable sum triggers fire at commit against the complete set                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Money arithmetic                     | The split rule is two step. Defense: the DEF zone planned total equals the current fixed cost total (sum of `fixed_cost.amount_minor`), allocated across DEF spots by intra zone largest remainder on their basis points. The rest of income (what is left after defense) splits across GK, MID, FWD, and BENCH spots by basis points with largest remainder. A line's `basis_points` after creation is historical record, the amounts are the truth. All arithmetic in `src/domain/money.ts` (spec 0001); results written to `planned_minor`                                  |
| Currency at creation                 | A match's `currency` is the user's `profile.default_currency` (NGN while no profile row exists). The creating action refuses when any income stream or fixed cost currency differs from it, so mixed currency totals never arise; a later multi currency feature widens this deliberately                                                                                                                                                                                                                                                                                      |
| Library writes                       | Migrations only; never through the API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `updated_at`                         | Maintained by a `set updated_at = now()` trigger in the `private` schema on the tables that carry the column; actions never set it by hand                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Profile                              | Upsert with `on conflict do nothing` from the first authenticated read path, wired in feature 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

**Value sourcing** (values later reads must produce, and where each comes from):

| Value                                                                                  | Source                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total monthly income                                                                   | Sum of `income_stream.amount_minor` for the user, current rows (a raise edits the row; no version history needed), all in the match's currency; the creating action refuses mixed currencies                                                             |
| Planned amount per spot                                                                | Two step rule in the interface contract: DEF spots share the real fixed cost total by intra zone largest remainder; GK, MID, FWD, BENCH spots share the remaining income by basis points with largest remainder; stored at split time in `planned_minor` |
| Fixed costs covered by defense                                                         | Sum of current `fixed_cost.amount_minor` at match creation, frozen as the DEF `planned_minor` lines; a later cost change never moves a past match                                                                                                        |
| Debt balance                                                                           | `principal_minor` minus `debt_progress.paid_minor` (from active match lines linked to the debt), computed at read                                                                                                                                        |
| Goal progress                                                                          | `goal_progress.saved_minor` over `target_minor`, computed at read                                                                                                                                                                                        |
| Planned versus actual (season view)                                                    | `planned_minor` and `actual_minor` on the same line row                                                                                                                                                                                                  |
| Reminder dates                                                                         | `income_stream.payday_day` clamped to the month length in `Africa/Lagos` by `src/domain/dates.ts` (clamp rule decided in the reminders spec)                                                                                                             |
| "This month" (`period` value)                                                          | Calendar month in `Africa/Lagos` computed in `src/domain/dates.ts`, never the server UTC clock (spec 0001)                                                                                                                                               |
| Emergency fund total                                                                   | Sum of `actual_minor` on `GK` lines across active matches, computed at read                                                                                                                                                                              |
| Emergency fund target (feature 9 shows progress toward 3 to 6 months of defense costs) | Denominator is the last active match's DEF planned total (its frozen real costs), read via `match_line` where `role = 'DEF'`; multiplying the live `fixed_cost` sum would let history chase today's rent                                                 |

**Key invariants** (DB enforced unless noted):

- A shape's positions sum to exactly 10000 basis points (deferrable constraint trigger on `formation_position`, checked at commit).
- A match's lines sum to exactly 10000 basis points (deferrable constraint trigger on `match_line`, checked at commit; the one transaction rule makes the check meaningful).
- A tactic version's JSONB split sums to 10000 basis points (deferrable constraint trigger on `user_tactic_version`).
- One active match per user per period (partial unique index).
- One line per spot per match, one current version per tactic (unique constraints).
- Amounts positive, `basis_points` in `0..10000`, `payday_day` in `1..31`, `period` on the first of a month (check constraints).
- Match source pairing: `source_kind` `library` requires `library_id`, `tactic` requires `tactic_id` and `tactic_version_id` (check constraint).
- Defense planned total covers current fixed costs, and the shape's DEF basis point share funds it. App level, in the action that creates a match: when a shape's DEF share is below the cost total, the action refuses and the formation shows as unable to cover (the scope's "says so instead"); a formation never shrinks the rent. Same enforcement home as the tactics board warning (feature 7).
- One currency per match: `match.currency` is `profile.default_currency` (NGN before a profile exists), every line copies it (check constraint), and the creating action refuses mixed currency streams or costs. A change to `default_currency` affects only future rows; stored rows never move.
- No float types anywhere in the schema (a spec 0001 rule; `information_schema` assertions guard it in tests).

**Security model**: personal financial data, no formal compliance regime yet (NDPA basics arrive with feature 14; hard deletion is pre built here). RLS on all eleven tables, enabled in the creating migration. Policies `to authenticated` with `(select auth.uid()) = user_id` wrapped as a subselect so it evaluates once per query; user owned tables get select, insert, update, delete grants plus `usage` and `select` on their sequences; the two library tables get select only, so no API path can write the shared seed data; both progress views get select to `authenticated`. `match_line` policies check ownership through the parent match (an exists subquery) since the line has no user id column. No policy for `anon` anywhere; feature 15 adds a read only anon grant to the library tables in its own migration. Private schema triggers follow the least privilege rule: `security definer` functions set `search_path = ''`, live in `private`, and revoke `execute` from `public`, `anon`, and `authenticated`.

**Configuration required**: no new environment variables. First run needs `supabase start` locally (config already covered by spec 0001); the migration directory `supabase/migrations/` is created by this build.

**Critical test scenarios** (each maps to an acceptance criterion):

- Fresh database: apply the one migration, generate types, drift check clean. Verifies **AC-1**, **AC-2**.
- RLS isolation, per user owned table: user B reads and writes user A's rows and gets nothing (a zero row result or an error), against local Supabase with the service key only in test setup. Verifies **AC-3**.
- Library writes through the API are rejected; seeding two shapes that sum to 9999 and 10001 basis points are both rejected by the trigger. Verifies **AC-3**, **AC-4**.
- Snapshot integrity: log a match, then rename the library shape and edit the tactic; the lines keep the old labels and amounts. Verifies **AC-5**.
- Bad split: a second active match for a period is rejected with a conflict; a correction (supersede then insert with the line copy, in one transaction) succeeds, the old row stays as history, and the new match carries the logged actuals. Verifies **AC-6**.
- Delete sweep: delete a linked debt and goal; past lines keep their copied names with null ids; the season totals do not move. Verifies **AC-7**.
- View consistency: log actuals on three lines for one debt, then correct that month; `debt_progress` follows the active match only and the correction's copied actuals keep the balance whole. Verifies **AC-8**.
- Split rule: with costs above a shape's DEF basis point share the create is refused (the unable to cover case); with a normal set, DEF planned equals the cost total, the rest splits by basis points, and every line sums to the income exactly. Verifies **AC-5** (amounts) and the defense floor rule.
- Constraint probes: `payday_day` 0 and 32 rejected; a `period` of 2026-10-15 rejected; a negative `amount_minor` rejected; a tactic sourced match without `tactic_version_id` rejected. Verifies **AC-2**, **AC-9**.
- Account delete: remove the auth user; all eleven tables have zero rows for that id. Verifies **AC-3** (the cascade half) and the feature 14 promise.

## Build plan

Tracer Bullet: the schema is the ground the first thread walks on, so it lands whole in one migration, then each later slice thickens one segment without touching it.

1. [x] Create the Supabase local project files (`supabase/config.toml` if absent) and write the one migration: eleven tables, check constraints (including the match source pairing and line currency checks), unique and partial indexes, FK indexes, grants and sequence grants, RLS policies. Satisfies **AC-1**, **AC-2**, **AC-3** (structure).
2. [x] Add the trigger functions in the `private` schema (shape sum, line sum, and tactic version split sum as deferrable constraint triggers, version current flip, `updated_at` setter) with least privilege settings, and wire them. Satisfies **AC-4**, **AC-6**.
3. [x] Seed the six built-in formations with positions as INSERT statements in the same migration, taking names, style lines, spot labels, bench size, and basis points from the current values in `src/domain/formations.ts`, so the sums pass the triggers on migration day. Satisfies **AC-4**, **AC-5** (spot coverage).
4. [x] Add the two `security_invoker` progress views with select grants, and the profile upsert helper (`on conflict do nothing`) in `src/features/` for feature 5 to call. Satisfies **AC-8**, **AC-10**.
5. [x] Run `supabase start`, apply the migration, generate `database.types.ts`, run `pnpm db:types` in CI mode to prove no drift. Satisfies **AC-1**.
6. [x] Write the Vitest isolation tests per user owned table (two users against local Supabase) plus the constraint probes from the scenarios above. Satisfies **AC-3**, **AC-7**, **AC-9**.

## Consequences

**Positive**:

- Slices 4 to 7 build screens, not schema; the scope's no breaking migration test is met by design.
- History is structurally truthful: snapshots as rows, immutability enforced by triggers and constraints rather than by discipline.
- Isolation is a database property from day one, tested per table before a single screen exists.
- Exact money by construction: `bigint` minor units plus a currency code on every row.

**Negative / tradeoffs**:

- Four tables (debts, goals, tactics, versions) carry no traffic until their slices ship; their tests prove constraints, not behavior.
- Trigger based sum checks mean a bad batch write fails with an opaque database error until actions map it to a friendly message.
- JSONB tactic splits cannot be joined positionally; if a later report needs per position tactics in SQL, that is a new table through `/architect`.
- The defense floor (fixed costs always covered) is app level, so a buggy action can still write a match that falls short; the tactics board warning is the compensating control.
- One currency per match and a lazy profile push small complexities into features 5 and 6 (tolerate a missing row, map a conflict error).

**Neutral**:

- New pattern for this repo: the first SQL in `supabase/migrations/`, the first functions in `private`, the first generated types file.
- `match.tactic_id` references with restrict, so deleting a tactic that matches point at fails; the tactic head is effectively permanent, which matches the snapshot philosophy.
- Text columns with check constraints instead of Postgres enums: adding a role or kind is a one line migration.

## Follow-up

- [ ] `supabase` and `supabase-postgres-best-practices` conventions are not yet referenced in root `AGENTS.md`; they apply to every database file and belong at root level.
- [ ] Feature 5 (sign in) wires the lazy profile upsert into the first authenticated read, and decides session and callback plumbing per spec 0001.
- [ ] Feature 6 (first match loop) maps the partial unique conflict (23505) and trigger failures to friendly `ActionResult` error codes.
- [ ] Feature 10 (reminders) decides the payday day clamping rule for short months and the reminder storage tables; those are additive, non breaking.
- [ ] Feature 12 (forward line guidance) will add its investment option tables in its own spec; additive, non breaking.
- [ ] Feature 14 (legal) confirms the hard delete cascade covers any new table added between now and then, and owns the account deletion path that needs the secret key.
- [ ] Feature 15 (free calculator) adds the anon read grant to the two library tables in its own migration.
- [ ] Confirm the CI drift check for `pnpm db:types` from spec 0001 exists in `.github/workflows/ci.yml`; add it in this build if the feature 2 workflow left it out.
- [ ] Blocking for this build, task 3: the built-in formation content (spot labels, bench size, basis points, style lines) must be final in `src/domain/formations.ts` before the seed runs, because the migration sums must pass 10000 on day one. Feature 4 product copy review may change the wording fields; any basis point change is a new migration, additive only.
