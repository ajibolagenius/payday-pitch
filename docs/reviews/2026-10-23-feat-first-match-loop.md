# Review, feat/first-match-loop, 2026-10-23

**Reviewed by**: inline session model (author model was sonnet; this client spawns subagents on the session model with no override, so this review is a degraded cross-model check that shares the author's model family. For a fully independent read, switch via `/model` and re-run `/check review first match loop`.)
**Scope**: 43 files, `git diff 41843a3` (branch mode against `origin/main`, the true merge base; local `main` is stale)
**Verdict**: Changes requested

## Summary

This is the first match loop end to end: income and cost entry through Server Actions, the formation picker reading the seeded library, the split engine with largest remainder allocation, the pitch review with twelve actuals fields, the `play_match` Postgres function as the one atomic write, the month tour, and a 54 test component suite plus RLS and e2e coverage that trace to spec 0007. The architecture is right and the security hygiene is genuinely careful: the function re-checks every invariant against freshly read data instead of trusting the client, all twelve lines land in one statement so the batch sum triggers see the complete set, and every statement filters by the resolved `auth.uid()`. The merge is stopped by one Major: on a correction play, the function throws away whatever actuals the user just typed and keeps only the carried forward values, while the UI explicitly invites the user to enter them.

## Major

### 🟠 `play_match` discards freshly entered actuals on a correction play, `supabase/migrations/20261023090000_play_match_function.sql:153`–`176`

**Problem**: When the period already has an active match, the carry-forward rewrite runs over every new line unconditionally: `jsonb_set(n.obj, '{actual_minor}', coalesce(to_jsonb(o.actual_minor), 'null'::jsonb))` (line 172 to 174). Whatever the payload carried in `actual_minor` is replaced by the old match's value for that slot key, or by JSON null when the old slot had no predecessor. The client side does send entered values: `src/features/match/actions.ts` builds each line with `entered.get(line.spotIndex) ?? null`, and the UI invites entry on the replay path: "Play this month again" (`src/components/walk/walk.tsx:381`) opens the review with blank actuals and the line "Put in what you actually moved, if you want the month to show it." (`src/components/walk/pitch-review.tsx:54`). So a user who replays the month to correct what actually moved types their numbers, presses Play, gets the success toast, and their entries are silently gone. The previous values stay.

**Why it matters**: Correcting the month is the whole point of the replay path (AC-6), and silently dropping a user-entered money value after a success confirmation is a data correctness defect on the write path. Spec 0007 AC-6 says the correction copies "each entered actual to the matching slot key", which reads as carry-forward fills the gaps, not carry-forward stamps out fresh entry. No layer of the suite pins the entered-on-correction case: the RLS test replays without sending actuals and its assertion `expect(actual).toBe(before[index] ?? null)` (`src/lib/supabase/rls.test.ts:1141`) in fact locks in the discard behavior, and the e2e correction spec types nothing on replay by design (`tests/e2e/walk.spec.ts:274`–`305`, its own comment says the actuals "come from the carry forward"). The behavior and the UI disagree, and both test layers agree with the function, so this shipped without anyone noticing the seam.

**Suggested fix**: Keep the payload value when one was entered, carry forward only the gaps. At line 174 replace the value expression with something like `coalesce(nullif(n.obj -> 'actual_minor', 'null'::jsonb'), coalesce(to_jsonb(o.actual_minor), 'null'::jsonb'))`. The `nullif` matters: the action sends JSON null for an unentered spot, and `->` returns the jsonb `'null'` value, not SQL null, so a plain `coalesce` over `->` would treat an entered-less line as present and kill the carry forward. Then update the RLS replay test to enter at least one fresh actual on the second play and assert entered wins, old fills gaps, and extend the e2e correction path to type one actual so the seam stays pinned at both layers. If the team instead decides the current "carry forward always wins on replay" behavior is intended, the fix moves to the UI (pre-fill the draft from the active match and disable or relabel entry), and the spec needs the same decision written down; either way the mismatch closes here, not in the code.

**Resolved (2026-10-23)**: Fixed as suggested, in a follow-up migration `supabase/migrations/20261023180000_play_match_correction_actuals.sql` (the original was already applied to the shared local database, so it is replaced, not edited). The RLS replay test now enters three fresh actuals on the second play (over a carried value, over a zero, over a gap) and asserts entered wins, gaps carry; the e2e correction test types one actual on replay. Verified: RLS suite 34 of 34, walk e2e 9 of 9, unit suite 292 passed, typecheck and lint clean.

## Minor

### 🟡 `loadWalk` failure loses its cause with no server log, `src/app/(app)/app/page.tsx:20`

**Problem**: `await loadWalk(supabase, userId).catch(() => null)` converts any read error into the generic "Could not load your season" card. The error object itself is dropped, and nothing is logged.

**Why it matters**: The card is the right user-facing answer, but when this fires in production there is no trace of why: no message, no stack, no Supabase error code. Every debugging session starts by reproducing it blind. A money app's home screen failing silently is the one place a log is cheap and worth it.

**Suggested fix**: `.catch((error) => { console.error("walk load failed", error); return null; })`. One line, keeps the honest card.

### 🟡 Money totals are summed across currencies but labeled with the profile currency, `src/features/match/queries.ts` (`loadMoney`), `src/features/streams/actions.ts`, `src/features/costs/actions.ts`

**Problem**: `loadMoney` adds `amount_minor` over every income and cost row without checking the row's currency, and renders the total in `profile.default_currency ?? "NGN"`. The CRUD actions hardcode `"NGN"` on insert. Today every stored row is NGN and `play_match` refuses mixed currency at write time, so nothing is wrong yet. The gap is the profile: a user whose `default_currency` is not NGN gets totals that sum NGN kobo rows and label them in another currency, and they can never play (every line is rejected as `mixed_currency` against their profile currency).

**Why it matters**: Two reads of the same number disagree about what the currency means, and the only guard is that the write path eventually refuses. This is a latent mislabel plus a soft lockout, not an active bug, hence Minor.

**Suggested fix**: Smallest honest option: have `loadMoney` refuse (or the read return a flag) when any row's currency differs from the profile currency, so the screen shows the same mixed-currency message the function would give, instead of a wrong total. A one line `eq("currency", currency)` guard per sum with a captured bad count mirrors what `play_match` already does.

## Strengths

- The `play_match` posture is the right one: the function never recomputes the split, it re-checks each domain invariant against freshly read rows (sums to 10000 bps, lines total the live income, defense equals the live cost total, every line matches the stored shape row by row), so a stale or hand built payload is refused with a code. The payload shape is validated (`jsonb_typeof`, negative checks, per-line currency check) before any cast, so a malformed call answers with a message, never a database error.
- The single statement that inserts the match and all twelve lines in one `INSERT ... SELECT FROM jsonb_to_recordset` is exactly what the statement-level batch sum triggers require, and letting the 23505 from the one-active-match index abort the whole call is the correct concurrency answer: a match can never commit without its lines.
- `security definer` hygiene is disciplined: `set search_path = ''`, every statement filters by the resolved `auth.uid()`, the grant is re-issued explicitly after ownership change, and the comment records why this function is the exception to spec 0004's revoke rule.
- Domain boundaries hold: `src/domain/money.ts` and `src/domain/dates.ts` stay pure TypeScript, the largest remainder allocation is exact by construction with a deterministic tie break, the Lagos period comes from wall time and not the server UTC clock, and money moves only as integer kobo through `MoneyText`.
- The e2e suite is honest about its own frictions: the tour poll workaround is commented with the reason, the correction spec states plainly that it types nothing, and `auth.spec.ts` was updated to assert the "Sign out" button rather than a heading a fresh account would never show.

## Test coverage

Strong for the breadth it claims. The 54 new component tests trace to AC-2 and AC-10 among others (labeled fields, no comboboxes, inline validation with no toast, error announcements wired to `aria-describedby`, short badges, read-only state). `actions.test.ts` and `read.test.ts` cover the precheck refusals and the 23505 to conflict mapping. The RLS suite gained the full `play_match` section: atomic twelve-line write with owner-only reads, foreign caller refusal, code-not-exception refusals for bad shape id, no income, mixed currency, stale numbers, the shortfall with its exact figure, one active match with history kept, concurrent plays, and the deletion nulls for debts and goals. The real gap is the one named in the Major: the entered-on-correction path has no test at any layer, and the existing replay test asserts the current discard behavior.

## Verdict

Changes requested. One Major (entered actuals dropped on replay, `20261023090000_play_match_function.sql:153`–`176`), two Minors (lost error cause, currency seam on totals). Fix the Major, or record the deliberate decision and close the UI seam, and this is mergeable.
