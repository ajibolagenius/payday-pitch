# Design system

Payday Pitch has one visual language: the look of a football pitch at night, held to WCAG AA. This file documents the system as built, in plain words. It never lists color values. Every value lives in `src/app/globals.css`, and that file is the only place a color is written down.

Spec: [docs/specs/0005-design-system-ui-foundation.md](docs/specs/0005-design-system-ui-foundation.md). Proof page: `/design-system` (dev only, it 404s in a production build).

## Color, in two layers

Layer one is the brand. Six raw values, named, defined once: `--pitch-green`, `--volt`, `--surface-black`, `--paper`, `--ink`, and `--pitch-line`. Components do not consume them. The two exceptions are artwork and browser chrome: the pitch field, the stickers, and `src/lib/brand.ts` (which holds the one hex that a manifest and a theme color meta tag need).

Layer two is meaning. Components consume only these semantic names, and they are the shadcn names so the copied primitives resolve: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `success`, `success-foreground`, `border`, `input`, `ring`, `radius`.

Light values sit in `:root`. Dark values sit in `.dark`, and each of them is written out rather than derived. next-themes sets the class on `<html>`, the app opens dark by default (`defaultTheme="dark"`), honors the system preference, and a toggle stores the choice in localStorage before any account exists.

What the semantic tokens mean here:

| Token                           | Job                                                              |
| ------------------------------- | ---------------------------------------------------------------- |
| `background`, `foreground`      | The page canvas and its body copy                                |
| `card`, `card-foreground`       | A surface lifted off the canvas, and the copy on it              |
| `popover`                       | Menus, tooltips, dialogs: a surface that floats above everything |
| `primary`, `primary-foreground` | The main action. Pitch green fill in both themes                 |
| `secondary`                     | Quiet chips, tab strips, states that are present but not pushing |
| `muted`                         | Support surfaces: helper blocks, the bench strip, empty states   |
| `accent`                        | The highlight. Pitch green in light, volt in dark                |
| `destructive`, `success`        | Money that went wrong, money that went right, deltas and errors  |
| `border`, `input`               | Structure. Never a text color                                    |
| `ring`                          | The focus ring against the canvas                                |

Three rules keep the brand honest:

1. **Volt is text only on a dark surface.** In light, `--accent` is pitch green, so a component that wants the highlight color asks for `accent` and gets the safe thing for the theme. Never paint body copy volt on paper.
2. **`primary` is a fill, not a text color.** Pitch green on a near black canvas is unreadable, so anything that needs accent-colored _text_ uses `accent`. That is why the copied Button and Badge `link` variants read `text-accent` instead of `text-primary`.
3. **`destructive` in dark is lifted higher than a normal red.** Error text lands on `card`, and on the `destructive/10` and `destructive/20` tints that shadcn uses for soft buttons and badges, so the token has to clear AA on all of them, not only on the canvas.

## Type

Space Grotesk is the only family, weights 400, 500, and 700, loaded through `next/font/google` with `display: "swap"` and exposed as `--font-space-grotesk`. Headings are 700, body is 400, labels are 500.

The scale is modular at 1.25, mobile first:

| Utility     | Size | Use                                                              |
| ----------- | ---- | ---------------------------------------------------------------- |
| `text-xs`   | 12px | Captions and labels                                              |
| `text-sm`   | 14px | Secondary copy, control text                                     |
| `text-base` | 16px | Body, and every input (16px stops iOS zooming the page on focus) |
| `text-lg`   | 20px | Card titles                                                      |
| `text-2xl`  | 25px | Section headings                                                 |
| `text-4xl`  | 39px | Page titles, hero amounts                                        |
| `text-5xl`  | 49px | Display numbers on a StatTile                                    |

Money is figures, so it aligns in columns: `.money` sets `font-variant-numeric: tabular-nums`, and `MoneyText` applies it. Tracking tightens on the large steps (`tracking-tight` on 25px and up).

## Spacing

There is no custom spacing scale. Tailwind's default 4px grid is the whole system, and these are the steps the app actually uses:

