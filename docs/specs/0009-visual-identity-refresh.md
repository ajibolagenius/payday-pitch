# 9. Visual identity refresh

**Date**: 2026-10-25
**Status**: In Progress

## Summary

Replace the look of the app while keeping the system underneath. The current skin (dark canvas, electric yellow, one grotesque) is the most common signature of AI generated apps, so the product reopens it. The new identity leads with formality: warm paper surfaces by default, a deep forest green as the brand color, amber gold as the single money accent, terracotta and warm slate for state, and four Fontshare faces (Melodrama for headings, Switzer for body copy, Tabular for amounts, Teko on the pitch only). The two layer token system, the component kit, and the pitch view all stay; every value, font, icon, and surface gets re-skinned onto them, and the automated contrast test keeps both themes honest.

## Context

Spec 0005 shipped the design system and its skin. The scope (feature 4) keeps the system and reopens the skin: dark near black with one neon accent and one grotesque is what every AI generated dashboard looks like in 2026, and a product about personal wealth needs to read like a private banking report first and a football app second. The audience is Nigerian salary earners on phones, many on slow data plans, so type must be vendored and lean, not streamed. Money legibility is a product requirement, not decoration: columns of naira amounts have to align by the font's own design.

Forces at play:

- The two layer token structure (raw values, then semantic names) is proven and stays; the refresh must not restructure it (spec 0005 AC-2 still holds).
- WCAG AA in both themes is a merge gate enforced by `src/lib/tokens.test.ts`, which parses `globals.css`. Any new palette must pass that test, and the pair contract itself needs extending for gold on paper.
- shadcn/ui primitives are copied into the repo and render `lucide-react` glyphs internally; the registry expects them to stay stock so future component adds apply cleanly.
- Vendored RuneIcons turned out to be near dead code: only the design system demo imports them, and the actual app chrome uses `lucide-react`. The scope line "Phosphor replaces RuneIcons" must be restated as "Phosphor becomes the app level icon set" or it lands on nothing.
- next-themes stores the user's choice in localStorage; flipping the default must not silently override a choice a returning user already made.
- The emails script carries its own copies of the old palette and one gray already drifted from the app. Duplicate color data is how the identity rots.
- Motion and reduced motion gating are untouched; this is paint, not machinery.

## Requirements

**User stories**:

- As a new visitor, I want the app to open on warm paper with serif headings so that it reads as a financial instrument, not a neon dashboard.
- As a returning user who picked a theme, I want my choice honored so that the refresh does not move things under my hands.
- As a user reading amounts, I want a figure built font with lining tabular numerals so that money columns align and read as money.
- As the developer of any later slice, I want one restyled token layer and one icon convention so that every new screen lands on the new identity for free.
- As a user with low vision, I want every new pair to clear AA in both themes so that the new skin is no harder to read than the old one.

**Acceptance criteria** (the contract; `/check verify` checks against it):

