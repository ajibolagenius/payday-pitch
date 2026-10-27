# Payday Pitch: unified research report

**Working follow up:** [Three focused briefs and the founder decision queue](../direction/index.md). Use those for the next steps; this report retains the full research and recommendations.

**Date:** 26 October 2026
**Status:** Consolidated research and recommendation. No code was changed. Nothing here is an approved spec until it goes through `/scope` and `/architect`.
**Brief:** [docs/prompt.md](../prompt.md). Four questions: product breadth, visual directions, the mobile-first face, and brand/copy/type/logo/marketing. The current implementation is deliberately ignored.
**Built from three agent reports:**

| Tag     | Agent      | Report                                                                           | What it was best at                                                                                                                                                          |
| ------- | ---------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Q]** | Qwen/Qoder | [2026-10-26-vision-refresh.md](2026-10-26-vision-refresh.md)                     | Nigeria-specific market insight, football idiom, growth and monetisation, a committed recommendation. It is also the only report built on answers the founder actually gave. |
| **[C]** | Cursor     | [research-fresh-approach-2026-10-26.md](research-fresh-approach-2026-10-26.md)   | Asset reading, breadth of feature ideas, mobile method, grill questions, a practical decision workshop.                                                                      |
| **[X]** | Codex      | [fresh-product-brand-mobile-research.md](fresh-product-brand-mobile-research.md) | Financial correctness, honest terminology, accessibility, a verified font audit, a validation plan.                                                                          |

Tags mark where each idea came from. **[U]** marks something added or corrected while merging the reports.

---

## 0. The unified stance on one page

1. **The product is a pay-cycle season, not a one-off screen.** Pre-season (setup) → Matchday (payday plan) → Kick-off (follow-through checklist) → Half-time (mid-month check) → Change tactics (adjust) → Full-time (month review) → next Matchday. A calendar year is one season. [Q][C][X]
2. **We plan and never hold money.** "Your bank keeps the ball; we draw the tactics board." This is the strongest trust position available in a market burned by collapsed schemes, and every screen has to keep it true. "Plan saved. Your money has not moved." [Q][X]
3. **The formation explains priorities. It never prescribes risk.** There are four lines (Keeper, Defence, Midfield, Attack) and the user's real purposes sit inside them. There is no forced count of eleven. A formation preset is an editable starting shape whose numbers are always visible. [X][Q][C]
4. **Defence comes first, and that is a rule.** Essentials and required debt payments must be funded before Attack can be. When the plan breaks this rule, the user sees it explained, not scolded. [C][X]
5. **Celebrate adherence, never transactions, and never punish a hard month.** Clean sheets are counted per season, not kept as a streak that can break. There are no points for money moves, no loot boxes and no betting visuals. "No wager. Just your eleven." [Q][C][X]
6. **Visual direction "Matchday": a calm product with loud moments.** The structure is a Swiss pitch grid on a warm daylight paper surface, with an equal Night Match dark theme. The colour system is one owned signal colour plus four position colours. Amounts sit on a quiet grotesque with tabular figures, and kit-number display numerals appear only for celebrations. Neon sticker energy belongs to marketing. [Q][C][X]
7. **Design mobile first, and decide the platform deliberately.** An installable PWA is the recommended first platform (data costs, no store tax, a link instead of a download). Its limits are known: no home-screen widgets, no per-user app icon, and push on iOS only after the app is installed. [Q][U]
8. **Football names the moment; plain English names the action.** A screen can be called "Half-time". Its button says "Update plan". [X][C][U]
9. **The free tier must never block the core habit.** The paid Season Ticket sells coaching depth, scenarios, history, household planning and league hosting. Warnings, corrections and exporting your own data are always free. [Q][X]
10. **Typography needs work before launch.** Aspekta is the right UI family, but it has **no ₦ glyph and proportional digits**, which this merge verified. Amounts need either a renamed OFL fork of Aspekta with ₦ and tabular figures, or a paired numeral face. [X][U]

### 0.1 Founder decisions already on record

These answers came from the working session in [Q]. The other two agents ran without them, so where their recommendations conflict with these answers, the answers win.

| Topic                        | Decision                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Primary market               | Nigeria first (naira, Lagos time, local instruments and culture)                                                |
| Football layer               | Core loop plus gamification. The formation is a monthly ritual, not just a hook.                                |
| Business model               | Consumer subscription                                                                                           |
| Visual references to explore | All four clusters: flat editorial illustration, candy widget softness, neon sticker energy, dark poster UI      |
| Data entry                   | Manual now; open banking later                                                                                  |
| "Put to work"                | Instrument-agnostic: savings apps, ajo/co-ops, funds, crypto. The app never holds money or recommends products. |
| Gamification                 | Solo progression first; social mini-leagues as the premium hook                                                 |

### 0.2 Where the reports disagreed, and what this report picks

| Question              | [Q]                                             | [C]                                             | [X]                                                      | **Unified pick**                                                                                    | Why                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand base colour     | Lime or deep green, owned loudly                | Electric trust blue, with lime only on Matchday | Colour-Block Club (ink/aubergine + lime, apricot, lilac) | **Pitch ink + floodlight lime on warm paper**, tested against one alternative (§2.4)                | Blue is the most crowded lane among Nigerian money apps (verified, §0.3 audit). Ink and lime own the sport register without betting cues; they must stay visibly distinct from Bamboo's green and lime. |
| Streaks               | Clean-sheet streak is the core retention metric | No dark streaks                                 | Do not lead with streaks                                 | **Count clean sheets per season; no breakable streak**                                              | Keeps the reward and removes the punishment, so streak freezes are not needed either.                                                                                                                   |
| Formation literalness | Fixed position mapping, presets                 | Presets with ratios, captain, bench             | Flexible purposes, no forced eleven, test three models   | **Four fixed lines, flexible purposes inside, presets as editable starting shapes**                 | Football identity holds without inventing fake categories to fill a 4-3-3.                                                                                                                              |
| Home screen           | The formation screen is the app                 | Living pitch home                               | Action-led Today, pitch in Plan                          | **Action-led Today with a compact pitch strip; full pitch in Plan**                                 | Answers "what do I do now?" while football stays visible. Test against a pitch-led home.                                                                                                                |
| Bottom nav            | (screen list only)                              | Pitch · Plan · Goals · Activity · You           | Today · Plan · Goals · Progress                          | **Today · Plan · Goals · Season**, with account behind the avatar                                   | Four plain destinations; "Season" carries the football flavour.                                                                                                                                         |
| Dark mode             | Night Match reserved for premium                | Dual kit, home and away                         | Design dark deliberately                                 | **Night Match free for everyone**                                                                   | Theme is a comfort and accessibility setting, not a paywall. Premium can unlock extra kit colourways instead.                                                                                           |
| Mini-leagues          | Premium hook, adherence-only                    | Private first, rank on rate not income          | Avoid public wealth ranks                                | **Private, adherence-only; joining is free, hosting needs a Season Ticket**                         | Network effects stay free while the hook stays paid.                                                                                                                                                    |
| AI coach              | "The Gaffer", rules first, LLM later            | Opt-in coach mode; no fake AI                   | A bounded explanation feature, later                     | **Gaffer notes are rule-based and show their basis. Warnings are free; scenario depth is premium.** | All three agree on bounded and honest; this adds the free/paid split.                                                                                                                                   |
| Export                | CSV/PDF free (trust), later listed as premium   | Export is premium                               | Never charge for your own records                        | **CSV always free; the designed season PDF is premium**                                             | Owning your data is a trust promise.                                                                                                                                                                    |
| Price                 | ₦1,200–2,000 per month                          | (not set)                                       | Do not set a price yet                                   | **₦1,200–2,000 per month as a test band only**; annual ≈ 10 months, framed as a "season ticket"     | Gives tests a starting point without treating it as decided.                                                                                                                                            |
| Pidgin                | Celebration and marketing only                  | Asked the question                              | (not covered)                                            | **[Q]'s code-switch rule**                                                                          | Sound reasoning, and an open lane competitors are not using.                                                                                                                                            |
| Fonts                 | Aspekta + Big UI or Stanzegic                   | Aspekta/Mont path; verify licences              | Aspekta-led study; ₦ and tnum missing                    | **Aspekta for UI, a new solution for amounts, display face to be sourced**                          | Big UI and Stanzegic are images only, with no font files.                                                                                                                                               |

### 0.3 Corrections made during the merge

