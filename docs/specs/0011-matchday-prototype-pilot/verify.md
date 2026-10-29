# Matchday verification and session preparation

**Prepared**: 27 October 2026. **Execution status**: not run. This is a procedure and evidence template, not a record of a working prototype, invitations, consent or completed sessions.

## Candidate roster and ownership

| Candidate | Known profile                                                 | Unknown                                                          | Current status |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| A         | Remote data analyst, Chelsea supporter                        | Pay timing, current planning tool, device needs and availability | Candidate only |
| B         | On site digital marketer, Manchester United supporter         | Pay timing, current planning tool, device needs and availability | Candidate only |
| C         | Hybrid machine learning engineer, Manchester United supporter | Pay timing, current planning tool, device needs and availability | Candidate only |

Keep names, contact details and real financial amounts outside tracked documents. Income ranges are optional and not needed for a fictional sample session. The founder is the recommended owner for invitations, scheduling, facilitation, anonymous notes and decision updates. Confirm that capacity before invitations. The assistant prepares materials; no outreach is authorised by this specification.

All known candidates are football fans. They form a first comprehension round, not a representative audience or evidence about people with limited football knowledge. Record their prior exposure to the concept. Add a participant with limited football knowledge and modest device or large text needs in a later round.

Suggested invitation for the founder to adapt, not send automatically: “I’m testing a sample salary planning tool. Could you spend about 30 minutes trying fictional figures and telling me what is confusing? It does not connect to a bank or move money. No real salary details or account credentials are needed.”

## Technical verification before participant use

Run `/check verify` against AC-1 through AC-13, then `/test`. Use the project Vitest skill for meaningful calculation tests. Run `pnpm typecheck`, `pnpm lint`, `pnpm check:hex`, `pnpm test` and `pnpm build`, and the relevant Playwright scenarios. Existing token and font checks remain applicable. No new database suite is needed without a database change. Record actual command outcomes separately from this prepared plan.

| Check                  | Expected evidence                                                                                                                                               | Criteria          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Entry and reset        | Signed out sample loads; simulated account uses no credentials; refresh, restored page and reset discard edits                                                  | AC-1, AC-13       |
| Baseline and shortfall | Exact headline totals from the spec; separate overall/essential gaps; save requires acknowledgement which edits clear                                           | AC-3, AC-4        |
| Input boundaries       | Invalid decimal, negative input, unsafe integer and unsafe sum leave valid state intact; zero and unknown remain distinct                                       | AC-3, AC-5, AC-13 |
| View parity            | Same edits, figures, warnings and actions in pitch and list; no eleven item requirement                                                                         | AC-2, AC-10       |
| Payment and correction | Partial due payment stays incomplete; correction replaces its total; unknown and no due obligations earn no award                                               | AC-5              |
| Adjustment             | Source and destination previewed; recorded repayment unavailable; unknown completion prompts clarification; repeated apply cannot duplicate change              | AC-6              |
| Food                   | Six exact clipped weeks, same total as the food plan; transfer preserves reported spending and available funds; no automatic carry                              | AC-7              |
| Next month             | Explicit carry confirmation sets (never adds to) December's opening carry; no copied purposes, receipts or new contributions; unknown balances remain unknown   | AC-8              |
| Restored page          | Navigate away and use the browser back button after editing; the default fixture returns                                                                        | AC-1, AC-13       |
| Extras                 | Goal progresses only when recorded; four reminder previews; share contains no sensitive values even in hidden content                                           | AC-9              |
| Accessibility          | Keyboard completion, 320px and wide viewport, 200% text, long amounts, accessible dialogs and reduced motion                                                    | AC-10             |
| Network and storage    | Editing, saving, corrections and previews emit no data requests; no entered values in URLs, storage, cookies or logs; cached public shell has only fixture data | AC-13             |
| Preparation pack       | Anonymous roster, session plan, thresholds and later pilot/payment gates exist without invented results                                                         | AC-11, AC-12      |

Use existing browser tooling and Playwright. Inspect computed visible results and side effects, not just the presence of controls. Target the changed paths; broaden checks only for a failure or new shared code change. Build verification is separate from participant comprehension evidence.

## Thirty minute comprehension session

