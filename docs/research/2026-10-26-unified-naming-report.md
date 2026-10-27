# Payday Pitch: unified naming report

**Date:** 26 October 2026
**Status:** Consolidated naming research and recommendation. No name is legally cleared. Nothing is renamed until the founder decides after the test in §6.
**Built from three agent reports:**

| Tag     | Agent      | Report                                                                         | What it was best at                                                                                                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[X]** | Codex      | [2026-10-26-naming-research.md](2026-10-26-naming-research.md)                 | A disciplined shortlist, careful wording about what a search does and doesn't prove, a name hierarchy, and a three-pass test method. It also kept Payday Pitch as the benchmark to beat. |
| **[Q]** | Qwen/Qoder | [2026-10-26-naming.md](2026-10-26-naming.md)                                   | The longest collision list (betting brands, Nigerian brands, football apps), a domain sweep, two-meaning names, and Pidgin options.                                                      |
| **[C]** | Cursor     | [2026-10-26-project-naming-research.md](2026-10-26-project-naming-research.md) | The widest set of names grouped by strategy, a scoring sheet, pitfalls specific to this product, and a bank of campaign lines.                                                           |

**[U]** marks checks and corrections made while merging. Companion to the [unified research report](2026-10-26-unified-research-report.md), whose product decisions (Nigeria first, formation-led loop, plan only and never hold money, no betting cues, consumer subscription) frame this brief.

---

## 0. The unified stance on one page

1. **Payday Pitch is the benchmark, but it is no longer the safe default.** It is clear, alliterative and easy to spell after hearing it once. But **"Payday" is already a Nigerian fintech brand** (Payday, the virtual-card and payments company funded by Moniepoint), and "payday" also suggests payday loans. None of the three reports caught the first problem. A challenger only has to match Payday Pitch on clarity to be worth choosing. [X][Q][U]
2. **Test five names together:** **Payday Pitch** (benchmark), **Goal Difference** (lead challenger), **Paytactic** (most ownable), **Money XI** (plainest), and **Kobopitch** (the Nigerian wildcard). [U] (merged from [X][Q])
3. **Lead challenger: Goal Difference.** It is the only name that _is_ the product idea. In football, goal difference is goals scored minus goals conceded; in money, it is what comes in minus what goes out. That margin is what decides the table. It uses two common words, so people spell it correctly after hearing it, it has no betting or loan cue, and it covers more than payday. Its costs are length and search noise from football statistics. [Q]
4. **Demoted from first place:** Formashon (people who hear it will type "formation", and it breaks our own rule of using Pidgin only for celebrations), Payformation (people hear "pay information", and the .com is taken), One Nil ("nil" means zero on a money app). Each still has a role elsewhere (§5). [U]
5. **Leave football-feature words as feature names, not the brand:** Matchday, Clean Sheet, the Gaffer, Pre-Season, Away Days. These words are crowded or already taken as brands, and they work better as names for moments inside the app. [Q][X][C]
6. **Decide with ears, not eyes.** Say each name aloud, then ask what the person heard, what they think the app does, and whether they remember it later. The final question is the "I put it in my ___" test. Only then check legal, domains and handles. [X][Q][C]

---

## 1. The naming brief

All three reports' criteria, deduplicated and put in priority order:

| #   | Criterion                                   | Kill test                                                                                                         | From      |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | **Trust-safe**                              | Reads as betting, a loan, a bank, holding your money, crypto, or a kids' game → out                               | all       |
| 2   | **Spelled correctly after one hearing**     | Someone types the wrong thing into the Play Store after hearing it on WhatsApp or in the office → out             | [C][Q][X] |
| 3   | **Speaks to both football and money**       | Only football, or only money, makes it a weaker candidate (not out)                                               | [Q][C]    |
| 4   | **Grows past payday**                       | Still fits goals, seasons, reviews and household planning                                                         | [X][C]    |
| 5   | **Not tied to a fixed number of positions** | Must not imply exactly eleven financial categories                                                                | [X]       |
| 6   | **Owned and searchable**                    | A major brand already uses it in money, football or Nigeria → out                                                 | all       |
| 7   | **Fits on the icon**                        | About 12 characters or fewer for the home-screen caption (the PWA `short_name`)                                   | [Q][C]    |
| 8   | **Works in Nigerian speech**                | Easy in Nigerian English and Pidgin; any local-language root is checked with native speakers for tone and meaning | [C][Q]    |