| Claim                                                                                       | Source    | Correction                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Verify the chosen faces contain `tnum`"                                                    | [Q]       | Verified with fontTools on 26 Oct 2026. **Aspekta 400, 700 and the variable font have no `tnum` and no tabular digits** (nine different digit widths). **No ₦ (U+20A6)** in Aspekta, Mont Heavy demo or Batica. There is no precomposed Ẹ/Ọ/Ṣ; Aspekta does have the combining dot below (U+0323), but its placement has not been tested. Mont Heavy demo _does_ have `tnum`. |
| Modify Aspekta freely                                                                       | (implied) | Aspekta's OFL 1.1 declares **Reserved Font Name "Aspekta"**. A modified version is allowed but must be published under a different name.                                                                                                                                                                                                                                      |
| "Display: Big UI or Stanzegic"                                                              | [Q]       | No font files for either exist in `web_resources`; the files are JPG mockups. Treat them as composition references and source a licensed display face separately. [X]                                                                                                                                                                                                         |
| Mont is "paid for web embedding" / "demo"                                                   | [Q][C]    | The local archive holds two demo weights (ExtraLight, Heavy) with a 2015 free-font EULA that permits commercial use for the fonts it covers. The current foundry terms differ. Keep the provenance and buy the full family before using it in production. [X]                                                                                                                 |
| Collectible app icon that changes with your streak                                          | [Q]       | Not possible for a PWA. Manifest icons are fixed at install and identical for every user. Android badging shows only a dot or count. Put the collectible element on share cards and in-app kit instead. [U]                                                                                                                                                                   |
| Taken market colours "PiggyVest green, Moniepoint pink"                                     | [Q]       | **Wrong. Verified with Playwright on 26 Oct 2026** (see "Market colour audit" below). PiggyVest and Moniepoint are both **blue**. Of Qwen's list, only Kuda (purple) and OPay (green) were right.                                                                                                                                                                             |
| Cleo settlement "$17M"                                                                      | [Q]       | [Q]'s own cited FTC source says about $15.8M returned to consumers. Quote the source figure or leave the number out.                                                                                                                                                                                                                                                          |
| Market statistics (saving fell from 64% to 40%; 83% pay black tax; ₦300bn+ lost to schemes) | [Q]       | Plausible and cited, but not re-verified here. Check each against its primary source before using it in a pitch deck or ad.                                                                                                                                                                                                                                                   |
| "No football-metaphor finance product exists"                                               | [Q]       | Narrow it to "no direct competitor found". [C] cites Visa's Financial Soccer, a literacy game, and Foosio, a fantasy formation UX. Neither is a salary planner.                                                                                                                                                                                                               |

#### Market colour audit (Playwright, 26 Oct 2026)

**Method.** Each homepage was loaded at 1280×900. I read its `theme-color` meta tag, measured which saturated colours cover the most area and text in the live CSS, and checked a screenshot by eye. Moniepoint's site blocks automated browsers (Cloudflare), so its colour comes from its Google Play icon. PiggyVest's icon was also checked on Google Play, because its website wordmark is near-black.

| Brand      | Qwen said    | Verified              | Evidence                                                                                                                       |
| ---------- | ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| PiggyVest  | green        | **Blue**              | Blue padlock app icon; cobalt CTA `#1734ca`; `theme-color` `#0C567B` (deep teal-navy); near-black wordmark; pink flower accent |
| Cowrywise  | blue         | **Blue** ✓            | `theme-color` and CTAs `#0067f5`; navy text `#082552`; blue app icon                                                           |
| Kuda       | purple       | **Purple** ✓          | Page field `#40196d`; lilac wordmark `#cc77e9`; cream surfaces `#F5EFE6`                                                       |
| OPay       | green        | **Green** ✓           | Mint-green `#1dc99b` / `#1dcf9f`; deep indigo text `#210f60`                                                                   |
| Moniepoint | pink         | **Blue**              | Blue "M" app icons (Personal and Business); navy and sky-blue store artwork                                                    |
| PalmPay    | (not listed) | **Purple**            | Violet `#7047d9` / `#8f00ff`, deep purple `#490181`, yellow accent `#ffd74c`                                                   |
| Bamboo     | (not listed) | **Dark green + lime** | App icon: lime leaf on deep green (seen in the Play Store results)                                                             |
| PocketApp  | (not listed) | **Purple + orange**   | App icon and store banner                                                                                                      |

**What this means:**

- **Blue is the most crowded lane** (PiggyVest, Cowrywise, Moniepoint). That confirms the decision not to use [C]'s electric trust blue as the base.
- **Purple is the second most crowded** (Kuda, PalmPay, PocketApp).
- **Green is taken** in two forms: OPay's bright mint, and Bamboo's deep green with lime. Bamboo sits close to candidate A ("pitch ink + floodlight lime"), so A has to separate itself on the ground, not only the hue: warm paper surfaces, ink that is near-black rather than forest green, lime used as a flat fill with no leaf or organic shapes, and the formation-dot mark. If the icon tiles still read as Bamboo in the side-by-side test, move the signal colour toward a yellower "boots" lime or test candidate B.
- **Still open in this market:** lime/acid-yellow as a lead colour, warm orange/tangerine, and off-white-led identities.

---

## 1. Product: more than a single act

### 1.1 What success means for the user

"Split my salary" is an activity. The outcome to design for is: **"I know what this pay must cover, what to do with it today, and whether my future is getting stronger."** [X]

| User question                                          | What the product does                                | Football frame   |
| ------------------------------------------------------ | ---------------------------------------------------- | ---------------- |
| What must this salary cover before next payday?        | Lists amounts, priorities and due dates              | The fixtures     |
| What do I do with the money today?                     | Turns the plan into an ordered checklist             | Kick-off         |
| Can I change this without hurting something important? | Shows the consequences before saving                 | Change tactics   |
| Am I getting more resilient?                           | Tracks the reserve, contributions and debt over time | The season table |
| Am I allowed to enjoy some of it?                      | Makes flexible spending a legitimate line            | Midfield         |

Why the need is real in Nigeria, as reported by [Q] (verify before external use): fewer people are saving each month (64% in 2023 to 40% in 2025, PiggyVest Savings Report); very few feel financially secure; most earners pay "black tax" to family and over half pay it monthly; collapsed schemes have taught people to distrust anything that holds their money. A planner that gives salary a _shape_ and never takes custody answers all of these.

### 1.2 The service boundary (non-negotiable)

- **Payday Pitch plans, records and explains. It never holds, moves or invests money, and it never recommends a specific financial product.** [Q][C][X]
- The "put to work" line points to wherever the user already saves: PiggyVest, Cowrywise, an ajo, a co-op, a crypto wallet. The app records the _intention_ and, once the user marks it, the _action_. [Q][X]
- Every confirmation tells the truth about this boundary: "Plan saved. Your money has not moved." [X]
- If the product ever reads bank data or moves money, that is a separate product decision with its own language, flows and regulation. Do not drift into it. [X]

### 1.3 The season loop

| Moment                           | Financial job                                                   | Football name                            | Why the user comes back                                                |
| -------------------------------- | --------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| First 1–2 paydays                | Guided setup with sensible, skippable defaults                  | **Pre-season**                           | Build the first plan without a big form                                |
| Payday                           | Confirm the pay received, assign every naira a purpose, lock    | **Matchday** ("Lock my XI")              | Decide what this money must do                                         |
| Straight after                   | Tick off the transfers and payments made in their own bank apps | **Kick-off checklist**                   | Turn the plan into actions                                             |
| Mid-month                        | One question: is Defence still funded? Anything new?            | **Half-time**                            | A quick check, not a replan                                            |
| When life changes                | Move money between lines and see the consequences               | **Change tactics** (the transfer window) | Keep the plan true when reality shifts                                 |
| Irregular family or social calls | Draw from a pre-funded line                                     | **Away Days**                            | A wedding, a hospital bill or a call from home doesn't wreck the month |
| Before next payday               | Compare planned with recorded; carry the lessons forward        | **Full-time report**                     | The next plan starts better                                            |
| Year end                         | Clean sheets, Defence record, reserve growth, debts relegated   | **Season finale**                        | The annual, shareable story                                            |

The loop has a time budget: **the monthly Matchday ritual must fit in about 90 seconds for a returning user.** Every feature lives around that loop, never inside it. [Q][C]

This is not a daily-use app. One focused session plus a few short check-ins is a successful month. Optimise for decisions completed across pay cycles, not for minutes spent in the app. [X]

### 1.4 The formation model