- **AC-1**: `design.md` is rewritten to the new system: type roles, the paper first palette in both themes, spacing, corners, the icon convention, the sticker and pitch guidance, voice, and the anti-slop rules named as a list. Hex values appear only in `src/app/globals.css`, `src/lib/brand.ts`, the new `src/lib/brand-palette.ts`, and the artwork carve out (`src/components/pitch/**`, `src/components/stickers/**`).
- **AC-2**: Space Grotesk is fully removed: no `next/font/google` font import remains, and no live code or copy string references it.
- **AC-3**: The four Fontshare families are vendored in the repo and loaded through `next/font/local` with `variable` bindings; a Playwright route abort rule proves no request reaches any font CDN at load. Weights are limited to those the roles use (Melodrama 300 to 700, Switzer 400 to 700 plus roman italic 400, Tabular 400 to 700, Teko 400 to 700), Latin characters only, and the summed vendored font bytes stay under 350 kB (a Vitest check over the fonts directory).
- **AC-4**: `globals.css` carries the new two layer contract exactly as specified below: the new raw layer, a complete semantic light layer (the default), and a written out dark layer with an explicit value for every token. The old values (`#1b4638`, `#f5ff6b`, `#101010`) appear nowhere except superseded history.
- **AC-5**: The updated pair contract in `src/lib/tokens.ts` passes in Vitest, including the new gold checks (gold text on paper in light, gold text on forest surfaces in dark), and the demo route passes the axe contrast scan in both themes.
- **AC-6**: The app opens on paper: `defaultTheme` is `light` with `enableSystem` kept, a stored choice still wins, and the ThemeToggle flips both themes correctly.
- **AC-7**: `@phosphor-icons/react` is the app level icon set: `runeicons.tsx` is deleted, no orphaned import remains (`pnpm typecheck` and `pnpm lint` clean), `lucide-react` appears nowhere outside `src/components/ui/**` (a repo grep gate), and at least one active state pair uses `weight="fill"` (a grep gate on the count). shadcn internals keep their stock lucide glyphs.
- **AC-8**: The pitch view reads as the same product under the new skin: the new grass pair, shirt numbers and formation labels in Teko, player nodes on semantic tokens, white pitch lines at the new alphas; keyboard reach and reduced motion behavior of the existing Playwright specs stay green.
- **AC-9**: One color source feeds the periphery: `src/lib/brand.ts` exports the new forest value, `src/app/manifest.ts` and the viewport theme color read it, `pnpm icons` regenerates the app icon set from re-painted master SVGs in the new palette, and `scripts/render-emails.mts` imports the shared palette from `src/lib/brand-palette.ts` instead of holding literals.
- **AC-10**: Every built surface in the surfaces inventory below renders in the new identity in both themes with no old palette residue, proven by the axe scan across the exercised routes in both themes plus one recorded visual review pass per theme at the demo page.
- **AC-11**: `pnpm check:hex`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` are green on the branch.

## Options considered

### Option 1: Coordinated single switch on one branch (chosen)

One `feat/visual-identity-refresh` branch flips tokens, type, theme default, icons, and every surface in one reviewed change; each commit is one milestone (type and tokens, then icons, then surfaces, then peripheral color sources), and every commit lands with the contrast test passing.

**Pros**:

- Nobody ever sees half the identity; the demo page and the pair test gate every commit.
- No flag machinery, no second palette to maintain, simple review.

**Cons**:

- A big branch; if late surprises pile up, the branch grows before it merges.

### Option 2: Strangler, old and new side by side

Ship the new token layer behind a class or flag, migrate surfaces screen by screen, keep both skins during the transition.

**Pros**:

- Small mergeable increments; rollback per surface.

**Cons**:

- Users would meet two products at once, which is exactly what an identity refresh exists to prevent; the pair test must then check two palettes. Justified for a live user base; this app has none yet.

### Option 3: Keep lucide as the app icon set

Adopt the new palette and type, skip Phosphor, keep the current `lucide-react` usage.

**Pros**:

- Zero icon churn; lucide is already everywhere in the app.

**Cons**:

- Lucide is the default icon set of AI generated frontends, the same signature this refresh exists to remove; the scope already adopted Phosphor, and regular plus fill weights carry the pitch and state language better.

## Decision

**Chosen option**: Option 1: Coordinated single switch on one branch

Re-skin the shipped system in one coordinated branch: vendored Fontshare type on four role bound variables, the paper first palette as the new raw and semantic layers (light default, dark kept with its own written out values), Phosphor as the app level icon set with lucide staying only inside shadcn internals, one shared palette module feeding emails, manifest, and app chrome, and the contrast pair contract extended to cover gold on paper.

**Implementation skills**: `impeccable` (global, `~/.agents/skills/impeccable/`, the design skill that governs surface work) · `tailwindcss` (Tailwind v4 token conventions) · `vitest` (`.claude/skills/vitest/`, the pair test update) · `playwright-cli` (e2e gates) · `sharp` (`.agents/skills/sharp/`, icon regeneration behind `pnpm icons`)

## Rationale

The direction itself was deliberated in the scope box for feature 4 (fonts checked against the live Fontshare catalog on 2026-10-25, the paper first color strategy, Phosphor adopted); this spec settles what was still open there, each decided with the engineer: concrete hex values in the spec rather than at build time, Phosphor across app code but not shadcn internals, vendored fonts rather than the Fontshare CDN, stored theme choices honored. The value layer is fixed here because it is the largest brand decision the build would otherwise invent (basis: the Asks vs acts rule against silently deciding load bearing choices). The single switch wins over a strangler because there are no live users to protect and a half migrated identity defeats the purpose (basis: strangler pattern is for production traffic, and none exists). Icons follow the real code, not the scope's old wording: the scan showed RuneIcons only survives in the demo, so AC-7 restates the swap as app level coverage (basis: the codebase audit in Context). Gold is the one risky hue, so it is pinned with passing math, not vibes: every value below was computed against WCAG before being written into this spec (basis: WCAG 2 AA contrast ratios).

## Feature design

**Type contract** (fixed, not left to the build):

| Variable         | Family               | Weights                             | Role                                                                                                                                                     |
| ---------------- | -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--font-heading` | Melodrama (variable) | 300 to 700                          | Headings h1 to h4 and display figures that are not amounts. Melodrama has no italics; never set it italic                                                |
| `--font-sans`    | Switzer (variable)   | 400, 500, 600, 700 plus true italic | UI copy, body, labels, captions                                                                                                                          |
| `--font-money`   | Tabular (variable)   | 400, 500, 600, 700                  | Every amount: the `.money` class in `globals.css` sets this family plus `font-variant-numeric: tabular-nums`; `MoneyText` keeps using `.money` unchanged |
| `--font-accent`  | Teko (variable)      | 400 to 700                          | Pitch surfaces only: shirt numbers, formation labels, zone headings                                                                                      |