Before each session, confirm voluntary participation, explain the fictional figures and agree whether notes are acceptable. Recording audio/video and reusing quotations each need separate permission. Participation does not enrol anyone in the later pilot or authorise reminders. Stop if someone is uncomfortable; the facilitator can skip any task.

Use the same fixture and task wording for each candidate. Let the participant choose pitch or list, then ask them to repeat one action in the other view. Ask for their interpretation before explaining. Record a hint as a prompt, not independent completion.

| Time guide     | Task                                                                                                                 | Observe                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 0 to 3 minutes | Introduce the sample and confirm consent for notes                                                                   | Prior exposure, chosen device/text size and any need for assistance                                              |
| 3 to 7         | Identify received versus expected pay, the coverage month, remainder and next due action                             | Whether forecast becomes spendable money in their explanation; discovery time                                    |
| 7 to 12        | Edit a sample purpose, inspect both views, review and save                                                           | Can they explain the difference between the two remainders and left to assign, and that no money moved?          |
| 12 to 16       | Record part of a required payment, then correct it                                                                   | Whether unknown, zero and partial payment remain distinct                                                        |
| 16 to 22       | Handle salary shortfall, acknowledge it, then increase food by ₦20,000 before and after extra repayment is completed | Whether the gap is visible and the participant can name the purpose that loses allocation                        |
| 22 to 26       | Check weekly food remainder, choose what happens to unused allowance, review a clean sheet and next month preview    | Whether carry forward creates imagined income or repeats a contribution                                          |
| 26 to 30       | Inspect goal, reminder and private share previews; recap what to do next                                             | Planned versus recorded progress, unwanted reminder moments, privacy comprehension and a useful reason to return |

Use “What would you do next?” and “What changed?” rather than asking whether they like the idea. If time runs out, mark remaining tasks not attempted. Do not convert skipped tasks into passes. Ask about current tools and actual pay timing only if the participant volunteers that discussion; no exact salary or bank details are needed.

## Evidence and decision rules

For each task record: candidate code, date, build revision, fixture, view, task, outcome (`independent`, `prompted`, `not completed`, `not attempted`), time, number of prompts, observed error, participant explanation and proposed revision. Keep notes anonymous. Quote only with permission. Do not store credentials, contact details or actual financial amounts in this pack.

These are proposed qualitative thresholds to freeze before the first session:

1. Any belief that the sample moved money, any hidden shortfall, reuse of a completed repayment, or disclosure of sensitive data blocks progression of that flow to a real pilot. Correct it and repeat the affected task with a participant before proceeding.
2. For this first round, at least two of three participants should independently distinguish received from forecast, explain the coverage month and next action, and understand the save boundary. A failure repeated by two participants calls for a revision and another check. Do not call an unattempted task successful or present this sample as a population conversion rate.
3. Test the roughly five second next action discovery and 90 second returning plan hypotheses, but do not use them as hard pass gates or published performance claims. The first guided walkthrough is not a returning session.
4. Missing a session or lacking an eligible pay cycle is missing evidence, not churn. No threshold above establishes wealth improvement, retention or willingness to pay.

Record findings in a dated subsection here or in an adjacent evidence file owned by this spec. Keep prepared thresholds intact; if changing them, record the date, reason and which sessions preceded the change. Current findings: none collected.

## Gate to the real two pay cycle pilot

The sample sessions are not the two pay cycle pilot. Before that pilot starts, reconcile the production model, implement the real authenticated loop, satisfy existing hosting and personal data requirements, verify ownership isolation and corrections, and resolve blockers from the comprehension sessions. Do not enter real financial data into this public sample.

The founder separately invites and consents participants for a free pilot. Record their actual next expected payday and a way to update it when pay is late. Permission for personal data, reminder channel and cadence, recordings and public quotations is separate. Keep the consent and identifiable roster in a private location chosen before collection, not this repository.

Define activation as a reviewed saved plan plus an explanation of the next real action. A useful return is planning, recording, adjusting or reviewing in a later eligible pay cycle. Its denominator is activated participants whose next expected payday has actually occurred; record late pay and opportunity to return. Follow each participant for two actual eligible cycles rather than imposing a calendar date that treats late pay as abandonment.

Track activation, opportunity to return, voluntary useful return, incomplete information, reasons for non return and reported changes in decisions. Self reported payments do not prove principal reduction, net worth or financial resilience. Voluntary useful return is an agreed early signal; numerical production targets remain unset.