**Four lines, each with an exact financial meaning.** Users place their real purposes in the lines; empty space on the pitch is allowed. [X][Q]

| Line         | Holds                                                                                                            | Boundary                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Keeper**   | Accessible cash reserve, the emergency fund                                                                      | It must be cash the user can actually reach. An investment is not a keeper.                                   |
| **Defence**  | Essentials (rent, transport, power, data, food basics) and **required** debt payments                            | Funded first. Every item shows its real label and due date.                                                   |
| **Midfield** | Flexible day-to-day spending, family support (black tax), the Away Days fund, near-term bills being saved toward | "Flexible" does not mean "unimportant". Family support is a position, not a leak.                             |
| **Attack**   | Long-term goals and wealth contributions (savings plan, ajo, fund, crypto, a course)                             | The position does not imply higher-risk investments. It holds an intention until the user records it as done. |

**Formation presets** give a starting shape. Each one shows its numbers and its trade-off in one sentence, and everything can be edited. [Q][C]

| Preset                          | Shape                                    | For                                  |
| ------------------------------- | ---------------------------------------- | ------------------------------------ |
| 4-4-2 Balanced                  | Even Defence and Midfield, steady Attack | A typical stable month               |
| 5-3-2 Park the bus / Debt siege | Heavy Defence                            | High rent, debt or obligation months |
| 4-5-1 Family shield             | Heavy Midfield                           | Months with heavy family support     |
| 4-3-3 Attack                    | Lean Defence, strong Attack              | Debt-free, building wealth           |

A preset name never sets a risk level and never silently sets percentages. [X]

**Optional depth, added later and kept light:** **Captain** is the one purpose that gets any surplus first. **Bench** holds goals parked until income grows. **Squad call-up / release** adds or retires a goal without a CRUD screen. [C][Q]

**Debt gets its own story: the Relegation battle.** Each debt shows its required payment, the remaining balance when known, and progress toward being "relegated" out of your league. It is framed as getting rid of the debt, never as a shameful opponent. [Q][X]

### 1.5 Financial rules the product must follow

Most of these come from [X], with [C]'s "rules of the pitch" framing:

1. Plan only on money that has been received or explicitly confirmed. Keep expected income separate from received income.
2. Ask for **net take-home pay**, so deductions are never counted twice.
3. **Defence before Attack.** Locking a plan that underfunds essentials triggers a calm explanation and an extra confirmation, not a block. [C]
4. Essentials may exceed income. Show the shortfall and help prioritise; never invent a savings contribution that isn't there.
5. Required debt payments are commitments. Never assume one salary can clear the whole balance.
6. Keep **planned**, **recorded** and **verified** visibly distinct (§4.3).
7. A transfer between the user's own accounts is not new income and not wealth created.
8. An adjustment always says where the money came from and what that line loses. It never silently reduces the Keeper or a debt payment.
9. Forecasts show their inputs, any missing information and their assumptions.
10. Necessary spending is never described as failure.

### 1.6 Worked example (illustrative numbers only) [X]

₦600,000 net pay received:

| Purpose                                    |       Amount | Line                  |
| ------------------------------------------ | -----------: | --------------------- |
| Living costs: power, food, transport, data |     ₦200,000 | Defence               |
| Saving toward annual rent                  |      ₦80,000 | Defence               |
| Required loan repayment                    |      ₦50,000 | Defence               |
| Family support                             |      ₦40,000 | Midfield              |
| Flexible personal spending                 |      ₦75,000 | Midfield              |
| Emergency reserve                          |      ₦80,000 | Keeper                |
| Course fund                                |      ₦75,000 | Attack                |
| **Total assigned**                         | **₦600,000** | **₦0 left to assign** |

Seven purposes, no forced eleven. If only ₦400,000 arrives, the app shows a ₦200,000 gap against the draft and asks what to change. If food costs rise by ₦20,000, Change tactics asks which line pays for it and shows what that line loses.

### 1.7 Feature catalogue by horizon

"v1" means the first end-to-end loop. Items move later or earlier based on evidence, not enthusiasm.

| Feature                                                                                                             | Horizon                    | Source    |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------- |
| Pre-season setup (5 resumable cards: income → essentials → debts → obligations → goals; value shown before sign-up) | **v1**                     | [Q][C][X] |
| Matchday plan builder: four lines, presets, live "left to assign"                                                   | **v1**                     | all       |
| Lock confirmation with the Defence-first rule                                                                       | **v1**                     | [C][X]    |
| Kick-off checklist (record actions done elsewhere)                                                                  | **v1**                     | [X]       |
| Fixtures: commitments with due dates before the next payday                                                         | **v1**                     | [C][X]    |
| Change tactics (mid-month adjustment with consequences)                                                             | **v1**                     | all       |
| Late or partial salary state                                                                                        | **v1**                     | [X][C]    |
| Full-time report (planned vs recorded) and carry-forward                                                            | **v1**                     | [C][X]    |
| Clean sheet count                                                                                                   | **v1**                     | [Q]       |
| Payday reminder notification (opt-in)                                                                               | **v1**                     | [Q][C]    |
| Share card (shape and percentages; amounts off by default)                                                          | **v1**                     | all       |
| CSV export                                                                                                          | **v1**                     | [Q][X]    |
| Half-time check-in                                                                                                  | Next                       | [C]       |
| Away Days fund                                                                                                      | Next                       | [Q]       |
| Relegation battle (debt view)                                                                                       | Next                       | [Q]       |
| Goals with dates (goal stadiums)                                                                                    | Next                       | [C][X]    |
| Annual and irregular bills (rent, school fees, December)                                                            | Next                       | [X][C]    |
| Raise or bonus planner; salary ledger with "contract renewal" nudge after 12 flat months                            | Next                       | [Q][X]    |
| Gaffer notes: rule-based, one per payday, shows its basis                                                           | Next                       | [Q][C][X] |
| Season view and season finale                                                                                       | Next                       | [Q][C]    |
| Scenario packs ("December is coming", "salary delayed", "bonus arrived")                                            | Next                       | [C]       |
| What-if comparison of two plans                                                                                     | Next (premium)             | [C][X]    |
| Private mini-leagues (adherence only)                                                                               | Next (premium hosting)     | [Q][C]    |
| Multi-income squads (salary + side hustle)                                                                          | Later (premium)            | [Q][C]    |
| Inflation-adjusted wage view                                                                                        | Later                      | [Q]       |
| Annual "scouting report" (re-quote rent, data, subscriptions)                                                       | Later                      | [Q]       |
| Household / couple squad with privacy controls                                                                      | Later (premium)            | all       |
| Bank or CSV import                                                                                                  | Later                      | all       |
| Employer wellness channel                                                                                           | Later experiment           | [X]       |
| Money movement, investment integration                                                                              | Separate business decision | [X]       |

### 1.8 Gamification rules

**Celebrate:** a locked plan, a clean sheet (every Defence item recorded as paid that month), a reserve milestone, a relegated debt, coming back after a gap. [Q][C][X]

**Never gamify:** money moves, trading or investing frequency, borrowing, aggressive allocation, daily opens, or anything that can be "won" with a bigger salary. [C][X]

**Mechanics:**

- Clean sheets are a **season count** ("7 clean sheets in 2027"). A missed month never erases past ones. [U]
- **One** choreographed celebration per month, at lock. No per-tap confetti. [Q]
- Leagues score adherence only (plan locked, clean sheet, Full-time report done) and never show amounts. Private and invite-only. [Q][C]
- No loot boxes, card packs, paid random rewards or second currencies. [Q][X]
- "Never punish a hard month" is both the ethical rule and the growth rule. [Q]

### 1.9 Premium: the Season Ticket

|                                                  | Free      | Season Ticket |
| ------------------------------------------------ | --------- | ------------- |
| Plans, lock, checklist, fixtures, Change tactics | Unlimited | Unlimited     |
| Shortfall and Defence-first warnings             | ✓         | ✓             |
| Clean sheets, current-season history             | ✓         | ✓             |
| Share cards, CSV export                          | ✓         | ✓             |
| Join a mini-league                               | ✓         | ✓             |
| Night Match theme                                | ✓         | ✓             |
| Gaffer: deeper analysis and scenario comparisons |           | ✓             |
| Multi-season history and analytics               |           | ✓             |
| Multiple income squads                           |           | ✓             |
| Host mini-leagues                                |           | ✓             |
| Designed season PDF report                       |           | ✓             |
| Household squad (later)                          |           | ✓             |
| Extra kit colourways and custom formations       |           | ✓             |