Loaded through `next/font/local` in `src/app/layout.tsx`, one variable file per family with the `weight` range (for example `"300 700"`), except Switzer, which also gets its roman italic 400 cut as a separate `src` entry with `style: "italic"` (variable files cannot synthesize the italic). Files vendored under `src/app/styles/fonts/` (any directory works; `src/` keeps them out of the public bundle), `display: "swap"`, `variable` bindings (not `className`, because SVG and library surfaces read the vars), plus the documented `fallback` option; one `fontshare.css` attribution note beside them records the license terms checked on the download day (all Fontshare fonts are free for personal and commercial use; re-read the terms at download). `@theme inline` gains `--font-money` and `--font-accent`; the `.driver-popover.tour-popover` rule switches from the old font var to `--font-sans`. A Vitest check (`src/lib/fonts.test.ts`) sums the vendored font bytes and fails over 350 kB, the payload budget for slow data plans.

**Color contract** (Layer 1 raw, verified against WCAG AA at writing time):

```css
:root {
  /* paper first surfaces (warm) */
  --paper-50: #fffdf8;
  --paper-100: #f6f3eb;
  --paper-200: #eae5d8;
  --paper-300: #ddd8c9;
  /* deep forest, the brand hue */
  --forest-600: #2e6b4e;
  --forest-700: #1c4534;
  --forest-800: #143428;
  --forest-900: #0e241c;
  /* amber gold, the single money accent */
  --gold-50: #fff1cf;
  --gold-200: #f0c75e;
  --gold-300: #e3b23c;
  --gold-500: #c89321;
  --gold-600: #b07f1b;
  --gold-700: #7a5410;
  /* terracotta, state only (debt, warnings, errors) */
  --terracotta-400: #e07a5f;
  --terracotta-500: #c95d41;
  --terracotta-600: #b2452c;
  --terracotta-700: #8a3018;
  /* warm slate, quiet neutrals */
  --slate-600: #5c564c;
  --slate-700: #3a352b;
  --ink: #241f17;
  --night: #12160f;
  --night-card: #1b201a;
  /* pitch line art: white at low alpha on grass in light, higher in dark */
  --pitch-line: rgb(255 255 255 / 0.5);
  --radius: 0.5rem;
}
```

