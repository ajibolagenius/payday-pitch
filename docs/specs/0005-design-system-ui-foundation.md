# 5. Design system and UI foundation

**Date**: 2026-10-22
**Status**: In Progress (its structure stands; the palette, type, and dark default it specifies are superseded by [0009](0009-visual-identity-refresh.md))

## Summary

Give the app one visual language it can build every screen on: a two layer token system in `globals.css` (raw brand colors, then semantic names components consume), Space Grotesk, shadcn/ui base components, and the pitch view component that shows a formation with amounts. The look comes from the references already in `docs/assets`: pitch green, volt yellow, near black surfaces, and a small hand drawn sticker set for celebration moments. The app opens dark by default, honors the system preference, and offers a toggle; volt yellow text lives only on dark surfaces so contrast stays honest. A demo page proves everything, and a unit test computes contrast straight from the token values, so no pair can ship broken.

## Context

Spec 0001 fixed the styling stack (Tailwind v4 with CSS variable tokens, shadcn/ui copied into the repo, Space Grotesk via `next/font`) and left placeholder tokens in `src/app/globals.css` with a comment pointing here. Every later feature (sign in, first match loop, tactics, season view) draws screens from this foundation. Without it, each feature invents its own shades, radii, and heading sizes, and the app drifts into an inconsistent look that is expensive to pull back.

Forces at play:

- The product handles personal money data for Nigerian salary earners. It must read as trustworthy (the dark, editorial UI_1 and UI_2 references) while keeping football joy alive (the pen line sticker references DES_1 to DES_3).
- Volt yellow `#F5FF6B` on light surfaces fails WCAG AA contrast for text. The scope flags this directly.
- Mobile first: the pitch view must render a readable formation on a 360px phone, and the whole system is used through a PWA shell (spec 0001).
- The formation data in `src/domain/formations.ts` carries 12 positions per shape: 11 on pitch plus a BENCH slot ("Guilt-Free Sub"). The pitch view contract must match that shape, not a generic 11.
- The team is one engineer plus agents, and the stack is very current (Next 16.4, React 19, Tailwind 4.3). Integration risk is real: none of shadcn, Motion, or next-themes is installed yet.
- The scope lists candidate tools to settle: Motion, DiceBear, an AI design skill, sharp.

## Requirements

**User stories**:

- As a developer of any later slice, I want named tokens and base components so that I build screens by composing proven parts instead of inventing styles.
- As a user on a phone, I want my money shown on a football pitch with real amounts so that the plan is instantly understandable.
- As a user with low vision or a screen reader, I want every base component to handle focus, keyboard, and announcements so that the app is usable my way.
- As a user in bright daylight, I want a light theme option so that the app stays readable.

**Acceptance criteria** (the contract; `/check verify` checks against it):

- **AC-1**: `design.md` at the repo root documents color, the type scale, spacing, corner language, component inventory, the sticker set, the voice of the interface (with example copy), and the graphics contrast checklist. Token values live only in `src/app/globals.css`; `design.md` documents them by name and never restates hex values.
- **AC-2**: Tokens follow the two layer rule: raw brand values defined once, semantic variables consumed by components, using the shadcn token names so copied primitives resolve. Light and dark themes swap only the semantic layer, and every semantic token has an explicit value in both themes.
- **AC-3**: Every named foreground and background token pair passes WCAG AA (4.5:1 body text, 3:1 large text and graphics), proven by a Vitest that parses the token values from `globals.css` and checks the pair list. In addition, the demo route passes an axe scan (Playwright) in both themes for rendered text contrast. Volt yellow is never a text color on a light surface.
- **AC-4**: Base components (Button, Card, Input, Badge, Tabs, Dialog, sonner toast, Tooltip, StatTile, MoneyText, ThemeToggle) manage focus, work fully by keyboard, expose correct roles and labels, and show a visible focus ring in both themes.
- **AC-5**: The pitch view renders any of the six seeded formations from `src/domain/formations.ts`: 11 on pitch players plus the BENCH slot in a bench strip, each with its amount in naira. Responsive down to 360px, every player and the bench node reachable by keyboard, announced with role, label, and amount.
- **AC-6**: Switching formations animates players to new slots with Motion layout transitions keyed by role slot, and under `prefers-reduced-motion: reduce` players jump instead of slide, proven by a Playwright test with `reducedMotion: 'reduce'` asserting the player element carries no transform transition.
- **AC-7**: The app opens dark by default, honors the system preference through next-themes, and a working theme toggle persists the choice in localStorage before any account exists.
- **AC-8**: The sticker set (at least: ball, boots, whistle, goal net, sparkle, GOAAALL banner, warning card) exists as inline SVG components using token colors, plus the generated app icon set (192, 512, maskable with safe zone padding, 180px apple touch) produced by a reproducible script from master SVGs.