**Founder note:** criteria 1, 2 and 6 rule names out. Criteria 3, 4, 5, 7 and 8 only rank the names that remain.

---

## 2. The test set

|                       | Name                | Big idea                                                               | Strengths                                                                                                                                             | Main risks                                                                                                                                                               | Domains (DNS check, 26 Oct)             |
| --------------------- | ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **Benchmark**         | **Payday Pitch**    | The payday moment, set out on a pitch                                  | Clear and alliterative; already the working name; the logo work so far fits it                                                                        | **"Payday" is an existing Nigerian fintech**; payday-loan association; "pitch" also means a sales pitch; descriptive, so harder to trademark                             | .com .app .ng .com.ng: no DNS           |
| **Lead challenger**   | **Goal Difference** | Your wealth is your goal difference: what comes in minus what goes out | The product idea in two words fans already know; spelled right after hearing; grows naturally (seasons, tables, clean sheets); no betting or loan cue | Long (15 characters, 5 syllables), so the icon caption needs a short form; search results full of football stats; .com taken; two common words may be harder to register | .com **used**; .app .ng .com.ng: no DNS |
| **Most ownable**      | **Paytactic**       | A tactic for your pay                                                  | Short coined word, easy to search and own; supports adjusting through the month; all domains clear                                                    | Can sound like a payments or payroll tool; people may add an "s" ("Paytactics"); football is only hinted                                                                 | All four: no DNS                        |
| **Plainest**          | **Money XI**        | Your money, as an eleven                                               | Says what it is; "XI" is generic football shorthand; premium look as a wordmark                                                                       | Unclear aloud ("Money Eleven" or "Money X-I"?) and when typed (`moneyxi`, `money11`); fixes the count at eleven, which [X] warns against                                 | All four: no DNS                        |
| **Nigerian wildcard** | **Kobopitch**       | A pitch for every kobo                                                 | Local money word plus an obvious sport word; spelled right after hearing; tagline built in: "Give every kobo a role"                                  | **"Kobo" is a crowded Nigerian prefix** (Kobo360 logistics with KoboSafe and KoboCare; Rakuten Kobo); kobo means very small amounts; "pitch" ambiguity again             | All four: no DNS                        |

**What "no DNS" means:** no nameserver or SOA record was found. That is a strong hint the domain is free, not proof. Check every finalist with a registrar or WHOIS. [Q][U]

### 2.1 Why Goal Difference leads

- **It carries the thesis of the product.** The other names describe a _mechanism_ (pay put into a formation). Goal Difference names the _result_: the margin you build. That is what "build wealth" means here, and it fits the Season story (the table, the finale) without any explanation.
- **It passes the hearing test.** Both words are common, so nobody misspells it after hearing it.
- **It fits the anti-betting position.** Goal difference is a quiet, cumulative number from the league table, not odds or a one-off win.
- **Its weaknesses can be managed:**
  - Use `goaldifference.app` as the primary domain.
  - Use **GD** as the icon caption and app monogram. A two-letter monogram is also a strong logo territory: two letters forming a margin.
  - Pair the name with a fixed descriptor ("Salary planning, football-style") to cut through football-stat search noise.
  - **Before going further, have a trademark attorney confirm that two common football words are registrable in classes 9 and 36 in Nigeria.** That single check is enough to kill or confirm this name.

### 2.2 Why the others stay in the test