Old raw names `--pitch-green`, `--volt`, `--surface-black` are removed; `--paper` and `--ink` are redefined onto the new values. The grass becomes raw vars `--grass-a: #254A34` and `--grass-b: #2C553D` (a deeper, dirtier pair that reads as painted turf, not neon; raw vars, so the pair test can reach them and the player plate can be checked against them).

**Color contract** (Layer 2 semantic). Light is the default; dark gets its own written out values. Components keep consuming only these names.

```css
/* Light, the paper theme (default) */
:root {
  --background: var(--paper-100); /* #F6F3EB */
  --foreground: var(--ink); /* #241F17, 14.8:1 */
  --card: var(--paper-50); /* #FFFDF8 */
  --card-foreground: var(--ink);
  --popover: var(--paper-50);
  --popover-foreground: var(--ink);
  --primary: var(--forest-700); /* #1C4534 */
  --primary-foreground: #ffffff; /* 10.8:1 */
  --secondary: var(--paper-200); /* #EAE5D8 */
  --secondary-foreground: var(--forest-800);
  --muted: var(--paper-200);
  --muted-foreground: var(--slate-600); /* #5C564C, 6.6:1 */
  --accent: var(
    --gold-50
  ); /* #FFF1CF, gold tint surface (a tint, not a fill) */
  --accent-foreground: var(--gold-700); /* #7A5410, 6.0:1 on the tint */
  --destructive: var(
    --terracotta-700
  ); /* #8A3018, 7.5:1 as text, 5.7:1 on a /20 tint */
  --destructive-foreground: #ffffff; /* 5.6:1 */
  --success: var(--forest-600); /* #2E6B4E, white on it 6.3:1 */
  --success-foreground: #ffffff;
  --border: var(--paper-300); /* #DDD8C9 */
  --input: #c4beab;
  --ring: var(--gold-700); /* 6.1:1 on paper */
}

/* Dark, kept as a theme, forest tinted night */
.dark {
  --background: var(--night); /* #12160F */
  --foreground: #f2efe6; /* 15.9:1 */
  --card: var(--night-card); /* #1B201A */
  --card-foreground: #f2efe6;
  --popover: #161b14;
  --popover-foreground: #f2efe6;
  --primary: var(--forest-700); /* #1C4534, lifted off the night canvas */
  --primary-foreground: #ffffff; /* 10.8:1 */
  --secondary: #23281f;
  --secondary-foreground: #e9e6dc; /* 11.7:1 */
  --muted: #262a23;
  --muted-foreground: #ada99c; /* 6.2:1 */
  --accent: var(--gold-200); /* #F0C75E, gold fill home in dark */
  --accent-foreground: var(--ink); /* #241F17 on gold, 8.3:1 */
  --destructive: var(--terracotta-400); /* #E07A5F, 6.2:1 as text on night */
  --destructive-foreground: var(--night);
  --success: #5fb98a;
  --success-foreground: var(--night); /* 7.7:1 */
  --border: #33362c;
  --input: #454a3d;
  --ring: var(--gold-200); /* 11.4:1 */
  --pitch-line: rgb(255 255 255 / 0.75);
}
```

**Pair contract** (`src/lib/tokens.ts` keeps its role as the machine checked contract, with three changes). One: `TokenPair` gains a `theme` field (`"light" | "dark" | "both"`, default `"both"`) because some pairs are theme specific by design. Two: it gains an optional `over: { token, alpha }` on the background side, and `src/lib/tokens.test.ts` composites the blend (the same alpha over math Tailwind does for `bg-destructive/20`) before measuring, because shadcn tints surfaces. Three: the test also reads the `--grass-a` and `--grass-b` raw vars so artwork pairs are checkable. The existing eleven pairs stay at `"both"`; additions: `background`/`accent-foreground` and `card`/`accent-foreground` (4.5, light, gold ink on paper and card); `background`/`accent-foreground` and `card`/`accent-foreground` (4.5, dark, ink on the gold fill); `primary`/`accent-foreground` (gold text on the forest button, 4.5, dark); `accent`/`grass-a` and `accent`/`grass-b` (the player plate on turf, 3, both, the check that replaces the old volt on grass rule); `destructive` and `success` as text `over` their own 0.2 alpha tint on both `background` and `card`, in both themes (the terracotta values above are computed against this rule). The computed values above all pass; the test is the gate, not this table.