## Gate to a paid benefit test

The sequence is a free two pay cycle pilot, then one working paid benefit with explicit opt in. Pricing may be discussed during the pilot, but there is no automatic conversion. Basic income entry, planning, corrections and access to original records stay free.

First identify a used capability that participants would miss. Then define a concrete offer with benefit, price, billing period, renewal and cancellation terms before asking for paid consent. None of those terms or a payment collection action is approved here.

A saved rules draft after manual income entry may test convenience, if labelled accurately. It is not live bank detection. If the only benefit participants value is bank connected automation and it does not work yet, defer the paid offer. Future bank data access needs its own consent, provider and freshness design; no money movement is part of that proposed benefit.

# Verify: Matchday prototype and pilot preparation · spec 0011 · updated 29 October 2026

_Steps derived from spec 0011 acceptance criteria and its value sourcing table, after the `/develop` build. `/check verify` runs these; `/test` locks the durable ones. Open `/prototype/matchday` signed out. "Scenario X" means Sample scenario → X._

## UI / manual

- [x] Open `/prototype/matchday` signed out → loads with the "Fictional sample" badge and banner on every screen; page head has `robots: noindex, nofollow` → AC-1
- [x] Explore the sample → Account shows "In the real app you would create an account here. Continue with fictional figures." with no email or password field → AC-1
- [x] Edit Miscellaneous to 30000, press Reset → Miscellaneous is back to ₦35,000.00. Edit again, go to `/`, press browser Back → default fixture returns → AC-1, AC-13
- [x] Baseline Builder → received remainder ₦70,000.00, forecast remainder ₦270,000.00, left to assign −₦200,000.00, overall gap ₦200,000.00, no essentials gap → AC-3
- [x] Scenario Salary shortfall → received remainder −₦80,000.00, forecast ₦270,000.00, overall gap ₦350,000.00, essentials gap ₦80,000.00; Review names the optional purposes in one static line with no button → AC-3, AC-4
- [x] Scenario Late receipt, Setup → Salary C shows latest receipt 4 November and still covers November; set Covers to December and update → Nov received drops to ₦400,000.00 and Report's December preview lists Salary C with its 4 November receipt date → AC-3, AC-8
- [x] Setup: enter received 1 with no date → "Add the date the money arrived." and the old values remain → AC-3
- [x] Review on baseline: Save without ticking → "Tick the box…" alert, still draft. Tick, save → "Sample plan saved for this visit. Your money has not moved."; edit any planned amount → status Draft and the tick is cleared → AC-4
- [x] Builder: edit an amount from the List view, switch to Pitch → same amount and same flags; after the dialog closes, focus is back on the Edit button; no line requires eleven purposes → AC-2, AC-10
- [x] Today, Transport: record 20000 → "Partly paid", still due ₦30,000.00; record 50000 → "Paid in full" (replaced, not added); clear the field → "Not recorded"; enter 0 → ₦0.00 (zero is not unknown) → AC-5
- [x] Scenario Report incomplete, Report → "Still due"; correct required debt to 120000 on Today → Report shows "Clean sheet". Scenario Report unknown → "Not enough information". Baseline Report → "Month not finished", no award → AC-5
- [x] Scenario Adjustment before repayment, Today: Extra debt repayment → Food, 2 Nov to 8 Nov, 20000, preview → extra debt ₦80,000.00 → ₦60,000.00, food month ₦100,000.00 → ₦120,000.00, everything planned unchanged; apply, then nothing remains to re-apply → AC-6
- [x] Scenario Adjustment after repayment → "Take from" offers only Course goal; Course goal → another purpose for 20000 previews ₦75,000.00 → ₦55,000.00 → AC-6
- [x] Scenario Fully received → no sources; the "Waiting for a record" note lists the unrecorded optional purposes → AC-6
- [x] Today food check → six weeks: 1 Nov ₦3,333.34; 2 to 8 Nov ₦23,333.34; 9 to 15, 16 to 22, 23 to 29 Nov ₦23,333.33; 30 Nov ₦3,333.33. On 4 November the 2 to 8 Nov week is highlighted. Remaining above allowance is rejected; 30 Nov offers no "next week" → AC-7
- [x] Report complete, Next month preview: enter 15000 twice → December opening carry ₦15,000.00 (not ₦30,000.00); reserve ₦180,000.00; course savings ₦50,000.00; no purposes or receipts listed. Scenario Report unknown → reserve shows "Incomplete" → AC-8
- [x] Goal branch on baseline → ₦50,000.00 of ₦300,000.00; record 75000 → ₦125,000.00 of ₦300,000.00 (bar 41.66%) → AC-9
- [x] Reminders → four previews with the spec's exact text, all switches off, no permission prompt → AC-9
- [x] Share on baseline → Keeper 13.33%, Defence 55.00%, Midfield 19.17%, Attack 12.50%, dots 1, 5, 2, 1; the figure's DOM has no ₦, NGN or purpose name → AC-9
- [x] 320px wide with 200% text → no horizontal page scroll on any screen or dialog; complete Sample → Report by keyboard only → AC-10
- [x] Reduced motion on, Scenario Report complete → the Clean sheet badge appears without scaling → AC-10
- [x] Network panel through the whole flow → no fetch or XHR and no non GET request; localStorage, sessionStorage, cookies empty; URL never changes → AC-13

