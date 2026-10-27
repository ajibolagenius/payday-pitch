# Payday Pitch: fresh product, brand, and mobile research

**Research date:** 26 October 2026  
**Status:** discovery report; recommendations for discussion, not an approved specification  
**Deliverable:** research and documentation only
**Agent:** Codex

## How to use this report

The brief is the starting point: help salary earners use a football formation to give their pay purposeful roles and make progress towards wealth. This report explores what that product could become, its possible visual identities, a mobile-first experience, and a coherent approach to language, typography, graphics, and marketing.

The application implementation, existing product specs, and existing design system were deliberately excluded. Earlier brand choices were not treated as constraints. The evidence consists of the supplied `docs/assets/web_resources` collection, public product documentation, primary design guidance, and the researcher's interpretation. No application code was changed.

The proposed palettes, screen structures, feature priorities, and commercial packages are **design hypotheses**. They have not been tested with customers. Competitor documentation establishes that a pattern exists; it does not establish demand for the same pattern here. Nigeria appears in examples because it makes the scenarios concrete, not because the founder's nationality determines the target market. Markets, currencies, audience, and financial services scope remain to be confirmed.

Read the opening recommendation first, then use these sections according to the decision at hand:

1. [Product opportunities and a recurring reason to return](#1-product-opportunities-and-a-recurring-reason-to-return)
2. [Visual direction catalogue](#2-visual-direction-catalogue)
3. [Mobile-first experience and screen concepts](#3-mobile-first-experience-and-screen-concepts)
4. [Brand, copy, typography, graphics, and marketing](#4-brand-copy-typography-graphics-and-marketing)
5. [Discovery questions and validation plan](#5-discovery-questions-and-validation-plan)
6. [Resource audit and research sources](#6-resource-audit-and-research-sources)

## Opening recommendation

**Explore Payday Pitch as a personal money-management season: plan on payday, follow through during the month, adjust when life changes, and review progress before the next payday.** Football gives this routine a memorable structure. The financial experience must explain what each action means in real life.

The strongest initial product hypothesis is a planning and follow-through companion that works alongside the user's existing accounts. Start by testing whether people actually use and revisit the plan. Reading bank data, moving money, holding balances, and selling investments are separate product decisions, with different expectations and operating requirements.

Five recommendations lead the report:

- **Extend the core loop before expanding the catalogue.** Add commitments, due dates, progress, and adjustment to salary allocation. These are connected reasons to return; a news feed or unrelated rewards programme would introduce another product to maintain.
- **Make the formation a tool for priorities.** A position represents a purpose; changing a position should help explain a change in priorities. A formation name must never silently prescribe an investment percentage or level of financial risk.
- **Use expressive branding with precise financial presentation.** Distinctive colour, type, illustration, and football geometry can coexist with legible amounts, quiet forms, explicit statuses, and clear confirmations.
- **Design the recurring mobile tasks first.** Test setting up a month, checking the next commitment, changing a plan, and reviewing progress. Explore the desktop equivalents early enough to discover comparison and editing needs.
- **Earn a subscription through continuity and better decisions.** Scenario comparisons, useful history, household coordination, and credible progress summaries are stronger premium hypotheses than extra badges or colours alone.

For visual exploration, three especially useful alternatives are **Colour-Block Club**, **Modern Club Editorial**, and **Financial Atlas**. They express different balances of football culture, warmth, and analytical clarity. **Floodlight Studio** and **Collectible Progress** are additional directions worth testing if the audience responds to a stronger sporting or playful identity. None has been selected by this report.

### What the evidence supports, and what remains unknown

| Question                                                         | Current confidence                | Why                                                                                                                                                                                                 |
| ---------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can salary allocation support a richer product loop?             | Strong conceptual case            | Bills, goals, adjustments, and reviews connect directly to the original task. Their relative importance still needs customer research.                                                              |
| Can colourful sport branding coexist with functional typography? | Supported as a design possibility | The Premier League typography case explicitly addresses both expressive branding and small-screen numerical clarity. It is a precedent, not evidence of financial trust. [Monotype case study][S08] |
| Is mobile-first the right sequence?                              | Strong working hypothesis         | The proposed recurring tasks fit short phone sessions. Device preference and setup behaviour have not been measured.                                                                                |
| Is a formation easier than a conventional budget?                | Unknown                           | The metaphor could reduce anxiety or introduce translation work. Compare both presentations in testing.                                                                                             |
| Will users pay, and how much?                                    | Unknown                           | No interviews, pricing tests, or revealed purchase behaviour were collected.                                                                                                                        |
| Does the supplied resource folder define one complete identity?  | No                                | It contains several distinct visual families and incomplete font/licence coverage. See the asset audit.                                                                                             |

## 1. Product opportunities and a recurring reason to return

### 1.1 Define success in terms of the user's life

“Split my salary” describes an activity. A more useful outcome is: **I know what this pay must cover, what I can act on now, and whether my future priorities are progressing.**

The CFPB's financial well-being research identifies four dimensions: control over current finances, resilience to shocks, progress towards goals, and freedom to make valued choices. These offer a useful product lens, while the original research context is the United States and should not be treated as local audience validation. [CFPB framework][S01]

Translate that lens into questions the app can answer:

| User question                                          | Product responsibility                                             | Meaningful outcome to investigate         |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------- |
| What must this salary cover before I get paid again?   | Identify amounts, priorities, and dates                            | Fewer forgotten commitments               |
| What should I do with the money today?                 | Turn a plan into an ordered checklist                              | More intended actions completed           |
| Can I change this without hurting something important? | Explain consequences before saving a change                        | More informed adjustments                 |
| Am I becoming more financially resilient?              | Show contributions, accessible reserves, and obligations over time | Better visibility of progress and gaps    |
| Can I enjoy some of my pay?                            | Make discretionary spending a legitimate purpose                   | Less uncertainty around planned enjoyment |

These are proposed outcomes. The app cannot promise wealth, positive investment returns, or relief from an income shortfall simply because it organises a salary well.

### 1.2 Audience hypotheses to investigate

Choose a first audience based on need and willingness to adopt a routine, not on a broad label such as “young professionals.”

| Audience hypothesis                  | Recurring difficulty                           | Potential fit                                    | Main research question                                          |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| First few years of steady income     | Every payday feels like a reset                | Simple routine and visible progress              | Is the problem deciding, remembering, or having enough?         |
| Established earner supporting others | Personal goals compete with family obligations | Explicit support commitments and trade-offs      | What must remain private, and which obligations are negotiable? |
| Earner handling debt                 | Debt, living costs, and goals compete          | Minimum-payment planning and repayment scenarios | What information can users provide accurately?                  |
| Earner with several savings goals    | Money is saved but its purposes overlap        | Clear goal funding and progress                  | Will users maintain this manually?                              |
| Household with more than one income  | Different paydays and responsibilities         | Shared planning and permissions                  | Is joint planning wanted, or would it create friction?          |
| Football-oriented professional       | Conventional finance tools feel remote         | Familiar managerial language                     | Does football improve comprehension after the novelty fades?    |

Football enthusiasm is a useful research dimension. It should not substitute for understanding the financial task. Include people with different genders, football familiarity, abilities, and household arrangements in discovery.

### 1.3 The recurring loop

**Prepare → allocate → act → check → adjust → review → prepare again.**

| Moment                    | Financial job                                   | Football expression                       | Reason to return                                    |
| ------------------------- | ----------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| Before payday             | Update expected pay and upcoming commitments    | Prepare the squad                         | A new bill or priority changes next month's plan    |
| Payday                    | Confirm received income and assign purposes     | Set the formation                         | Decide what this money needs to do                  |
| Immediately after         | Follow the intended payment and saving steps    | Put the plan into play                    | Complete an actionable checklist                    |
| During the month          | Check a due date or record a contribution       | Check the next fixture                    | Answer a specific question quickly                  |
| When circumstances change | Compare and save an adjustment                  | Change tactics                            | Keep the plan useful when it stops matching reality |
| Before the next payday    | Review what happened and carry learning forward | Review the month; optional season summary | Improve the next plan without starting again        |

This does not imply daily app use. For some users, a useful month may consist of one planning session and a few short check-ins. Optimise for successful decisions and sustained use across pay cycles, not maximum time inside the app.

### 1.4 Product opportunity catalogue

“First research slice” means an idea worth including in an early prototype, not a commitment to build it. “Next” depends on evidence from the core loop. “Later” means a separate capability with additional complexity.

| Opportunity                          | User benefit and football expression                                  | Suggested horizon                        | What would validate it?                                              |
| ------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Payday plan                          | Allocate real take-home pay to purposes; set the lineup               | First research slice                     | People finish a realistic plan and explain it correctly              |
| Commitments calendar                 | Show amounts due before the next pay; upcoming fixtures               | First research slice                     | People spot a future cash gap they otherwise miss                    |
| Follow-through checklist             | Record payments or transfers made elsewhere; put the plan into play   | First research slice                     | Users return to record meaningful actions without excessive effort   |
| Mid-month adjustment                 | Show what changes when money is reassigned; change tactics            | First research slice                     | Users can resolve an unexpected expense without double-counting      |
| Month review and repeat              | Compare intentions with recorded activity; review and prepare         | First research slice                     | A second plan is easier and more accurate than the first             |
| Accessible cash reserve              | Track a user-defined buffer separately; goalkeeper role               | Next                                     | Users understand available cash versus an earmarked target           |
| Annual and irregular bills           | Build towards rent, insurance, fees, repairs; prepare future fixtures | Next                                     | Users prioritise these before deadline pressure arrives              |
| Debt repayment view                  | Track required payments, extra payments, and remaining debt           | Next                                     | Users understand the difference between a payment and debt reduction |
| Goals with dates                     | Set contributions against a purpose and date; season objective        | Next                                     | Targets influence monthly decisions rather than remaining decoration |
| Alternative plans                    | Compare two allocations before accepting one; tactical options        | Next / premium candidate                 | Users make a choice they can explain and want to revisit             |
| Raise and bonus planner              | Deliberately allocate additional income                               | Next                                     | Users report or demonstrate a recurring need beyond normal payday    |
| Late or partial salary plan          | Separate expected pay from money received                             | Next; basic state belongs in first slice | The flow remains useful without pretending the full salary arrived   |
| Family-support planning              | Make recurring and occasional support explicit                        | Next                                     | Users say this helps represent their actual obligations              |
| Weekly check-in                      | Ask only about changes or upcoming decisions                          | Next                                     | It improves follow-through without creating notification fatigue     |
| Contextual learning                  | Explain a relevant concept at the decision point; coach's note        | Next                                     | Users understand and act without needing a separate course           |
| Contribution history                 | Show repeated actions towards chosen goals                            | Next / premium candidate                 | Users use the history to adjust a plan                               |
| Pay-cycle forecast                   | Estimate future commitments and planned contributions                 | Next / premium candidate                 | Inputs are reliable enough and uncertainty is understood             |
| Salary-change scenario               | Explore a salary reduction, leave, or new recurring expense           | Next / premium candidate                 | Users value the comparison before a real decision                    |
| Household planning                   | Shared responsibilities with private and shared views                 | Later / premium candidate                | Both parties want it and understand visibility rules                 |
| Account and CSV import               | Reduce manual maintenance                                             | Later                                    | Repeated use is limited by entry effort rather than lack of value    |
| Net-worth view                       | Distinguish assets, liabilities, and earmarked cash                   | Later                                    | Users can supply trustworthy balances and understand changes         |
| Optional accountability partner      | Share chosen progress with one trusted person                         | Later                                    | Users request support without pressure to disclose balances          |
| Employer financial-wellness offering | Offer access as a benefit                                             | Later business experiment                | Employees trust the separation from employer visibility              |
| Professional review                  | Let a qualified human review a plan within a defined service          | Later                                    | Clear demand, service quality, and viable delivery cost              |
| Money movement and automation        | Execute approved saving or payment actions                            | Separate product decision                | Strong repeated demand plus feasible provider and operating model    |
| Investment-provider integration      | Connect an intended contribution to an actual investment service      | Separate product decision                | Clear user demand and appropriate market-specific service design     |

Several of these already exist in adjacent categories. YNAB illustrates prioritising the money someone has and anticipating less frequent expenses. Monarch's current Goals documentation separates saving towards something from paying down debt. Cowrywise distinguishes accessible emergency savings from locked plans. These are useful functional distinctions to learn from, rather than a checklist to copy. [YNAB guide][S02], [Monarch Goals][S03], [Cowrywise savings plans][S04]

### 1.5 Keep the football model financially coherent

Use a small, stable vocabulary that has an exact financial interpretation:

| Football term  | Suggested meaning                                     | Boundary                                                                                      |
| -------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Formation      | The current arrangement of financial purposes         | A formation name alone does not prescribe percentages                                         |
| Position       | One purpose or a group of closely related purposes    | Do not require people to invent categories to fill a pitch                                    |
| Goalkeeper     | A cash-reserve purpose                                | Specify whether cash is actually accessible; an investment is not automatically a cash buffer |
| Defence        | Essential commitments and required payments           | Explain the actual purpose and due date                                                       |
| Midfield       | Day-to-day flexibility and nearer-term priorities     | Flexible does not mean unimportant                                                            |
| Attack         | Longer-term ambitions and chosen growth contributions | The position does not imply higher-risk investments                                           |
| Fixture        | A dated bill, contribution, or financial event        | Always show the real-world label                                                              |
| Change tactics | Adjust allocations after seeing the effects           | Saving a plan change does not execute a bank transfer                                         |
| Season         | A user-chosen period for reviewing progress           | Personal finances continue outside a football calendar                                        |
| Coach's note   | A contextual explanation or suggestion                | Show its basis; do not imply guaranteed personalised financial advice                         |

Three possible formation models deserve comparison:

1. **Flexible purposes on a recognisable pitch.** Strongest initial usability hypothesis. People add the purposes they actually need. Roles are grouped into football lines; empty space is allowed.
2. **An eleven-position squad with grouped detail.** Strongest literal football identity. Each position can contain several related items. Risk: maintaining an arbitrary visual count introduces extra work and hides detail.
3. **Formation as a summary of a conventional plan.** Strongest control condition. The underlying plan is a clear list; the pitch provides a visual summary. Risk: football becomes decorative if the pitch never helps a decision.

Test all three with the same task. The first is a provisional recommendation, not a settled decision about how much football the founder wants.

If eleven positions are essential to the concept, let the user group actual purposes into positions without changing their amounts. Explain the grouping. Do not split one financial goal into several artificial goals merely to populate a 4–3–3.

#### Rules for the financial experience

- Base an active allocation on money available to plan. Keep expected future income separate.
- Ask about net take-home pay so payroll deductions are not silently counted twice.
- Identify prior earmarked balances before treating carryover as new spending capacity.
- Keep planned, recorded, and externally verified activity distinguishable.
- Treat required debt payments as commitments. Do not assume someone can clear their entire outstanding debt with one salary.
- Allow essentials to exceed income. Show the shortfall and support prioritisation; do not manufacture a positive savings contribution.
- Separate accessible reserves, money saved towards a known bill, and long-term investments.
- Never count a transfer between a person's accounts as new income or automatically as wealth created.
- Make any forecast's inputs, missing information, and assumptions available.
- Let users change a plan without describing necessary spending as a failure.

These are proposed product rules. Detailed repayment or investment guidance would require additional, market-specific research before it becomes a customer-facing service.

#### Worked illustration: one salary, several jobs

**Illustrative data, not a recommended allocation:** NGN 600,000 received for a pay cycle.

| Purpose                                  |          Amount | Pitch grouping         |
| ---------------------------------------- | --------------: | ---------------------- |
| Living costs: bills, food, and transport |     NGN 200,000 | Defence                |
| Contribution towards a future rent bill  |      NGN 80,000 | Defence                |
| Required debt payment                    |      NGN 50,000 | Defence                |
| Family support                           |      NGN 40,000 | Midfield               |
| Flexible personal spending               |      NGN 75,000 | Midfield               |
| Accessible reserve contribution          |      NGN 80,000 | Goalkeeper             |
| Long-term goal contribution              |      NGN 75,000 | Attack                 |
| **Total assigned**                       | **NGN 600,000** | **Nothing unassigned** |

The pitch is explaining a plan with seven purposes; it does not need eleven different financial products. The rent contribution is money set aside for a future expense. The long-term contribution is an intention until recorded as completed. Neither should automatically appear as investment returns or verified wealth growth.

If only NGN 400,000 arrives, the app should show the NGN 200,000 gap against the draft plan and ask what to change. If food costs rise by NGN 20,000, an adjustment should identify the purpose that provides that amount and the consequence for that purpose. It should never silently reduce the reserve or a debt payment.

### 1.6 Premium usefulness and business-model options

“Premium” has two meanings: a quality of experience and a paid package. Everyone needs trustworthy amounts and clear recovery from mistakes. Charge for additional ongoing utility that customers can recognise.

| Possible package          | User-facing proposition                    | Capability hypothesis                                                         | Main risk                                                                     |
| ------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Core                      | Know what this pay needs to cover          | Current plan, basic goals, adjustments, and review                            | If restricted too heavily, the free experience cannot prove the habit         |
| Plus                      | Make better plans over time                | Alternative plans, extended comparisons, richer progress summaries, forecasts | Value may be occasional rather than subscription-worthy                       |
| Household                 | Coordinate without losing personal control | Shared purposes, responsibilities, permission controls                        | Collaboration can expose information or create interpersonal pressure         |
| Supported planning        | Get a useful human review                  | A defined review session or service                                           | Cost, quality, and service boundaries need separate validation                |
| Employer-sponsored access | Use the product through a benefit          | Access paid by an employer; individual financial details remain private       | Trust can collapse if employees assume salary plans are visible to management |

Monarch publicly sells ongoing planning and reporting capabilities; Strava sells deeper progress and analysis in a sporting context. They illustrate possible packaging patterns, not comparable purchasing power or willingness to pay in the intended market. [Monarch pricing and capabilities][S06], [Strava subscription][S07]

Do not set a price from these references. First test the problem, the frequency of value, and which specific capability someone would pay to keep. Ask about existing subscriptions and alternatives; stated enthusiasm alone is weak evidence.

Avoid charging extra for understanding a critical warning, correcting an amount, accessing basic support, or retrieving a user's own records. These are product recommendations about trust, not claims about competitor policy.

### 1.7 Ideas to defer unless customers pull them into scope

- A football news feed: creates content operations without necessarily improving a salary decision.
- Public wealth rankings: risks confusing income advantage with good financial choices.
- Rewards for investing more aggressively: conflicts with understandable, user-controlled risk decisions.
- A conversational AI surface as the entire product: introduces ambiguity into amounts, actions, and provenance. A bounded explanation feature is a more testable later idea.
- Club-specific live scores as the home-screen centrepiece: competes with the user's next financial action.
- Complex achievement currencies, trading cards, or paid random rewards: adds a second economy before the first routine is useful.
- Holding deposits simply to increase engagement: changes the service substantially and should follow an explicit business decision.

## 2. Visual direction catalogue

### 2.1 What the supplied references actually suggest

The collection contains four overlapping visual interests:

1. **Compact, bold identity:** bright marks on dark or pale grounds, rounded app icons, and geometric wordmarks in `Logo-Idea-Concept.png`.
2. **Human, aspirational illustration:** travel objects, people, buildings, movement, and broad colour fields in `Visual-Style-Concept.png` and the luggage image.
3. **Tactile, modular play:** shaped widgets, colourful buttons, sticker-like symbols, and collectible objects in `shapes-ideas-concept.png` and `hello-colorful.jpg`.
4. **Confident type and composition:** expressive display specimens, geometric sans references, and a restrained isometric landing-page example.

These are observations about the supplied images. Their original provenance is mostly unverified. A Pinterest screenshot is a board of references, not a licensed component library.

### 2.2 Thirty-two materially different directions

Each direction below has a different organising idea. These are options to discuss, rather than thirty-two variations of a dashboard card.

| #   | Direction                        | Visual grammar and typography                                                        | How it could serve Payday Pitch                                    | Main tension                                                     |
| --- | -------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 1   | **Colour-Block Club**            | Bold fields, precise geometric type, simple shapes                                   | Financial roles form a recognisable set of coloured modules        | Too many colours can obscure hierarchy                           |
| 2   | **Modern Club Editorial**        | Warm paper, strong headlines, generous spacing, portraits                            | A personal monthly plan feels like a well-edited club publication  | Needs discipline to remain a useful tool                         |
| 3   | **Financial Atlas**              | Diagram legends, routes, fine grids, clear numerical labels                          | Show how this salary connects to future commitments and goals      | Can become cold or overly diagrammatic                           |
| 4   | **Floodlight Studio**            | Ink surfaces, illuminated accents, crisp light type                                  | A focused tactics room for financial decisions                     | Easily drifts towards esports or trading terminals               |
| 5   | **Collectible Progress**         | Original illustrated tokens, album frames, restrained badges                         | Contributions build a personal story over several months           | Novelty can overpower the money task                             |
| 6   | **Broadcast Clarity**            | Scoreboard numerals, lower-third labels, horizontal bands                            | Due dates and changes are presented with immediate status clarity  | Could look like live betting if signals are mishandled           |
| 7   | **Training Journal**             | Ruled notes, practice logs, modest stamps, readable humanist type                    | Emphasise improvement and review over one perfect month            | Risks looking unfinished or overly manual                        |
| 8   | **Club Membership**              | A restrained crest, member cards, rich colour, formal spacing                        | Belonging, identity, and a long-term relationship with the product | Must not imply a bank, insurer, or real club affiliation         |
| 9   | **Contemporary Sports Magazine** | Editorial grids, large cropped type, high-quality photography                        | Mix useful financial stories with a clear planning tool            | Content production could become expensive                        |
| 10  | **Precision Equipment**          | Instrument-like controls, sharply labelled scales, technical numerals                | Make amounts, limits, and consequences feel exact                  | Can become intimidating or militaristic                          |
| 11  | **Humanist Money Companion**     | Open letterforms, warm neutrals, accessible colour accents                           | Prioritise ease, reassurance, and everyday use                     | Needs a strong signature to avoid generic fintech                |
| 12  | **International Typographic**    | Strong grid, asymmetric type, few shapes, selective colour                           | Bring order to complicated commitments and comparisons             | Football identity must survive outside illustrations             |
| 13  | **Transit and Wayfinding**       | Routes, stations, interchange shapes, compact labels                                 | Explain upcoming financial events and changing destinations        | A route map may confuse time with money movement                 |
| 14  | **Payday Receipt**               | Clean ledgers, receipt edges used sparingly, factual headings                        | Make each plan and adjustment easy to review and retain            | Overuse can suggest cheapness or unnecessary accounting          |
| 15  | **Season Passport**              | Chapter tabs, date stamps, destination imagery                                       | Show progress towards life events over multiple pay cycles         | Travel metaphors may compete with football                       |
| 16  | **Kit and Textile**              | Jersey panels, seams, stripes, original patterns                                     | Turn financial role groups into a coherent graphic identity        | Pattern must never interfere with figures                        |
| 17  | **Terrace Poster**               | Bold condensed headlines, screen-print texture, club-culture energy                  | Strong acquisition campaigns and monthly statements                | Aggression and dense type can weaken trust                       |
| 18  | **Modernist Clubhouse**          | Architectural forms, timber/stone colour cues, quiet geometry                        | A considered, welcoming place for longer-term planning             | Can become too subdued for the colourful brief                   |
| 19  | **Isometric Financial World**    | Small constructed scenes, diagrammed spaces, clean sans                              | Explain how separate commitments fit together                      | Depth can hide labels and increase asset cost                    |
| 20  | **Flat Object Library**          | Consistent illustrations of everyday objects, plain backgrounds                      | Make goals tangible: rent, learning, travel, equipment             | Literal objects may oversimplify sensitive goals                 |
| 21  | **Sculptural Colour Objects**    | Bold 3D forms, clear lighting, restrained compositions                               | Memorable onboarding and milestones                                | Can feel like speculative crypto branding                        |
| 22  | **Soft Utility**                 | Rounded controls, gentle surfaces, warm approachable type                            | Reduce intimidation around starting and adjusting a plan           | Low contrast and excessive softness reduce precision             |
| 23  | **Ticket and Programme**         | Perforations, serial details, fixture cards, functional type                         | Turn a month's commitments into an understandable programme        | Decorative detail can overwhelm small screens                    |
| 24  | **Paper Cut Formation**          | Layered flat shapes, visible edges, limited texture                                  | An original pitch and role illustration language                   | Requires consistency between illustration and UI                 |
| 25  | **Digital Chalkboard**           | Thin pitch geometry, a few hand-marked annotations, clear sans                       | Make adjustments feel like deliberate tactical thinking            | Handwriting must stay out of financial data                      |
| 26  | **Community Mural**              | Commissioned local artwork, large colour planes, simple interfaces                   | Express a specific launch community without generic stock imagery  | Must follow actual audience research, not geographic assumptions |
| 27  | **Personal Emblem**              | User-chosen insignia, controlled colour combinations, compact marks                  | Give a plan identity through an original club-like emblem          | Personalisation can become setup friction                        |
| 28  | **Progress Ribbon**              | Continuous bands, chapter markers, restrained motion                                 | Show steady progression across several pay cycles                  | Continuous progress can misrepresent uneven financial life       |
| 29  | **Calendar First**               | Typographic dates, compact event groups, minimal ornament                            | Emphasise when commitments happen, rather than only totals         | The signature pitch needs a clear supporting role                |
| 30  | **Open Ledger**                  | Transparent totals, expandable explanations, minimal visual effects                  | Express trust through understandable financial relationships       | May look conventional unless graphic identity is distinctive     |
| 31  | **Illustrated Life Chapters**    | Editorial scenes of real aspirations, substantial typography                         | Connect monthly decisions to meaningful life outcomes              | Aspirational imagery can exclude ordinary or modest goals        |
| 32  | **Contemporary Club Archive**    | Album indexes, archival captions, considered colour, disciplined serif/sans contrast | Make past months worth reviewing as a personal financial record    | Historical styling can make a current task feel static           |

Do not combine all these directions. Choose one primary visual grammar, then decide which supporting elements it can absorb consistently. For example, editorial structure can accommodate a small original sticker library; a receipt system and a sculptural control system would need stronger reconciliation.

### 2.3 Five directions to develop further

The colour names below describe exploratory palettes. They are not accessibility-approved colour combinations. Final values must be tested in the actual text, chart, control, and focus states.

#### A. Colour-Block Club

**Thesis:** a serious personal planning tool with the visual confidence of a modern sports identity.

- **Palette:** deep aubergine or ink; warm white; lime, apricot, and lilac as supporting fields. Reserve red and amber semantics carefully so decorative colour does not masquerade as an alert.
- **Type:** Aspekta as the initial UI candidate; a more distinctive licensed display treatment for short campaign headlines if needed.
- **Shapes:** a small family of circles, clipped rectangles, and pitch-derived arcs. Each has a stable purpose.
- **First mobile screen:** a large factual plan summary, one next action, a compact formation overview, and a clear route to edit. Colour differentiates groups without decorating every surface.
- **Signature interaction:** select a purpose; its matching position and detail are highlighted together. Changing its amount shows the resulting totals before confirmation.
- **Marketing reach:** recognisable role tiles, concise headlines, high-contrast outdoor and social layouts.
- **Local evidence:** `89c0bdfa71129ea4ae7de3f2dbf46d13.jpg`, `hello-colorful.jpg`, and the logo board.
- **Honest risk:** a loud visual system can make a vulnerable financial moment feel trivial. Test the shortfall and error screens, not only the happy path.

#### B. Modern Club Editorial

**Thesis:** financial confidence presented with the care of a contemporary club magazine.

- **Palette:** ivory, forest or wine, ink, and one bright accent such as tangerine.
- **Type:** a crisp text sans for tasks; an optional restrained editorial face for major titles and longer stories. A second family is justified only if it contributes clearly.
- **Shapes:** strong alignment, generous margins, fine rules, small fixture labels, occasional full-width image panels.
- **First mobile screen:** “Your November plan” with the most important factual status, a concise next-step section, and a smaller lineup preview.
- **Signature interaction:** a monthly review reads as a short, annotated account of choices and changes, with direct links back to the relevant plan items.
- **Marketing reach:** original portraits and everyday financial stories; a salary plan as an editorial feature.
- **Local evidence:** the illustration board, the font references, and the quieter landing-page composition.
- **Honest risk:** a beautiful publication can hide the work. Editing an amount must still be direct, fast, and obvious.

#### C. Financial Atlas

**Thesis:** see where this salary needs to take you, and which choices connect the present to the future.

- **Palette:** pale mineral backgrounds, dark ink, cobalt or teal for navigation, and a small labelled category palette.
- **Type:** open, highly legible sans; tabular numerical presentation where the actual font supports it.
- **Shapes:** routes, nodes, legends, and labelled lines. A pitch is one useful map within the system.
- **First mobile screen:** the current pay cycle, available planning amount, next commitment, and a labelled path into goals.
- **Signature interaction:** compare a changed contribution with its previous plan and estimated goal date, with the assumptions visible.
- **Marketing reach:** clear diagrams explaining choices; educational graphics with little dependence on photography.
- **Local evidence:** `isometric-clean-landing.webp`, structured widgets in the shapes board, and the geometry of `Mont.jpg`.
- **Honest risk:** too many paths create cognitive work. Use diagrams to answer one question at a time.

#### D. Floodlight Studio

**Thesis:** a focused planning environment with the atmosphere of a professional tactics room.

- **Palette:** charcoal and ink, warm near-white text, a restrained vivid green or acid-yellow identity accent, and muted supporting colours.
- **Type:** a functional sans with prominent, distinguishable figures; condensed display type only for short nonessential headings.
- **Shapes:** precise pitch markings, quiet dividers, stable panels; avoid constant glowing edges.
- **First mobile screen:** a legible salary-plan status and a single highlighted next decision. The board earns its area by explaining purpose relationships.
- **Signature interaction:** preview a tactical change with an explicit before/after breakdown.
- **Marketing reach:** dramatic original compositions and clean football geometry.
- **Local evidence:** dark icon treatments in the logo board and the dark mobile food-interface reference.
- **Honest risk:** visual overlap with betting, esports, or speculative trading. Ask customers what category they think the product belongs to before explaining it.

#### E. Collectible Progress

**Thesis:** small real financial actions accumulate into a personal record worth keeping.

- **Palette:** milk or pale grey, deep plum, and a controlled set of sunny yellow, leaf green, sky, and pink.
- **Type:** approachable sans for tasks; a bolder display weight for milestones.
- **Shapes:** original illustrated objects or emblems, flat frames, occasional tactile depth. Financial controls remain plainly labelled.
- **First mobile screen:** the next financial action leads. A small personal emblem or progress object supplies character.
- **Signature interaction:** completing a user-recorded contribution adds a dated event to a personal progress record. It never implies a bank verification that did not happen.
- **Marketing reach:** flexible sticker sets, milestone stories, original social campaigns.
- **Local evidence:** the shapes board, `hello-colorful.jpg`, and expressive mockup graphics.
- **Honest risk:** earned progress can become social pressure or busywork. Reward useful behaviours and returning after a disruption; do not punish a financially difficult month with lost status.

### 2.4 How to choose between them

The Premier League's identity and type projects show that sport can use a broad expressive palette while requiring type to work across tiny tables, large headlines, and different media. The transferable lesson is a coherent system with functional type, rather than copying its lion, palette, or proprietary font. [Premier League identity announcement][S09], [Monotype typography case][S08]

Compare three directions using the **same content and tasks**:

- A first payday plan.
- An ordinary mid-month check.
- A salary shortfall or an unexpected bill.

Ask what the product appears to do, what the next action is, whether amounts are understandable, what feels trustworthy, and which details make it recognisable. Ask for preference after the comprehension task, so visual attraction does not stand in for usability.

Avoid claiming that a particular hue creates trust by itself. Trust also depends on truthful language, understandable amounts, useful support, predictable behaviour, and the service keeping its promises.

## 3. Mobile-first experience and screen concepts

### 3.1 Mobile-first is a sequence and a constraint

Start with the smallest useful version of the recurring task. This encourages decisions about hierarchy, reading effort, input, and what deserves immediate visibility.

It does not establish that every task is easiest on a phone. A long household setup, editing several commitments, or comparing future plans may benefit from more space. The recommended sequence is **mobile task model first, early cross-size exploration, then detailed responsive layouts**. It is not a proposal to redesign the product twice.

Also distinguish mobile-first from native-first. A mobile website, an installable web app, and a native app have different installation, notification, and platform capabilities. The visual research can proceed without deciding the implementation; the product promise must eventually reflect the chosen platform's actual behaviour.

### 3.2 Session types

These are design targets to test, not measured usage data:

| Session    | Intent                                         | Initial design target                                |
| ---------- | ---------------------------------------------- | ---------------------------------------------------- |
| Setup      | Tell the app enough to produce a useful draft  | A short, saveable sequence; optional detail can wait |
| Payday     | Confirm income, make choices, review the plan  | One focused session with clear progress              |
| Check-in   | Find the next commitment or record a change    | One or two obvious actions                           |
| Adjustment | Understand the effect of an unexpected expense | A guided comparison and confirmation                 |
| Review     | Learn what to carry into the next cycle        | A short summary with relevant detail available       |

### 3.3 Suggested information architecture

Prototype four plainly named primary destinations:

| Destination  | User question                | Principal content                                              |
| ------------ | ---------------------------- | -------------------------------------------------------------- |
| **Today**    | What needs my attention?     | Current pay-cycle status, next due item, next useful action    |
| **Plan**     | How is this salary assigned? | Formation and list views of the same purposes; edit and review |
| **Goals**    | What am I working towards?   | Goal dates, contributions, accessible balances when known      |
| **Progress** | What has changed over time?  | Month reviews and contribution history, with data provenance   |

Profile, preferences, help, and privacy controls can be reachable through a consistent account entry. Do not give every future idea a permanent tab. If early research shows Goals has too little independent content, test three destinations and keep goals inside Plan until it earns a separate place.

Android's official guidance supports familiar layout/navigation pairings and three to five primary navigation destinations on compact screens, with adaptation on larger screens. Four destinations here are a product hypothesis within that pattern. Native dimensions and components should not be copied mechanically into a web interface. [Android layout and navigation guidance][S10]

### 3.4 Screen inventory and behaviour

| Screen or state          | What should be visible first                                      | Main action                                       | Detail that can wait                         |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Welcome / try a sample   | One concrete explanation of the money-and-football mechanism      | Explore a labelled sample or start a plan         | Full feature catalogue                       |
| Pay-cycle setup          | Take-home amount, currency, expected/received status, next payday | Continue                                          | Employer and other optional profile details  |
| Commitments              | Amount, purpose, frequency, due date                              | Add or edit a commitment                          | Advanced grouping                            |
| Initial draft            | What is covered, what remains, what is missing                    | Adjust priorities                                 | Formation styling                            |
| Formation                | Clear roles and recognisable spatial groups                       | Select a purpose or switch to list                | All category amounts at once                 |
| Purpose detail           | Real name, amount, status, and due date                           | Edit or record an action                          | History and explanations                     |
| Review plan              | Full amounts, totals, gaps, and consequences                      | Save plan                                         | Decorative imagery                           |
| Plan saved               | What was saved and what to do next                                | Open action checklist                             | Celebration                                  |
| Follow-through           | Intended external actions with truthful statuses                  | Record an action completed elsewhere              | Long-term statistics                         |
| Today                    | The most useful current fact and next action                      | Open that action                                  | Full pitch, charts, and education library    |
| Commitments calendar     | Upcoming items in date order                                      | Open an item                                      | Calendar-grid view if an agenda works better |
| Adjustment               | Added need, available alternatives, affected purposes             | Compare and confirm                               | Unrelated settings                           |
| Goal detail              | Target, date, planned contribution, recorded progress             | Update or contribute in the user's actual service | Speculative return estimates                 |
| Debt detail              | Remaining debt when known, required payment, due date             | Update or plan a payment                          | Complex projections before inputs exist      |
| Month review             | Planned versus recorded activity and incomplete data              | Carry forward a revised plan                      | Every transaction                            |
| Progress                 | A useful trend with clear dates and definitions                   | Explore a period                                  | Decorative trophy cabinet                    |
| Preferences and help     | Currency/date settings, notifications, privacy, support           | Change one preference or get help                 | Brand personalisation                        |
| Shortfall                | Size of the gap and commitments affected                          | Prioritise or revise                              | Cheerful illustration                        |
| No income received       | Expected income and available planning choices                    | Keep draft or record partial income               | False zero-spending advice                   |
| Stale or incomplete data | Last update and what the app actually knows                       | Update or continue with an explicit limitation    | Precise-looking unsupported forecasts        |
| Interrupted session      | Saved progress and next unfinished step                           | Resume                                            | Repeated onboarding                          |

These are not all separate pages. Some are full-screen flows or states of the same destination. Start with the minimum set needed to test the complete loop.

### 3.5 Three mobile composition concepts

#### Concept 1: action-led home, formation-led planning

Today answers one immediate question. Plan is where the pitch becomes the main workspace. A persistent, clear next action remains reachable without crossing unrelated content.

**Why test it:** separates quick check-ins from deliberate planning while keeping football central to allocation.

**Risk:** the home screen may feel like a conventional finance app unless the role language and visual identity remain present.

#### Concept 2: formation-led home

The pitch leads the first screen, with a compact current status above it. Selecting a position reveals its financial detail. Upcoming commitments and review sit below.

**Why test it:** strongest immediate expression of the original concept.

**Risk:** the board may consume the screen without answering a practical question. Test whether a returning user can find the next due payment quickly.

#### Concept 3: pay-cycle timeline

The home screen follows the current salary period through dated commitments and contributions. The formation is the editable plan underneath that timeline.

**Why test it:** timing problems may matter more than category totals for the first audience.

**Risk:** two representations can introduce confusion unless names, amounts, and statuses remain consistent.

These compositions can be tested within any of the visual worlds above. Do not change layout, colour, copy, and interaction simultaneously and then attribute a result to one of them.

### 3.6 Make the pitch usable on a small screen

The board should answer “what role does this money play?” A separate view can answer “what are all the exact amounts?”

- Give each position a short, meaningful purpose label. Avoid requiring users to decode shirt numbers or abbreviations.
- Keep line groupings recognisable, with ample touch areas and a clear selected state.
- Selecting a position opens or reveals its name, amount, timing, and status. Show one detail context at a time.
- Make the same purposes available as an ordered list. This helps scanning, assistive technology, and people who prefer numerical detail.
- Preserve the user's amount and position selections when moving between representations.
- Include an exact full breakdown in plan review. Hiding information at rest must not make it hard to find.
- Provide direct numeric editing. A slider may help explore, but should not be the only way to enter an exact amount.
- If dragging is offered, support a simple tap/select alternative as well as keyboard operation. WCAG 2.2 specifically addresses providing a single-pointer alternative to nonessential dragging. [W3C dragging guidance][S11]
- At increased text sizes, allow labels and details to reflow into a readable list or grouped layout. Shrinking the pitch text is not an adequate response.

### 3.7 A concrete mobile flow to prototype

**Scenario:** the user receives pay, has an annual rent commitment, supports a relative, and wants to set money aside for a course.

1. **Confirm pay.** Enter take-home pay, currency, and next payday. Ask whether it has arrived.
2. **Add what must be covered.** Capture real amounts and dates. Explain annual bills in terms of the upcoming bill and money already earmarked.
3. **Choose priorities.** Ask which purpose needs attention this cycle. Offer editable suggestions with an explanation.
4. **See the draft formation.** Show purposes grouped by role and an understandable total. Permit switching to a list immediately.
5. **Adjust one amount.** Show where the money comes from and what changes for the affected purpose.
6. **Review and save.** Display exact totals, unassigned money or shortfall, and any unfunded commitments.
7. **Follow through.** Provide the relevant external-action checklist. Saving a plan must not appear to have moved money.
8. **Handle a change.** Introduce an unexpected expense and let the user compare options.
9. **Review the month.** Separate recorded actions from unconfirmed intentions, then carry forward a revised draft.

This sequence tests the core proposition and the retention loop before requiring bank connections or investment integrations.

### 3.8 Mobile methods and current patterns to consider

| Pattern or method              | Recommendation                 | Why / condition                                                                   |
| ------------------------------ | ------------------------------ | --------------------------------------------------------------------------------- |
| Progressive disclosure         | Use                            | Let people see the next decision without losing access to complete information    |
| Short, saveable setup          | Use                            | People may not know all their numbers at once                                     |
| Persistent labelled navigation | Use                            | Returning users need predictable access to the main jobs                          |
| Bottom sheet for a short edit  | Test                           | Useful for one bounded choice; long financial forms deserve room and clear review |
| Reachable primary action       | Use                            | Account for keyboard, safe areas, zoom, and small viewports                       |
| Haptics                        | Platform-dependent enhancement | Never the only confirmation that an action succeeded                              |
| Micro-animation                | Use selectively                | Connect selection and changed values; keep critical information stable            |
| Rich widgets                   | Test after core utility        | A widget should answer a real question, not merely display a badge                |
| Tactile or 3D objects          | Mostly brand and milestones    | Avoid turning exact financial controls into ambiguous objects                     |
| Glass or translucency          | Optional and restrained        | Text and amounts need reliable contrast over actual backgrounds                   |
| Dark mode                      | Explore deliberately           | Design separate readable states, rather than inverting colours                    |
| Voice/conversational entry     | Later experiment               | Parsing amounts and acting on ambiguous requests requires explicit review         |
| Notifications                  | Opt-in and event-based         | Reminders should correspond to a relevant commitment or chosen routine            |
| Shareable progress cards       | Optional                       | Let people share a milestone without exposing income or balances by default       |
| Persistent streaks             | Do not lead with them          | A missed session is not reliable evidence of poor financial management            |

Apple's current materials guidance positions Liquid Glass primarily as a control/navigation layer and discourages using it throughout content. Even where a platform trend is relevant, this supports treating financial content as something that needs its own stable hierarchy. This is platform guidance, not a requirement for this product's visual identity. [Apple materials guidance][S12]

### 3.9 Accessibility, resilience, and numerical trust

These should be part of the concept review:

- Aim for roughly 44–48 CSS-pixel hit areas for frequent web controls as a design target. WCAG 2.2 AA's target-size criterion is 24 by 24 CSS pixels with specified exceptions; these are different thresholds, not interchangeable requirements. [W3C target size][S13]
- Meet the relevant contrast requirements: ordinarily 4.5:1 for normal text and 3:1 for qualifying large text, with the standard's exceptions. Check actual combinations, not palette swatches in isolation. [W3C text contrast][S14]
- Identify category and status with text or symbols as well as colour.
- Preserve meaningful reading and focus order when the formation is represented spatially.
- Allow reflow at the equivalent of 320 CSS pixels for nonexcepted content; provide readable alternatives where a spatial diagram needs them. [W3C reflow][S15]
- Announce meaningful updates such as a changed total or a saved plan to assistive technology without requiring a visual toast to convey everything. [W3C status messages][S16]
- Provide reduced-motion behaviour and keep amounts readable during transitions.
- Test large amounts, long names, zero values, negative balances, different currencies, and long translations.
- Include draft, saved, incomplete, stale, failed, and corrected states in the design system.
- Keep sensitive amounts out of generic notification previews unless the user deliberately enables them.
- Do not promise offline access, background processing, or native capabilities until the selected delivery platform can support the stated behaviour.

### 3.10 Grow the experience to larger screens

| Task                         | Phone                                                     | Tablet / desktop                                   |
| ---------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Select and inspect a purpose | Selection then focused detail                             | Formation and detail side by side                  |
| Edit several commitments     | Ordered, saveable sequence                                | Wider editable list with visible context           |
| Compare plans                | Switch between summaries with an explicit difference view | Side-by-side totals and consequences               |
| Review a month               | Narrative summary, then detail                            | Summary alongside useful tables and trends         |
| Coordinate a household       | Responsibility-based tasks                                | Broader overview with explicit visibility controls |

Preserve terminology and task order across sizes. Use additional space for comparison and context instead of increasing the number of competing dashboard modules.

## 4. Brand, copy, typography, graphics, and marketing

### 4.1 Positioning routes

Three routes are worth testing before writing a complete messaging system:

| Route                             | Proposed promise                         | Best fit                                        | Risk                                                      |
| --------------------------------- | ---------------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| **Everyday control**              | Know what this payday needs to cover     | People seeking clarity and a repeatable routine | May undersell longer-term ambitions                       |
| **Progress through a plan**       | Connect this salary to what matters next | People balancing several goals                  | Must distinguish intended progress from completed actions |
| **Manage your money like a team** | Give each part of your pay a clear role  | Football-oriented audience                      | Newcomers may need translation                            |

Recommended initial positioning hypothesis:

> Payday Pitch helps salary earners give each part of their pay a clear role, follow through on their plan, and adjust as life changes—with a football formation that makes priorities easier to see.

The final clause is a claim to test. Until it is validated, marketing should describe the mechanism rather than assert that it is easier for everyone.

### 4.2 Messaging hierarchy

1. **Outcome:** greater clarity about what pay needs to cover.
2. **Mechanism:** assign financial purposes through a football formation.
3. **Continuity:** check, adjust, and review across pay cycles.
4. **Proof:** show a real interface and a believable worked example.
5. **Service boundary:** explain what the product actually does with money and data.

Avoid leading with every feature or with an abstract wealth promise. A visitor should understand what happens after they start.

### 4.3 Voice and language playbook

**Character:** clear, capable, encouraging, and occasionally witty. Football fluency supplies personality; plain language carries financial meaning.

| Context               | Tone                   | Example draft                                                                                                               |
| --------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Marketing headline    | Memorable and concrete | “Give your pay a game plan.”                                                                                                |
| Mechanism explanation | Direct                 | “Assign your salary to bills, savings, and goals through a football formation.”                                             |
| Setup                 | Helpful                | “What needs to be covered before your next payday?”                                                                         |
| Selection             | Brief and factual      | “Rent fund · Planned for this payday”                                                                                       |
| Save confirmation     | Exact                  | “Plan saved. Your money has not moved.” — appropriate only for the planning-only product                                    |
| External action       | Truthful               | “Record this transfer as completed.”                                                                                        |
| Shortfall             | Calm                   | “Your plan is NGN 20,000 over the pay you've recorded. Review the amounts or update your income.”                           |
| Goal contribution     | Specific               | “You've recorded NGN 15,000 towards your course.”                                                                           |
| Adjustment            | Explain consequence    | “This change reduces the amount planned for your course by NGN 10,000.”                                                     |
| Return after a gap    | Welcoming              | “Ready to update your plan?”                                                                                                |
| Missing data          | Transparent            | “This estimate uses the balances you last updated on 12 November.”                                                          |
| Error                 | Actionable             | “Your change wasn't saved. Try again; your previous plan is still available.” — use only if that recovery behaviour is true |

All amounts and dates in sample copy are illustrative. Do not publish an error-recovery or privacy statement until the service actually behaves that way.

#### Football vocabulary budget

Use formation, lineup, fixtures, and tactics as navigational or explanatory cues when helpful. Accompany unfamiliar terms with the real-world task. Prefer **“Change plan”** or **“Adjust allocations”** on critical actions if “Make a substitution” causes confusion.

Avoid shame or gambling language around personal finances: “you bottled it,” “all in,” “guaranteed win,” “red card for spending,” and wealth leagues are poor candidates. A bill is a commitment, not an opponent to defeat. A family-support payment is not inherently a leak.

### 4.4 Terminology that earns trust

| Term                 | Use when                                                          | Do not imply                                         |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| Expected             | Future income entered as a forecast                               | Money has arrived                                    |
| Planned              | An allocation has been saved                                      | A payment or transfer happened                       |
| Recorded             | A user entered an action or balance                               | External verification                                |
| Confirmed / verified | A defined trustworthy source actually confirms the specific event | Verification of unrelated balances or the whole plan |
| Available to assign  | Money included in this planning calculation remains unassigned    | A live bank balance unless it is one                 |
| Goal progress        | A stated calculation measures progress                            | Guaranteed future returns                            |
| Estimate             | Output depends on stated assumptions                              | A certain date or outcome                            |

Do not call an allocation card a “wallet” if it is simply a planning category. If future versions hold or move funds, change the language and flows deliberately.

### 4.5 Typography: what the downloaded resources support

The folder includes three font archives, several specimens, and images whose filenames should not be treated as proof of a usable font family.

| Resource            | What was verified locally                                                                              | Potential role                                                                    | Constraint / next check                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Aspekta**         | Archive includes static fonts, a variable font, webfonts, and an OFL 1.1 licence                       | Strong first candidate for UI and much of the brand                               | Test currency symbols, numerals, accents, and small-screen rendering; do not assume all locale coverage |
| **Mont**            | Archive contains ExtraLight DEMO and Heavy DEMO only, a specimen, and a free-font EULA dated June 2015 | Heavy can inform display exploration; a fuller licensed family could be evaluated | The local download does not provide normal UI body weights                                              |
| **Batica Sans**     | Archive contains one Regular OTF and a personal-use licence that excludes unapproved commercial use    | Reference or internal exploration within its terms                                | Obtain suitable commercial rights before production; assess a full family separately                    |
| **Stanzegic**       | Supplied JPG is a social-story mockup presentation; no corresponding font binary is present            | Graphic composition reference; possible separate font candidate                   | Filename is not proof of the font used in the image; production rights remain unverified                |
| **Big-UI-Font.jpg** | Image of expressive display typography on phone mockups                                                | Headline character and campaign composition                                       | No font file or licence accompanies this reference                                                      |
| **Aspekta.jpg**     | Type-pairing visual showing Aspekta and Helvetica labels                                               | Reference for contrast between brand and text type                                | The screenshot does not grant a Helvetica licence or supply that font                                   |

The Aspekta upstream project confirms its open-source distribution and font formats. The Mont foundry offers more styles than the two in the supplied archive, while its present trial-font terms differ from the older free-font EULA bundled locally. Preserve provenance and assess the licence for the exact files selected; do not assume that every Mont file marked “demo” has identical terms. [Aspekta project][S17], [Mont foundry page][S18], [Fontfabric trial guidance][S19]

**Local licence finding for Mont:** the included free-font EULA describes commercial, web, and app use as permitted for its covered free fonts. That is materially different from declaring the archive personal-use only. It does not establish rights to every Mont style or settle provenance of the download. This report records the distinction rather than resolving it through the filename.

**Local glyph finding:** a character-map inspection of the sampled Aspekta-100 OTF, both supplied Mont demo OTFs, and BaticaSans-Regular OTF did not find a mapped naira symbol, U+20A6. The same samples lacked precomposed capital Ẹ, Ọ, and Ṣ. This was a binary coverage check, not a complete shaping or browser-rendering audit. It does not prove every release or every weight has the same coverage.

Also, the inspected Aspekta-400 OTF and variable TTF did not list a `tnum` substitution feature. Do not assume requesting tabular numerals will make the figures tabular; measure the actual numeral widths and rendering. These findings matter more than a specimen's general claim of multilingual support.

#### Recommended type exploration order

1. Start with an **Aspekta-led single-family study** for UI, headings, and marketing. Establish whether one family can carry enough distinction.
2. Test a **Mont-led display study with a proven UI text face**. The supplied Heavy weight is more useful for this than the ExtraLight weight on small money screens. Any production selection needs the appropriate files and rights.
3. Test **Batica as a separate identity candidate** only if its character is preferred and the licensing/family requirements are acceptable.
4. Evaluate a second display face only when it adds clear personality. It must not compromise numerical consistency or inflate every mobile screen's visual density.
5. If the preferred family lacks required glyphs, compare a different primary family, a visibly compatible licensed fallback, or an explicit ISO currency-code presentation. Test the actual mixed-font result.

Fontfabric's licensing guidance distinguishes desktop, web, app, and digital-ad uses. A static logo licence should not be assumed to cover font embedding in all of those environments. The Batica marketplace likewise lists separate usage categories; check the exact version and licence being acquired. [Fontfabric licensing][S20], [Batica licensing listing][S21]

#### Typography test sheet

Before choosing a production face, render:

- `NGN 1,234,567.89`, `₦1,234,567.89`, `$1,234.56`, `£1,234.56`, and `€1.234,56` in the intended locales.
- Zeros, negative figures, brackets, decimal points, and aligned before/after columns.
- `0 O`, `1 I l`, `5 S`, and `8 B` at realistic sizes and weights.
- Names and goal labels with required diacritics, including decomposed accents where applicable.
- Long purposes such as “Annual rent and moving costs.”
- A full review screen at normal and increased text sizes, with real fallback behaviour.

As starting design values, explore body/input text around 16–18 CSS pixels, supporting text around 14–16, page titles around 24–32, and major amounts around 32–40 when space permits. These are prototype ranges, not evidence that every screen should use the same sizes. Avoid tiny supporting labels whose legibility depends on a large device or ideal eyesight.

### 4.6 A design system built around financial decisions

The research should lead to a focused system with these parts:

| Layer                  | Decisions to document                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Brand foundations      | Chosen visual world, emblem, wordmark, palette logic, type roles                                                           |
| Semantic colour        | Text, surfaces, actions, focus, financial roles, warnings, errors, positive confirmation                                   |
| Numerical presentation | Currency placement, grouping, precision, alignment, negative values, missing values, provenance labels                     |
| Layout                 | Spacing rhythm, margins, reading order, density, responsive compositions                                                   |
| Components             | Amount input, purpose row, position marker, selected detail, due-date item, progress indicator, comparison, review summary |
| States                 | Draft, saved, recorded, verified, incomplete, stale, empty, failed, corrected                                              |
| Content patterns       | Setup prompt, explanation, adjustment consequence, shortfall, confirmation, support                                        |
| Motion                 | Selection, change explanation, navigation continuity, success feedback, reduced-motion alternatives                        |
| Asset rules            | Illustration, photography, icons, shape grammar, logo clear space, campaign templates                                      |
| Evidence               | Which decisions are tested, why variants exist, and unresolved questions                                                   |

#### Colour without chaos

- Separate identity colour from category colour and status colour.
- Use a stable category label and symbol alongside colour.
- Give warnings a consistent treatment that decorative campaign colours cannot imitate accidentally.
- Let bright fields establish identity in a header, illustration, or selected module. Large areas of saturated colour do not need to carry every paragraph and amount.
- Design light and dark appearances with their own tested pairings.
- Avoid allowing user-selected club colours to override error, warning, or focus semantics.

#### Motion with a financial purpose

Use movement to show what was selected, which amount changed, and how a panel relates to the board. Keep the final values immediately readable. A saved plan can have a restrained response; a recorded investment contribution should not trigger visuals that imply market gains. Decorative motion should be optional and quiet in repeated use.

### 4.7 Logo territories

Develop original marks from the product's mechanism. The downloaded logo board is a reference for compactness, proportion, and contrast; existing marks should not be traced.

| Territory                 | Concept                                                             | Strength                                                  | Watch-out                                                |
| ------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| **Pitch monogram**        | P / PP built from a centre line, arc, or goal-area geometry         | Direct connection to the name and sport                   | Must work without a full pitch drawing                   |
| **Purpose constellation** | Several ordered nodes forming a compact P or forward arrangement    | Suggests allocation and a formation                       | Avoid a generic network symbol                           |
| **Allocation bands**      | Three or four arranged bands forming a distinctive silhouette       | Extends naturally into role modules and campaigns         | Avoid looking like an equaliser or stock chart           |
| **Open goal frame**       | An original frame containing deliberate space or a directional form | Communicates a destination without a football ball cliché | Can resemble a generic square app icon                   |
| **Personal club emblem**  | A restrained original badge around a unique symbol                  | Supports belonging and personal identity                  | Avoid official-club cues and unsupported heritage claims |
| **Wordmark first**        | Distinctive Payday Pitch lettering with one useful repeated detail  | The name carries the idea without a complex symbol        | Needs a separately legible small-icon treatment          |
| **Formation motion**      | An ordered shape that can rearrange into role positions             | Connects mark, onboarding, and interaction                | Still needs a complete static version                    |
| **Payday marker**         | A compact date/arrival mark with pitch geometry                     | Links the recurring financial event and the sport         | Must not be mistaken for a payment-network logo          |

Test shortlisted marks in one colour, at small app-icon and favicon sizes, against light and dark backgrounds, and beside the full name. Distinctiveness, readability, and recognition matter more than the number of hidden ideas. Appropriate trademark research would follow a shortlist; this report does not clear a name or mark.

### 4.8 Illustration, icons, photography, and graphic UI

**Illustration approach options:**

1. **Editorial life scenes:** work, housing, learning, family, leisure, and future aspirations. Best with Modern Club Editorial or Illustrated Life Chapters.
2. **Original flat objects:** a coherent set of everyday purposes, with consistent outlines, viewpoints, and colour. Best with Colour-Block Club or Flat Object Library.
3. **Isometric relationships:** explain how purposes connect using a few labelled objects. Best for onboarding and educational diagrams, not dense money controls.
4. **Sculptural milestone objects:** a very small family of 3D assets with consistent lighting. Best for campaigns and meaningful milestones.
5. **Diagram-led identity:** pitch arcs, routes, line groupings, and numbers. Best when the brand should feel precise with little reliance on illustration.

Choose one lead treatment. Avoid mixing clip art, glossy 3D trophies, photographic player cutouts, and hand-drawn marks without a deliberate system.

Use a coherent icon set for ordinary actions, with labels where ambiguity matters. Develop a small set of original financial-role symbols only where it adds recognition. Icons should not encode the only explanation of a financial state.

For photography, consider commissioned or licensed everyday scenes that fit the actual market and audience. Do not infer that all customers aspire to international travel, luxury goods, or professional football fandom because those appear in the reference collection. Include attainable and personally meaningful goals.

### 4.9 Marketing and static design system

Build a reusable campaign grammar from the chosen identity: headline placement, type hierarchy, field colours, framing shapes, one illustration/photography treatment, product-demo framing, and a consistent action area.

| Asset family      | Message job                                        | Suggested composition                                                                     |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Product explainer | Explain the mechanism quickly                      | One real sample plan, a clear headline, three labelled financial roles                    |
| Payday campaign   | Make starting feel timely                          | Salary arrival → priorities → a saved plan; no implication that money moved automatically |
| Commitments story | Explain the value of looking ahead                 | A dated bill and the planned contributions that prepare for it                            |
| Adjustment story  | Show usefulness after setup                        | Before/after allocation with one plainly explained consequence                            |
| Progress story    | Demonstrate continuity                             | Contributions over several cycles, clearly labelled illustrative until real and consented |
| Football analogy  | Make a familiar idea teach a financial distinction | “A strong plan covers more than one goal” plus a concrete example                         |
| Trust explainer   | Answer what happens to money/data                  | Factual service explanation with supporting evidence appropriate to the actual product    |
| Founder story     | Explain why this approach exists                   | Clear point of view with honest limits and an invitation to try it                        |
| Customer account  | Show a real experience                             | Consented story with context; no unverified savings claims                                |

A practical initial static kit could contain a portrait feed master, a square master, a vertical story/ad master, a wide banner, a landing-page hero, a multi-panel educational template, and a printable one-page explanation. Export to the current specifications of the selected channels when producing them; this report does not lock platform dimensions that may change.

#### Example campaign copy routes

- **Mechanism:** “Give your pay a game plan.” / “A football formation for your monthly money.”
- **Control:** “Know what this payday needs to cover.” / “Bills, goals, and room to live.”
- **Adjustment:** “Plans change. See what changes with them.”
- **Continuity:** “A plan for payday. A routine for the month.”
- **Progress:** “Small contributions. A clearer picture of progress.”
- **Football-oriented:** “Build a lineup for what matters.”

Use draft headlines to test understanding. Avoid guaranteed wealth language, fabricated testimonials, unsubstantiated protection claims, and countdown urgency unrelated to a real offer.

### 4.10 A coherent brand ecosystem

The same underlying identity should behave differently by context:

| Context                   | Expression level    | Priority                                            |
| ------------------------- | ------------------- | --------------------------------------------------- |
| Marketing and campaigns   | High                | Be distinctive and explain the product              |
| Welcome and onboarding    | Moderate            | Make the mechanism understandable                   |
| Today and planning        | Controlled          | Help users make a decision                          |
| Amount editing and review | Precise             | Prevent misunderstanding and support correction     |
| Shortfall and error       | Quiet and direct    | Explain what happened and what can be done          |
| Progress and milestones   | Warm and expressive | Recognise real actions without overstating outcomes |

This gives finance and football meaningful roles: football structures planning and identity; financial clarity governs amounts, actions, and consequences.

## 5. Discovery questions and validation plan

### 5.1 Founder questions to answer first

The live discovery questions accompanying this report remain open unless the founder has answered them. Start with the first eight; the rest can guide subsequent discussion.

1. **Who is the first customer?** Which market, pay pattern, income range, household situation, and existing financial tools?
2. **What is the sharpest pain?** Deciding where money goes, remembering commitments, following through, understanding progress, or simply not having enough?
3. **What happens to money?** Does the first product only plan and record, read financial accounts, or actually execute transactions?
4. **How essential is football?** A management model people should learn, an instantly familiar tool for fans, or a lighter identity around plain financial tasks?
5. **Must the formation contain eleven positions?** Would flexible purpose groups still feel true to the original idea?
6. **What counts as success after three pay cycles?** A completed plan, fewer missed commitments, consistent contributions, better decisions, or another observable result?
7. **What would justify payment?** Which concrete repeated task would the customer pay to make easier or more reliable?
8. **What should the everyday money screen feel like?** Calm with expressive moments, colourful throughout, or deliberately game-like?
9. Which three monthly decisions should become easier?
10. Should the product help people whose essentials exceed income? What support should it offer without pretending allocation solves that gap?
11. Which existing apps feel trustworthy, and what specific behaviour earns that feeling?
12. Which references in `web_resources` are close to your intention, and which are only exploratory?
13. Which football culture is relevant: tactical analysis, local club life, fantasy management, broadcast, kit design, or collecting?
14. Should a football newcomer be able to complete every task without learning football terminology?
15. Are family support, irregular bills, debt, and household planning core or optional?
16. Does “wealth” mean accessible savings, debt reduction, investments, income resilience, net worth, or a combination?
17. Should users record actual spending, or only planned contributions and key commitments?
18. How much manual maintenance is acceptable before an integration becomes necessary?
19. Is financial education part of the promise, or should explanations only appear at the point of a decision?
20. What personal information should never appear in a shared screen, notification, employer view, or progress card?
21. Which currencies, languages, names, and accessibility needs must the initial typography support?
22. Are commissioned illustration, photography, and commercial font licensing feasible within the brand budget?
23. What monetisation methods are unacceptable even if they earn revenue?
24. What would make the product feel childish, like betting, too bank-like, or too exclusive?

### 5.2 Customer research prompts

Ask for concrete recent behaviour before showing the concept:

- “Walk me through what happened to your last pay.”
- “Which decision was hardest, and what did you do?”
- “Show me how you remember the next important bill, without sharing sensitive details.”
- “What did you intend to save or pay down? What actually happened?”
- “Tell me about the last time an unexpected expense changed your plan.”
- “Which future expense do you worry about preparing for?”
- “What tool have you stopped using, and why?”
- “What do you currently pay for to help with money?”

Then ask people to complete a realistic task with the formation. Observe misunderstandings before asking whether they like it. Do not collect account numbers, employer information, or full financial records merely to run a concept study.

### 5.3 Proposed discovery sequence

| Step                           | Deliverable                                                                            | Decision it resolves                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1. Founder alignment           | One-page audience, problem, service boundary, and success definition                   | What the product is trying to achieve first                     |
| 2. Behaviour interviews        | Initial small qualitative sample, for example 6–8 people across relevant situations    | Whether the proposed problem and routine match actual behaviour |
| 3. Model comparison            | Flexible pitch, eleven-position pitch, and a conventional list using identical content | Whether football improves or hinders understanding              |
| 4. Visual comparison           | Three visual directions on the same key states                                         | Which identity supports recognition and clarity                 |
| 5. End-to-end mobile prototype | Payday, action, adjustment, and review                                                 | Whether the complete loop works                                 |
| 6. Cross-size exploration      | The same key tasks on phone and larger screens                                         | Which tasks need different compositions                         |
| 7. Multi-pay-cycle pilot       | A small repeat-use study over at least two pay cycles                                  | Whether value survives setup and novelty                        |
| 8. Pricing investigation       | Capability-specific willingness-to-pay and purchase tests                              | Which premium proposition is credible                           |
| 9. Product/design brief        | Chosen direction, evidence, language, assets, unresolved risks                         | What an implementation phase would be authorised to build       |

The suggested interview count is a practical starting point for qualitative learning, not statistical proof or a universal sample-size rule. Recruit further when important situations remain unexplored. A small concept study cannot establish an entire market's preference.

### 5.4 Decisions and measurements

| Assumption                                      | What to observe                                                         | Suggested decision criterion                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| The metaphor is comprehensible                  | Can people explain what a position represents?                          | Resolve repeated misunderstanding before polishing the board   |
| A saved plan is distinguishable from a transfer | Ask what happened to the money after saving                             | Treat confusion as a blocking concept problem                  |
| The board helps a decision                      | Compare time, errors, explanation, and effort against the list          | Keep the board central only where it adds observable value     |
| Adjustments are understandable                  | Can users identify what was reduced and why?                            | No silent or unrecognised consequences in the tested flow      |
| The interface feels appropriate in difficulty   | Test a shortfall and a late salary                                      | Users can find a useful next step without feeling blamed       |
| Value recurs                                    | Observe voluntary returns and completed financial tasks over pay cycles | Continue based on repeated utility, not opening-day excitement |
| Premium is meaningful                           | Ask what users would lose without a specific paid capability            | Validate a concrete recurring value before setting packages    |

Use activation and retention definitions that match the loop. An example activation event is **a reviewed, saved plan plus understanding of the next real action**. An example retention event is **returning in a later pay cycle to update, act on, or review the plan**. These are proposed definitions, not recorded metrics.

Distinguish product activity from financial outcomes. A user-recorded contribution is not a verified bank transfer; a larger account balance is not necessarily investment performance; a completed checklist is not proof of improved financial well-being.

### 5.5 Recommended next discussion

First decide the audience, the service's relationship to money, and how literally the football formation must work. Then compare three coherent visual directions. Keep pricing and distant integrations as hypotheses until the recurring planning loop has evidence.

No implementation, prototype build, asset purchase, or permanent design-system change is authorised by this research report alone.

## 6. Resource audit and research sources

### 6.1 Local resources inspected

All 17 files in the supplied folder were inventoried. All 14 image files were visually inspected, including enlarged sections of the three long boards. The three ZIP archives were inspected without modifying the originals. Mont's bundled PDF EULA was text-extracted; font character maps and selected Aspekta feature tables were sampled for the typography findings.

| File                                                                                              | Observation and proposed use                                                                                                  | Rights / certainty                                                              |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [080a41b9f4c737b058b6bbe3c4847e77.jpg](assets/web_resources/080a41b9f4c737b058b6bbe3c4847e77.jpg) | Dark mobile food-interface presentation with large content panels and warm colour; reference for hierarchy and lively content | Original source and rights unverified                                           |
| [3fae4e3e03754f326dbd4e6ba7ea2673.jpg](assets/web_resources/3fae4e3e03754f326dbd4e6ba7ea2673.jpg) | Expressive display-type composition with green, cream, lime, pink, and orange                                                 | Font identity and production rights not verified                                |
| [89c0bdfa71129ea4ae7de3f2dbf46d13.jpg](assets/web_resources/89c0bdfa71129ea4ae7de3f2dbf46d13.jpg) | Simple labelled strips with coloured symbols on a dark field; good reference for modular identity                             | Reference only; no component licence supplied                                   |
| [9db5d58669c46b4575a9246bf5655caf.jpg](assets/web_resources/9db5d58669c46b4575a9246bf5655caf.jpg) | Stylised luggage illustration, broad blue field, strong cast shadows; useful direction for original goal illustrations        | Original asset use rights unverified                                            |
| [Aspekta.jpg](assets/web_resources/Aspekta.jpg)                                                   | Geometric typography and a labelled Aspekta/Helvetica pairing                                                                 | Image does not license either face; Aspekta archive separately includes OFL     |
| [Batica.jpg](assets/web_resources/Batica.jpg)                                                     | Geometric wordforms on pale, blue, and dark backgrounds                                                                       | Font licence checked separately in ZIP                                          |
| [Big-UI-Font.jpg](assets/web_resources/Big-UI-Font.jpg)                                           | Large expressive typography on three bright phone mockups                                                                     | A reference image; no font files supplied                                       |
| [Logo-Idea-Concept.png](assets/web_resources/Logo-Idea-Concept.png)                               | Pinterest board screenshot of compact logos, wordmarks, app-icon treatments, and bright/dark contrast                         | Many distinct existing identities; use for analysis, not copying                |
| [Mont.jpg](assets/web_resources/Mont.jpg)                                                         | Mont geometric sans specimen on blue                                                                                          | Does not establish which family files are available locally                     |
| [Stanzegic Modern Grotesk Font.jpg](<assets/web_resources/Stanzegic Modern Grotesk Font.jpg>)     | Colourful social-story mockups; useful advertising-layout reference                                                           | Filename alone cannot identify or license the displayed type                    |
| [Visual-Style-Concept.png](assets/web_resources/Visual-Style-Concept.png)                         | Pinterest board combining travel, people, architectural, flat, and 3D illustration                                            | A mixed reference collection; individual sources/rights need separate tracing   |
| [aspekta--aspekta-sources-2.100.zip](assets/web_resources/aspekta--aspekta-sources-2.100.zip)     | Font source package containing production fonts and licence files                                                             | OFL 1.1 present; glyph and rendering suitability still require testing          |
| [batica-sans.zip](assets/web_resources/batica-sans.zip)                                           | One Regular OTF plus personal-use EULA                                                                                        | Commercial permission not established by this download                          |
| [hello-colorful.jpg](assets/web_resources/hello-colorful.jpg)                                     | Tactile keyboard-like colourful forms on mint; strong shape/colour reference                                                  | Original rights unverified; create an original grammar                          |
| [isometric-clean-landing.webp](assets/web_resources/isometric-clean-landing.webp)                 | Restrained landing page with white space and a technical isometric diagram                                                    | Useful clarity/diagram reference; original rights unverified                    |
| [mont.zip](assets/web_resources/mont.zip)                                                         | Two demo OTFs, specimen PDF, and a permissive free-font EULA from 2015                                                        | Exact file provenance and chosen production use need to be retained and checked |
| [shapes-ideas-concept.png](assets/web_resources/shapes-ideas-concept.png)                         | Pinterest board of widgets, shaped icons, tactile controls, colourful UI, and badges                                          | Strong shape inspiration; not a reusable licensed asset pack                    |

### 6.2 Evidence limitations

- This is desk research with a local reference audit, not customer fieldwork or a market-sizing exercise.
- Competitor capabilities were checked against public documentation on the research date. Their availability, market coverage, and packaging can change.
- No current interest rate or competitor price is used as a recommendation in this report.
- Font licence observations distinguish bundled local terms from current foundry guidance; they are not a legal clearance opinion.
- The Mont specimen was inventoried but was not used as proof of the glyph coverage of the two supplied font files.
- Images that appear in boards were not traced individually to every original creator. They remain inspiration references.
- Proposed colours, font combinations, motion, and compositions have not been rendered as production interfaces or tested for contrast in this task.
- Proposed feature ordering is qualitative judgment. It is not a numerical market-priority score.
- Further market-specific research is needed before proposing regulated financial services, personalised investment recommendations, or money movement.

### 6.3 Public sources

Sources were accessed on **26 October 2026**. Links are provided beside the claims they support; this index explains their role. Source material was paraphrased rather than reproduced as a substitute for the original.

| ID  | Source                                                     | Used for                                                          | Qualification                                                                                     |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| S01 | [CFPB: Four elements of financial well-being][S01]         | Outcome framing beyond salary allocation                          | US research context; article originally published in 2015                                         |
| S02 | [YNAB: Simplify your finances][S02]                        | Prioritisation and preparing for less frequent expenses           | Product's own method, not independent proof for Payday Pitch                                      |
| S03 | [Monarch: Goals in Monarch][S03]                           | Current separation of saving and debt-paydown experiences         | Current guide updated 20 October 2026; supersedes older goal guidance encountered during research |
| S04 | [Cowrywise: Types of savings plans][S04]                   | Accessible emergency savings versus locked plans                  | Specific provider offering; no rate recommendation                                                |
| S05 | [PiggyVest: FAQs][S05]                                     | Adjacent-market comparison of target savings and locked funds     | Provider terms can vary; not a proposed Payday Pitch feature commitment                           |
| S06 | [Monarch: Pricing and capabilities][S06]                   | Subscription packaging precedent                                  | Prices intentionally not used as a local pricing anchor                                           |
| S07 | [Strava: Subscription][S07]                                | Sporting precedent for paid progress and analysis                 | Different category and purchase context                                                           |
| S08 | [Monotype: Premier League case study][S08]                 | Expressive sports typography with functional numerals             | Brand precedent, not a font licence                                                               |
| S09 | [Premier League: New look from 2016/17][S09]               | Flexible, colourful sporting identity precedent                   | Historical announcement, not a claim about an unchanged present-day system                        |
| S10 | [Android Developers: Layouts and navigation patterns][S10] | Compact navigation and adaptation to larger screens               | Native platform guidance applied as a pattern reference                                           |
| S11 | [W3C: Dragging movements][S11]                             | Alternatives to drag-only interactions                            | WCAG explanatory guidance                                                                         |
| S12 | [Apple: Materials][S12]                                    | Current treatment of Liquid Glass and content hierarchy           | Platform-specific guidance, not a compulsory web aesthetic                                        |
| S13 | [W3C: Target size minimum][S13]                            | Accurate distinction between AA minimum and larger design targets | Includes exceptions; final UI needs contextual assessment                                         |
| S14 | [W3C: Contrast minimum][S14]                               | Text contrast thresholds                                          | Actual combinations must be tested                                                                |
| S15 | [W3C: Reflow][S15]                                         | Narrow-width and enlarged-content behaviour                       | Spatial content may need an alternative representation                                            |
| S16 | [W3C: Status messages][S16]                                | Accessible presentation of saved and changed states               | Specific implementation is outside this report                                                    |
| S17 | [Aspekta upstream repository][S17]                         | Formats, distribution, and open-source font reference             | Local archive inspected independently                                                             |
| S18 | [Fontfabric: Mont][S18]                                    | Full-family availability versus local two-weight download         | Current family differs from older local files                                                     |
| S19 | [Fontfabric: Trial fonts][S19]                             | Distinguishing present trials from a bundled older free-font EULA | Do not apply present trial terms blindly to every older file                                      |
| S20 | [Fontfabric: Licensing][S20]                               | Distinct use categories for font licensing                        | Exact selected licence controls                                                                   |
| S21 | [MyFonts: Batica Sans licensing][S21]                      | Commercial licence routes and usage distinctions                  | Marketplace family should be matched to the actual chosen files                                   |
| S22 | [Official FPL: How to pick a squad][S22]                   | Adjacent sporting model with a constrained selection budget       | Useful analogy; its squad rules should not dictate personal finances                              |

### 6.4 Adjacent references worth studying with a specific question

| Reference                 | What to learn                                                      | What should not be assumed                                                               |
| ------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| YNAB                      | How a repeated allocation method connects to everyday choices      | Its terminology or onboarding is automatically right for this audience                   |
| Monarch                   | How goals, liabilities, reporting, and recurring use connect       | Its subscription price or market availability transfers to the launch market             |
| Cowrywise                 | How liquidity and a purpose are explained separately               | Every saving purpose should be locked or routed into a product                           |
| PiggyVest                 | How target-based saving and access restrictions are communicated   | A commitment mechanism is appropriate for an emergency reserve                           |
| Fantasy Premier League    | How a constrained budget and visual squad make trade-offs concrete | A financial plan should inherit fifteen-player squad rules or player performance scoring |
| Strava                    | How personal history supports a continuing sporting routine        | Public comparison is appropriate for private wealth                                      |
| Premier League / Monotype | How identity and number legibility coexist across media            | Its proprietary assets or exact colours should become Payday Pitch branding              |

PiggyVest's documentation distinguishes target-based saving from locked-fund products, while official FPL describes selecting a priced squad within a defined budget. The design inference is to make constraints and purposes visible. It is not a recommendation to copy either service's rules. [PiggyVest FAQs][S05], [Official FPL squad guide][S22]

[S01]: https://www.consumerfinance.gov/archive/blog/4-elements-define-personal-financial-well-being/
[S02]: https://www.ynab.com/guide/simplify-finances
[S03]: https://help.monarch.com/hc/en-us/articles/44373110771860-Introducing-Goals-3-0
[S04]: https://help.cowrywise.com/en/articles/1624208-types-of-savings-plans-on-cowrywise
[S05]: https://app.piggyvest.com/faq
[S06]: https://www.monarch.com/pricing
[S07]: https://www.strava.com/subscribe
[S08]: https://www.monotype.com/resources/case-studies/premier-league
[S09]: https://www.premierleague.com/en/news/60917
[S10]: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
[S11]: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
[S12]: https://developer.apple.com/design/human-interface-guidelines/materials
[S13]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
[S14]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
[S15]: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
[S16]: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
[S17]: https://github.com/ivodolenc/aspekta
[S18]: https://www.fontfabric.com/fonts/mont/
[S19]: https://www.fontfabric.com/trial-fonts/
[S20]: https://www.fontfabric.com/help/licensing/
[S21]: https://www.myfonts.com/collections/batica-sans-font-yukita-creative?tab=licensing
[S22]: https://www.premierleague.com/en/news/2174419/fpl-basics-how-to-pick-a-squad