**Radius and shadow**: `--radius` moves 0.625rem to 0.5rem (crisper, formal; the derived sm, md, lg, xl scale follows automatically). Cards keep the shipped border first treatment; no default shadcn shadow is left visible anywhere (anti-slop rule).

**Anti-slop rules** (recorded verbatim in `design.md`, and enforced by review): no gradient headline text, no glassmorphism, no emoji as icons, no purple or blue-violet brand hue, no default shadcn radius or shadow left visible, no centered hero with three feature cards, no neon on near black, no accent color as body text. Banned families (all free on Fontshare, all the current AI default): Inter, Space Grotesk, Poppins, Geist, Plus Jakarta Sans, Manrope, Outfit, Sora, Montserrat.

**Icons**: add `@phosphor-icons/react`; import from `@phosphor-icons/react` with `weight="regular"` as the default and `weight="fill"` for active or selected states; `size={16}` for inline chrome, `size={20}` for nav and buttons, color always `currentColor`. Delete `src/components/icons/runeicons.tsx`; swap app level `lucide-react` imports (found by grepping `lucide-react` outside `src/components/ui/**`: theme toggle, stat tile, and anything else the build turns up) to Phosphor equivalents. shadcn internals (`src/components/ui/**`) keep lucide untouched.

**Surfaces inventory** (every built surface the skin pass must cover):

| Surface                                                 | What the pass touches                                                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` marketing placeholder, `/offline`, `/auth/callback` | Tokens only; check nothing custom lingered                                                                                                                    |
| Sign in, sign up, verify email, recover, reset          | Form chrome, links, toasts, on paper                                                                                                                          |
| `/app` home, walk flow (4 steps), `/app/tactics`        | Cards, chips, badges, suggestion card, editor, tour popover                                                                                                   |
| Pitch view and bench strip                              | Grass vars `--grass-a/b`, player nodes (plate on `--accent`/`--accent-foreground`, white focus ring on turf), Teko shirt numbers and bench label, zone labels |
| Stickers                                                | Nothing in code (they draw on `currentColor`); visual check in both themes                                                                                    |
| Design system demo page                                 | Swatches regenerate from tokens; fix the Space Grotesk copy string; Phosphor set shown                                                                        |
| Toaster, tooltip, dialogs, sheets                       | Semantic tokens; verify focus rings in the new gold                                                                                                           |
| Driver.js tour popover                                  | Font var and token values already read CSS vars; retarget the font line                                                                                       |
| Auth emails (`scripts/render-emails.mts`)               | Palette imports `src/lib/brand-palette.ts`; forest button on paper, gold accents, terracotta warnings                                                         |
| App chrome                                              | `src/lib/brand.ts` forest value, `public/icons/master*.svg` re-painted (forest field, gold ball), `pnpm icons`, manifest and viewport theme colors            |

**Email palette mapping** (the six slots `scripts/render-emails.mts` passes into the react email templates, fixed here so the build invents nothing):

| Slot                          | New value | Read as                                 |
| ----------------------------- | --------- | --------------------------------------- |
| `pitch` (button fill, header) | `#1C4534` | forest 700                              |
| `onPitch` (text on pitch)     | `#FFFFFF` | white, 10.8:1                           |
| `ink`                         | `#241F17` | warm ink                                |
| `paper` (page background)     | `#F6F3EB` | paper 100                               |
| `card`                        | `#FFFDF8` | paper 50                                |
| `muted`                       | `#5C564C` | slate 600 (fixes the drifted `#71717a`) |

All six live as named exports in `src/lib/brand-palette.ts`; the emails script, `brand.ts`, `manifest.ts`, and the viewport theme color import from it, and the template prop shapes do not change.

**Value sourcing** (each displayed or produced value and where it comes from):