- **Paytactic** is the fallback if Goal Difference fails the legal check or the search-noise problem bites. It is the most ownable name on the list. [X]
- **Money XI** is in the test as the "say exactly what it is" control. If users understand it instantly but mangle it aloud, that tells us how much plainness matters to them. [Q]
- **Kobopitch** tests whether an explicitly Nigerian name beats a global one with this audience. Drop it if testers hear "Kobo360" or read "kobo" as "small change". [X]
- **Payday Pitch** stays in so a challenger has to _beat_ it. If it wins the test, keep it and get legal advice on the "Payday" fintech. [X]

---

## 3. Corrections made during the merge

| Claim                                                     | Source | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Payday Pitch: no product collision found"                | [Q]    | **Wrong for Nigeria.** _Payday_ is a Nigerian-founded fintech (virtual dollar and naira cards, payments; $3M seed led by Moniepoint, 2023). It is an adjacent money brand in the home market, not a loan app. ([TechCrunch](https://techcrunch.com/2023/03/29/payday-wants-to-power-the-future-of-work-for-africa-with-3m-seed-led-by-moniepoint-inc), [TechCabal](https://techcabal.com/2023/02/20/how-nigerians-are-currently-being-helped-by-payday-to-pay-for-starlink/)) |
| Kobopitch: "no obvious dedicated product"                 | [X]    | True for the exact name, but the **Kobo prefix is crowded**: Kobo360, a Lagos logistics company funded by Goldman Sachs and backed by Y Combinator, runs KoboSafe and KoboCare driver products. ([TechCrunch](https://techcrunch.com/2019/08/14/nigerian-logistics-startup-kobo360-raises-30m-backed-by-goldman-sachs/))                                                                                                                                                      |
| Goalbound is a strong double meaning                      | [C]    | **Goalbound is an active Roblox football game.** That puts it next to a football _game_, the wrong neighbour for a money app. Out.                                                                                                                                                                                                                                                                                                                                            |
| Formashon has "Fela lineage (he titled records this way)" | [Q]    | **Unverified.** Fela did write in Pidgin with phonetic spellings, but no Fela title "Formashon" was found. Don't use the lineage claim in marketing.                                                                                                                                                                                                                                                                                                                          |
| Payformation: "no obvious product"                        | [X]    | **payformation.com is in use** (it has DNS records). Add that to the existing worry that people hear "pay information".                                                                                                                                                                                                                                                                                                                                                       |
| One Nil, Goal Difference: ".com used"                     | [Q]    | Confirmed: **onenil.com, goaldifference.com and goaldiff.com all have DNS records.**                                                                                                                                                                                                                                                                                                                                                                                          |
| "Urgent 20" as a feature name                             | [Q]    | The common Nigerian meme is usually **"urgent 2k"**; check the current form. More importantly, naming a feature after asking for money conflicts with the "never shame" rule in the unified report. Use **Away Days** in the product; use "urgent 2k" humour only in marketing, and carefully.                                                                                                                                                                                |
| Formashon tops the list                                   | [Q]    | Conflicts with Qwen's own voice rule (English in the product, Pidgin only for celebrations and marketing), and fails the hearing test: someone who hears "Formashon" will search "formation", which is a crowded and unregistrable word.                                                                                                                                                                                                                                      |

---

## 4. Full candidate catalogue

About 150 names came out of the three reports. Deduplicated and grouped by strategy, with a verdict on each. ★ = worth keeping in reserve.

### 4.1 Mechanism names (formation, tactics, lineup)

| Name                                               | Verdict                        | Why                                                                                                                   | From |
| -------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---- |
| **Paytactic**                                      | **Test set**                   | §2                                                                                                                    | [X]  |
| ★ Payformation                                     | Reserve                        | Best expression of the mechanism, but people hear "pay information" and the .com is used                              | [X]  |
| ★ Formashon                                        | Reserve, as a celebration word | Strong local flavour; fails the hearing test as a brand. Use it in Pidgin celebration copy: "Your formashon don set!" | [Q]  |
| ★ Payday Tactics                                   | Reserve                        | Clear, but carries the same "Payday" collision                                                                        | [X]  |
| Tactipay                                           | Reserve                        | Same idea as Paytactic, but "pay" at the end reads more like a payments product                                       | [C]  |
| Pitchplan                                          | Weak                           | "Pitch plan" sounds like a sales plan                                                                                 | [C]  |
| Wageform / Payform                                 | Weak                           | Sounds like a payroll or HR form                                                                                      | [C]  |
| Formaid                                            | Weak                           | Hearing problem ("for maid"?)                                                                                         | [C]  |
| Formly, Forma                                      | Out                            | Crowded globally                                                                                                      | [C]  |
| Formation, The Formation                           | Out                            | "Company formation" is a whole legal-services category; can't be registered                                           | [Q]  |
| Squadform, Formfield, Pitchkit, Splitkit, Payshape | Weak                           | Workable but forgettable                                                                                              | [C]  |
| Naira Tactics                                      | Reserve                        | Clear, but tied to one currency and sounds like a trading-tips channel                                                | [X]  |
| Pocket Lineup, Pocket Formation, Pocket Season     | Out                            | PocketApp is already an established Nigerian money brand                                                              | [X]  |

### 4.2 Eleven ("XI") names

| Name                                        | Verdict      | Why                                      | From   |
| ------------------------------------------- | ------------ | ---------------------------------------- | ------ |
| **Money XI**                                | **Test set** | §2                                       | [Q]    |
| ★ Salary XI                                 | Reserve      | The most precise description; a bit flat | [Q]    |
| MyXI, Steady XI, Home XI, Stash XI, XI Plan | Weak         | Same unclear pronunciation, less meaning | [C]    |
| Payday XI                                   | Out          | Payday collision                         | [Q][C] |
| Starting XI, First Eleven, Eleven           | Out          | Live football apps, a token, ElevenLabs  | [Q]    |
| Nairaxi, Owaxi                              | Weak         | Spelling and native-speaker risk         | [C]    |

### 4.3 Results and outcome names

| Name                                       | Verdict                     | Why                                                                                                                                      | From |
| ------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Goal Difference**                        | **Test set (lead)**         | §2.1                                                                                                                                     | [Q]  |
| ★ One Nil                                  | Reserve, as a campaign line | Elegant pragmatic-win idea, but "nil" means zero balance on a money app, and non-fans miss it. Use it as a line: "One-nil. Every month." | [Q]  |
| ★ Goalstead                                | Reserve                     | Room to grow, but the meaning is fuzzy and the football link is faint; also near "Goalward"                                              | [X]  |
| Clean Sheet                                | Feature name                | Crowded as a brand (construction SaaS and others); perfect as the in-app metric                                                          | all  |
| Stoppage                                   | Weak                        | Evocative, but "stoppage" also means a cut-off or a halt in payments                                                                     | [Q]  |
| Goalbound                                  | Out                         | Roblox football game (§3)                                                                                                                | [C]  |
| Table Top, Promotion, Form Guide, Campaign | Weak                        | Crowded, generic, or editorial-feature names                                                                                             | [C]  |
| Relegation, Offside Money, Reserve Side    | Out                         | Fear-based or second-best framing                                                                                                        | [C]  |

### 4.4 Nigerian and Pidgin names

| Name                                                                | Verdict                   | Why                                                                                            | From   |
| ------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| **Kobopitch**                                                       | **Test set (wildcard)**   | §2                                                                                             | [X]    |
| ★ Brollant                                                          | Reserve                   | Warm Pidgin for cash that nobody owns, but dated and hard for non-Nigerians                    | [Q]    |
| Kobo Lineup, Kobo Tactics, KoboKick, KoboGoal                       | Weak                      | Kobo-prefix crowding; KoboKick sounds like a game                                              | [X]    |
| Owoform, Egbepay, Ajeform, Orokit                                   | Native-speaker test first | Tone carries meaning (_ajé_ vs _àjẹ́_); Owo Planner already exists as a Nigerian income planner | [C][X] |
| Gidi Plan, Correct Pay, No Dulling, Bye Sapa                        | Campaign lines            | Great voice, weak exclusive brands                                                             | [C][Q] |
| Ball Don Land                                                       | **Tagline**               | The salary-lands moment in three words (§5)                                                    | [Q]    |
| Ajo, Esusu, Igudu, Alajo, Esusu XI, Ajo Pitch                       | Out                       | Generic rotating-savings words, crowded, and they signal a group-savings product               | all    |
| Kolo, Oba, Oriki, Gbedu, Shaku, Small Small, No Wahala, Japa Buffer | Out                       | Taken (KoloPay, Oba MFB, UBA No Wahala), loaded, or generic speech                             | [Q][C] |

### 4.5 Ritual, coach and squad names

| Name                                                        | Verdict       | Why                                                                                             | From   |
| ----------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- | ------ |
| Matchpay, Paykick, Kickpay, Matchwage, Seasonpay, Payleague | Weak          | "Pay" plus a sport word reads as a payments or fee tool; Payleague sounds like a betting league | [C]    |
| Matchday, Pre-Season, Gaffer, Sideline, Touchline           | Feature names | Matchday is the FA app and others; Gaffer is a live tactics app. They work as in-app moments    | [Q][C] |
| Squadron, Squadwealth, Salary Squad, Purpose FC             | Weak          | Military, on-the-nose, or mistaken for a real club                                              | [C][X] |
| Paycoach, Drillpay, Manager Mode                            | Weak          | Generic "coach" market; game-mode cue                                                           | [C]    |

### 4.6 Coined and abstract names

| Name                                                                                                | Verdict | Why                                                                                                                                  | From |
| --------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| Pixa, Elvena, Squava, Monduo, Levora, Balansa, Wageo, Kikoff, Pitchly, Rondo, Cadence, Veldt, Tikki | Weak    | Ownable but empty. Each needs months of teaching, and several fail the hearing test (Kikoff, Squava) or are crowded (Rondo, Cadence) | [C]  |
| Tactworth, Salaryside                                                                               | Weak    | Hard consonant join; sounds like a side-income service                                                                               | [X]  |
| Xlotti                                                                                              | Out     | Lotto cue                                                                                                                            | [C]  |

---

## 5. Name hierarchy: what names what

The brand doesn't have to carry every idea. Football language lives in the layers below it. [X]

| Layer                             | Name                                                            | Notes                                                       |
| --------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| **Brand**                         | _Chosen from the test set_                                      |                                                             |
| **Descriptor**                    | "Salary planning, football-style" / "Your salary, in formation" | Always shown under the brand on stores and the landing page |
| Monthly ritual                    | **Matchday**                                                    | Feature only; not a brand                                   |
| Plan                              | **Your XI** / **your formation**                                |                                                             |
| Mid-month check                   | **Half-time**                                                   |                                                             |
| Change plan                       | **Change tactics**                                              | The button still says "Update plan" (unified report §4.2)   |
| Habit metric                      | **Clean Sheet**                                                 |                                                             |
| Irregular family and social calls | **Away Days**                                                   | Not "Urgent 2k" (§3)                                        |
| Coach notes                       | **The Gaffer**                                                  |                                                             |
| Year                              | **Season** / **Season finale**                                  |                                                             |
| Subscription                      | **Season Ticket**                                               |                                                             |
| Pidgin celebration                | "Formashon don set!" · "Ball don land!"                         | Celebrations and marketing only                             |

**Tagline bank** (pair any of these with the chosen brand):

| Line                               | Register                                     | From           |
| ---------------------------------- | -------------------------------------------- | -------------- |
| Give your pay a game plan.         | Main tagline (product and stores)            | unified report |
| Defence first. Then attack wealth. | Principle                                    | [C]            |
| Your pay, in formation.            | Mechanism                                    | [X]            |
| Give every kobo a role.            | Local (pairs with Kobopitch, or works alone) | [X]            |
| Ball don land. Set your XI.        | Pidgin payday campaign                       | [Q]            |
| One-nil. Every month.              | Pragmatic-win campaign                       | [Q]            |
| No gaps in the back line.          | Campaign                                     | [C]            |
| Don't play your salary on vibes.   | Campaign                                     | [C]            |
| No wager. Just your eleven.        | Anti-betting guardrail                       | unified report |

---

## 6. How to decide

### 6.1 The test (about 10 salary earners, a mix of football fans and non-fans) [X][C][Q]

1. **Hear it.** Say each of the five names aloud _without_ showing the spelling. Ask: "Write down what you heard." "What do you think this app does?" "Does it sound like it holds your money, lends money, or involves betting?"
2. **Understand it.** Show each name with the _same_ descriptor and the same 20-second demo. Ask: "What would this help you do?" "Would you recommend it out loud?"
3. **Remember it.** After an unrelated task, ask which names they remember unaided.
4. **Say it.** Ask each person to finish the sentence _"I put my salary in my \___"_ out loud. Watch for hesitation or embarrassment. [Q]
5. **Score it** on [C]'s sheet, 1–5 for each: clarity without explanation · football cue without betting cue · trust for salary money · ease in Nigerian English and Pidgin · how ownable it feels · stretch to seasons and goals.

**Decision rule** [U]:

- A challenger replaces Payday Pitch only if it matches it on hearing and understanding _and_ beats it on recall or trust.
- If Goal Difference and Paytactic tie, choose Goal Difference if the trademark check clears, and Paytactic if it doesn't.
- Any name that more than one or two people link to betting, loans or a bank is out, whatever its other scores.

### 6.2 Legal and availability checks on the final one or two [X][Q][C]

1. A trademark attorney searches the Nigerian Trademarks Registry in **classes 9 (software) and 36 (financial services)**, plus the [WIPO Global Brand Database](https://www.wipo.int/en/web/global-brand-database) if you plan to expand abroad.
2. Confirm domains with a registrar (`.com` / `.app` / `.ng`). **Don't let a free domain decide the name.** [X]
3. Check handles on Instagram, TikTok, X and WhatsApp Business.
4. Search the App Store and Play Store for the name, its sound-alikes and its misspellings (Paytactics, Goal Diff, Money 11).
5. Re-check for betting-brand collisions at launch (Ginger Bet and BetJara were the examples found). [Q]

### 6.3 What the decision changes

The logo territories in the unified report (§4.6) depend on the name. **Formation-dot** and **allocation bands** work with any name. **Pitch monogram "P"** only works if a P-name wins. Goal Difference would open a **"GD" monogram** territory. So lock the name before any final logo work.

---

## 7. Questions only the founder can answer

1. **Do you have a personal veto or a favourite?** A personal veto beats any research ranking. [C]
2. **Must "pay", "salary" or "naira" be in the name,** or can the descriptor carry the money meaning? [C]
3. **Global or Nigerian sound?** If diaspora and other markets matter, Kobopitch and Formashon carry less weight. [C][X]
4. **Do the company name and the app name have to be the same?** A legal entity name doesn't have to match the brand. [C]
5. **Can you live with the "Payday" fintech in your home market** if Payday Pitch wins the test? [U]

---

## 8. Sources

- **Collisions found while merging:** [Payday: $3M seed led by Moniepoint (TechCrunch)](https://techcrunch.com/2023/03/29/payday-wants-to-power-the-future-of-work-for-africa-with-3m-seed-led-by-moniepoint-inc) · [Payday and Starlink (TechCabal)](https://techcabal.com/2023/02/20/how-nigerians-are-currently-being-helped-by-payday-to-pay-for-starlink/) · [Kobo360 $30M raise (TechCrunch)](https://techcrunch.com/2019/08/14/nigerian-logistics-startup-kobo360-raises-30m-backed-by-goldman-sachs/) · [Kobo360 profile (Technext)](https://technext.ng/2018/11/16/meet-kobo360-the-uber-like-startup-changing-nigerias-logistics-space/) · Goalbound on Roblox (search results, 26 Oct 2026).
- **DNS check:** `dig` NS and SOA lookups on .com, .app, .ng and .com.ng for ten names, 26 Oct 2026.
- **From [X]:** [PocketApp](https://pocketapp.com/) · [Pitchwise (football)](https://www.pitchwise.ai/) · [Pitch Pocket](https://www.pitchpocket.io/) · [SquadFolio](https://squadfolio.tech/) · [Goalward](https://goalward.io/) · [Paystead Ltd (Companies House)](https://find-and-update.company-information.service.gov.uk/company/17484830) · [Owo Planner](https://owoplanner.com/) · [WIPO Global Brand Database](https://www.wipo.int/en/web/global-brand-database).
- **From [Q]:** [Ginger Bet](https://x.com/GinjaBet/) · [BetJara](https://betjara.ng/) · [UBA No Wahala loan](https://www.ubagroup.com/nigeria/personal-banking/loans-payments/no-wahala-loan/) · [KoloPay](https://kolopay.com/) · [FA Matchday app](https://apps.apple.com/gb/app/matchday-by-england-football/id1401913451) · [Skipper Money](https://www.skippermoney.com.au/) · [Keeper Security](https://apps.apple.com/us/app/keeper-password-manager/id287170072) · [Visa Financial Football](https://play.google.com/store/apps/details?id=com.visa.financialfootball) · [Man Utd v SEGA on naming](https://www.theguardian.com/football/2020/may/22/manchester-united-sues-football-manager-makers-over-use-of-name).
- **From [C]:** SquadPay (`squadpay.app`), PitchPay (`pitchpay.net`), MatchDayHQ and Formatio (club-fee tools) · [Wekeza: a precedent for local-meaning brands](https://www.wekeza.com/our-story-of-the-african-diaspora/).

### 8.1 Collision register

So nobody suggests these again. Merged from all three reports:

| Name                                                                  | Problem                                                                             | From   |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| Payday (prefix)                                                       | Existing Nigerian fintech; payday-loan association                                  | [U][Q] |
| Kobo (prefix)                                                         | Kobo360 (KoboSafe, KoboCare), Rakuten Kobo                                          | [U]    |
| Goalbound                                                             | Roblox football game                                                                | [U]    |
| Matchday                                                              | FA app, Messi-backed web3 game, matchday.com                                        | [Q]    |
| Keeper · Eleven · Starting XI / First Eleven                          | Keeper Security · ElevenLabs · live football apps and a token                       | [Q]    |
| Skipper · Regista · Advantage · Captain                               | Skipper Money (AU financial wellness) · Nigerian business app · BofA · ride-hailing | [Q]    |
| Ginger · Jara                                                         | Ginger Bet · BetJara and JARA CASH (betting and loans), disqualified                | [Q]    |
| No Wahala · Oba · Kolo · Oriki · Gbedu                                | UBA loan · Oba MFB · KoloPay and Kolomoni · wellness group · music platform         | [Q]    |
| Gaffer · Playmaker · Total Football · Libero                          | Tactics app · US Bank campaign · Cruyff estate · webmail                            | [Q]    |
| Pitchwise · Pitch Pocket · SquadFolio · Goalward · Paystead · Payline | Existing sports, software or payments uses                                          | [X]    |
| PocketApp (Pocket-) · Owo Planner (Owo-)                              | Established Nigerian money brands                                                   | [X]    |
| SquadPay · PitchPay · MatchDayHQ · Formatio                           | Existing payment or club-fee tools                                                  | [C]    |
| Formation · Clean Sheet · Fixture · Set Piece · Whistle · Terrace     | Crowded, common phrases; use as features at most                                    | [Q][C] |
