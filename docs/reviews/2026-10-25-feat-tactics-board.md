# Review, feat/tactics-board, 2026-10-25

**Reviewed by**: Qoder (author on Qoder)
**Scope**: 20 files, uncommitted (the tactics board change set only; already-merged auth / first-match-loop / design-system and the untracked `videos/` are out of scope)
**Verdict**: Approve with nits

## Summary

The tactics board lets a user edit a library formation's per-spot shares, save it as a named own tactic (new pinned version each save), and play it for the month through the recreated `play_match`. The money and share arithmetic is genuinely careful: everything is integer basis points / kobo, the board preview and the stored plan run the _same_ `splitMatch`, the locked-DEF-pool and ceiling/tie-break rules hold under a long edit fuzz, and the recreated function restates the shipped header (owner, `security definer`, empty `search_path`, the exact revoke/grant set) line for line while adding a tamper-checked, ownership-checked tactic branch. RLS/grants and the soft-delete predicate are present on every read and write path, and identity comes only from `getClaims()`. Typecheck is clean and the 64 new unit/component tests plus the domain fuzz pass. I found no blockers and no majors: what remains is a handful of small resilience, spec-drift, and dead-code items.

## Minor

### 🟡 Save is not atomic and leans on a best-effort compensating delete, `src/features/tactics/actions.ts:131`

**Problem**: `saveTactic` creates the head (one PostgREST request) and then inserts the version (a second, separate request). If the version insert fails after the head committed — a transient network/5xx on that one request is the realistic case, not a validation failure since the split is already checked — the code issues a _third_ request to delete the orphan head, which can itself fail.
**Why it matters**: A committed head with no current version takes a slot under the 5-cap and opens as an empty board (`tacticSource` returns `null` → "That plan is not here"), with no in-band way for the user to recover it. No money is lost and the month is never half-written (that is `play_match`'s job, and it is one atomic call), so this is cosmetic, matching the spec's own framing — but the gap is real.
**Suggested fix**: Either wrap head+version in one transaction (a small `security definer` save RPC like `play_match`, or Postgres-`transactions` option if the client supports it), or accept it and add a read-side guard so a version-less head is auto-hidden from the cap count and list so it cannot block a fifth slot.

### 🟡 `readBoardContext` does not validate the tactic id through `idSchema`, contrary to the spec table, `src/features/tactics/board.ts:210`

**Problem**: The value-sourcing table says "a tactic id must parse through `idSchema`". The code instead does `Number(params.tactic)` + `Number.isInteger`. A value like `?tactic=99999999999999999999` parses to a float whole-number, passes `Number.isInteger`, and is then bound into `.eq("id", …)`; the bigint-out-of-range error throws `failed("tactic", …)`.
**Why it matters**: It is still RLS-scoped and safe (no leak, no cross-user row), and the page catches the throw into the "Could not load the board" state, so this is not a hole — but it diverges from the stated contract and turns a malformed param into an error card rather than a clean `not_found`.
**Suggested fix**: Parse the param through the same `idSchema` the actions use and treat a non-match as the not-found state.

### 🟡 Dead `"index"` variant in `SplitProblem`, `src/domain/tactics.ts:217`

**Problem**: `"index"` is in the `SplitProblem` union and in `PROBLEM_COPY` (actions.ts:45) but `splitProblem` never returns it: a non-integer `spot_index` is reported as `"role"` (tactics.ts:251).
**Why it matters**: A whole-number spot-index problem shows the user "Every spot has to belong to a position on the pitch," which is misleading, and the unused copy implies a branch that does not exist.
**Suggested fix**: Either return `"index"` from the `!Number.isInteger(spot.spot_index)` check, or drop the variant and fold that message into `"role"`.

### 🟡 Empty / non-array split returns `validation`, not `invalid_split`, `src/lib/schemas.ts:63`

**Problem**: `tacticSplit` is `z.array(splitItem).min(1)`. An empty array or a non-array fails at the Zod layer, so `authedAction` answers `code: "validation"` rather than the `invalid_split` the spec lists for structural problems. The domain's `count` check only sees non-empty arrays.
**Why it matters**: Minor contract inconsistency in the error code; both are refusals and neither writes a row, and the board never sends an empty split. Noted for completeness.
**Suggested fix**: If the distinction matters to callers, let an empty array reach `splitProblem` (drop `.min(1)`) so it maps to `invalid_split`, or accept it and document that `validation` also covers a missing split.

## Nits

- ⚪ `src/features/tactics/board.ts:214`, `?tactic=0` (`Number("0")` is falsy) silently falls through to the first library shape instead of the not-found state; guard on `tacticId !== null` rather than truthiness.
- ⚪ `src/features/tactics/board.ts:167`, the "no match played yet" denominator is 0 (via the empty lines list), whereas the spec's sourcing table says to use the live cost total then. Functionally identical (numerator is also 0, so `fundMonths` → 0 and no nudge fires), just a wording drift worth a one-line comment.
- ⚪ `src/components/tactics/spot-editor.tsx:47`, the exact-share field re-parses on every keystroke and re-echoes the computed `percent`, so multi-digit entry relies on `%`-stripping to round-trip. It works (covered by the ceiling tests) but reads as fragile; a debounce-on-blur commit would be calmer.

## Strengths

- The preview/stored agreement invariant is real: `board.ts`, the board component, and `playSavedTactic` all route amounts through the same `splitMatch`, and `play_match`'s defense floor uses the identical `v_income * v_def_bps / 10000` integer expression, so a plan the board shows as covering costs is exactly what the function accepts, and a race surfaces as a clear `validation`/`tactic_stale` refusal rather than a silent divergence.
- The recreated function's tactic branch is the right shape for the threats: resolve the version through its own head, check `user_id = auth.uid()` and `deleted_at is null` before ever reading the split (a foreign `p_tactic_version_id` returns `not_found`, no existence leak), gate on `is_current`, then tamper-check the payload against the pinned JSONB on role/spot_index/basis_points/label. The header (owner, `security definer`, empty `search_path`, `revoke from public, anon, authenticated` + `grant execute to authenticated`) is restated to match the shipped one, and the RLS test was correctly updated to the new signature and the three security-invoker views.
- `src/domain/tactics.ts` share rules are tight and well-fuzzed: the raise/lower/bench/DEF/ceiling paths each target a single counterparty with the lowest-`spot_index` tie break, total is 10000 by construction, and the "keeps the plan whole across a long run of edits" test plus the whole-number invariant checks give real confidence. Money stays integer kobo throughout and every amount on screen renders through `MoneyText`.

## Test coverage

Strong and mapped to the ACs. The domain suite covers both share directions, bench-exhausted take-over, tie-breaks, the locked DEF pool, the ceiling clamp, `setShare`, both warnings, `fundMonths` (including the zero-denominator guard), and `suggestFormation`'s fixed debt-then-fund-then-costs order with the reason sourced from each shape's own `whenToPlay`. The component suites cover edit/save/play/shortfall-refusal/cap/rename/delete/reserved-name and the fund-state card. The RLS suite adds real cross-user isolation for the new column, the fund view, the tactic branch, `tactic_stale`, deleted-not-playable, both-sources/neither, and payload tamper; the Playwright spec walks edit→save→play on a phone viewport and runs axe. Gaps worth a line (none blocking): no unit test asserts the exact `code` strings coming back from the actions themselves (the board test mocks them), and the "name on an edit is ignored" path is covered only at the client (payload sends `source.title`), not proven server-side; both are low-risk given `/check verify` exercised the live path.