**Rules** [Q][X]:

- Never paywall the act of planning or saving, a critical warning, correcting a mistake, support, or the user's own records.
- Price in naira, monthly first. The annual plan is about 10 months' price, framed as a "season ticket". **Test band: ₦1,200–2,000 per month**, to be checked against the willingness-to-pay method in §6.2 before launch.
- Show the renewal price at every checkout and allow cancelling within two taps. Treat this as a brand feature: "Cancel like a gentleman." [Q]
- Payment rails: recurring card through Paystack or Flutterwave, **plus** bank transfer and top-up, because card auto-renewal churns badly on failed charges in Nigeria. [Q]
- Ship in-app subscriptions on the web/PWA so store fees (15–30%) are avoided. [Q]

### 1.10 Rejected or deferred ideas

Football news feed or live scores as the home centrepiece. Public wealth rankings. Rewards for investing more aggressively. A chat-only AI product. Trading-card collectible mechanics. Holding deposits to raise engagement. Club or Super Eagles theming (licensing and ambush-marketing risk). [X][Q][C]

---

## 2. Visual direction

### 2.1 What the reference pack says

The folder pulls toward two poles at once. [C]

- **Trust pole:** Aspekta, Mont and Batica specimens, the isometric clean landing page, calm white cards.
- **Energy pole:** lime-on-black logos, ink-trap display type, neo-pop keycaps, sticker stories, dark glass UI.

Do not average them into muddy "purple fintech". **Pick a ratio by surface: roughly 70% trust and 30% energy inside the product, reversed in marketing.** [C] Codex's expression ladder sets the ratio per context:

| Context                          | Expression          | Priority                                         |
| -------------------------------- | ------------------- | ------------------------------------------------ |
| Marketing and campaigns          | High                | Distinctive; explains the product                |
| Onboarding (Pre-season)          | Moderate            | Makes the mechanism clear                        |
| Today and Plan                   | Controlled          | Helps the user decide                            |
| Amount editing and review        | Precise             | Prevents misunderstanding                        |
| Shortfall and errors             | Quiet and direct    | Says what happened and what to do                |
| Lock, clean sheet, season finale | Warm and expressive | Recognises real actions without overstating them |

| Reference                                    | Signal                                         | Use for                            |
| -------------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| `Logo-Idea-Concept.png`                      | Neon lime on black, heavy geometric marks      | Icon and sticker energy, marketing |
| `3fae4e3e…jpg`                               | Forest green, lime and orange ink-trap display | Matchday moments, campaigns        |
| `shapes-ideas-concept.png`                   | Widgets, soft 3D, bento, neo-brutal borders    | Position modules, share cards      |
| `hello-colorful.jpg`                         | Keycap objects, mint, thick outlines           | Stickers and onboarding objects    |
| `89c0bdfa…jpg`                               | Colour square + label strips                   | Team-sheet / position lists        |
| `080a41b9…jpg` (Sprouts-style)               | Dark editorial mobile, big type, floating dock | Night Match, display numerals      |
| `Visual-Style-Concept.png`, `9db5d586…jpg`   | Flat editorial illustration, long shadows      | Rationed illustration moments      |
| `isometric-clean-landing.webp`               | White space, diagrams                          | Explainer and education graphics   |
| Aspekta / Mont / Batica / Big-UI / Stanzegic | Type candidates and story layouts              | See §4.5                           |

All board images are inspiration with unverified rights. Create an original grammar from them; never trace them. [X]

### 2.2 The catalogue of directions

The three reports named about 60 directions with heavy overlap. Deduplicated:

| #   | Direction                                                                                                                                              | Idea                                                                           | Best role                              | Main risk                               | From      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------- | --------- |
| 1   | **Swiss pitch grid**                                                                                                                                   | Pitch markings (centre circle, halfway line, boxes) as the literal layout grid | **Product skeleton**                   | Cold if colourless                      | [Q][X]    |
| 2   | **Colour-Block Club**                                                                                                                                  | Bold fields, one module colour per role                                        | Position modules, marketing            | Rainbow noise                           | [X][C]    |
| 3   | **Kit and textile**                                                                                                                                    | Jersey stripes as dividers, kit numerals for amounts, name-plate labels        | Celebration numerals, share cards      | Costume-y if overdone                   | [Q][X]    |
| 4   | **Soft bento / widget OS**                                                                                                                             | Rounded tiles, rings, glanceable modules                                       | Formation-at-a-glance, Today           | Generic fintech if colour is timid      | [C][Q]    |
| 5   | **Floodlight / Night pitch**                                                                                                                           | Ink surfaces, lime light, poster numerals                                      | Dark theme, campaigns                  | Betting or esports look-alike           | all       |
| 6   | **Flat editorial illustration**                                                                                                                        | Big silhouettes, 2–3 colour scenes                                             | Four rationed moments                  | Expensive to sustain                    | [Q][C][X] |
| 7   | **Neon sticker brand**                                                                                                                                 | Lime/black/yellow, wordmark as art                                             | Marketing, WhatsApp status, merch      | Wrong for errors and debt               | [Q][C]    |
| 8   | **Modern Club Editorial**                                                                                                                              | Warm paper, strong headlines, magazine care                                    | Full-time report, season finale        | Can hide the work                       | [X]       |
| 9   | **Financial Atlas**                                                                                                                                    | Routes, legends, labelled paths                                                | Goals and explainers                   | Too diagrammatic                        | [X]       |
| 10  | **Electric trust blue**                                                                                                                                | Royal blue, white, classic money trust                                         | (not recommended as base)              | Most crowded lane in the market         | [C]       |
| 11  | **Broadcast score bug**                                                                                                                                | TV lower-thirds, status bands                                                  | The persistent "score bug" status chip | Live-betting look if mishandled         | [C][X]    |
| 12  | **Paper tactics board / digital chalkboard**                                                                                                           | Marker strokes and X/O on paper                                                | Change tactics screen                  | Handwriting must stay away from figures | [C][X]    |
| 13  | **Results board**                                                                                                                                      | Chalk on black, one accent                                                     | Marketing nostalgia                    | Bleak for a wealth app                  | [Q]       |
| 14  | **Teletext retro**                                                                                                                                     | Pixel scoreboard, 90s Super Eagles nostalgia                                   | One-off campaign                       | Novelty register                        | [Q]       |
| 15  | **Ticket and programme**                                                                                                                               | Fixture cards, perforations                                                    | The Fixtures list                      | Detail overload on small screens        | [X]       |
| 16  | **Isometric systems**                                                                                                                                  | Labelled nodes and connectors                                                  | "How it works" explainers              | Asset cost, hidden labels               | [C][X]    |
| 17  | **Soft clay 3D**                                                                                                                                       | Tactile tokens and orbs                                                        | Milestone objects only                 | Crypto look, infantilising              | [C][X]    |
| 18  | **Neo-brutal lite**                                                                                                                                    | Thick borders, hard shadows                                                    | Ads only                               | Wrong for balances                      | [C]       |
| 19  | **Glass on night pitch**                                                                                                                               | Frosted chrome                                                                 | Nav dock and sheets only               | Unreadable amounts                      | [C][Q]    |
| 20  | **Cream authority**                                                                                                                                    | Off-white, black, restrained accent                                            | Receipts, export, legal                | Too quiet alone                         | [C]       |
| 21  | **Monochrome + one signal**                                                                                                                            | Black, white and one colour                                                    | Discipline check for the system        | Less colourful than the brief           | [C]       |
| 22  | **Photo-real Nigerian life + graphic type**                                                                                                            | Commissioned everyday scenes                                                   | Campaigns                              | Consent, licensing, cost                | [C][X]    |
| 23  | **Stadium day**                                                                                                                                        | Floodlight gradients, grass texture                                            | Season finale                          | Heavy for low bandwidth                 | [Q]       |
| 24  | **Trading-card collectibles**                                                                                                                          | Goals as cards with stats                                                      | **Rejected**                           | Loot-box smell                          | [Q][X]    |
| 25  | **Collectible progress / personal emblem**                                                                                                             | A user's club emblem and progress album                                        | Season record (later)                  | Setup friction, busywork                | [X]       |
| 26  | Others (transit map, receipt ledger, training journal, season passport, clubhouse, mural, ribbon, calendar-first, open ledger, life chapters, archive) | Valid alternatives                                                             | Reference only                         | Off the recommended axis                | [X]       |

### 2.3 Recommendation: "Matchday"

One coherent system. Every layer has one job:

| Layer                | Choice                                                                                                                                                                                                                    | From          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Skeleton**         | Swiss pitch grid: hairline pitch markings define sections, the halfway line is the main divider, the centre circle is the focal point                                                                                     | [Q] J, [X] 12 |
| **Ground**           | Daylight: a warm paper/off-white surface, never pure white. Night Match: a deep ink-green surface, never pure black. Both themes are free and equal, and each gets its own tested pairings.                               | [Q][C]        |
| **Identity colour**  | One owned signal colour, used with conviction (§2.4)                                                                                                                                                                      | [Q]           |
| **Position colours** | Four candy-bright but contrast-safe hues for Keeper, Defence, Midfield and Attack. Always paired with a label and a symbol. These hues live in modules, chips and share cards; this is where the widget softness belongs. | [Q][C][X]     |
| **Modules**          | Soft bento tiles with moderate radius; a squared "team-sheet" strip for lists                                                                                                                                             | [C]           |
| **Numbers**          | One giant tabular hero figure per screen; kit-number display numerals only at 24px and above on celebration surfaces                                                                                                      | [Q]           |
| **Illustration**     | Flat editorial style, commissioned for exactly four moments: Pre-season, empty plan, season finale, Season Ticket page. Everywhere else, the grid and type carry the design.                                              | [Q]           |
| **Sticker layer**    | The neon lime/black sticker identity runs marketing, WhatsApp status cards and merch. Inside the product it appears only as celebration accents.                                                                          | [Q][C]        |
| **Glass**            | Nav dock and sheets only, never behind figures                                                                                                                                                                            | all           |

**Why this order:** trust is the binding constraint in this market, so the product surface reads premium first. Playfulness goes where it is safe: lock moments, share cards and marketing. [Q]

### 2.4 Colour

**Separate three colour roles that must never borrow from each other** [X]:

1. **Identity:** the signal colour and the ink.
2. **Category:** the four positions.
3. **Status:** covered, short, over, locked, and error/warning/success. No decorative or user-chosen colour may imitate a status.

**Hero colour fork.** This is the biggest brand decision left.

| Candidate                                        | Character                                    | Rule if chosen                                                                                                                                                                                                  |
| ------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Floodlight lime + pitch ink** (recommended) | Sport-tech, ownable; neither blue nor purple | Lime is a _fill_ (CTAs, lock moment, icon tile) with ink text on it. Lime is never used as text on paper. Keep it distinct from Bamboo (deep green + lime leaf): near-black ink, warm paper, no organic shapes. |
| B. Deep match green + tangerine                  | Premium, editorial (Modern Club Editorial)   | Keep clear of OPay's mint and Bamboo's deep green                                                                                                                                                               |
| ~~C. Electric blue + lime accents~~ [C]          | Classic trust                                | **Dropped.** The audit confirmed blue is the most crowded lane (PiggyVest, Cowrywise, Moniepoint).                                                                                                              |

**Method:** the market colour audit is done (§0.3). Next, mock A and B as home-screen icon tiles placed beside the real PiggyVest, Cowrywise, Kuda, OPay, Moniepoint, PalmPay and Bamboo icons, and as a Matchday screen. Test both with 5–10 target users using the comprehension-first method in §6.2. [Q][X]

**Building the palette:** define it in OKLCH so lightness steps, position hues and the dark theme derive systematically [Q]. Check real text and background pairs against WCAG: 4.5:1 for normal text, 3:1 for large text and UI parts, and not just the swatches [X]. Keep position hues away from red and amber so they never read as alerts [X]. Ask about cultural colour meanings (for example, all-red reading as debt or danger) [C].

### 2.5 Prototype comparison

Build **three** directions with the **same content and the same three tasks**: a first payday plan, a mid-month check, and a salary shortfall. [X]

1. **Matchday** (recommended): daylight pitch grid, lime and ink.
2. **Modern Club Editorial**: ivory, forest, tangerine, magazine type.
3. **Floodlight**: dark-first, lime, poster numerals.

Ask what the product does, what the next action is, and whether the amounts are clear _before_ asking which one users prefer. [X]

---

## 3. The mobile-first face

### 3.1 Why mobile first, and what that does not mean

Payday happens on a phone: a 90-second ritual on a mid-range Android, often on bad data. Designing small first forces clear hierarchy. [Q][C]

What mobile first does **not** mean: that every task is best on a phone, or that the desktop gets designed twice. The sequence is: **mobile task model first, early cross-size checks, then responsive detail.** The desktop later becomes the "coach's chalkboard" for wide editing, side-by-side plan comparison and household setup, using the same tokens and terms. [X][C]

### 3.2 Platform

Recommended: **an installable PWA first.** A link instead of a download, a small bundle in a data-cost market, and no store tax on the subscription. [Q] The honest limits [Q][U]:

| Wanted                    | PWA reality                                       | Substitute                                                                                                                                |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Home-screen widgets       | Not possible                                      | Share cards users save themselves; manifest shortcuts ("Start Matchday" on long-press)                                                    |
| Dynamic per-user app icon | Not possible                                      | Kit and emblem inside the app and on share cards                                                                                          |
| Badge                     | Android badging (dot or count)                    | Badge on payday until the plan is locked                                                                                                  |
| Push                      | Android: yes. iOS: only after Add to Home Screen. | A thin Play Store wrapper later, used purely as a notification port                                                                       |
| Offline                   | Possible                                          | Do not promise until it is built. If built: cached shell and an honest offline page. Never cache signed-in money pages in shared storage. |

### 3.3 Design principles

1. **One hand, one thumb.** Primary actions sit in the lower third and use the bottom nav. Nothing critical goes in the stretch zone. [Q][C]
2. **One job per screen.** Two equal primary CTAs means the screen should be split. [C]
3. **Money is the hero numeral.** One giant tabular figure per screen. On Today, that figure is "left to assign" or "next due", not the total salary. [Q]
4. **Show value before asking for verification.** Show the formed formation before sign-up; Pre-season works as a guest. [Q][C]
5. **Resumable, skippable steps.** Every setup card saves itself and offers a sensible default. [Q][X]
6. **The 90-second test.** No feature may lengthen the returning-user Matchday loop. [Q]
7. **Bottom sheets for short edits only,** with the pitch still visible behind them. Long financial forms get a full screen and a review step. [C][X]
8. **Every state is a designed screen:** empty, loading, error, offline, shortfall, late salary, stale data. [C][X]
9. **Motion means something.** Numbers settle (about 300–500ms), one celebration per month, and everything respects `prefers-reduced-motion`. Never animate money into false optimism. [Q][X]
10. **Calm numbers, loud moments.** Colour explodes at lock and at trophies; daily browsing stays legible. [C]
11. **Haptics are a bonus, never the only confirmation.** [X]
12. **Light by default, with a real dark theme.** Cheap LCD screens in daylight punish dark-only UIs. [Q]

### 3.4 Navigation

| Tab        | User question             | Contents                                                                                  |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| **Today**  | What needs me now?        | Score bug (funded % · days to payday), next due fixture, next action, compact pitch strip |
| **Plan**   | Where is this pay going?  | Full pitch ↔ list toggle, lines, purposes, Change tactics                                 |
| **Goals**  | What am I building?       | Goals with dates, reserve, Relegation battle                                              |
| **Season** | How am I doing over time? | Full-time reports, clean sheets, season history                                           |

Account, notifications, export, help and subscription sit behind an avatar in the header. If Goals proves too thin in testing, fold it into Plan and go to three tabs. [X]

### 3.5 Home composition

**Recommended: action-led Today with a compact pitch strip, and the full pitch in Plan.** [X] Concept 1, with [C]'s score bug and a pitch strip so the football doesn't disappear. On payday itself, Today turns into a full-screen **Matchday mode**. [C]

**Test it against:** a formation-led home ([Q]/[C]: "the formation screen is the app") and a pay-cycle timeline home ([X] Concept 3). The success measure is whether a returning user finds the next due payment within 5 seconds.

### 3.6 The pitch on a small screen

- A vertical pitch, read from the goal line upward: Keeper, then Defence, Midfield, Attack. Each line is a stack of modules showing name and ₦ amount. [Q]
- A live "left to assign" chip pinned in the thumb zone. [Q]
- Tapping a purpose opens a sheet with its name, amount, due date, status and line. Only one detail is open at a time. [C][X]
- **A list view of the same data, one tap away.** This serves scanning, screen readers and people who prefer numbers. Amounts and selection carry over between the views. [X]
- **Direct numeric entry is the primary input.** Drag-to-rebalance and sliders are optional extras, and every drag has a tap alternative (WCAG 2.2, dragging movements). [X]
- At large text sizes the pitch reflows into the grouped list. Never shrink the text to fit the pitch. [X]
- Labels are plain words, never shirt numbers or abbreviations. [X]