## Value sourcing (one per row)

- [x] Open or reset → scenario, sample date and figures come from the named fixture; changing only the date keeps edits; picking a scenario after an edit asks "Load …?" first
- [x] Record income → R and U follow the edited totals; reassigning coverage removes the source from November sums
- [x] Headline remainders → change opening carry to 10000: both remainders rise by ₦10,000.00
- [x] Left to assign → raise any optional purpose by 1000: left to assign falls by ₦1,000.00, remainders unchanged
- [x] Funding warnings → set Transport planned to 40000: "planned below its required payment by ₦10,000.00"; expected income never closes a received gap
- [x] Save → acknowledgement required for any of the three warning types
- [x] Next due → baseline shows Transport (2 Nov, ahead of Data by fixture order); record Transport and Data in full → Required debt
- [x] Record or correct → remaining due is required minus recorded, only when known
- [x] Adjustment → fixed required payments never appear as sources; a fully recorded fixed payment is not a destination
- [x] Weekly check → allowances sum to the food plan exactly
- [x] Food carry → moving a week's remaining to a purpose changes the food total and that purpose by equal opposite amounts; week to week leaves the food total unchanged
- [x] Goal and reserve → planned contribution never moves progress; unknown stays "Not recorded"
- [x] Share preview → set every planned amount to 0: "Nothing to share yet", no invented percentages
- [x] Reminder previews → fixed text, toggles only
- [x] Clean sheet → move every fixed payment's due date to December: "No due payments", no award
- [x] Report food row → check one week: "reported spending" equals allowance minus remaining; "5 weeks unchecked"
- [x] Unused allocation → Report incomplete: ₦90,000.00 (miscellaneous ₦15,000.00 plus course ₦75,000.00 recorded at ₦0); required debt listed as "Still due ₦60,000.00", not unused
- [x] Next month → carry is assignment of the confirmed amount only, never inferred from unused budget

## Commands

- [x] `pnpm typecheck` → passes → AC-10, AC-13
- [x] `pnpm lint` → 0 warnings → AC-10
- [x] `pnpm check:hex` → passes → AC-10
- [x] `pnpm test` → `src/features/matchday-prototype/model.test.ts` passes (worked figures, weeks, adjustment, clean sheet, carry, share) → AC-3 to AC-9
- [x] `pnpm build` → `/prototype/matchday` prerenders as static (fixture only) → AC-1, AC-13
- [x] `git diff --stat main -- supabase src/features/*/actions.ts package.json` → no migration, Server Action or dependency change → AC-13

## Acceptance criteria coverage

- AC-1 entry, account, reset, back · AC-2 view parity · AC-3 baseline, shortfall, late receipt, receipt date · AC-4 acknowledgement · AC-5 records, corrections, report states · AC-6 adjustment branches · AC-7 food weeks · AC-8 carry and December · AC-9 goal, reminders, share · AC-10 320px, 200% text, keyboard, reduced motion, focus · AC-11, AC-12 the session pack and gates above (prepared 27 October; check that no invented result was added) · AC-13 network, storage, URL, build, diff