| Value                    | Source                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Theme default            | `defaultTheme="light"` in `src/components/providers.tsx`; stored choice wins through next-themes (AC-6)                   |
| Font files               | Downloaded from the Fontshare catalog during the build, vendored under `src/app/styles/fonts/` (AC-3)                     |
| Token values             | Written out in `globals.css` above; the Vitest pair test reads them from the file (AC-5)                                  |
| Gold passes on paper     | Computed ratios recorded in this spec; the pair contract rechecks on every run                                            |
| Email colors             | `src/lib/brand-palette.ts`, the only literal source outside `globals.css`, imported by `scripts/render-emails.mts` (AC-9) |
| Manifest and theme color | `src/lib/brand.ts` forest constant (AC-9)                                                                                 |
| App icon art             | Re-painted `public/icons/master*.svg`, rasterized by `pnpm icons` (AC-9)                                                  |
| Pitch grass and lines    | Component constants plus `--pitch-line` (AC-8)                                                                            |

**Key invariants**:

- One hex literal source outside `globals.css`: `src/lib/brand-palette.ts`. `src/lib/brand.ts` keeps its exports but re-exports values from the palette module, so forest exists once. The two files plus the artwork directories are the whole carve out list (`check:hex` and the ESLint rule both gain `brand-palette.ts`).
- Teko renders only inside `src/components/pitch/**`: the shirt number, the bench strip label, and the position legend. Formation chips in the picker, the tactics board, and the walk are Switzer.
- On grass, player node focus shows a white ring with `outline-offset` (the gold ring token is measured against canvas and card, not turf).
- The dark filled Button carries a hairline `border-primary/40` so a forest 700 button lifts off the night canvas; shape plus tone, not color contrast, does that separation.
- Components consume semantic tokens only; artwork may reference raw vars.
- Melodrama is never italic (it has no italic cut); Switzer carries all italics.
- Teko renders only on pitch surfaces.
- Every pair in the contract passes AA in its declared theme(s) at merge time.
- Motion stays the only animation library; reduced motion gating untouched (out of scope for change).

**Configuration required**: none. No new env vars or secrets; the Phosphor package is a normal dependency.

**Critical test scenarios** (each maps to an AC):

- Happy path: fresh visitor (no stored theme) on a phone sees paper, Melodrama headings, Tabular amounts; toggling reaches the dark night theme and back, verifies **AC-4**, **AC-6**, **AC-10**.
- Returning user: a pre-seeded localStorage dark choice survives the deploy and still renders dark, verifies **AC-6**.
- Contrast: `pnpm test` runs the pair contract in both themes; the demo route axe scan reports zero contrast violations in light and dark, verifies **AC-5**.
- Font loading: a Playwright route abort rule fails the test if any request targets `api.fontshare.com` or `fonts.gstatic.com`; the vendored byte budget check passes, verifies **AC-3**, **AC-2**.
- Icons: full repo grep finds `lucide-react` only under `src/components/ui/**`; typecheck and lint clean after the RuneIcons file deletion, verifies **AC-7**.
- Pitch regression: existing Playwright specs (formation switch, keyboard reach, reduced motion) pass under the new skin; the shirt number element reports a computed `font-family` matching the Teko family name emitted by `next/font`, verifies **AC-8**.

## Build plan

Ordered by Tracer Bullet for a skin: the thread is tokens to rendered pitch, so type and tokens land first (everything else consumes them), then the icon convention, then surfaces from the risky one (the pitch) outward, then the peripheral color sources, and the gates close it. One milestone per commit keeps the branch reviewable.

