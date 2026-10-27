# Payday Pitch — Vision Refresh Research Report

Date: 2026-10-26
Status: Research / proposal. No code changes. This report deliberately ignores the current implementation and treats the product as a fresh brief.
Inputs: the reference pack in `docs/assets/web_resources`, a four-question working session (market, football depth, business model, visual pull), and web research across the Nigerian savings market, fintech design, and brand/growth practice.
**Agent:** Qwen/Qoder

**Decisions taken in the working session (these frame everything below):**

| Question                     | Answer                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary market               | Nigeria first (naira, Lagos time, local instruments and pop culture)                                                                         |
| Football layer               | Core loop + gamification — the formation is a monthly ritual, not just a hook                                                                |
| Business model               | Consumer subscription                                                                                                                        |
| Visual directions to explore | All four from the references: bold flat editorial illustration, candy iOS-widget softness, neon sticker-brand energy, dark premium poster UI |
| Data entry                   | Manual now, open-banking (Monnify/anchor/PSB) later                                                                                          |
| "Put to work" instruments    | Savings/funds, informal systems (ajo, co-ops), crypto — but the app stays instrument-agnostic                                                |
| Gamification                 | Solo progression (seasons, streaks) first; social mini-leagues as the premium hook                                                           |
| Voice                        | To be proposed by this report                                                                                                                |

---

## Executive summary

1. **The category is empty.** Every search for a football/sports-metaphor personal-finance product came back with zero results, while the "spatial allocation metaphor" (jar-method apps) is a proven category in emerging markets. Payday Pitch can own a genre, not just an app.
2. **The pain is quantified and current.** Monthly saving in Nigeria fell from 64% (2023) to 40% (2025); only 6% of earners feel financially secure; 83% pay black tax and 56% pay it monthly (PiggyVest 2025 Savings Report; Dataphyte). A tool that gives salary a _shape_ answers a measured wound.
3. **Trust is the product.** Nigerians have lost ₦300bn+ to collapsed schemes; the trust playbook that works is "we hold nothing — you keep your money in your own bank, we plan it." A planner that never touches custody sidesteps the "another app that will collapse" objection entirely. That is a positioning gift.
4. **Recommended visual direction: "Matchday."** A hybrid led by bold flat editorial illustration on a pitch-green base with candy-color position coding, kit-number display typography for money, and a dark "Night Match" premium surface. This merges all four chosen references onto one coherent axis instead of fighting between them.
5. **Recommended product spine:** the Monthly Matchday loop — payday notification → set your formation → lock your XI → clean-sheet streaks → season progression — with an AI coach ("the Gaffer") and social mini-leagues reserved for the subscription.
6. **Monetization reality:** proven consumer willingness to pay in Nigeria clusters at ₦1,600–₦4,000/month (Spotify, Netflix price points). The subscription must be naira-anchored, monthly with an "annual season ticket" framing, one-tap cancel, and value that looks like coaching and league play — never gating the act of saving itself.
7. **Mobile-first is correct, with one hard constraint:** PWAs cannot ship home-screen widgets on iOS or Android. The "widget-first" ambition from the references must be expressed through the app icon, badge, push, shortcuts, and screenshot-able formation cards users pin to their own home screens.

---

## Part 1 — Making it more than a single-act notion (product ideas)

The formation is one screen. A _product_ is a calendar, a identity, and a habit. The ideas below are grouped by what they add, each annotated with why it fits the Nigerian market.

### 1.1 Deepen the core metaphor (the football spine)