- Page gutter: `px-4`, `sm:px-6`.
- Page measure: content columns are capped (`max-w-4xl` on the demo, `max-w-72 sm:max-w-96 md:max-w-lg` on the pitch) so a line never runs long.
- Block rhythm between sections: `space-y-12`, each section opening with a `border-t` and `pt-8`.
- Inside a card: the Card's own `--card-spacing` (16px, or 12px at `size="sm"`). Between a title and its body: `gap-1` or `gap-2`.
- Rows of controls and chips: `flex flex-wrap gap-2`.
- Stacks that need more air than a gap: `gap-3` or `gap-4`.

## Corners

One radius token, `--radius` (0.625rem), scaled by Tailwind: `rounded-sm` for the smallest chips, `rounded-md` for a player badge and small controls, `rounded-lg` for buttons and inputs, `rounded-xl` for cards and dialogs, `rounded-full` only for a shirt number. Nothing is square except the pitch itself, and nothing is a pill except where a number sits.

## Components

Copied and restyled shadcn primitives live in `src/components/ui/`: Button (default, outline, secondary, ghost, destructive, link, plus sizes), Card, Input, Badge, Tabs, Dialog, Tooltip, and the sonner toast. They keep shadcn's accessibility work: real roles, keyboard behavior, focus management, and a visible 3px focus ring drawn with `ring` at 50 percent, on top of the `outline-ring/50` base rule.

The app's own pieces live in `src/components/`:

| Component     | What it does                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `MoneyText`   | Renders an amount from integer kobo plus a currency code through `src/domain/money.ts`. Nothing else formats money |
| `StatTile`    | A label, one large figure, an optional delta with direction                                                        |
| `ThemeToggle` | Sun or moon, aria label that names the theme it is switching to                                                    |
| `PitchView`   | A formation drawn on a field, eleven slots plus a bench strip                                                      |
| `PlayerNode`  | One slot: shirt number, purpose, amount. A button when the screen can select it                                    |
| `PitchField`  | The grass and markings, one SVG with a fixed portrait viewBox                                                      |

Two deliberate departures from the copied defaults, both for contrast: the `link` variant uses `text-accent` (see the color rules), and the destructive button and badge keep the same soft tint in both themes rather than a heavier dark tint.

## Icons and stickers

lucide stays inside the primitives (chevrons, check marks, the sun and moon). App level icons are RuneIcons, vendored as inline SVG in `src/components/icons/runeicons.tsx` with an attribution note; they take `currentColor`, so a token controls them, and they are `aria-hidden` because the label next to them carries the meaning.

The sticker set is hand drawn pen line, inline SVG, token fills, in `src/components/stickers/`: ball, boots, whistle, goal net, sparkle, warning card, and the GOAAALL banner. The banner spells its word as letter outlines, not a `<text>` node, so it needs no font. Stickers mark emotion, not information: a celebration, a warning, a milestone. Never a control, never a data point.

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

## Graphics contrast checklist

Text pairs are enforced by a unit test (`src/lib/tokens.test.ts` reads the values straight out of `globals.css`) and by an axe scan of the demo page in both themes. Non text graphics are the part a scan cannot see, so check them by hand for each new screen:

- [ ] Focus ring against the surface behind it, at least 3:1 in both themes.
- [ ] Any border or separator that conveys meaning (not decoration) at least 3:1.
- [ ] The volt shirt number on its dark player chip, and the same chip on light grass.
- [ ] Pitch line markings on both grass stripes, at both theme settings.
- [ ] Sticker strokes and fills against whatever sits behind them, including the 320px phone layout.
- [ ] Icons at their real size, not the size they are drawn at.
- [ ] Any state shown by color alone (a delta arrow, a covered slot) also shown by shape or text.

## Running the gates

```bash
pnpm test          # token pair contrast, domain rules
pnpm check:hex     # no raw color outside the token layer
pnpm test:e2e      # axe in both themes, keyboard, 360px, reduced motion, the demo 404 guard
```
