# Design system

Payday Pitch has one visual language: a paper document about money, with the pitch painted on it, held to WCAG AA. This file documents the system as built, in plain words. It never lists color values. Every value lives in `src/app/globals.css`, and that file is the only place a screen color is written down.

Specs: [0005, the foundation](docs/specs/0005-design-system-ui-foundation.md) and [0009, the identity refresh](docs/specs/0009-visual-identity-refresh.md). Proof page: `/design-system` (dev only, it 404s in a production build).

## Color, in two layers

Layer one is the brand, as raw families named for what they are: `paper-50` to `paper-300`, `forest-600` to `forest-900`, `gold-50` to `gold-700`, `terracotta-300` to `terracotta-700`, `slate-600` and `slate-700`, plus the single inks `ink` and `night`, the turf pair `grass-a` and `grass-b`, and `pitch-line`. Components do not consume them. The exceptions are artwork and browser chrome: the pitch field, the stickers, and `src/lib/brand-palette.ts` (the one place a color is a literal outside CSS, because email clients, the manifest, and the theme color meta tag cannot read a variable).

Layer two is meaning. Components consume only these semantic names, and they are the shadcn names so the copied primitives resolve: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `accent-text`, `destructive`, `destructive-foreground`, `success`, `success-foreground`, `border`, `input`, `ring`, `radius`.

Light is the default: paper values sit in `:root`. Dark sits in `.dark`, and each of its values is written out rather than derived. next-themes sets the class on `<html>`, `defaultTheme` is `light` with `enableSystem` kept, and a stored choice still wins over the default. The toggle stores the choice in localStorage before any account exists.

What the semantic tokens mean here:

| Token                           | Job                                                              |
| ------------------------------- | ---------------------------------------------------------------- |
| `background`, `foreground`      | The page canvas and its body copy                                |
| `card`, `card-foreground`       | A surface lifted off the canvas, and the copy on it              |
| `popover`                       | Menus, tooltips, dialogs: a surface that floats above everything |
| `primary`, `primary-foreground` | The main action. Forest fill in both themes                      |
| `secondary`                     | Quiet chips, tab strips, states that are present but not pushing |
| `muted`                         | Support surfaces: helper blocks, the bench strip, empty states   |
| `accent`                        | The highlight as a _surface_: pale gold in light, gold in dark   |
| `accent-foreground`             | The copy that sits on an accent fill                             |
| `accent-text`                   | Gold used as _text_ on a neutral surface: a link, a selected row |
| `destructive`, `success`        | Money that went wrong, money that went right, deltas and errors  |
| `border`, `input`               | Structure. Never a text color                                    |
| `ring`                          | The focus ring against the canvas                                |

Four rules keep the brand honest:

1. **Gold is never body text in light.** On paper, gold lives as a tint surface (`accent`) or as the deep brown gold of `accent-text`. A bright gold on paper is unreadable, and a unit test fails if `foreground`, `card-foreground`, `muted-foreground`, `accent-foreground`, or `accent-text` is ever pointed at a bright gold in the light theme.
2. **`accent` is a surface, `accent-text` is the type.** Anything that wants gold-colored _copy_ (a link, an active tab, a headline on a suggestion card) uses `accent-text`, which is theme aware: brown gold on paper, bright gold on night. Using `accent` for text gives you a pale wash on paper that nobody can read.
3. **`primary` is a fill, not a text color.** Forest on the night canvas is barely a step up, so in dark the filled button carries a hairline border that lifts it off the surface. Text that needs the brand hue uses `accent-text`.
4. **State colors clear AA on their own tint.** shadcn paints soft errors and confirmations with `destructive/20` and `success/20`, so both tokens are checked as text over that blend on canvas and card, in both themes. Dark error text rides a lighter terracotta than the fill for exactly this reason.

## Type

Four Fontshare families, vendored in `src/app/styles/fonts/` and loaded through `next/font/local` with `variable` bindings, Latin only, `display: "swap"`. No request leaves the app for a font, and a Playwright rule proves it. Each family has one job, and the weight list is capped at what the job uses.

