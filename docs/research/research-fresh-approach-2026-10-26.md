# Fresh Product & Visual Direction Research

**Date:** 26 October 2026  
**Scope:** Greenfield research (product logic + visual/brand + mobile-first UX).  
**Sources:** `docs/assets/web_resources` mood boards, type specimens, logo/shape boards; public fintech UX, gamification, and Nigerian wealth-app brand references (linked in §Sources).  
**Constraint:** This report deliberately ignores any existing product implementation, specs, or UI already in the repo. It is a fresh view meant to pressure-test what the product _could_ become.
**Agent:** Cursor

---

## How to read this document

Each of the four questions gets:

1. A researched answer (ideas, directions, methods).
2. A shortlist of what this research leans toward (still unconfirmed).
3. A **grill sheet** — pointed questions you should answer before locking direction.

At the end: a synthesis of recommended next decisions, and an inventory of what your `web_resources` folder already implies.

---

## Asset inventory (what you already collected)

### Typography packages & specimens

| Asset                                                | What it signals                                                                                                                                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Aspekta.jpg` + `aspekta--aspekta-sources-2.100.zip` | Primary geometric display/UI sans; paired with Helvetica as secondary; electric blue + white + near-black; precise size ladder (64→16 with +10 leading). Premium tech / fintech trust.             |
| `Batica.jpg` + `batica-sans.zip`                     | “Modern simplicity” geometric sans; cream / royal blue / charcoal bands. Approachable authority. **Note:** zip includes a 1001Fonts EULA — verify commercial web/app rights before production use. |
| `Mont.jpg` + `mont.zip`                              | Geometric family (Book→Bold in specimen; zip appears DEMO weights). Strong wordmark / headline candidate on royal blue. **Note:** demo + free EULA — confirm full family + commercial license.     |
| `Big-UI-Font.jpg` / ink-trap “Visore”-style refs     | Display face with ink traps, story-format mobile mockups, pastel + forest + pink. Marketing/energy, not body UI.                                                                                   |
| `Stanzegic Modern Grotesk Font.jpg`                  | Chunky friendly grotesque in story templates; blue / yellow / red; sticker illustrations. Social / campaign tone.                                                                                  |
| `3fae4e3e…jpg`                                       | Forest green + lime + orange ink-trap display; “modern athletic” energy. Pitch-adjacent colour without literal football kitsch.                                                                    |

### Visual / UI mood boards

| Asset                                                      | What it signals                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `hello-colorful.jpg`                                       | Neo-pop keycaps, mint ground, primary colours, thick outlines — playful modular “object” branding.                                          |
| `080a41b9…jpg` (“Sprouts”-style)                           | Dark editorial mobile: bold condensed headlines, colour hero cards, glass floating dock, category pills. Lifestyle-premium, not bank-beige. |
| `89c0bdfa…jpg`                                             | Sharp modular menu blocks (colour square + label). Swiss / scoreboard logic — great for position/category lists.                            |
| `9db5d586…jpg` + travel pins in `Visual-Style-Concept.png` | Flat high-contrast vector (red/blue suitcases, long shadows). Aspiration = travel/goals, not vaults.                                        |
| `isometric-clean-landing.webp`                             | White space, blue CTAs, isometric system diagram, trust badges. “Precision SaaS” — usable for explaining salary→formation flow.             |
| `Visual-Style-Concept.png`                                 | Broad travel/fintech illustration board: cobalt, red accents, hands+devices, lifestyle aspiration, clean sans.                              |
| `Logo-Idea-Concept.png`                                    | App-icon / wordmark board: neon lime on black, heavy geometric marks, sport-tech energy.                                                    |
| `shapes-ideas-concept.png`                                 | Widgets, soft 3D icons, neo-brutal borders, glass cards, bento grids, Y2K accents — mobile component language.                              |

**Tension in the folder (important):** your refs pull in two different poles at once —

- **Trust pole:** Aspekta/Mont/Batica, isometric clean landing, calm white fintech cards.
- **Energy pole:** lime/black logos, ink-trap display, neo-pop keycaps, sticker stories, glass dark UIs.

A coherent brand will pick a **ratio** (e.g. 70% trust / 30% energy in product UI; reverse that ratio in ads), not average them into muddy purple-fintech.

---

# Question 1 — Beyond “split salary into a formation”

## Core promise (restated, fresh)

Help salary earners turn each payday into a deliberate wealth plan by mapping money to a football formation: fixed costs and debts covered first, remaining cash put to work in roles that make sense (defence / midfield / attack as metaphor for safety → growth).

A single monthly “set formation” moment is a strong hook. It is not yet a durable product habit. Comprehensive, premium usage needs **seasons**, not just kick-off.

## Idea clusters (product + logic)

### A. Season & matchday loop (time structure)

1. **Matchday = payday** — the ritual screen: income lands → rebuild or confirm XI → lock allocations.
2. **Season = calendar year / financial year** — standings for savings rate, debt payoff, emergency fund “clean sheet” months.
3. **Half-time reviews** — mid-month check-in: “Are defenders still funded?” without forcing a full replan.
4. **Fixtures calendar** — rent day, school fees, bonus expected, festive months (Dec/Jan pressure in Nigeria).
5. **Extra time / injury time** — unexpected expense flow that temporarily pulls from a designated “bench” (buffer) without breaking the whole plan.
6. **Transfer window** — monthly/quarterly window to swap category amounts or “players” (goals) with friction that prevents constant tinkering.
7. **Pre-season** — first 2–3 paydays as guided setup with soft defaults, not a permanent formation lock.

### B. Formation intelligence (not just a pretty pitch)

8. **Preset formations with meaning** — e.g. 4-4-2 “Balanced Earner”, 5-3-2 “Debt Siege”, 3-5-2 “Growth Push”, 4-5-1 “Family Shield” — each maps to allocation ratios with plain-language tradeoffs.
9. **Chemistry score** — how well allocations match stated goals (house, school, emergency) without fake investment advice.
10. **Fitness / form** — each “player” (bucket) shows health: underfunded, on track, overfunded.
11. **Bench & substitutes** — optional goals parked until income grows or debts clear.
12. **Captain** — one priority bucket that gets surplus first (user-chosen).
13. **Fair play rules** — hard rules: debts and essentials cannot sit empty while attack is funded; surface this as “rules of the pitch,” not scolding.
14. **What-if simulator** — drag a midfielder’s budget and see knock-on effects before locking.
15. **Multi-income squads** — salary + side hustle as dual kits / second strip, merged into one XI.

### C. Wealth outcomes (why the metaphor earns trust)

16. **Goal stadiums** — named destinations (emergency fund, rent buffer, investment starter, travel, school fees) with progress as “distance to goal.”
17. **Debt as opposing side** — payoff progress as reducing the opponent’s score / possession, carefully framed so it never glamorizes debt.
18. **Clean sheet streak** — months where essentials + minimum debt payments were fully covered.
19. **League table (private first)** — personal ranks across seasons; optional later social leagues.
20. **Trophy cabinet** — milestones tied to _outcomes_ (3 months emergency fund), not compulsive daily opens.
21. **Post-match report** — short narrative after payday lock: what changed vs last month, one recommendation.
22. **Inflation / reality check** — optional Lagos/Naira cost-of-living nudges when fixed costs drift.

### D. Behaviour & education (premium without lecturing)

23. **Tactics board explainers** — 30–60s lessons: “Why defence first?”, “What is an emergency fund?” — Visa’s Financial Soccer shows sport + literacy works when the quiz serves learning, not dopamine trading.
24. **Coach mode** — opt-in tips; silent mode for power users.
25. **Playbooks** — curated plans for “first job,” “new parent,” “aggressive debt,” “investor curious” (education + templates, not regulated advice unless you become licensed).
26. **Scenario packs** — “December is coming,” “salary delayed,” “bonus arrived.”

### E. Social & cultural layers (use carefully)

27. **Private family/club share** — share a formation summary with a partner without exposing raw balances.
28. **Office / friend mini-leagues** — compete on savings _rate_ or consistency, never on income flexing.
29. **Local kit identity** — optional Super Eagles / club colour theming for celebration moments only (not the whole product chrome — licensing risk).
30. **Naija payday culture** — language and defaults that respect salary cycles, cash + bank mix, and “black tax” / family obligations as a real midfield line, not an afterthought.

### F. Premium / retention levers (reasonable, not extractive)

31. **Pro tactics** — advanced formations, multi-currency later, exportable reports, partner-linked goals.
32. **Reminders that respect attention** — payday eve, mid-month half-time, not daily spam.
33. **Read-only widgets** — home-screen glance: “Defence funded ✓ · Attack 62%.”
34. **Bank / wallet connect (later)** — auto-suggest from real inflows; keep manual entry excellent first.
35. **Export & accountant pack** — PDF/CSV for serious users.
36. **Ethical gamification** — progress, badges, goals, diversification-style scores; **avoid** points-for-trading-style loops that regulators warn increase impulsive money behaviour (OSC 2026 gamification research: rewards for buying/selling increased trading ~40% in earlier work; positive use cases favour goal framing, progress, and education).

### G. Trust & safety (non-negotiable for money + “game” framing)

37. **Clear product boundary** — planner / coach metaphor vs broker / bank; copy must never blur this.
38. **Cooling friction** — confirm before locking a formation that underfunds essentials.
39. **No dark streaks** — do not punish users for skipping opens; rewards should accrue from funded plans, not app addiction (pattern seen in thoughtful reward design elsewhere: earn even if you don’t open daily).
40. **Accessible money display** — large amounts, clear NGN formatting, colour not sole signal.

## What this research leans toward (Q1)

Ship a **narrow vertical loop** first: Matchday (payday) → set/confirm formation → mid-month half-time → post-match report → season standings. Layer education and social only after the monthly ritual feels inevitable.

Avoid turning into “another savings app with football stickers.” The formation must **constrain and explain allocation**; decoration alone will not retain salary earners who already have PiggyVest / Cowrywise-class tools for lock savings and investing.

## Grill sheet — Question 1

1. **Who is user #1 in one sentence?** (e.g. “Lagos software earner, ₦400k–₦1.2m/mo, already banks with X, fans football casually / obsessively?”)
2. **Is the football metaphor literal XI positions, or a softer “defence / midfield / attack” three-line model?** How deep must a non-fan go before they bounce?
3. **Are you a planner only, or will you ever hold / move money?** That decision changes regulation, trust UX, and whether “premium” means insight or custody.
4. **What must a user finish in the first 10 minutes to feel “this is for me”?** Formation? First goal? First payday simulation?
5. **Which outcome is the north star metric?** Months with essentials fully funded? Emergency fund complete? Debt down? Investment started?
6. **How do you treat “black tax” / family obligations** — first-class position, optional category, or something else?
7. **Single currency NGN forever for v1, or multi-currency ambition?**
8. **Social: private only, couple mode, or public leagues?** Where does envy become harm?
9. **What will you refuse to gamify?** (Trading frequency? Borrowing? Skipping rent?) Write the list.
10. **Premium: what is paid vs free without feeling punitive to the people who need the tool most?**
11. **How football-native vs finance-native should the IA feel?** (Tabs named Pitch / Squad vs Home / Plan / Goals?)
12. **When salary is irregular or delayed, what is the product story?** Extra time? Friendly match? Pause season?

---

# Question 2 — Visual concepts (many directions)

Below are distinct **visual worlds**. Several are already latent in `web_resources`. Mix deliberately; do not merge all into one soup.

## 1. Pitch Floodlights (sport-tech dark)

Black / charcoal ground, neon lime + white type, sparse red accents. App icons like the lime wordmarks in `Logo-Idea-Concept.png`. Feels like broadcast graphics + Nike digital. High energy; risk: looks like a betting/fantasy app unless money typography stays calm.

## 2. Electric Trust Blue (fintech primary)

Royal / electric blue fields, white type, Helvetica/Aspekta ladder from your specimen. Classic money trust with a sharper edge than “corporate navy.” Strong for auth, balances, legal moments.

## 3. Cobalt + Action Red (illustrated lifestyle)

From `Visual-Style-Concept.png`: cobalt scenes, red focal objects, flat/2.5D people + devices. Aspiration (travel, work, pay) without vault clichés. Good for marketing + empty states.

## 4. Mint Neo-Pop Objects (`hello-colorful`)

Keycap / toy-object branding, thick outlines, mint grounds. Extremely memorable onboarding and stickers; too playful as the _only_ product chrome for balances.

## 5. Forest Athletic Display (`3fae…` + Big-UI-Font)

Deep pitch green, lime + orange ink-trap headlines. Sportswear × Gumroad energy. Excellent for campaigns and “Matchday” moments; pair with a quieter text face in-app.

## 6. Dark Editorial Lifestyle (`080a…` Sprouts-like)

Dark shell, saturated hero cards, condensed display titles, glass dock. Magazine-app feel. Premium scanning; watch accessibility of thin text on photos.

## 7. Swiss Scoreboard Modular (`89c0…`)

Hard rectangles, colour index squares, no soft radii. Category lists feel like team sheets / LED boards. Differentiating and “crisp”; can feel cold if overused.

## 8. Soft Bento / Widget OS (`shapes-ideas`)

Rounded tiles, home-screen widgets, progress rings, soft 3D orbs. Modern iOS-native comfort. Great for “formation at a glance”; risk of generic fintech if colour is timid.

## 9. Neo-Brutal Lite

Thick borders, hard shadows, loud fills (from story templates + shapes board). Youthful and loud for ads; for money UI, reserve for marketing or a “Tactics” playful mode.

## 10. Glass on Night Pitch

Frosted sheets over dark pitch texture / subtle grain. Depth and “premium tech”; keep glass off critical number readability.

## 11. Isometric Systems Diagram (`isometric-clean-landing`)

White canvas, blue connectors, labelled nodes. Perfect for explaining “salary hub → positions.” More marketing/education than daily home.

## 12. Flat Travel Aspiration (suitcases board)

Red/blue luggage, long shadows, sky gradients. “Wealth = options / trips / preparation.” Strong goal category art; weak if the whole brand becomes tourism.

## 13. Soft Clay 3D Mascots

Tactile icons from shapes board — player tokens as clay chips on a pitch. Delightful for formation building; keep mascot from infantilizing money.

## 14. Pastel Story Canvas (Visore stories)

Cream / pink / forest story frames for Instagram/ads. Marketing system separate from product tokens.

## 15. Cream Authority (Batica top band)

Off-white, black type, restrained blue. Quiet wealth; use for statements, receipts, legal — the “bank letter” register.

## 16. Dual-Mode Kit (home & away)

Light “day match” and dark “night match” themes with shared geometry. Users often prefer one; both must pass contrast for NGN amounts.

## 17. Kit Colour Personalization

User picks accent (club-like) while core surfaces stay neutral. Increases ownership; increases design QA cost.

## 18. Broadcast Lower-thirds

Typography and motion like TV score bugs for payday lock animations. Memorable; easy to overdo.

## 19. Paper Tactics Board

Cream paper, dry-erase marker strokes, X/O notation for allocations. Distinctive intellectual sport feel; less “colorful” unless accents are strong.

## 20. Guilloche / Security Pattern (Cowrywise-adjacent lesson)

Subtle security-inspired patterns for trust moments (confirm lock, export). Use sparingly so you don’t look like a bank clone.

## 21. Photo-real Nigerian life + graphic type

Real payday / commute / living-room photography with bold graphic type overlays (from editorial mobile ref). Local trust; needs consistent art direction and consent/licensing.

## 22. Monochrome + One Signal Colour

Mostly black/white with a single brand signal (lime _or_ blue _or_ red). Highest discipline; forces excellence in type and layout.

## Shortlist this research recommends testing (Q2)

| Priority | Direction                                     | Why                                                                                                  |
| -------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A        | **Electric Trust Blue + Night Pitch accents** | Trust for money + sport energy without looking like betting. Aspekta/Mont/Batica already point here. |
| B        | **Soft Bento formation UI**                   | Mobile-native, glanceable XI, matches shapes board and thumb-zone habits.                            |
| C        | **Forest/lime only for Matchday & marketing** | Keep loud athletic colour in ritual + ads, not every settings screen.                                |
| D        | **Flat aspiration illustration system**       | Suitcases / goals / devices for empty states and onboarding — not 3D clutter everywhere.             |

Anti-patterns to avoid (especially given current internet fintech sameness): purple-glow crypto aesthetic; cream + terracotta “AI brochure” look; pure neo-brutal for balances; emoji-heavy finance.

## Grill sheet — Question 2

1. **On a 1–10 scale, how loud should the brand be on the home screen vs in ads?**
2. **Dark-first, light-first, or equal dual kit?** What do your target users use at night for banking today?
3. **Illustration: flat vector, soft 3D, or photography?** Pick a primary.
4. **How close to Super Eagles / club green are you willing to go** without looking unofficial or licensed?
5. **Do you want to be recognized in 3 seconds as “football money” or “smart money that happens to use football”?**
6. **Which three refs in `web_resources` are non-negotiable keepers?** Which three are “inspiration only / discard”?
7. **Rounded friendly vs sharp scoreboard — which is the default radius language?**
8. **Is colour coding by position (GK/DEF/MID/FWD) required, or too much rainbow for trust?**
9. **Any cultural colour taboos for your audience** (e.g. all-red feeling like debt/danger)?
10. **Will marketing and product share one type family, or display-for-ads + grotesque-for-UI?**

---

# Question 3 — Mobile-first: concepts, screens, method, trends

Starting mobile → expanding to desktop is the right call for salary-earner tools: payday happens on phones; one-handed use dominates; complexity must survive a small canvas first (constraint breeds clarity). Desktop later becomes a “tactics table” for power editing, not the place you discover the concept.

## Method (how to design)

1. **Constraint pass first** — design the monthly Matchday flow on a 390×844 frame before any desktop artboard.
2. **One job per screen** — if a screen has two primary CTAs of equal weight, split it (2026 mobile UX practice).
3. **Thumb zone** — primary actions in the lower third; titles/status up top; avoid critical taps in the stretch zone.
4. **Bottom navigation ≤ 5** — e.g. Pitch · Plan · Goals · Activity · You.
5. **Bottom sheets for edits** — adjust a player/bucket while the pitch remains visible (NN/G pattern: sheet keeps context). Not for multi-step KYC.
6. **Progressive disclosure** — home answers “Am I safe this month?” first; drill for category math.
7. **Progressive onboarding / KYC** — let users taste the formation before heavy identity (fintech trust pattern).
8. **Content-first chrome-second** — hide secondary toolbars on scroll.
9. **States as screens** — loading, empty, error, offline each designed (Nigerian network reality).
10. **Gesture with care** — swipe between month matchdays; never swipe-to-spend.
11. **Motion = match events** — short celebrations on lock / clean sheet; respect reduced-motion.
12. **Expand to desktop later** as list+detail / large pitch editor, not a stretched phone.

## Mobile UI concepts worth owning

- **Living pitch home** — formation as the hero, not a chart buried under cards.
- **Matchday mode** — full-screen focused flow on payday (distinct from casual browse).
- **Player cards** — tap a position → sheet with amount, rule, goal link.
- **Score bug** — persistent mini status: funded % / days to next payday.
- **Season strip** — horizontal months as fixtures.
- **Half-time sheet** — mid-month nudge from notification deep link.
- **Widget / glance** — defence OK / attack progress (from shapes board language).
- **Story-style education** — use your story mock refs for literacy, not for moving money.

## Suggested screen map (v1 mobile)

**Acquisition & trust**

1. Splash / brand beat
2. Value story (3 screens max): salary → formation → wealth outcomes
3. Sign up / sign in
4. Optional demo formation (no account numbers)

**Setup (pre-season)**  
5. Income capture (amount, payday date, currency)  
6. Essentials & debts (defence line)  
7. Goals picker (attack / projects)  
8. Recommended formation + explain tradeoffs  
9. Confirm & name your squad/season

**Core loop**  
10. Home / Pitch (month status + XI)  
11. Matchday wizard (allocate → validate rules → lock)  
12. Player detail (bottom sheet)  
13. Goals / stadium progress  
14. Activity / post-match reports  
15. Half-time check-in  
16. Season standings / trophies

**Account & trust**  
17. Profile & security  
18. Notifications preferences  
19. Export / share summary  
20. Help / playbook library

**System**  
21. Empty states (illustrated)  
22. Error / retry  
23. Offline  
24. Permission prompts in context

## Trends to adopt (with judgment)

| Trend                                     | Use                             | Avoid                                   |
| ----------------------------------------- | ------------------------------- | --------------------------------------- |
| Thumb-zone CTAs & bottom sheets           | Editing allocations             | Stacking sheets / multi-step in a sheet |
| Bento / widget summaries                  | Home glance                     | Dashboard soup                          |
| Bold type hierarchy                       | Amounts & headlines             | Display face for dense forms            |
| Light ethical gamification                | Goals, streaks for clean sheets | Points for risky money moves            |
| AI personalization talk (2026 fintech UX) | Optional cashflow nudges later  | Fake “AI coach” with no substance       |
| Dark premium shells                       | Night Matchday                  | Low-contrast green-on-green amounts     |
| Glass docks                               | Nav only                        | Glass behind figures                    |

## Ideas this research “wants” the mobile product to have

1. **Pitch is the product** — if you remove the formation view, the app should feel broken, not “fine.”
2. **Matchday ceremony** — 60–90 seconds of focused, beautiful flow once or twice a month.
3. **Rules that teach** — blocking an unsafe lock teaches finance better than a blog.
4. **Calm numbers, loud moments** — colour explodes at lock/trophy; daily browse stays legible.
5. **Local payday realism** — payday date, salary delay, cash expenses, family obligations.
6. **One-handed lock** — confirm CTA where the thumb rests.
7. **Shareable without doxxing income** — formation shape + percentages, optional absolute naira.
8. **Desktop later as coach’s chalkboard** — wide editing, same tokens.

## Grill sheet — Question 3

1. **Native app, installable PWA, or both?** What do your users already trust for money?
2. **Minimum Android version / low-end device budget?** (Affects glass, blur, heavy illustration.)
3. **Must Matchday work fully offline after data is cached?**
4. **Biometrics default?** Step-up only for export/share?
5. **Which 5 screens are in the first clickable prototype?**
6. **Portrait only for v1, or landscape pitch on tablets?**
7. **How long may Matchday take before users abandon?** (Design to a time budget.)
8. **Notifications: push from day one, or in-app only until retention is proven?**
9. **Will amounts be editable by typing, sliders, steppers, or drag-on-pitch?** Pick a primary.
10. **Accessibility: dynamic type up to XXXL — does the pitch layout survive?**

---

# Question 4 — Copy, messaging, design system, fonts, ads, logo

## Messaging playbook approaches

### Positioning routes (pick one primary)

1. **“Your salary’s starting XI”** — sport-forward, memorable, needs non-fan translation.
2. **“Payday, planned like a pro”** — ritual + professionalism.
3. **“Defence first. Then attack wealth.”** — principle-led, clear finance logic.
4. **“Formation over vibes”** — anti-chaos money, slightly sharp voice.
5. **“Make every payday a matchday”** — habit framing.
6. **Money-plain like Cowrywise’s verbal shift** (“money” not “finance”) **+ sport season structure** — accessible without childishness.

### Voice principles

- **Coach, not casino.** Encourage discipline; never hype bets or FOMO trades.
- **Short verbs on Matchday** (“Lock formation”, “Fund defence”).
- **Plain Naira talk** in product; poetry reserved for campaigns.
- **Respect adult salary earners** — witty beats childish.
- **Explain the metaphor once, then use it consistently.**

### Message architecture

| Layer      | Job         | Example direction                                                            |
| ---------- | ----------- | ---------------------------------------------------------------------------- |
| Brand line | Memory      | “Salary into formation.”                                                     |
| Value prop | Clarity     | “Split your pay so needs, debts, and goals each have a position.”            |
| Proof      | Trust       | Security, clarity, user stories, no fake returns.                            |
| Ritual CTA | Habit       | “It’s Matchday — set this month’s XI.”                                       |
| Education  | Empowerment | “Why your defence line is rent, food, and transport.”                        |
| Legal      | Boundary    | “Planning tool — not investment advice / not a bank” (exact legal copy TBD). |

### Campaign / static ad approaches (using your refs)

1. **Story frames** (Stanzegic / Visore layouts) — 9:16 vertical, huge type, one idea.
2. **Object hero** (keycaps / clay players) — brand recognition stickers.
3. **Before/after pitch** — messy list of expenses → clean XI.
4. **Score bug motion stills** — “Clean sheet: essentials funded.”
5. **Travel aspiration stills** — goals as destinations (suitcase art).
6. **Isometric explainer carousels** — LinkedIn/Twitter education.
7. **Neon wordmark posters** — lime on black for football Twitter; quieter blue variants for LinkedIn.

Nigerian market lesson (public brand work on PiggyVest / Cowrywise): clarity, speed on low-end phones, and design as a selling point matter; playful roots must still feel like a serious wealth partner. Your sport metaphor can be the differentiator **if** the money story stays as clear as those products’ savings stories.

## Design system approaches

1. **Token-first** — colour, type, space, radius, elevation named by role (`bg-pitch`, `text-amount`, `signal-defence`), not by raw hue alone.
2. **Two typographic registers** — Product UI grotesque (Aspekta / Mont / Batica class) + optional Display for marketing (ink-trap / chunky grotesque).
3. **Position colour system** — 3–4 semantic colours max for DEF/MID/FWD/GK; neutrals carry 80% of UI.
4. **Component set prioritized for money** — Amount, PlayerCard, PitchSlot, MatchdayStepper, BottomSheetEdit, LockConfirm, ReportBlock, EmptyIllustration.
5. **State kit** — success/warn/danger that works for colour-blind users (icons + text).
6. **Motion tokens** — duration for lock celebration vs micro feedback.
7. **Marketing ≠ product leakage** — neo-brutal ads can coexist with calmer app chrome if linked by colour + wordmark.
8. **License hygiene** — Aspekta sources include LICENSE.txt; Batica from 1001Fonts EULA; Mont zip is DEMO — budget for full commercial licences or replace before launch.

## Font recommendation paths

| Path                     | Display / Marketing                  | UI / Product                              | Notes                                       |
| ------------------------ | ------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| **Trust Geometric**      | Mont Bold / Aspekta                  | Aspekta + system/Helvetica-like secondary | Closest to your `Aspekta.jpg` specimen      |
| **Friendly Geometric**   | Batica                               | Batica + slightly narrower grotesque      | Warm; verify license                        |
| **Dual World**           | Ink-trap display (Visore-class)      | Aspekta/Mont                              | Ads loud, app quiet — matches asset tension |
| **Strict Single Family** | One paid geometric with many weights | Same                                      | Highest coherence, less campaign spice      |

Do not use demo fonts in production. Prefer a paid complete family with Nigerian Naira-friendly figures (tabular lining for amounts).

## Logo concept approaches (from `Logo-Idea-Concept` + logic)

1. **Wordmark lockup** — bold geometric name; sporty tracking.
2. **Pitch monogram** — abstract field + ball negative space (avoid literal cheap clipart ball).
3. **Formation dots mark** — 11 dots in a recognizable shape → app icon at 16–1024.
4. **Letter as kit** — single letter on squircle, lime or blue (board already explores this).
5. **Stripe / sash mark** — diagonal “kit sash” for motion and stickers.
6. **Crest simplified** — shield that reads at favicon size (danger: generic sports crest).
7. **Typographic badge** — stacked “PAY / DAY” or product name in scoreboard block (`89c0` energy).
8. **Dual mark system** — calm blue mark for finance contexts; lime “matchday” variant for campaigns.

**Logo tests:** 16px favicon, monochrome, reverse on photo, next to Naira amount, and “does it look like betting?” gut check with non-fans.

## Grill sheet — Question 4

1. **Final product name locked?** (Affects lettermark and domain voice.)
2. **English only, or Pidgin / local language moments in marketing?**
3. **What phrase must never appear** (guaranteed returns, “risk-free”, bank claims)?
4. **Will you show faces of real Nigerian users early, or illustration-only?**
5. **Brand rivalry:** closer to PiggyVest clarity, Cowrywise colour wit, or sports media?**
6. **Budget for custom type / logo designer vs licensed fonts + in-house mark?**
7. **App icon: lime-black sport or blue trust — which wins the home screen?**
8. **Tagline contest: sport metaphor first, or benefit first?**
9. **Tone on debt and family obligations — gentle coach or blunt truth?**
10. **Where will static ads run first** (Instagram, Twitter/X, football pages, LinkedIn, WhatsApp status)? That choice picks layout system.

---

## Synthesis — a coherent “fresh approach” to pressure-test

If you answered nothing else, test this provisional stance in a mobile prototype:

1. **Product:** Matchday → Formation lock → Half-time → Season standings. Formation enforces defence-first rules.
2. **Visual:** Light/dark dual kit; **blue trust base**; **lime only for Matchday/marketing**; bento pitch home; flat aspiration illustration.
3. **Type:** Aspekta-or-Mont-class UI geometric; ink-trap display optional for ads only; tabular amounts.
4. **Voice:** “Defence first. Then attack wealth.” Coach, not casino.
5. **Logo:** Formation-dot or geometric wordmark; dual calm/matchday colourways.
6. **Mobile method:** Thumb CTAs, sheets for edits, ≤5 tabs, progressive onboarding.

Then revise hard using your grill answers.

---

## Suggested decision workshop (90 minutes)

1. Answer Q1 grill #1–5 (user, metaphor depth, custody, aha moment, north-star).
2. Vote keep/kill on 8 visual directions (stickers on printed refs from `web_resources`).
3. Pick font path + icon colourway.
4. Choose 5 mobile screens for the first prototype.
5. Write 10 banned phrases + 10 approved verbs.
6. Only then update formal product/design docs (out of scope for this research file).

---

## Sources (external)

- Fuselab — Fintech UX Design Guide 2026 (personalization, ethical gamification, thumb zone, minimalism): https://fuselabcreative.com/fintech-ux-design-guide-2026-user-experience/
- Eleken — Fintech UX best practices 2026 (empowerment, light gamification): https://www.eleken.co/blog-posts/fintech-ux-best-practices
- Urban Geko — Fintech mobile patterns (progressive KYC, dashboard first question, bottom nav): https://www.urbangekodesign.com/fintech-mobile-app-ui-ux-design/
- Fora Soft — Mobile App UX 2026 playbook (thumb zone, one job per screen): https://www.forasoft.com/blog/article/mobile-app-ux-design-best-practices
- Nielsen Norman Group — Bottom sheets: https://www.nngroup.com/articles/bottom-sheet/
- Ontario Securities Commission / BIT — Gamification positive use cases & mitigations (2026): https://www.osc.ca/sites/default/files/2026-10/html-report_20260203_gamification.pdf
- Markswebb — Gen Z investors / contextual learning: https://markswebb.com/insights/gen-z-investors/
- Visa Practical Money Skills — Financial Soccer (sport × literacy precedent): https://www.practicalmoneyskills.com/
- PiggyVest 4.0 redesign narrative (simplicity, navigation, performance for Nigerian phones): https://piggyvest.medium.com/the-simpler-path-to-financial-freedom-piggyvest-4-0-57191cf12f1e
- FourthCanvas — Piggyvest brand (trust + ambition): https://fourthcanvas.co/portfolio/piggyvest
- Dá Design — Cowrywise rebrand (colour, verbal “money”, patterns): https://dadesign.studio/work/cowrywise
- Foosio case (fantasy formation UX lessons): https://zsoficzeman.com/foosio.html

## Sources (local assets)

All files under `docs/assets/web_resources/` listed in the Asset inventory section above.

---

## Appendix — Priority questions to answer first (meta-grill)

If you only reply to a short set, answer these:

1. Planner-only or money-moving product?
2. Metaphor depth: full XI vs three lines?
3. Primary user persona + income band + city?
4. Loud sport brand or quiet finance brand with sport ritual?
5. Blue-trust or lime-sport as the default app icon?
6. Top outcome metric for the first 6 months after launch?
7. Name lock + one sentence positioning?

Your answers should drive the next artifact (positioning one-pager + mobile wireframes), not more abstract research.