| Idea                                   | What it is                                                                                                                                                                                                                                                                                                                             | Why it serves                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Position-coded money**               | Goalkeeper = emergency fund (the last line), defenders = fixed costs (rent, transport, light), midfield = obligations and black tax (the workhorse link between what you earn and who depends on you), forwards = wealth put to work (savings goals, funds, crypto). Money problems become football problems: "your defence is leaky." | Makes allocation instantly legible and re-tellable. Nobody has to explain the app twice.                                                                                       |
| **Formation templates as life stages** | 4-4-2 (balanced salaried ringer), 5-3-2 "park the bus" (heavy rent/black-tax months), 4-3-3 (debt-free, attacking savings), 3-5-2 (single income, midfield-heavy obligations). Users pick a shape, then tweak.                                                                                                                         | Turns a form into a decision. Gives returning users a visible "same season, different formation" progression.                                                                  |
| **Clean Sheet**                        | A month where every debt line was fully covered and the formation locked without a break. Streak of clean sheets = the core retention metric.                                                                                                                                                                                          | Celebrates _plan adherence_, which is the gamification behavior research blesses (Monzo pots, PiggyVest targets) — unlike celebrating transactions, which got Robinhood fined. |
| **Transfer window**                    | Mid-month rebalancing: move ₦ between lines with deliberate friction (a "deal memo" confirm), logged as transfers in/out.                                                                                                                                                                                                              | Reframes budget-editing (usually a guilt spiral) as squad management. Positive friction on a risky action is a Thaler "sludge reversed" pattern.                               |
| **Season & season finale**             | The year is a season: formation history, wage progression, net-worth "title race" chart, end-of-season trophy screen (Man of the Month picks, clean-sheet count, goals = ₦ saved).                                                                                                                                                     | Gives long-horizon progress a shape monthly apps lack. The season recap is the natural shareable/viral artifact.                                                               |
| **Relegation battle**                  | A dedicated debt-payoff view: the debt line literally gets smaller pitch space each month until it's "relegated" out of the league.                                                                                                                                                                                                    | Debt is the most emotionally loaded line for this market; giving it a finish line is the strongest habit anchor after saving itself.                                           |
| **Academy graduate**                   | First-income/first-formation milestone; onboarding is "pre-season."                                                                                                                                                                                                                                                                    | Language for the entry-level user (young graduate on first salary) that flatters instead of condescends.                                                                       |
| **The Gaffer (AI coach)**              | An inline coach that reads the formation and says one useful sentence per payday: "Rent line is short ₦18k — drop the streaming subscription from midfield?" Rules first, LLM later.                                                                                                                                                   | 2026's dominant money-app feature, but it fits here without new UI: the coach speaks formation language. Keep claims out of it (see Cleo's $17M FTC settlement).               |
| **Away Days**                          | A slot for irregular obligations — family emergencies, church/wedding money, "black tax call-ups." Funded monthly at a chosen amount so an away day doesn't wreck the formation.                                                                                                                                                       | Black tax is structural (83% pay it). Every competitor ignores it or shames it; giving it a _position_ is both honest and sticky.                                              |
| **Squad depth / call-ups**             | Goals as squad members: a new savings goal is "called up to the first team"; a dead goal gets "released on a free transfer."                                                                                                                                                                                                           | Multi-goal tracking without a goal-list CRUD screen.                                                                                                                           |

### 1.2 Beyond the monthly act (comprehensiveness)

- **Payday Matchday notification** — the loop's heartbeat. Push at salary arrival (user-set day/time): "Matchday. What's the shape today?" One tap into the formation builder. (Android push works from installed PWAs; iOS push requires the add-to-home-screen flow — plan a thin Play Store wrapper later purely as a notification port, which also dodges store tax on the subscription.)
- **Salary ledger & wage growth** — track each month's pay over time; "contract renewal" reminders when salary hasn't moved in 12 months. In an inflation market, showing _real_ (inflation-adjusted) wage movement is a genuinely differentiated, frequently cited need.
- **Fixed-cost scouting report** — once a year, prompt a re-quote of rent, data, transport, subscriptions. Nigerians are hypersensitive to hidden charges; a "your defence is overpaying" nudge is concrete value.
- **Instrument-agnostic allocation, with a directory** — the forward line points to wherever the user actually saves (PiggyVest target, Cowrywise plan, ajo, co-op, crypto wallet, a mat under the mattress). The app never holds money and never recommends products (regulatory safety), but an educational "where forwards play" card library can later become partner content.
- **Couple/family squad (later, premium)** — shared formations for households pooling one salary. Very common structure in the market; nobody serves it.
- **Offline-first everything** — the formation builder, ledger, and last plan must work with zero data. This is a trust feature in a network-failure market, not just a technical nicety.
- **Export your season** — CSV/PDF of all formations. Owning your data is a trust signal that costs almost nothing and answers "what if you collapse too?"

### 1.3 The premium line (consumer subscription)