### 3.7 v1 screen inventory

| #   | Screen / state                                                                                           | Shows first                                                                            | Main action                       |
| --- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | Landing / install                                                                                        | A 10-second animated formation demo; the "we never touch your money" line              | Try a sample / Add to Home Screen |
| 2   | Pre-season cards (5)                                                                                     | One question per card, with a default                                                  | Continue / Skip                   |
| 3   | Draft formation                                                                                          | What is covered, what remains, what is missing                                         | Adjust / Pick a preset            |
| 4   | Sign up                                                                                                  | Saving the plan you just made                                                          | Create account                    |
| 5   | **Today**                                                                                                | Score bug, next fixture, next action                                                   | Open action                       |
| 6   | **Matchday builder**                                                                                     | Pitch, live remainder, Defence-first rule                                              | Lock my XI                        |
| 7   | Lock review                                                                                              | Exact totals, gaps, unfunded items                                                     | Confirm lock                      |
| 8   | Locked                                                                                                   | "Plan saved. Your money has not moved." The squad card render and the one celebration. | Open Kick-off checklist           |
| 9   | Kick-off checklist                                                                                       | Intended external actions with truthful statuses                                       | Mark as done                      |
| 10  | Purpose detail (sheet)                                                                                   | Name, amount, line, due date, status                                                   | Edit / Record                     |
| 11  | Fixtures                                                                                                 | Upcoming commitments in date order                                                     | Open item                         |
| 12  | Change tactics                                                                                           | The new need, where the money comes from, what that line loses                         | Compare and confirm               |
| 13  | Full-time report                                                                                         | Planned vs recorded, incomplete data, clean sheet result                               | Carry forward to the next plan    |
| 14  | Season                                                                                                   | Clean sheets, reports, history                                                         | Open a month                      |
| 15  | Share card                                                                                               | Shape and percentages; amounts off by default; under 100KB                             | Share to WhatsApp                 |
| 16  | Settings                                                                                                 | Theme, notifications, export, privacy, subscription price                              | Change one thing                  |
| —   | **States:** shortfall · salary not received / partial · stale data · interrupted setup · offline · error | The size of the problem and what is affected                                           | One clear next step               |

### 3.8 The first clickable prototype

Five screens: **Pre-season → Matchday builder → Lock review/Locked → Today → Full-time report**, plus the **shortfall state**. [C] asked for five; [X] supplied the flow.

**Scenario to run** [X]: pay arrives; the user has annual rent to save toward, supports a relative and wants to save for a course. Confirm pay → add commitments → choose a priority → see the draft formation → change one amount → lock → tick the checklist → an unexpected bill arrives (Change tactics) → Full-time report.

### 3.9 Trends: adopt and avoid

| Adopt                      | Where                             | Avoid                                                                 |
| -------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Bento / modular tiles      | Position lines, Today             | Dashboard soup                                                        |
| Oversized display numerals | Hero figure, celebrations         | Display face in dense forms                                           |
| Variable fonts             | One family for UI to save bytes   | Shipping many static weights                                          |
| Bottom sheets              | Short edits                       | Multi-step flows inside a sheet                                       |
| Inline AI notes            | Gaffer note at the decision point | A chatbot tab; fake "AI" with no substance                            |
| Liquid-glass chrome        | Nav dock only                     | Glass behind amounts                                                  |
| Ethical gamification       | Adherence, milestones             | Points for money moves, breakable streaks                             |
| Shareable cards            | Formation shape, clean sheets     | Exposing income by default                                            |
| —                          | —                                 | **Betting aesthetics:** odds boards, jackpot gold, "winner takes all" |

### 3.10 Accessibility and number trust [X]

- Touch targets of about 44–48px for frequent controls. WCAG 2.2 AA's minimum is 24px; these are different thresholds.
- Contrast checked on real pairs: 4.5:1 for text, 3:1 for large text and UI.
- Category and status always carry text or a symbol as well as colour.
- A logical reading and focus order for the spatial pitch, and reflow at 320px.
- Changed totals and saved plans are announced as status messages, not only shown in a toast.
- Test long names, zero and negative values, very large amounts and slow networks.
- Keep amounts out of notification previews unless the user opts in.

---

## 4. Brand: copy, type, logo and marketing

### 4.1 Positioning and messaging

**Positioning statement** ([X], sharpened):

> Payday Pitch helps salary earners give every naira of their pay a position: bills defended, family covered, the rest out front building wealth. Plan on payday, follow through all month, adjust when life happens. We never touch your money.

**Message architecture:**

| Layer                  | Line                                                                            | From |
| ---------------------- | ------------------------------------------------------------------------------- | ---- |
| **Tagline**            | **Give your pay a game plan.**                                                  | [X]  |
| Principle              | Defence first. Then attack.                                                     | [C]  |
| Habit                  | Make every payday a matchday.                                                   | [C]  |
| Trust                  | We never touch your money. Your bank keeps the ball; we draw the tactics board. | [Q]  |
| Utility                | Ninety seconds at payday. A year you can see.                                   | [Q]  |
| Anti-betting guardrail | No wager. Just your eleven.                                                     | [Q]  |
| Long-form narrative    | Your salary is a squad. Stop spending it like a loose ball in midfield.         | [Q]  |

**Hierarchy on any surface:** outcome → mechanism → continuity → proof (a real UI and a believable example) → service boundary. Never lead with a feature list or a wealth promise. [X]

### 4.2 Voice: the smart teammate. Coach, not casino.

Three axes [Q][C]:

1. **Plain first.** Finance sentences at roughly an 8th-grade reading level. Short, active and exact.
2. **Warm, but the money is stern.** Jokes belong in empty states, milestones and marketing. There are none in errors, amounts or anything that costs money.
3. **Football idiom stays pitch-side.** Formation language is welcome; betting language is not.

**The naming rule** [U]: _football names the moment; plain English names the action._ Screen titles and celebrations use football ("Half-time", "Full-time report"). Buttons that change money use plain verbs ("Update plan", "Lock plan", "Move ₦10,000"). Explain a metaphor once, then use it consistently. [C]

**Pidgin code-switch rule** [Q]: English for all product copy. Nigerian Pidgin only for celebrations and marketing (lock moment, share cards, socials), never in errors or amounts. Example on lock: "Sapa don clear!"

**Tone by context** [X], with football added:

| Context            | Example                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Ad headline        | "Give your pay a game plan."                                                                     |
| Setup              | "What must be covered before your next payday?"                                                  |
| Empty plan         | "Your squad is empty. Sign your first player: rent."                                             |
| Lock confirm       | "Plan saved. Your money has not moved. Here's your kick-off list."                               |
| Checklist          | "Record this transfer as done."                                                                  |
| Shortfall          | "Your plan is ₦20,000 over the pay you've recorded. Trim a line or update your income."          |
| Adjustment         | "This moves ₦10,000 from Course fund to Food. Course fund drops to ₦65,000."                     |
| Late salary        | "Pay not in yet? Keep your draft. We'll lock when it lands."                                     |
| Return after a gap | "Welcome back. Ready to set this month's XI?"                                                    |
| Clean sheet        | "Clean sheet. Every Defence bill paid this month."                                               |
| Error              | "That change didn't save. Your previous plan is safe. Try again." (Only say this if it is true.) |
| Renewal            | "Season Ticket renews 1 Dec at ₦1,500. Cancel anytime in Settings → Subscription."               |

### 4.3 Vocabulary

**Idiom bank** [Q][C][X]: Pre-season (setup) · Matchday (payday) · Your XI / formation (the plan) · Lines: Keeper / Defence / Midfield / Attack · Fixtures (dated commitments) · Kick-off (checklist) · Half-time (mid-month check) · Change tactics / transfer window (adjust) · Away Days (irregular family and social calls) · Clean sheet (every Defence bill paid) · Relegation battle (debt payoff) · Captain (first call on surplus) · Bench (parked goals) · Full-time report (month review) · Season / Season finale (year) · Season Ticket (premium) · Academy graduate (first salary) · The Gaffer (coach notes).

**Terms that earn trust** [X]: always use these words with these exact meanings.