| Role    | Variable         | Family    | Weights                | Where it appears                                                   |
| ------- | ---------------- | --------- | ---------------------- | ------------------------------------------------------------------ |
| Heading | `--font-heading` | Melodrama | 300 to 700 (variable)  | `h1` to `h4`, display figures. Never italic: it has no italic cut  |
| UI      | `--font-sans`    | Switzer   | 400 to 700 plus italic | Body, labels, captions, chips, every input                         |
| Money   | `--font-money`   | Tabular   | 300 to 700 (variable)  | Every amount, through `.money` on `MoneyText`                      |
| Pitch   | `--font-accent`  | Teko      | 300 to 700 (variable)  | Pitch surfaces only: shirt numbers, the bench label, zone headings |

Headings sit at `font-weight: 500` and up, because Melodrama at 300 reads thin on paper in bright light. Body copy is Switzer: the app's UI voice is neutral and quiet so the display face and the figures carry the personality.

The scale is modular at 1.25, mobile first:

| Utility     | Size | Use                                                     |
| ----------- | ---- | ------------------------------------------------------- |
| `text-xs`   | 12px | Captions and labels                                     |
| `text-sm`   | 14px | Secondary copy, control text                            |
| `text-base` | 16px | Body, and every input (16px stops iOS zooming on focus) |
| `text-lg`   | 20px | Card titles                                             |
| `text-2xl`  | 25px | Section headings                                        |
| `text-4xl`  | 39px | Page titles, hero amounts, a StatTile figure            |
| `text-5xl`  | 49px | Display numbers on a wide surface                       |

Money is figures, so it aligns in columns: `.money` sets `font-variant-numeric: tabular-nums` on the money face, and `MoneyText` applies it. Tracking tightens on the large steps (`tracking-tight` on 25px and up).

## Spacing

There is no custom spacing scale. Tailwind's default 4px grid is the whole system, and these are the steps the app actually uses:

- Page gutter: `px-4`, `sm:px-6`.
- Page measure: content columns are capped (`max-w-4xl` on the demo, `max-w-72 sm:max-w-96 md:max-w-lg` on the pitch) so a line never runs long.
- Block rhythm between sections: `space-y-12`, each section opening with a `border-t` and `pt-8`.
- Inside a card: the Card's own `--card-spacing` (16px, or 12px at `size="sm"`). Between a title and its body: `gap-1` or `gap-2`.
- Rows of controls and chips: `flex flex-wrap gap-2`.
- Stacks that need more air than a gap: `gap-3` or `gap-4`.

## Corners

One radius token, `--radius` (0.5rem), scaled by Tailwind: `rounded-sm` for the smallest chips, `rounded-md` for a player badge and small controls, `rounded-lg` for buttons and inputs, `rounded-xl` for cards and dialogs, `rounded-full` only for a shirt number. The step is deliberately crisp: this is a document, not a toy. Nothing is square except the pitch itself, and nothing is a pill except where a number sits.

## Components

Copied and restyled shadcn primitives live in `src/components/ui/`: Button (default, outline, secondary, ghost, destructive, link, plus sizes), Card, Input, Badge, Tabs, Dialog, Tooltip, and the sonner toast. They keep shadcn's accessibility work: real roles, keyboard behavior, focus management, and a visible 3px focus ring drawn with `ring` at 50 percent, on top of the `outline-ring/50` base rule. Inside these files lucide stays untouched.

The app's own pieces live in `src/components/`:

| Component     | What it does                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `MoneyText`   | Renders an amount from integer kobo plus a currency code through `src/domain/money.ts`. Nothing else formats money |
| `StatTile`    | A label, one large figure, an optional delta with direction                                                        |
| `ThemeToggle` | Sun or moon, aria label that names the theme it is switching to                                                    |
| `PitchView`   | A formation drawn on a field, eleven slots plus a bench strip                                                      |
| `PlayerNode`  | One slot: shirt number, purpose, amount. A button when the screen can select it                                    |
| `PitchField`  | The grass and markings, one SVG with a fixed portrait viewBox                                                      |

Four deliberate departures from the copied defaults, all for the identity or for contrast: the `link` variant reads `text-accent-text`; the destructive button and badge keep the same soft tint in both themes rather than a heavier dark tint; an inactive tab uses `text-muted-foreground` instead of a 60 percent alpha of the ink, which falls under AA on paper; and a filled `primary` button in dark carries a 40 percent forest hairline so it lifts off the night canvas.

## Icons and stickers