## Options considered

### Option 1: Tokens plus a full component kit, charts included

Build the token layer, all base components, the pitch view, and the radar chart kit from UI_2 in one pass.

**Pros**:

- Feature 9 (season view) starts with zero design work.
- One context switch to settle everything visual.

**Cons**:

- Charts serve a feature that is five slices away; building blind invites rework when real season data arrives.
- Roughly doubles this slice with no user-visible benefit until feature 9.

### Option 2: Tokens and documentation only

Write `design.md` and the token layer; let each feature add its own components as needed.

**Pros**:

- Smallest possible slice.

**Cons**:

- The pitch view, the single most load bearing component, would be invented inside feature 6 under deadline pressure.
- The scope's Done when explicitly requires the pitch view and base components here.

### Option 3: Tokens, pitch view, standard starter kit (chosen)

Tokens, `design.md`, shadcn starter components plus the app's own StatTile, MoneyText, PitchView, sticker set, icons, Motion as the animation standard, and a demo page that proves the system. Charts deferred to feature 9.

**Pros**:

- Every later feature composes proven parts; the risky component (pitch view) gets careful foundation time.
- Kept honest by a token level contrast unit test plus a rendered axe scan.

**Cons**:

- Some components (Tabs, Tooltip) ship before any screen uses them, so their first real test comes later.
- The sticker set is agent drawn, so quality depends on review during the build.

## Decision

**Chosen option**: Option 3: Tokens, pitch view, standard starter kit

Build the two layer token system (shadcn native naming, light `:root` plus `.dark` swap, dark as the default theme), `design.md`, the shadcn starter components plus the app's own pitch components, an agent drawn sticker set, generated app icons via sharp, and Motion as the app wide animation standard, proven on a dev only demo route with a Vitest contrast check on the tokens themselves.

**Implementation skills**: `impeccable` (AI design skill, drives the build) · `tailwindcss` (Tailwind v4 conventions) · `vercel:shadcn` (shadcn component workflow) · `vitest` (`.claude/skills/vitest/`, tests beside source) · `playwright-cli` (`.claude/skills/playwright-cli/`, e2e checks)

## Rationale