| Term           | Means                                                 | Never implies                   |
| -------------- | ----------------------------------------------------- | ------------------------------- |
| Expected       | Future income entered as a forecast                   | That money has arrived          |
| Planned        | The allocation is saved                               | That a payment happened         |
| Recorded       | The user marked it done                               | External verification           |
| Verified       | A defined source confirmed it (later, with bank data) | That the whole plan is verified |
| Left to assign | Planning money not yet given a position               | A live bank balance             |
| Estimate       | Depends on stated assumptions                         | A certain outcome               |

Never call a planning line a "wallet" or "account".

**Banned phrases** (a starting list of 10; finish it in the workshop) [C][X][Q]: guaranteed returns · risk-free · win big / jackpot · all in · bet / odds / stake · you bottled it · red card (for spending) · own goal (aimed at the user) · "bank" (for us) · countdown urgency without a real offer.

**Approved verbs:** plan · lock · cover · fund · record · move · adjust · review · carry forward · sign (a goal).

### 4.4 Typography

**Verified facts** (fontTools, 26 Oct 2026, plus [X]'s audit):

| Font              | Files on hand                        | ₦   | Tabular digits       | Licence                                              | Role                                                        |
| ----------------- | ------------------------------------ | --- | -------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| **Aspekta**       | 20 weights + variable, TTF/OTF/WOFF2 | ✗   | ✗ (proportional)     | OFL 1.1, Reserved Font Name "Aspekta"                | **UI workhorse**                                            |
| Mont              | ExtraLight DEMO and Heavy DEMO only  | ✗   | ✓ (Heavy has `tnum`) | 2015 free EULA locally; current foundry terms differ | Display/wordmark candidate once the full family is licensed |
| Batica Sans       | Regular only                         | ✗   | ✗                    | Personal use only                                    | Reference only                                              |
| Big UI, Stanzegic | **No font files**, images only       | —   | —                    | Unknown                                              | Composition reference                                       |

**Recommended stack:**

1. **UI text: Aspekta (variable).** Calm neo-grotesque, free, one WOFF2 subset of about 20–30KB. [Q][C][X]
2. **Amounts: fix the two gaps.** Pick one of:
   - **(Preferred) Commission an OFL fork of Aspekta under a new name** (for example "Pitch Sans"). Add a ₦ glyph and a tabular figure set behind `tnum`. This keeps one coherent family. It is a small, scoped job for a type designer. [U]
   - **(Stopgap) Pair a numeral face** for `<MoneyText>`-style amounts that verifiably has ₦ and `tnum`. Run the test sheet below on each candidate; do not trust specimen claims. [X]
   - Fallback only: show "NGN" instead of ₦ where a glyph is missing. Nigerians read ₦, so this is not acceptable as the primary display. [U]
3. **Display: one licensed face** with poster energy (ink-trap or condensed), lazy-loaded only on celebration, share and marketing surfaces, 24px and up. Candidates: the full Mont family (its Heavy weight already has `tnum`) or a licensed ink-trap face like the ones in the refs. Pick one, never two. [Q][C]
4. **Kit numerals:** an outlined or condensed jersey-style numeral treatment for share cards and celebrations only. [Q]
5. **Budget:** WOFF2 only, subsetted, `font-display: swap`. The font budget is a data-cost budget for users. [Q]

**Test sheet before choosing** [X]: `₦1,234,567.89`, `NGN 1,234,567`, negative values, brackets, aligned before/after columns, `0 O 1 I l 5 S 8 B`, names with Ẹ Ọ Ṣ (precomposed and decomposed), "Annual rent and moving costs", and a full review screen at 200% text size.

**Starting sizes** [X]: body and inputs 16–18px, supporting text 14–16px, titles 24–32px, hero amount 32–40px or more.

### 4.5 Design system

- **Token-first.** All values live in one token source; components consume role names (`surface-paper`, `text-amount`, `line-defence`, `status-short`), never raw hues; a lint rule bans raw hex everywhere else. [Q][C]
- **One money component.** Every amount renders through it, which is where tabular figures and ₦ placement are enforced. [Q]
- **The core component set** [C][X]: Amount, Amount input, Purpose module, Line band, Pitch, Score bug, Fixture row, Checklist item, Bottom-sheet edit, Lock review, Consequence diff, Report block, Share card, Empty illustration.
- **The state kit** [X]: draft, planned, recorded, verified, incomplete, stale, empty, failed, corrected, plus shortfall and late salary.
- **Motion tokens:** one settle duration (about 400ms), one lock celebration sequence, one global reduced-motion gate. [Q]
- **Voice lives in the same source of truth as the tokens** (Monzo/Wise pattern): one `design.md` covers tokens, type scale, component states and the voice axes. [Q]
- **Marketing does not leak into the product.** Neo-brutal ads and a calm app share only colour and wordmark. [C]

### 4.6 Logo

**Design the icon first.** For an installable app, the home-screen tile _is_ the logo. It must read at 512px and at a 16px favicon. [Q]

**Shortlist three territories** (merged from 8 + 8 + 4 candidates):

| Territory            | Concept                                                             | Strength                                                      | Watch-out                                   | From      |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- | --------- |
| **Formation-dot P**  | A "P" (or "PP") built from ordered dots in a recognisable formation | Mark, name and mechanism in one; animates into position lines | Must not read as a generic network symbol   | [C][X][Q] |
| **Pitch monogram**   | P built from the halfway line and centre-circle arc                 | Direct link to the pitch grid system                          | Must work without drawing a whole pitch     | [Q][X]    |
| **Allocation bands** | Four stacked bands (the lines) forming a silhouette                 | Extends naturally into modules and campaigns                  | Can look like an equaliser or a stock chart | [X]       |

**Wordmark:** "payday pitch" in lowercase, in the display face, with one repeated detail (the p's as formation markers). There is a calm variant in Aspekta for in-product and legal use, and a lime sticker variant for marketing. [Q][C]

**Tests** [C][X]: 16px favicon, single colour, reversed on a photo, next to a ₦ amount, light and dark backgrounds, and the gut check: _"does this look like a betting app?"_, asked of people who don't follow football.

**Guardrails:** no club, league, EPL or Super Eagles IP. Own the formation, not the trademarks. Never trace marks from the logo board. Trademark search comes after the shortlist. [Q][X]

### 4.7 Illustration, icons and photography

- **One lead illustration style:** flat editorial, rationed to the four moments in §2.3. [Q][X]
- **One icon set** for ordinary actions, plus a small original set of four position symbols. Icons never carry a financial state alone. [X]
- **Photography (marketing):** commissioned or licensed everyday Nigerian scenes with attainable goals (rent, a course, family, a small business), not just travel and luxury. [X][C]
- Do not mix clip art, glossy 3D trophies, player cut-outs and hand-drawn marks without a system. [X]

### 4.8 Marketing and growth

**Channels** [Q][C]:

1. **Short-form video (TikTok/Reels).** The content unit is the formation itself: "Watch me set my November salary's XI." Creator briefs show the product and never promise returns, staying inside the finfluencer and anti-gambling-promotion lines.
2. **WhatsApp is the community layer.** Status-sized share cards under 100KB, league invites through deep links, broadcast lists. Stay on free personal WhatsApp patterns.
3. **Two-sided naira referrals.** The credit is released only when the referred friend locks a real plan.
4. **The PWA as a growth feature.** A link instead of a store download.
5. **Earned-media trust.** Publish the "we hold nothing" position plainly; it becomes the safe answer the next time a scheme collapses.

**Calendar** [Q]: December is the overspend month ("Detty December") and **January is Pre-season**, the main acquisition window. Ride AFCON and World Cup moods without using their IP. Payday-week posts every month.

**Static kit** [X][C]: portrait feed master, square, 9:16 story/status, wide banner, landing hero, multi-panel explainer carousel, one-page printable.

**Campaign formats** [C][X]:

| Format                                                              | Message job                 |
| ------------------------------------------------------------------- | --------------------------- |
| Before/after pitch: messy expenses become a clean XI                | Explain the mechanism       |
| Score-bug stills: "Clean sheet: every bill paid"                    | Celebrate adherence         |
| Story frames with huge type and one idea (Stanzegic/Visore layouts) | Social reach                |
| Isometric explainer carousel                                        | Education (LinkedIn/X)      |
| Neon wordmark posters (lime on black)                               | Football Twitter, merch     |
| Adjustment story: "Plans change. See what changes with them."       | Show usefulness after setup |
| Trust explainer: "Where's my money? In your bank."                  | Answer the objection        |
| Founder story                                                       | Why this exists             |

**Pricing communication** [Q]: naira first; compare monthly cost to a daily reference ("less than a data sachet a week"); annual is the "season ticket". Lead the pricing page with transparency: "Price shown every time. Cancel in two taps."

**Never in marketing:** guaranteed wealth, fabricated testimonials, unsupported protection claims, fake urgency, betting imagery. [X][C]

---

## 5. Risks

| Risk                                            | Mitigation                                                                                                    | From   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| Gamification reads as trivialising money        | Celebrate adherence only; season counts, not streaks; no loot mechanics                                       | [Q][X] |
| Looks like betting                              | Pitch-side idiom only; banned-phrase list; "No wager. Just your eleven."; the betting gut check on every mark | all    |
| Users think saving the plan moved money         | "Your money has not moved" in confirmations; test it as a blocking issue                                      | [X]    |
| The metaphor costs non-fans comprehension       | Plain verbs on actions; list view alongside the pitch; test against a plain list                              | [X][C] |
| Low willingness to pay                          | Test band, monthly first; premium = depth, not access                                                         | [Q][X] |
| Subscription dark patterns (the Cleo precedent) | Renewal price always shown; cancel in two taps                                                                | [Q]    |
| PWA platform limits                             | Substitute stack (§3.2); store wrapper later                                                                  | [Q]    |
| Font gaps (₦, tabular digits)                   | OFL fork or a paired numeral face before launch                                                               | [X][U] |
| Illustration cost                               | Four commissioned moments only                                                                                | [Q]    |
| Pidgin misread as unserious                     | English in-product; Pidgin only in celebrations and marketing                                                 | [Q]    |
| Bank sync later erodes the ritual of choosing   | Decide which choices stay manual by design                                                                    | [Q]    |

---

## 6. Open questions and validation

### 6.1 Founder questions still open (priority order)

1. **Hero colour:** lime and ink vs deep green and tangerine, tested as icon tiles beside the real competitors (the colour audit is done, §0.3). [Q][C]
2. **First user in one sentence:** city, income band, football closeness, existing money apps. [C][X]
3. **North-star metric:** recommended is _plans locked in consecutive pay cycles_, with clean sheets as the outcome measure. [C][X]
4. **Does Keeper ship in v1,** or arrive later as a "signing" event? (Recommendation: v1. A reserve is the first step toward resilience.) [Q]
5. **League scoring:** pure adherence count, or a light "balance" score? (Recommendation: pure adherence; it carries less shame risk.) [Q]
6. **Name:** is "Payday Pitch" final? Decide before the logo work. The test set and method are in the [unified naming report](2026-10-26-unified-naming-report.md). [Q][C]
7. **Who owns essentials that exceed income:** how much shortfall support the product gives without pretending allocation fixes it. [X]
8. **Budget:** commissioned illustration, an Aspekta fork and a licensed display face. [X][C]

### 6.2 How to validate [X]

| Step                                                          | Output                                            | Decides                              |
| ------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| 1. Founder alignment (90-min workshop, §7)                    | One page: user, problem, boundary, success metric | What we are building first           |
| 2. 6–8 behaviour interviews ("Walk me through your last pay") | Real payday patterns                              | Whether the loop matches reality     |
| 3. Model comparison: four-line pitch vs plain list            | Comprehension, time, errors                       | How central the pitch should be      |
| 4. Visual comparison: three directions, same tasks (§2.5)     | Recognition and clarity                           | The visual direction                 |
| 5. Clickable prototype (§3.8)                                 | End-to-end loop                                   | Whether the loop works               |
| 6. Two-pay-cycle pilot                                        | Voluntary return and completed actions            | Whether value survives novelty       |
| 7. Pricing test, capability by capability                     | "What would you lose without X?"                  | The Season Ticket contents and price |

**Measures:** activation = _a reviewed, locked plan, and the user can say what their next real action is_. Retention = _returning in a later pay cycle to update, act on or review_. A recorded contribution is not a verified transfer, and a completed checklist is not proof of financial wellbeing. Keep that distinction in every report. [X]

---

## 7. Next steps

**A 90-minute decision workshop** [C]:

1. Answer §6.1 questions 1–6.
2. Keep or kill each reference in `web_resources` against the Matchday system (§2.1 table).
3. Pick the hero colour candidate(s) and the font route for amounts (fork or pair).
4. Confirm the five prototype screens (§3.8).
5. Finish the banned-phrase list and the approved-verb list (§4.3).

**Then, in this repo's workflow:** run `/scope` to fold the v1 loop (§1.7) into [docs/scope/scope.md](../scope/scope.md), then `/architect` for the visual identity, money-display and platform decisions. This report authorises no build, asset purchase or design-system change on its own. [X]

---

## Appendix: key sources

Collected from the three reports. The full citation lists are in each source report.

- **Market (Nigeria):** [PiggyVest 2025 Savings Report](https://www.piggyvest.com/reports/2025) · [Dataphyte on black tax](https://www.dataphyte.com/issue/pocket-science/2024/08/black-tax-bonding-or-burdening) · [Poverty Action: fee transparency in Nigerian digital finance](https://poverty-action.org/sites/default/files/publications/Report_Measuring-Fees-Transparency-Nigeria-Digital-Finance.pdf) · [PiggyVest 4.0 redesign](https://piggyvest.medium.com/the-simpler-path-to-financial-freedom-piggyvest-4-0-57191cf12f1e) · [FourthCanvas: PiggyVest brand](https://fourthcanvas.co/portfolio/piggyvest) · [Dá Design: Cowrywise rebrand](https://dadesign.studio/work/cowrywise) · [Cowrywise savings plans](https://help.cowrywise.com/en/articles/1624208-types-of-savings-plans-on-cowrywise)
- **Gamification and ethics:** [Reuters: Robinhood drops confetti](https://www.reuters.com/technology/robinhood-scrap-confetti-animation-app-after-gamification-criticism-2021-03-31/) · [FTC: Cleo AI refunds](https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-returns-more-158-million-consumers-misled-cash-advance-app-company-cleo-ai) · [OSC: gamification research (2026)](https://www.osc.ca/sites/default/files/2026-10/html-report_20260203_gamification.pdf) · [CFPB: financial well-being](https://www.consumerfinance.gov/archive/blog/4-elements-define-personal-financial-well-being/)
- **Adjacent products:** [YNAB](https://www.ynab.com/guide/simplify-finances) · [Monarch Goals](https://help.monarch.com/hc/en-us/articles/44373110771860-Introducing-Goals-3-0) · [Strava subscription](https://www.strava.com/subscribe) · [FPL: picking a squad](https://www.premierleague.com/en/news/2174419/fpl-basics-how-to-pick-a-squad) · [Monotype: Premier League type](https://www.monotype.com/resources/case-studies/premier-league)
- **Design and platform:** [Apple: materials / Liquid Glass](https://developer.apple.com/design/human-interface-guidelines/materials) · [Android: layout and navigation](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns) · [NN/g: bottom sheets](https://www.nngroup.com/articles/bottom-sheet/) · [web.dev: app-like PWAs](https://web.dev/articles/app-like-pwas) · [web.dev: font best practices](https://web.dev/articles/font-best-practices) · [Monzo tone of voice](https://monzo.com/tone-of-voice)
- **Accessibility:** WCAG 2.2: [dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) · [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) · [contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- **Fonts:** [Aspekta (OFL)](https://github.com/ivodolenc/aspekta) · [Fontfabric: Mont](https://www.fontfabric.com/fonts/mont/) · [Fontfabric licensing](https://www.fontfabric.com/help/licensing/) · [Batica Sans licensing](https://www.myfonts.com/collections/batica-sans-font-yukita-creative?tab=licensing)
- **Growth:** [Rest of World: Nigerian betting influencers](https://restofworld.org/2023/online-gambling-influencers-nigeria/) · [IOSCO finfluencer report](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD795.pdf) · [Pidgin in Nigerian advertising](https://www.researchgate.net/publication/308781542_The_Use_of_Nigerian_Pidgin_English_in_Print_Advertising_Deviation_from_Standard_Orthography_and_Effectiveness) · [RevenueCat: subscription pricing psychology](https://www.revenuecat.com/blog/growth/subscription-pricing-psychology-how-to-influence-purchasing-decisions)
- **Local evidence:** every file in [docs/assets/web_resources/](../assets/web_resources/), and the font checks run for this merge (fontTools cmap, hmtx and GSUB inspection of Aspekta 400/700/VF, Mont Heavy DEMO and Batica Regular).