`@phosphor-icons/react` is the app level icon set. Import from the root (`@phosphor-icons/react`), `weight="regular"` by default and `weight="fill"` for an active or selected state (the fill is the marker, never color alone), `size={16}` for inline chrome and `size={20}` for nav and buttons, color always `currentColor` so a token controls it, and `aria-hidden` because the label beside it carries the meaning. The old vendored RuneIcons set is gone.

The sticker set is hand drawn pen line, inline SVG, token fills, in `src/components/stickers/`: ball, boots, whistle, goal net, sparkle, warning card, and the GOAAALL banner. The banner spells its word as letter outlines, not a `<text>` node, so it needs no font. Stickers mark emotion, not information: a celebration, a warning, a milestone. Never a control, never a data point.

## The pitch

The field is painted turf, not a screen: `grass-a` and `grass-b` stripes, white lines at a lower alpha in light and a higher one in dark, both read from `--pitch-line`. A player is a gold plate (`bg-accent` with `text-accent-foreground`) carrying a Teko shirt number, with the amount under it in the money face on a night chip. Gold clears 3:1 on both grass stripes in both themes, and the pair contract checks it. Selection adds a border and a fill weight, so it never depends on color alone.

## Motion

Motion (`motion/react`) is the only animation library. A formation switch moves players with `layout` transitions keyed by role slot (`GK-0`, `DEF-1`, and so on), so the same player travels between shapes instead of fading out and back in. The spring is stiffness 380, damping 32: quick, with a small settle.

Everything animated respects `prefers-reduced-motion`. `src/lib/use-prefers-reduced-motion.ts` subscribes to the media query, so the value is correct on the client and a server rendered attribute cannot go stale. Under reduce, players jump to their new slot and no transform transition runs.

## Voice of the interface

The app talks like a manager talking to a player about the season, not like a bank. Short sentences. The football metaphor carries the structure of the product, so the feature names are already the voice: Payday Whistle, Park the Bus, Tactical Review, the Guilt-Free Sub.

Do:

- Name the money moment, then the number. "Covered. Your debts are fully paid this month."
- Use the position words the formation already teaches: defend, midfield, strike, bench.
- Say what happens next in one line. "Send it and the pitch updates."
- Keep amounts as the app formats them, with the naira sign, never a float you built by hand.
- Let a win be loud, once. GOAAALL belongs to a completed month.

Don't:

- Do not scold a bad month. "The bus is parked. Costs came first" beats "You overspent."
- Do not mix metaphors inside one line. A salary is not a pass and a wallet is not a trophy.
- Do not use football words where the user needs a money word, such as a receipt, a fee, or an interest charge.
- Do not put a joke in an error. State what failed and what to try.

## Anti-slop rules

Enforced by review, on every surface:

- No gradient headline text.
- No glassmorphism.
- No emoji as icons.
- No purple or blue-violet brand hue.
- No default shadcn radius or shadow left visible.
- No centered hero with three feature cards.
- No neon on near black.
- No accent color as body text.

Banned families (all free on Fontshare, all the current AI default): Inter, Space Grotesk, Poppins, Geist, Plus Jakarta Sans, Manrope, Outfit, Sora, Montserrat.

## Graphics contrast checklist

Text pairs are enforced by a unit test (`src/lib/tokens.test.ts` reads the values straight out of `globals.css`, composites the tints, and checks each pair in the theme it claims) and by an axe scan of the demo page in both themes. Non text graphics are the part a scan cannot see, so check them by hand for each new screen:

- [ ] Focus ring against the surface behind it, at least 3:1 in both themes.
- [ ] Any border or separator that conveys meaning (not decoration) at least 3:1.
- [ ] The gold shirt number on its plate, and the plate on both grass stripes.
- [ ] Pitch line markings on both grass stripes, at both theme settings.
- [ ] Sticker strokes and fills against whatever sits behind them, including the 320px phone layout.
- [ ] Icons at their real size, not the size they are drawn at.
- [ ] Any state shown by color alone (a delta arrow, a covered slot) also shown by shape or text.

## Running the gates

```bash
pnpm test          # token pair contrast, vendored font budget, domain rules
pnpm check:hex     # no raw color outside the token layer and the palette module
pnpm test:e2e      # axe in both themes, keyboard, 360px, reduced motion, the demo 404 guard
```