Free tier = the act of saving must never be paywalled (PiggyVest's whole brand lesson: people resent paying to save). Premium ("Season Ticket") = the coaching and the competition layer:

- Free: unlimited formations, one squad (one set of goals), clean-sheet streaks, season history for the current season, formation share cards.
- Premium (₦1,200–₦2,000/mo, anchored monthly; annual "season ticket" at ~10 months' price): the Gaffer coach, transfer-window history, multi-year season analytics, multiple squads (side-hustle income streams), mini-leagues, custom formations, PDF export.
- **Social mini-leagues as the premium hook:** 5–10 friends/family form a private league; the only scored stat is _plan adherence_ (clean sheets, formations locked) — never amounts, so nobody's salary is exposed. This is the Duolingo-league mechanic applied to money, and it dodges both the privacy problem and the betting problem.
- Payment rails: Paystack/Flutterwave recurring card **plus** bank transfer plus a wallet/top-up model — card auto-renewal alone churns hard on failed charges in Nigeria (bank transfer and PoS dominate volume; NIBSS).
- Ethics guardrail, non-negotiable: renewal price shown every checkout, one-tap cancel, streak freezes for broke months. Streaks + subscriptions + money is the exact dark-pattern triangle the FTC is prosecuting (Cleo). "Never punish a poverty month" is both the ethical and the growth-correct rule.

---

## Part 2 — Visual concept directions

All four reference clusters are legitimate in 2026 fintech design. Below: the full candidate list (the four, plus six more worth naming), then the recommendation.

### 2.1 The four from the reference pack

**A. Bold flat editorial illustration** _(refs: Visual-Style-Concept.png, the suitcase illustration)_
Big silhouettes, 2–3 color scenes, character-led, poster composition. Evidence: this is where fintech illustration landed after corporate Memphis died — Mercury's "More than Banking" collages, Wise's boldness, Nike Nigeria's AFCON work. Reads as _culture_, not _software_.

- For: the formation screen literally wants a pitch scene; illustration carries the metaphor where charts can't.
- Against: expensive to sustain (every state needs art); can read "friendly fintech" generic if not art-directed hard.

**B. Candy iOS-widget softness** _(refs: shapes-ideas-concept.png)_
Rounded modules, pastel-pop fills, tactile claymorphism. Evidence: Apple's Liquid Glass refresh made widgets/icon personalization a mainstream behavior; clay/soft-3D is explicitly recommended for fintech onboarding when contrast passes. Users already read this language as "my home screen, my identity."

- For: each formation line _is_ a widget-like module; the share-card strategy depends on this look.
- Against: softness erodes money-trust if it goes all the way down — it's the least "bank" of the four.

**C. Neon sticker-brand energy** _(refs: Logo-Idea-Concept.png, hello-colorful.jpg)_
Lime/black/yellow, wordmarks as art, app-icon culture, sticker packs, merch logic. Evidence: Liquid Death and Duolingo prove a sticker identity builds earned media without a print budget; Kuda's seven years as "the purple bank" proves one loud color owned with conviction wins in this exact market.

- For: marketing, socials, WhatsApp status assets, Gen-Z word of mouth.
- Against: neon at full volume is wrong for a debt-payoff error state; it's a _brand_ register more than a _product_ register.

**D. Dark premium poster UI** _(refs: Sprouts phone mockups, Cool Font poster)_
Near-black surfaces, poster-scale type, collage imagery, ink-trap display faces. Evidence: dark-first = premium/confidence in finance (Revolut's codified austerity); oversized display numerals are a top 2026 dashboard trend; Mercury-style "data as composition."

- For: money-as-hero typography, the "Night Match" mood, premium tier signaling.
- Against: dark surfaces hide dirty data (low contrast on amounts); in a hot bright African daytime / low-end-screen market, dark-only is an accessibility risk.

### 2.2 Six more directions worth naming

**E. Kit design language.** The brand system _is_ a strip: jersey stripes as section dividers, kit numbers (huge, outlined) for amounts, name-plate lettering for labels, badge-over-heart for the logo. The formation screen becomes a squad list. Most distinctive and most ownable; risk: costume-y if overdone.

**F. Terrible-table / sports-results minimal.** Black board, white chalk, one accent — the football pool board as UI. Extremely legible, extremely local (every Nigerian street has seen one). Risk: bleak for a wealth app.

**G. Stadium day.** Warm floodlight gradients, grass textures, crowd-noise celebration motion. Emotional and photographic. Risk: texture-heavy for a low-bandwidth PWA.

**H. Trading-card collectibles.** Each goal/instrument as a collectible card with stats (rate, term, risk). Collect-and-upgrade loop fits gamification perfectly. Risk: card-pack mechanics smell like gambling loot boxes — the opposite of the trust position.

**I. Teletext retro score.** Pixel scoreboard, 1990s Super Eagles nostalgia, Channel 5 results culture. Massive cultural resonance for 25–40s. Risk: novelty register, not a product surface.

**J. Swiss pitch-grid.** The pitch's geometry (center circle, penalty box lines, halfway line) as the literal layout grid — thin white rules on green, everything aligned to pitch markings. Quiet, systematic, premium, and _structurally_ football rather than decoratively. This is the sleeper candidate.

### 2.3 Recommendation: "Matchday" — A leads, B and D support, C is the megaphone, J is the skeleton

The research conclusion is that the four chosen directions sit on two axes — (a)+(d) = trust/premium, (b)+(c) = retention/identity — and the right move is one core axis plus exactly one borrowed device. Concretely:

1. **Base surface: Daylight pitch.** A warm paper-white / very light grass-green ground (never pure white), Swiss pitch-grid structure (J) as the layout system: hairline field markings, halfway-line section breaks, center-circle focal points.
2. **Color: one owned hero + a position palette.** Claim **one loud, un-African-fintech color with Kuda-level conviction** (candidates: electric "boots" lime — from reference C — or a deep "match" green; note the market: PiggyVest green, Cowrywise blue, Kuda purple, OPay green, Moniepoint pink are taken). Then code the four position groups with a candy-bright but contrast-safe set (defender, midfielder, forward, keeper) — this is where B's widget softness lives: modules, chips, share cards.
3. **Type: grotesque workhorse + kit-number display (D).** One neo-grotesque for everything functional; oversized display numerals for money and milestones — the Sprouts poster logic applied to ₦ amounts. Numbers stay calm and tabular; display face appears only ≥24px on celebration surfaces.
4. **Illustration: A, rationed.** Commissioned flat editorial illustration for exactly four moments — onboarding ("pre-season"), formation empty state, season finale, paywall ("why go season ticket"). Everywhere else, the grid and type carry it.
5. **Night Match = premium mode.** A dark surface variant reserved for the Season Ticket tier's analytics and league screens. The free/premium difference is literally visible in the room's lighting.
6. **Sticker layer: C, outside the app.** The neon sticker energy runs the _marketing_ identity — logo lockups, WhatsApp status shareables, icon variants, merch. Inside the product, it appears only as celebration accents.

Why this order: trust is the binding constraint in this market (Part 5 of the research), so the product surface must read premium-first; playfulness is then deployed where research says it's safe — adherence celebration, share cards, and brand marketing.

---

## Part 3 — The mobile-first face of the app

Starting small-to-large is right for this product specifically: the use case is a 90-second ritual on a phone at payday, on a mid-range Android, often on bad data. Desktop was always the wrong first canvas.

### 3.1 Design principles for the mobile surface

1. **One hand, one thumb.** Primary action ("Lock my XI") lives in the lower-center thumb zone; bottom nav, never top tabs; no reach-across gestures.
2. **Money is the hero numeral.** The convention every 2026 fintech guide agrees on: one giant tabular figure, everything else subordinate. On the home screen that figure is "what's left to put to work," not total balance.
3. **Progressive disclosure, resumable steps.** Never a salary form. Pre-season is a 5-card chat-speed sequence (income → rent → debts → obligations → goals), each card saveable, each skippable with a sensible default. Show the formed formation _before_ asking for sign-up — value before verification is the named 2026 onboarding pattern, and it's built for low-data users deciding whether to trust you.
4. **The formation screen is the app.** One vertical composition: the pitch from the goal line up, four bands (keeper/defence/midfield/attack), each band a stack of candy modules showing name + ₦ amount, drag-to-rebalance between bands, a live "balance to allocate" chip pinned at the thumb zone. No tables, no spreadsheet scroll.
5. **90-second test.** The full monthly ritual — open, adjust, lock — must be achievable in 90 seconds. Every feature idea in Part 1 must not lengthen this loop; they live _around_ it.
6. **Offline is a first-class state.** Cached last formation, queued writes, an honest offline page under `/app`. Data bundles are a second subscription in this market; a planner that eats megabytes gets uninstalled.
7. **Motion = meaning, not decoration.** Numbers settle (count-up 300–500ms), one choreographed celebration per month (formation lock — the whistle-blow moment), everything gated by `prefers-reduced-motion`. Never animate money into misleading optimism; never per-tap confetti (the Robinhood lesson: celebrate adherence, not transactions).
8. **Light-first, dark as mode.** Cheap LCD screens in daylight punish dark-only UIs; Daylight base with Night Match premium variant covers both.

### 3.2 Screen inventory (mobile spec)

| #   | Screen                  | Role                                           | Key pattern                                                                                            |
| --- | ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Landing / install       | Value in 10 seconds, then "Add to Home Screen" | Animated formation demo, no signup wall; PWA install banner (Android) / share-sheet instructions (iOS) |
| 2   | Pre-season (onboarding) | 5 resumable cards to first formation           | Chat-speed progressive disclosure; guest mode until lock                                               |
| 3   | **Matchday home**       | The ritual hub                                 | "What's the shape today?" + last formation ghost + payday countdown tile                               |
| 4   | Formation builder       | Core interaction                               | Vertical pitch, four bands, drag-to-allocate, live remainder chip, haptic lock                         |
| 5   | Lock confirmation       | The commitment moment                          | Full-screen squad-card render of this month's XI, whistle celebration, calendar stamp                  |
| 6   | Away Days / call-ups    | Fund irregular obligations                     | Slot with monthly contribution, "call up" event form                                                   |
| 7   | Transfer window         | Mid-month rebalancing                          | Deal-memo confirm, transfer log                                                                        |
| 8   | Season view             | Year progress                                  | Title-race net-worth line, clean-sheet calendar, formation timeline                                    |
| 9   | Relegation battle       | Debt payoff                                    | Shrinking pitch space per debt, promotion zone at zero                                                 |
| 10  | The Gaffer              | Coaching                                       | One card per payday, question prompts, rules-first answers                                             |
| 11  | Leagues (premium)       | Social mini-leagues                            | Private league join code, adherence-only table, no amounts                                             |
| 12  | Season finale           | Annual recap                                   | Trophy screen, Man-of-the-Month montage, shareable poster                                              |
| 13  | Share card generator    | Growth engine                                  | Formation card sized for WhatsApp status, <100KB image                                                 |
| 14  | Settings                | Auth, notifications, subscription              | Renewal price always visible, one-tap cancel                                                           |

### 3.3 Methods and trends to ride (and one to dodge)

- **Ride: bento/module layout** — settled dashboard language, and it maps 1:1 to position bands.
- **Ride: widget-first _psychology_ within PWA limits** — PWAs can't ship home-screen widgets (hard platform fact). The substitute stack: a collectible app icon that changes with your streak, Android badging, payday push, manifest shortcuts ("Start today's formation" on long-press), and screenshot-able formation/match cards users pin themselves. This is the pragmatic pattern teams actually use.
- **Ride: oversized display type + variable fonts** — one family carrying poster and body saves both design budget and bytes.
- **Ride: AI coach as inline text, not a chatbot tab** — the copilot trend without inventing a second product.
- **Dodge: glassmorphism on money surfaces** — Liquid Glass is for chrome (nav, sheets), never for a data surface; contrast on amounts is non-negotiable.
- **Dodge: betting aesthetics** — no odds boards, no jackpot gold, no "winner takes all" visuals anywhere. Nigeria's betting-ad backlash and the 2025–26 gaming regulation tightening make this a legal and trust issue, not a style preference. Position line: **"No wager. Just your eleven."**

---

## Part 4 — Copies, messaging, design system, fonts, logo, marketing

### 4.1 Voice and messaging playbook

**Recommended voice: "the smart teammate."** Between Monzo's published warmth-with-discipline and Cowrywise's Nigerian relatability. Three axes:

1. **Plain first, never bank-speak.** Every finance sentence at ~8th-grade reading level (FEAT/plain-language standard — trending from best practice toward compliance globally). Short sentences, active voice, numbers exact.
2. **Warm, but the money is stern.** Humor scales inversely with stakes: jokes live in empty states, milestones, and marketing; zero jokes in errors, amounts, or anything that costs money. (Cleo's $17M FTC settlement is the cautionary tale — playfulness in _voice_ is safe, playfulness in _promises_ is not.)
3. **Football idiom, strictly pitch-side.** Formation language, never betting language.

**Code-switch rule:** English for all product copy (clarity = trust on money surfaces); Nigerian Pidgin only for celebration and marketing moments — the lock screen ("Sapa don clear!"), share cards, socials. Research on pidgin in Nigerian advertising shows it measurably raises emotional relevance with youth audiences; none of the big savings apps write pidgin _in-product_, so this is an open lane — but keep it out of errors and amounts.

**Idiom bank (money × football, already alive in Nigerian usage):** pre-season (setup) · your eleven (your plan) · clean sheet (fully covered month) · transfer window (rebalance) · away day (family emergency spend) · black tax = the midfield workload · relegation battle (debt payoff) · man of the match (best move this month) · own goal (self-sabotage, used gently, never shaming) · season ticket (premium) · academy graduate (first salary).

**Message architecture:**

- Master narrative: _"Your salary is a squad. Stop spending it like a ball loose in the midfield."_ — Payday Pitch turns every pay into a formation: bills defended, obligations covered, the rest out front scoring for you.
- Trust pillar: "We never touch your money. Your bank keeps the ball; we draw the tactics board." (The custody-free position, stated plainly, is the #1 trust asset in this market.)
- Utility pillar: "Ninety seconds at payday. A year you can see."
- Identity pillar: "No wager. Just your eleven." (Anti-betting line, for marketing surfaces.)

**Microcopy rules:** empty states are always a next step in football voice ("Your squad is empty — sign your first striker"); confirmations state the number and the date, never celebrate a mere input; errors name the fix; every renewal screen shows the price in ₦ with a one-tap cancel within two screens of the purchase (this is a brand feature, say so: "Cancel like a gentleman.").

### 4.2 Design system approach

- **Token-first, raw layer only:** all color/type/spacing values live in one token file; components consume tokens; a lint rule bans raw hex outside it (already house practice — keep it as a principle regardless of implementation).
- **Palette skeleton:** Daylight ground (warm paper / light grass) · one owned hero color (lime-or-deep-green decision, tested against the taken market colors: PiggyVest green, Cowrywise blue, Kuda purple, OPay green, Moniepoint pink) · four position colors (defender/midfield/forward/keeper — candy-bright, all passing 4.5:1 on their text) · Night Match surface set (elevated greys, never pure black, desaturated accents) · semantic money colors (covered / short / locked).
- **OKLCH for generation** — perceptual lightness control makes the position palette and dark variant systematically derivable, and keeps gamut safety on cheap Android screens.
- **Every amount renders through one money component** with `tabular-nums` enforced at that choke point (verify the chosen faces contain `tnum`).
- **Motion tokens:** one settle duration (~400ms), one celebration sequence, one global reduced-motion gate.
- **Documentation:** a single `design.md`-style source of truth (tokens, type scale, component states, voice axes) that every screen is built against — the Monzo/Wise pattern of treating voice and tokens as the same system.

### 4.3 Typography

From the downloaded candidates (Aspekta, Batica, Mont, Big UI, Stanzegic):

- **UI workhorse: Aspekta** (Ivo Dolenc / Slovotype, open source, 20 weights, clean neo-grotesque). It's the Helvetica-ish calm face for numbers and labels — the fintech-standard "grotesque carries the system" role (Stripe's Söhne, Wise Sans pattern).
- **Display/celebration: Big UI or Stanzegic** — poster energy for headlines ≥24px, season finales, share cards. Pick one, not both.
- **Drop Batica and Mont from the product system** — Aspekta + Mont + Batica are three similar sanses doing one job; keep them only as wordmark-lettering candidates. (Licensing note: Mont is Fontfabric — paid for web embedding; Batica commercial use is paid. Aspekta is free.)
- **Performance is a feature in this market:** WOFF2 only, subset, `font-display: swap`, one ~20–30KB variable Aspekta shipped globally; the display face lazy-loaded only on surfaces that use it. Data cost is a second subscription — the font budget is a UX budget.
- Kit-number idea: consider a jersey-style numeral treatment (outlined, condensed) as the _display numeral_ for formation amounts — that's direction E leaking productively into the recommended system.

### 4.4 Logo and icon system

- **Icon-first identity:** for a PWA, the home-screen tile _is_ the logo. Design the tile first: a single flat shape readable at 512px and at 16px favicon — a pitch crest (shield + halfway line + ball) or a monogram "PP" formed from two formation dots and a line. Build the responsive system outward: full lockup → compact → bare mark.
- **Wordmark:** "payday pitch" lowercase set in the display face with the two p's as formation markers (a dot + arc); sticker-variant in the neon C register for merch/socials, calm-variant in Aspekta for legal/in-product.
- **Collectible icon program:** the app icon changes with your season state (clean-sheet streak badge, end-of-season trophy overlay) — this is the PWA's substitute for widget personalization and the cheapest retention device on this list.
- **Sticker/asset pack:** WhatsApp-status-ready templates (formation card, clean-sheet stamp, relegation-battle update) — the Liquid Death/Duolingo lesson that one shape + stickers + status-friendly assets is a full merch identity without a print budget.
- **Guardrails:** no club, league, EPL, or Super Eagles IP — own the _formation_, not the trademarks (MTN/Airtel's ambush-marketing war shows how defended that IP is).

### 4.5 Marketing and growth approach

1. **Short-form first, finfluencer-safe.** TikTok/Reels money-creator culture is where Nigerian Gen Z learns finance; the content unit is the formation itself ("watch me set my salary's XI for November"). Creator briefs show the app's artifact, never promise returns — IOSCO's finfluencer warnings and Nigeria's influencer-gambling crackdown define the line.
2. **WhatsApp is the community layer.** Share cards built for status (the Duolingo-streak-card mechanic), private league invites via share-sheet deep links, broadcast lists as free CRM. Stay on free personal-WhatsApp patterns; Meta's per-message business fees are landing in Nigeria.
3. **Two-sided naira referrals.** Reward = credit toward a friend's first month premium or a savings round-up, released only when the referee locks a real formation. Share assets <100KB images, never video-gated.
4. **PWA as a growth feature, not a compromise.** Install-less link + tiny bundle beats store downloads in a data-cost market; ship a thin Play Store wrapper later purely for push (and to keep the subscription off the 15–30% store tax).
5. **Pricing communication.** Naira-first everywhere; frame monthly against a daily reference ("less than a data sachet a week"); annual = "season ticket." Lead the pricing page with fee transparency as a product claim ("we show the price every time; cancel in two taps") — hidden-charge sensitivity is documented and severe in this market.
6. **Earned-media trust play.** Publish the money-handling position plainly: "we hold nothing." When (not if) the next scheme collapses, the planner that never took custody becomes the safe answer, and that article writes itself.
7. **Seasonal beats:** match the marketing calendar to the football calendar (AFCON/World Cup seasons, Super Eagles runs — without touching their IP) and to the Nigerian money calendar (December "Detty December" overspend → January pre-season reset is the natural acquisition window).

---

## Part 5 — Risks and open questions

| Risk                                                                     | Mitigation baked into this report                                                               |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Gamification read as trivializing money (post-Robinhood frame)           | Celebrate adherence only (clean sheets), never transactions; no loot-box or card-pack mechanics |
| Betting-adjacency backlash (SportyBet effect, 2025–26 gaming regulation) | Strict pitch-side idiom; "No wager. Just your eleven." as a written brand guardrail             |
| Subscription ceiling in a low-WTP market                                 | ₦1,200–2,000 band, monthly-first, season never gates saving, gift/streak-earn mechanics         |
| Cleo-style dark-pattern liability                                        | Renewal clarity + two-tap cancel as brand features, stated in the voice guide                   |
| PWA push/widget limits on iOS                                            | Icon/badge/shortcut/share-card substitute stack; Play Store wrapper later                       |
| Illustration cost at scale                                               | Rationed to four commissioned moments; grid + type carry the other 90%                          |
| Pidgin misread as unserious on money surfaces                            | Code-switch rule: English in-product, pidgin in celebration/marketing only                      |

**Open questions for the next session:**

1. Hero color: electric lime (sticker energy, riskier on trust) vs deep match green (premium, closer to PiggyVest territory)? This is the single biggest brand fork — recommend generating both as icon-tile mockups and testing with 5–10 target users.
2. Does the goalkeeper/emergency-fund position exist from day one, or does the first version ship four lines and add the keeper as a "signing" event later?
3. Mini-league scoring: pure adherence count, or a light "formation IQ" score that rewards balance? The latter is more addictive, more shaming risk.
4. Is "Payday Pitch" the final name, or does the report's direction suggest testing alternatives while the identity is still fluid?
5. Bank-sync timing: the moment real balances auto-fill, the product's emotional core (the ritual of choosing) partly evaporates. Decide what stays manual by design.

---

## Sources

Market and behavior: [PiggyVest 2025 Savings Report](https://www.piggyvest.com/reports/2025) · [Dataphyte black tax](https://www.dataphyte.com/issue/pocket-science/2024/08/black-tax-bonding-or-burdening) · [Techpoint: PiggyVest ₦1.3tn 2025 payouts](https://techpoint.africa/news/piggyvest-2025-payouts/) · [Cowrywise on black tax](https://cowrywise.com/blog/black-tax/) · [NIBSS transaction data](https://nibss-plc.com.ng/pos-transaction-grow-by-40-e-payment-hits-n39-58tn/) · [KudiCompass: verifying SEC/CBN registration](https://kudicompass.com/safest-investment-apps-nigeria-sec-verification/) · [BBC: CBEX freeze](https://www.bbc.com/news/articles/cx2w9v91je1o) · [Netflix/Spotify Nigeria price points](https://thecondia.com/netflix-vs-prime-video-nigeria/) · [Poverty Action: fee transparency study](https://poverty-action.org/sites/default/files/publications/Report_Measuring-Fees-Transparency-Nigeria-Digital-Finance.pdf).

Gamification and trust: [Reuters: Robinhood confetti](https://www.reuters.com/technology/robinhood-scrap-confetti-animation-app-after-gamification-criticism-2021-03-31/) · [V&E: Robinhood $7.5M settlement](https://www.velaw.com/insights/game-over-robinhood-pays-7-5-million-to-resolve-gamification-securities-violations/) · [Craft Innovations: gamification in fintech](https://craftinnovations.global/gamification-in-fintech-examples-ideas/) · [Orizon: Duolingo gamification](https://www.orizon.co/blog/duolingos-gamification-secrets) · [FTC: Cleo $15.8M refund](https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-returns-more-158-million-consumers-misled-cash-advance-app-company-cleo-ai) · [Bayes: can gamification encourage saving](https://www.bayes.citystgeorges.ac.uk/faculties-and-research/research/bayes-knowledge/2021/june/can-gamification-help-people-save).

Design and brand: [Outcrowd: fintech design trends 2026](https://www.outcrowd.io/blog/fintech-design-trends-2026) · [Instrument: Mercury campaign](https://www.instrument.com/work/mercury) · [Ragged Edge: Monzo](https://raggededge.com/partnerships/monzo) and [Wise](https://raggededge.com/partnerships/wise) · [Monzo tone of voice](https://monzo.com/tone-of-voice) · [Mailchimp voice & tone](https://styleguide.mailchimp.com/voice-and-tone/) · [Apple: Liquid Glass design](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) · [web.dev: app-like PWAs](https://web.dev/articles/app-like-pwas) · [Envato: icon trends](https://elements.envato.com/learn/icon-design-trends) · [Type Network: tabular figures](https://typenetwork.com/articles/opentype-at-work-figure-styles) · [web.dev: font best practices](https://web.dev/articles/font-best-practices) · [maxibestof: Aspekta](https://maxibestof.one/typefaces/aspekta) · [Fontfabric: Mont](https://www.fontfabric.com/blog/typography-knowledge-what-are-geometric-fonts/).

Growth: [GrowthCurve: Chime referral playbook](https://growthcurve.co/the-playbook-that-fueled-12-million-users-for-chime) · [Rest of World: Nigerian betting influencers](https://restofworld.org/2023/online-gambling-influencers-nigeria/) · [IOSCO finfluencer report](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD795.pdf) · [ResearchGate: pidgin in Nigerian print advertising](https://www.researchgate.net/publication/308781542_The_Use_of_Nigerian_Pidgin_English_in_Print_Advertising_Deviation_from_Standard_Orthography_and_Effectiveness) · [Nike "You Can't Stop Us" AFCON case](https://pulse.africa/case-study/nike-you-cant-stop-us/) · [RevenueCat: subscription pricing psychology](https://www.revenuecat.com/blog/growth/subscription-pricing-psychology-how-to-influence-purchasing-decisions).

_Full agent research briefs (market, design, brand) are condensed here; every claim above carries its source in those briefs. Whitespace finding: exhaustive search for football-metaphor personal-finance products returned no existing product in any market._