Tracer Bullet says the first thin thread (feature 6) must show a formation with amounts on a pitch, so this slice builds exactly the thread (tokens to rendered pitch) and stops. Charts are deferred because the season view is five slices away and UI_2 gives a style target, not data shapes (basis: Tracer Bullet slicing from spec 0001 conventions). The yellow rule is a math fact: `#F5FF6B` on `#FAFAFA` fails AA badly, and the dark references show yellow where it shines, so yellow becomes an accent for dark surfaces and fills, never light surface text (basis: WCAG AA contrast requirements, named in the scope's Done when). shadcn is fixed by spec 0001, so the component answer is "copy the accessible primitives, restyle onto the shadcn token names," not a new library (basis: spec 0001 components row). Dark first is delivered as `defaultTheme="dark"` on top of the shadcn native light `:root` plus `.dark` structure, because inverting the base layer fights every copied primitive, the `dark:` variant, and next-themes at once (soundness note S1 from the cross check). A token level Vitest contrast check replaces an axe only strategy because axe cannot see pairs the demo never renders and cannot check non text graphics at all (soundness note S3). Motion wins over GSAP because layout animation (players sliding between formations) is a first class feature of Motion and a manual job in GSAP, and one animation library is enough for a one person team. DiceBear is declined: its generated avatars cannot match the hand drawn pen line references; the user chose a curated sticker set with RuneIcons for UI icons.

## Standard definition

**Canonical pattern**, the token layer in `src/app/globals.css`. shadcn naming so copied primitives resolve; `:root` holds light, `.dark` swaps, and next-themes sets `defaultTheme="dark"` so the app still opens dark:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

/* Layer 1: raw brand values, defined once, never consumed by components */
:root {
  --pitch-green: #1b4638;
  --volt: #f5ff6b;
  --surface-black: #101010;
  --paper: #fafafa;
  --ink: #141414;
}

/* Layer 2: semantic tokens (light). Components consume ONLY these.
   Exact values for every token below are finalized by the AC-3 contrast
   test during the build; the pair list it checks is fixed here. */
:root {
  --background: var(--paper);
  --foreground: var(--ink);
  --card: #ffffff;
  --card-foreground: var(--ink);
  --popover: #ffffff;
  --popover-foreground: var(--ink);
  --primary: var(--pitch-green);
  --primary-foreground: #ffffff;
  --secondary: #e8efea;
  --secondary-foreground: var(--pitch-green);
  --muted: #efefef;
  --muted-foreground: #525252;
  --accent: var(--pitch-green);
  --accent-foreground: #ffffff; /* volt is fill-only in light */
  --destructive: #c41e2f;
  --destructive-foreground: #ffffff;
  --success: #1e7a45;
  --success-foreground: #ffffff;
  --border: #e0e0e0;
  --input: #d4d4d4;
  --ring: var(--pitch-green);
  --radius: 0.625rem;
}

/* Dark swap: every semantic token gets an explicit dark value.
   This is where volt text is allowed (--foreground and --card-foreground
   are light inks on near black). */
.dark {
  --background: var(--surface-black);
  --foreground: var(--paper);
  --card: #1a1a1a;
  --card-foreground: var(--paper);
  --popover: #1a1a1a;
  --popover-foreground: var(--paper);
  --primary: var(--pitch-green);
  --primary-foreground: var(--volt);
  --secondary: #23352c;
  --secondary-foreground: var(--paper);
  --muted: #2a2a2a;
  --muted-foreground: #a3a3a3;
  --accent: var(--volt);
  --accent-foreground: var(--surface-black);
  --destructive: #e5484d;
  --destructive-foreground: var(--surface-black);
  --success: #4cc77f;
  --success-foreground: var(--surface-black);
  --border: #2a2a2a;
  --input: #3a3a3a;
  --ring: var(--volt);
}
```

The AC-3 pair list (checked in both themes): `background` with `foreground`, `muted-foreground`, and `destructive`; `card` with `card-foreground` and `muted-foreground`; `primary` with `primary-foreground`; `accent` with `accent-foreground`; `secondary` with `secondary-foreground`; `muted` with `muted-foreground`; `popover` with `popover-foreground`; `ring` against `background` (3:1, non text). Values that fail get adjusted until they pass; the pair list, not the hex, is the contract.

**Component rule**: components use `bg-card`, `text-muted-foreground`, and friends (mapped through `@theme inline`). No hex values and no raw palette utilities like `bg-[#1B4638]` anywhere in `src/`.

**Money rule**: all amounts render through `<MoneyText>`, which formats integer kobo plus currency code via `Intl.NumberFormat` (the `src/domain/money.ts` representation from spec 0001 and 0004). No component formats money by hand.

**Replaces**:

- The placeholder `--background` / `--foreground` block with its "comes from the design system spec" comment in `globals.css`.
- Per feature ad hoc styling (one off hex, arbitrary Tailwind values, feature local heading sizes).

**Enforcement**:

- ESLint `no-restricted-syntax` rejecting hex color literals in `src/**/*.tsx` and `src/**/*.ts`, with an `ignores` carve out for `src/components/pitch/**` and `src/components/stickers/**` (the artwork exception below). The rule cannot see inside `className` strings, so arbitrary color utilities (`bg-[#...]`) are caught by the build task 8 checklist plus a grep step in CI (fails on any hex literal outside the carve out and `globals.css`).
- The Vitest token contrast test fails CI without human review.

**Rollout**: new code complies immediately from this slice on; the only existing violation (placeholder tokens) is removed by this slice itself, so there is no debt to track.

**Exceptions**: `src/components/pitch/**` and `src/components/stickers/**` may use literal colors for artwork (grass greens, sticker inks), defined once as constants per component. They still may not import hex into other files.

## Feature design

**Pitch view contract** (`src/components/pitch/`):

| Piece            | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field            | One responsive inline SVG, fixed `viewBox="0 0 100 133"` portrait at all breakpoints. Markings: outer border, halfway line, center circle, two penalty areas, two goal areas, penalty spots, corner arcs. Line color `--pitch-line` (a raw layer constant, white at low alpha in light, higher alpha in dark). Grass: two alternating greens from component constants. On `md` and up the SVG simply renders larger, coordinates never change                             |
| Slot coordinates | New pure function in `src/domain/formations.ts`: `formationSlotCoordinates(formationId)` returning the 12 positions of the seed in order, each with `{x, y}` in 0 to 100 percent of the viewBox (GK at the bottom center, attack upward; bench slot at `x: 50, y: 97` inside the bench strip, which sits below the SVG, not on the grass). Vitest asserts all six formations: 12 points, x within 5 to 95, y within 5 to 95, no two points within 8 percent of each other |
| Player identity  | Slot key is `role + index within role` (for example `DEF-1`, `MID-0`), stable across formations, so Motion layout transitions pair players correctly when shapes differ. Derived from the seed order, which is already grouped GK, DEF, MID, FWD, BENCH                                                                                                                                                                                                                   |
| Player node      | Badge with shirt number (1 GK, then sequential by role order) plus `<MoneyText>`; renders as a button when interactive; `aria-label` "Emergency Fund, goalkeeper, 45,000 naira" pattern                                                                                                                                                                                                                                                                                   |
| Bench strip      | A slim styled strip under the SVG holding the BENCH node with its label and amount, visually distinct from the eleven (muted surface, smaller)                                                                                                                                                                                                                                                                                                                            |
| Animation        | Motion `layout` on the keyed nodes; every animated property gated by `useReducedMotion` (AC-6)                                                                                                                                                                                                                                                                                                                                                                            |

**Type decisions** (fixed, not left to the build):

- Space Grotesk weights 400, 500, 700 via `next/font/google` with `display: "swap"`, self hosted at build (spec 0001). Latin subset only.
- Type scale (modular 1.25, mobile first): `text-xs` 12px captions and labels, `text-sm` 14px secondary, `text-base` 16px body (prevents iOS zoom on inputs), `text-lg` 20px card titles, `text-2xl` 25px section headings, `text-4xl` 39px page titles and hero amounts, `text-5xl` 49px display numbers on the StatTile. Headings weight 700, body 400, labels 500.
- Amounts use `font-variant-numeric: tabular-nums` (a `.money` utility in `globals.css`) so columns of figures align.

**Component inventory** (all in `src/components/`):

- Copied and restyled shadcn primitives in `ui/`: Button, Card, Input, Badge, Tabs, Dialog, Tooltip, sonner toast.
- App owned: `PitchView`, `PlayerNode`, `StatTile` (props: `label: string`, `value: string`, optional `delta?: {value: string, direction: "up" | "down"}`; the money variant passes a `MoneyText` as `value`), `MoneyText` (props: `amountMinorUnits: number`, `currency: string`, delegates formatting to `src/domain/money.ts`), `ThemeToggle` (next-themes, class strategy, `defaultTheme="dark"`, `suppressHydrationWarning` on `<html>` in `src/app/layout.tsx`, and its current `className` from the font variables moved onto a wrapper so next-themes owns `<html>` class).
- Stickers in `stickers/`: agent drawn inline SVG components (ball, boots, whistle, goal net, sparkle, GOAAALL banner, warning card), strokes following the DES_2 and DES_3 pen line, fills from tokens. The GOAAALL banner is outlined letter paths (vector outlines, not `<text>`), so no font dependency and no hydration risk.
- UI icons: lucide stays for shadcn internals; RuneIcons SVGs vendored into `src/components/icons/` with an attribution note, used for app level icons (nav, positions, actions).

**Demo route**: `src/app/(internal)/design-system/page.tsx`, a new route group. Guarded at top with `if (process.env.NODE_ENV === "production") notFound()`, so it never ships publicly, plus `robots: { index: false }` metadata as a second lock. It renders: every semantic token as a swatch card with its pair text, the full type scale, every base component in every state, all stickers, StatTile filled with sample values (Emergency fund: 6 months of a sample 1,200,000 kobo fixed cost total; Next match: a sample 38,500 kobo amount; both constants defined on the route), MoneyText across three sample amounts, and the PitchView cycling all six seeded formations with sample per slot amounts (the 12 basisPoints of each seed applied to a sample monthly income of 1,200,000 kobo via `src/domain/money.ts`, computed at render, not stored).

**Value sourcing** (what the demo page and pitch view display, and where each value comes from):

| Displayed value              | Source                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formations on the demo pitch | The six seeds already in `src/domain/formations.ts`                                                                                                                                                                                                                                                                                                                                                   |
| Slot coordinates             | New pure function `formationSlotCoordinates` in `src/domain/formations.ts`, decided above                                                                                                                                                                                                                                                                                                             |
| Per slot amounts on the demo | Sample income constant on the route times each slot's `basisPoints`, via `src/domain/money.ts`                                                                                                                                                                                                                                                                                                        |
| StatTile demo values         | Sample constants on the route, formatted through `MoneyText`                                                                                                                                                                                                                                                                                                                                          |
| Money formatting             | `src/domain/money.ts` (spec 0004), via `MoneyText`                                                                                                                                                                                                                                                                                                                                                    |
| Contrast pairs               | The AC-3 pair list against `globals.css` token values, parsed by the Vitest check                                                                                                                                                                                                                                                                                                                     |
| Theme choice                 | next-themes, localStorage, `defaultTheme="dark"`, system honored (AC-7)                                                                                                                                                                                                                                                                                                                               |
| App icon art                 | Master SVGs `public/icons/master.svg` and `public/icons/master-maskable.svg` (padded safe zone, 80 percent rule), rasterized by `scripts/generate-icons.mjs` (run as `node scripts/generate-icons.mjs`, wired as `pnpm icons`), writing `src/app/icon.png` (192), `src/app/apple-icon.png` (180), `public/icons/icon-512.png`, `public/icons/maskable-512.png`, referenced from `src/app/manifest.ts` |
| Voice examples for design.md | The football metaphor copy already in the scope (Payday Whistle, Park the Bus, Tactical Review) plus 6 to 8 do and don't lines written during the build                                                                                                                                                                                                                                               |

**Key invariants**:

- No hex literal outside the raw layer of `globals.css` and the carve out artwork directories.
- Every named token pair passes AA in both themes at merge time (AC-3).
- `src/domain/` stays pure TypeScript: the coordinate function imports nothing (spec 0001 rule).
- Motion is the only animation library in `package.json`.

**Security model**: none new. This slice adds no data access, no actions, and no auth surface; all existing RLS and action rules from spec 0001 stand untouched. The demo route is production guarded, so no sample financial content is ever publicly served.

**Configuration required**:

- None. Fonts are self hosted via `next/font`, icons generate locally with sharp, no new secrets or environment variables.

**Critical test scenarios** (each maps to an AC):

- Happy path: demo page shows all tokens, components, stickers, both themes, and the pitch view rendering all six seeded formations (11 players plus bench) with amounts, verifies **AC-1**, **AC-2**, **AC-5**, **AC-7**, **AC-8**.
- Failure case: Playwright with `reducedMotion: 'reduce'` switches formation and asserts the player node has no transform transition; narrow viewport to 360px and all players plus the bench node stay legible, verifies **AC-5**, **AC-6**.
- Accessibility: the Vitest token pair test passes in both themes; axe scan of the demo route in both themes reports zero contrast or name violations; keyboard reaches and activates every player and control, verifies **AC-3**, **AC-4**.
- Guard: requesting `/design-system` in a production build returns 404, verifies **AC-1** (the system ships, the demo does not).

## Build plan

Ordered by Tracer Bullet: de-risk the integration first, then the thread (tokens to rendered pitch), then thickening, with the audits as the last honest gate.

- [x] 1. Spike: `pnpm dlx shadcn@latest init` (creates `components.json`, writes its own `globals.css` base), add `motion`, `next-themes`, `sonner`; prove a restyled Button renders in both themes on Next 16.4 with Turbopack, and the `@custom-variant dark` setup works. Sequence init BEFORE the token rewrite so it cannot clobber it, verifies **AC-2** groundwork
- [x] 2. Token layer: full two layer `globals.css` per the Standard definition (all pairs get passing values), type scale and weights wired in `src/app/layout.tsx` with `suppressHydrationWarning`, next-themes provider with `defaultTheme="dark"`, `ThemeToggle`, satisfies **AC-2**, **AC-7**
- [x] 3. Copy the shadcn starter set into `src/components/ui/` and restyle onto tokens; build `MoneyText` and `StatTile`, satisfies **AC-1**, **AC-2**, **AC-4**
- [x] 4. Sticker starter set in `src/components/stickers/` (the seven named pieces, GOAAALL as outlined paths), vendor chosen RuneIcons into `src/components/icons/` with attribution, satisfies **AC-8**
- [x] 5. App icons: two master SVGs, `sharp` as devDependency, `scripts/generate-icons.mjs` plus a `pnpm icons` script, generate all four outputs, update `src/app/manifest.ts` entries, satisfies **AC-8**
- [x] 6. Domain: `formationSlotCoordinates` for all six formations in `src/domain/formations.ts` with Vitest unit tests (12 points, bounds, spacing, stable order), satisfies **AC-5**
- [x] 7. PitchView plus PlayerNode: SVG field with the fixed viewBox and markings, bench strip, Motion layout transitions keyed by role slot, reduced motion gating, satisfies **AC-5**, **AC-6**
- [x] 8. Demo route `(internal)/design-system` with the production guard and no index metadata, exercising every token, component, sticker, theme, and the pitch view cycling all six formations, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-7**

- [x] 9. Contrast gates: the Vitest token pair test parsing `globals.css`, axe plus reduced motion and keyboard Playwright specs on the demo route, the ESLint hex rule with carve outs plus the CI grep step, satisfies **AC-3**, **AC-4**

- [x] 10. Write root `design.md` documenting the system as built (prose, token names not hex, voice section, graphics contrast checklist), satisfies **AC-1**

## Consequences

**Positive**:

- Features 5 onward compose proven parts; the formation switch animation in feature 6 is nearly free once Motion plus PitchView exist.
- Accessibility is a merge gate at token level, not a retrofit, and it catches pairs no demo render would show.
- The brand is reproducible: change a raw token, and the contrast test tells you what broke.

**Negative / tradeoffs**:

- The bundle gains Motion (roughly 50kB gzipped) before a single user screen exists.
- Tabs and Tooltip ship unused until a feature picks them; their first real test is not in this slice.
- Agent drawn stickers and vendored RuneIcons need visual review during the build; style drift is possible.
- Two themes double the contrast surface, held down by the pair test rather than by eye.

**Neutral**:

- New dependencies: `shadcn` (CLI, copies code), `motion`, `next-themes`, `sonner`, `@radix-ui` transitives, `sharp` (devDependency), `@axe-core/playwright` (devDependency).
- DiceBear and react-hook-form were considered and declined; revisit react-hook-form only if a multi step dynamic form appears.
- The chart library decision moves to feature 9 (season view), likely recharts since shadcn charts wrap it.
- Next 16.4, React 19, and Tailwind 4.3 are past most training data; task 1 exists because integration surprises, not design, are the top risk here.

## Follow-up

- [ ] `/sync` should load the design conventions into root `AGENTS.md`: the no hex literals rule, MoneyText for all amounts, Motion as the only animation library, and an `impeccable` skills table row (it is installed but not yet referenced there).
- [ ] Feature 9 (season view) owes a chart library decision; start from recharts as the shadcn charts wrapper uses it.
- [ ] Confirm the RuneIcons license permits vendoring SVGs into the repo before the first icon import (check at their site: https://www.runeicons.com/).

## References

**Project sources**:

- `AGENTS.md` and spec 0001: Tailwind v4 tokens in `globals.css`, shadcn/ui, Space Grotesk, the placeholder token comment pointing at this spec, integer kobo money rule
- Spec 0004: `src/domain/formations.ts` seeds (12 positions including BENCH) and the money representation
- `docs/assets/UI_1..3, DES_1..3`: the visual references
- `docs/scope/scope.md` feature 4: Done when criteria and candidate tools
- Installed skills: `impeccable`, `tailwindcss`, `vercel:shadcn`, `playwright-cli`, `vitest`

**Practices & standards**:

- WCAG 2 AA contrast ratios (4.5:1 body text, 3:1 large text and graphics)
- Two layer design tokens (raw palette, semantic consumption) as used by shadcn theming
- `prefers-reduced-motion` gating for all non essential animation