1. Vendor the four Fontshare families (one variable file each, plus Switzer roman italic 400), wire `next/font/local` in `src/app/layout.tsx` with `variable` bindings, rebind `@theme inline` font vars, add `--font-money` and `--font-accent`, set the `.money` and heading rules, retarget the tour popover font, add the 350 kB font budget Vitest check, satisfies **AC-2**, **AC-3**
2. Replace the raw layer and both semantic layers in `globals.css` with the contract above, flip `defaultTheme` to `light`, set `--radius` to 0.5rem, add the dark button hairline border, and rewrite the "volt yellow rule" block in `src/lib/tokens.test.ts` (it resolves `--volt` by name and would throw once the raw var is gone) into the new bright gold rule, satisfies **AC-4**, **AC-6**
3. Reshape the pair contract: add the `theme` and `over` fields to `TokenPair`, implement alpha compositing and raw var reading in `src/lib/tokens.test.ts`, extend the pair list with the gold, plate on grass, and state text on tint checks, run it green, satisfies **AC-5**
4. Install `@phosphor-icons/react`, delete `runeicons.tsx`, swap app level lucide imports (everything outside `src/components/ui/**`), update the demo page icon gallery, satisfies **AC-7**
5. Re-skin the pitch: grass constants, player node tokens, Teko shirt numbers and formation labels, `src/lib/brand.ts` value; re-run the pitch Playwright specs, satisfies **AC-8**
6. Skin pass on every surface in the inventory (auth screens, walk, tactics, home, offline, demo copy string, toasts, dialogs, tour), satisfies **AC-10**
7. Rewrite the e2e suite onto the new identity: `tests/e2e/installable-app.spec.ts` (asserts the Space Grotesk family string and the old theme color hex twice) and `tests/e2e/design-system.spec.ts` (its second theme scan clicks "switch to light" assuming a dark default), asserted through the `--font-*` vars and the palette module instead of literals, satisfies **AC-2**, **AC-6**, **AC-10**, **AC-11**
8. Create `src/lib/brand-palette.ts` as the single literal source (the six email slots above plus forest), point `src/lib/brand.ts` re exports, `scripts/render-emails.mts`, `src/app/manifest.ts`, and the viewport theme color at it, re-paint the two master icon SVGs, run `pnpm icons`, add `brand-palette.ts` to the `check:hex` and ESLint carve outs, satisfies **AC-9**, **AC-1**
9. Rewrite `design.md` to the new system including the anti-slop rules verbatim; run the full gate set (check:hex, lint, typecheck, test, test:e2e with axe in both themes), satisfies **AC-1**, **AC-11**

## Migration plan

**Strategy**: coordinated single switch on one branch (no live users to strangle around); each commit keeps the pair test green.
**Phases**:

1. Type and tokens (plan tasks 1 to 3): the whole app repaints through the token layer; screens may show icon inconsistency, nothing breaks.
2. Icons and surfaces (tasks 4 to 6): the skin completes outward from the pitch.
3. Peripheral color sources and docs (tasks 7 to 8): emails, icons, manifest, `design.md`.
   **Rollback**: revert the branch; the old values live on in git history and spec 0005. Nothing at runtime depends on the old tokens (no persisted CSS), and next/font output is hashed, so a revert needs no cache surgery beyond a normal deploy.
   **Risks**:

- Font weight creep: four families tempt the build into shipping every cut; the contract pins the weight lists, and the subset check keeps payloads lean.
- The pair test assumes both themes for every pair and resolves `--volt` by name; task 2 rewrites that rule block and task 3 reshapes the contract, so land task 3's test change together with task 2's token flip in one commit if separating them fights the test.
- Service worker caching: font and asset URLs are hashed by the build, so the sw version flip on deploy invalidates cleanly; no `/app` page caching exists to leak the old skin.
- Melodrama at 300 on paper can read thin in bright light; the demo page and the axe scan are the check, and design.md pins headings at 500 and up except display figures.

## Consequences

**Positive**:

- The product stops resembling every AI generated dashboard; a private banking voice fits a wealth building promise.
- Amounts align by the font's own design (Tabular), removing a class of "money looks wrong" defects for later slices.
- One palette module feeds app, emails, manifest, and icons, so the drift the emails script already shows cannot recur.
- The existing gates (pair test, axe, check:hex) carry the whole refresh; almost no new machinery.

**Negative / tradeoffs**:

- Four font families add weight even subset to used weights; the Latin only, pinned weight lists are the mitigation, and it is a real cost on slow data plans.
- shadcn internals keep lucide, so two icon styles coexist in small spots (dialog close, select chevron); accepted consciously.
- Gold is a harder accent than volt was: as a fill it needs dark ink on it, and the AA-checked gold text values are browns (gold-700), not brights. Some designed screens will want brighter gold for decoration only; the anti-slop rules hold that line at review.
- Spec 0005's palette, type, and AC-7 values are superseded; its structure survives but its numbers are history.

