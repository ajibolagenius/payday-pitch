# Matchday prototype and pilot rationale

## Context

> Premise note: a clickable sample and a usable pilot answer different questions. Treating the sample as a production release would hide the unresolved financial model and make simulated saving look like real records. This decision funds a comprehension test first and retains the later real pilot as separate work.

The founder's first useful job is seeing what remains after essentials and required debt when several salaries arrive on different days. The 27 October direction handoff chose four flexible lines, pitch/list parity, an acknowledged shortfall, sample before signup and a free two pay cycle pilot. The existing production specs still describe a fixed slot model and cannot be treated as implementing that direction.

Feature 20 provides one working day and no new spending for an editable sample and recruitment preparation. Three friends are candidates, not enrolled participants. The study needs to expose incorrect money assumptions as well as confusing visual language. It must not collect personal financial data through a simulated account.

## Options considered

| Option                                                  | Benefit                                                               | Cost or limitation                                                                                         | Basis                                             |
| ------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Scripted clickthrough                                   | Smallest build; useful for order and label tests                      | Fixed choices cannot expose calculation and correction behaviour                                           | Prototype contract; Ponytail                      |
| Editable isolated sample in the existing app, chosen    | Reuses installed assets and permits realistic edits with exact totals | Needs bounded calculation tests; resets lose work; gives no retention evidence                             | Confirmed founder answers; spec 0001; `design.md` |
| Extend the production schema and authenticated loop now | Produces real records and can support later longitudinal use          | Requires model reconciliation, migrations and security verification before evidence from the sample exists | Specs 0004, 0007 and 0008; Tracer Bullet          |

## Rationale

An editable local sample is the smallest approach that tests the chosen job rather than a predetermined sequence. The existing public calculator convention permits pure client calculations without a new backend. A new four line composition avoids pretending the existing fixed slot pitch already supports flexible purposes. (basis: spec 0001, inspected `pitch-view.tsx`, Ponytail.)

The same data drives both views and every report so inconsistent totals become test failures rather than visual differences. Keeping required payments separate from optional contributions makes shortfall and clean sheet explanations inspectable. Requiring known completion before an adjustment prevents unknown money from being silently treated as available. (basis: product brief D03 through D07; founder answers.)

The single Matchday study spends the day on comprehension rather than two skins. Reusing fonts and tokens keeps the study inside the existing accessibility and asset budget. This is a composition study, not a name choice or a production visual replacement. (basis: brand brief; `design.md`; Impeccable.)

## Founder decisions recorded in this design conversation

All answers below were supplied on 27 October 2026. The spec remains Proposed until reviewed; ratifying its content does not mark implementation complete.

| Topic                 | Founder answer                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| Late pay              | Keep the chosen coverage month, with explicit reassignment                           |
| Food week             | Monday to Sunday, clipped to the coverage month                                      |
| Capacity              | Up to one working day, no new spending                                               |
| Interaction           | Edit supplied sample amounts and complete the core flow                              |
| Persistence           | Reset to the sample on refresh or reopening                                          |
| Unused food allowance | Review and explicitly carry forward or reassign                                      |
| Checklist             | Record an amount, including partial payments and corrections                         |
| Available funds       | Salaries plus explicit carry forward, with reserve balance separate                  |
| Goal depth            | One linked sample goal with planned versus recorded progress                         |
| Model                 | “This matches the prototype” for the Plan, Income, Purpose, Food week and Goal model |
| Visual study          | One Matchday study using existing assets                                             |
| Sources               | Name relevant project sources without web research                                   |
| Headline figures      | Remainders after essentials and required debt, plus separate left to assign          |
| Corrected clean sheet | Recalculate the corrected month's clean sheet                                        |
| Candidate C           | “Machine Learning Engineer (Hybrid Worker), a Man U fan.”                            |

### Explicit recommendations for testing

On 29 October 2026 a cross check on a second model found 21 decisions the builder would otherwise invent: scenario fixtures and picker, adjustment sources, report formulas, share and reminder text, the restored page reset, and a cut order for the one day budget. The founder chose to apply all the recommended resolutions. They are recommendations for this sample, in the same standing as those below.

The invented amounts, daily food proration, no bill status for the food allowance, month end award timing, sample reminder cadence, session duration and decision thresholds are recommendations in this spec. They are not reported participant findings or permanent production rules. Candidate C's pay timing and current tool remain unknown. The other two candidates retain the gaps in the direction brief.

## References

Project sources, without external web research:

- `AGENTS.md`: branch, money, action, privacy and service worker rules, plus the mandatory skills.
- `docs/scope/scope.md`, feature 20: validation scope, Tracer Bullet and Beta.
- `docs/direction/product-brief.md`: first useful job, four lines, money boundaries and D03 through D08.
- `docs/direction/brand-brief.md`: Matchday study and asset constraints.
- `docs/direction/validation-plan.md`: prototype contract, candidate roster and pilot sequence.
- Spec 0001: stack, pure domain code, public calculator and real data prerequisites.
- Specs 0004, 0007 and 0008: existing production model and money loop requiring later reconciliation.
- `design.md`, specs 0009 and 0010: current visual and identity contracts.
- `src/components/pitch/pitch-view.tsx`: incumbent fixed slot and Bench assumptions.
- Ponytail, Secure Me and Impeccable at the installed locations named in the build spec: minimal implementation, fictional data boundary and visual planning.

Practices: Tracer Bullet, derived values rather than duplicated state, absolute record replacement for safe repetition, and a qualitative comprehension study before longitudinal claims. These practices support the chosen sample boundary and verification plan.