**Neutral**:

- New dependency: `@phosphor-icons/react`. Removed: the vendored RuneIcons file.
- Returning users with no stored theme (they always took the default) will land on paper for the first time.
- `videos/payday-credit-alert` keeps the old skin as a shipped marketing artifact (decided in the design conversation).

## Follow-up

- [ ] Re-read the Fontshare license terms at download time and record the check date beside the vendored files (the `fontshare.css` note in AC-3).
- [ ] Marketing owes a re-rendered promo film in the new identity when it next needs one; the old credit-alert video stays as shipped history.
- [ ] `/sync` should update the stale references after merge: root `AGENTS.md` (the Space Grotesk mention in the Stack section, the carve out list gaining `src/lib/brand-palette.ts`), spec 0001's binding stack row (it still names Space Grotesk through `next/font/google`), and scope feature 4's "Phosphor replaces RuneIcons" wording (the real swap replaced app level lucide usage; RuneIcons only survived in the demo). The motion and MoneyText rules are unchanged.
- [ ] Feature 16 (landing page) and feature 9 (season view) build on the new identity directly; `UI_2` analytics references get re-checked against the paper palette when feature 9 designs.

## Amendment A1 (measured, during /develop, authorized by the engineer 2026-10-25)

The pair contract as written (state text composited at 0.2 over its own tint on
`background` and `card`, both themes) fails on two pinned values, and three dark
gold pairs as literally listed resolve ink on the canvas rather than a real
surface. The build applies these measured corrections; every other pinned value
stands. `/architect` should fold this into the body at ratification.

1. **Dark error text**: `--destructive` in `.dark` becomes a new raw
   `--terracotta-300: #EB9680` (text token; terracotta-400 stays in the raw
   layer for artwork and plain fills). Ratios: 8.0 on night and 7.2 on night
   card plain; 5.6 and 5.0 on its own 0.2 tint; clears the contract in both
   roles it plays as text.
2. **Success tint check**: `TokenPair` gains an optional `text` field naming
   the token used when the color is painted as text on its own tint (the fill
   role keeps `background`). Light success text checks resolve `forest-700`
   (6.8 on the canvas tint, 7.4 on the card tint); the light fill stays
   `--forest-600` with white on it at 6.3. Dark success `#5FB98A` already
   passes its tint checks (5.4, 4.8) and needs no text override.
3. **Dark gold pairs restated** (the literal `background`/`accent-foreground`
   lines resolve ink on night, which no screen contains):
   - ink on the gold fill is the existing `accent`/`accent-foreground` pair,
     now theme aware: light reads gold-700 on the gold-50 tint (6.0), dark
     reads ink on gold-200 (8.3). The two duplicate light lines are dropped.
   - gold text on forest surfaces becomes an explicit raw pair:
     `primary`/`gold-200` at 4.5, dark (6.7 actual), plus `grass-a`/`gold-200`
     and `grass-b`/`gold-200` at 3, both (6.0 and 5.5 actual).

## References

**Project sources**:

- `docs/scope/scope.md` feature 4: the decided direction, the catalog check of 2026-10-25, anti-slop rules, candidate tools
- Spec 0005: the two layer structure, the pair test mechanism, the pitch contract this refresh reuses untouched
- Root `AGENTS.md`: the hex carve out rule, MoneyText rule, Motion rule, branch and PR golden rules
- Codebase scan 2026-10-25: RuneIcons imported only by the demo page; app chrome on `lucide-react`; emails script holding duplicate literals

**Practices & standards**:

- WCAG 2 AA contrast ratios (4.5:1 body text, 3:1 large text and graphics), computed per pair at spec time
- Design tokens as a contract (the pair test over the token file, not over screenshots)
- Vendored fonts with pinned subsets for slow networks; next/font local loading with swap and fallbacks
- Strangler pattern evaluated and declined for want of live traffic; coordinated switch chosen instead
