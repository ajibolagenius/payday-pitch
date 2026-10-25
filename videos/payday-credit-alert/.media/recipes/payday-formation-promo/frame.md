---
version: alpha
name: Payday Pitch — Credit Alert promo (Cobalt Grid bones, night-pitch brand)
unit: the frame — 2560x1080 primary (21:9); 1920x1080 letterbox documented
principle: brand is sacred · layout bones are the preset's · numbers come from the app
brand_source: ../../src/app/globals.css, ../../design.md, ../../src/domain/formations.ts
preset: cobalt-grid

colors:
  surface: "#101010" # app --surface-black, the only ground
  paper: "#FAFAFA" # app --paper, body ink on dark
  pitch: "#1B4638" # app --pitch-green, structural fill only
  grass-dark: "#1E5138" # pitch-field.tsx artwork carve-out
  grass-light: "#22603F" # pitch-field.tsx artwork carve-out
  volt: "#F5FF6B" # app --volt — the single accent, focal only
  chalk: "rgba(250,250,250,0.35)" # app --pitch-line (normal)
  chalk-strong: "rgba(250,250,250,0.60)" # app --pitch-line (emerged variant)
  grid: "rgba(250,250,250,0.055)" # the permanent graph paper, chalked
  hairline: "rgba(250,250,250,0.18)" # ledger row dividers

typography:
  # one family only (design.md). Hierarchy is size + the app's weight ladder.
  # On a 21:9 canvas the frame is short, so the ramp anchors to cqh (the height
  # axis), never to cqw — a cqw ramp would overflow the letterbox. 1cqh = 10.8px.
  money-hero:
    {
      fontFamily: "Space Grotesk",
      cqh: 14,
      weight: 700,
      lineHeight: 0.92,
      tracking: "-0.02em",
      tabular: true,
    }
  money-large:
    {
      fontFamily: "Space Grotesk",
      cqh: 9,
      weight: 700,
      lineHeight: 1.0,
      tracking: "-0.015em",
      tabular: true,
    }
  statement:
    {
      fontFamily: "Space Grotesk",
      cqh: 7.8,
      weight: 700,
      lineHeight: 1.05,
      tracking: "-0.015em",
    }
  ledger-figure:
    {
      fontFamily: "Space Grotesk",
      cqh: 5.2,
      weight: 700,
      lineHeight: 1.1,
      tabular: true,
    }
  ledger-label:
    { fontFamily: "Space Grotesk", cqh: 3.4, weight: 500, lineHeight: 1.2 }
  body: { fontFamily: "Space Grotesk", cqh: 3.5, weight: 400, lineHeight: 1.45 }
  label:
    {
      fontFamily: "Space Grotesk",
      cqh: 2.8,
      weight: 500,
      tracking: "0.16em",
      upper: true,
    }
  shirt-number:
    { fontFamily: "Space Grotesk", cqh: 3, weight: 700, lineHeight: 1 }
  chrome:
    {
      fontFamily: "Space Grotesk",
      cqh: 1.85,
      weight: 500,
      tracking: "0.18em",
      upper: true,
    }

spacing:
  edge: "3.2cqw" # 82px side inset at 2560 — the safe line
  rule-inset: "1.7cqh" # 18px: hairlines sit this far from the top and bottom
  pad-column: "57cqw" # the right column's left edge — everything beside the pitch
  gap-md: "2.2cqw"
  grid-cell: "2cqw"
  field: { left: "4.5cqw", top: "8cqh", height: "84cqh", width: "111.7cqh" } # 133:100
  # The money anchor: frame 1's figure and frame 2's amount share left 9cqw /
  # top 41.5cqh, so the 1→2 cut drops the card and leaves the number still.
  money-anchor: { left: "9cqw", top: "41.5cqh" }
  # The statement anchor: frame 1's hook and frame 2's claim share the column.
  statement-anchor: { left: "57cqw", top: "40cqh", width: "36cqw" }

components:
  chalk-grid:
    backgroundImage: "linear-gradient {colors.grid} 1px, transparent 1px, both axes"
    backgroundSize: "{spacing.grid-cell}"
    placement: "behind EVERY frame on the ground, never disabled"
    description: "The preset's permanent graph paper, chalked. Cell = pitch marking grid."
  hairlines:
    rule: "0.14cqw solid {colors.chalk-strong}"
    placement: "{spacing.rule-inset} from top and bottom, inset {spacing.edge}"
    description: "Two persistent rules framing every composition."
  run-bar:
    fill: "{colors.volt}"
    size: "4px tall, full width, above the bottom hairline"
    description: "Volt progress. The only element allowed to be full-saturation volt at rest. Lives on the root, not in a frame."
  shirt-node:
    layout: "circle, {colors.pitch} fill, {colors.paper} number, 0.16cqw {colors.chalk} ring"
    focal: "ring and number become {colors.volt} when the node is the read"
    size: "8cqh diameter"
    description: "One position. Geometry from pitch-field.tsx transposed to landscape; SLOT_COORDINATES mapped x = 100 - y, y = x."
  ledger-row:
    layout: "grid: {ledger-label} left · {ledger-figure} right, tabular"
    borderBottom: "0.14cqw solid {colors.hairline}"
    padding: "1.15cqw 0"
    description: "The three-line readout, in the right column beside the pitch. Preset's ledger atom, inverted to dark. Its bottom rule must clear the run bar."
  tactics-marking:
    stroke: "0.9 viewBox units dashed {colors.chalk-strong}"
    description: "Dotted chalk arrow + arc. Replaces the preset's pixel-glitch and QR-block."
  alert-card:
    layout: "surface panel, 2.4cqw radius, 0.2cqw {colors.hairline} border"
    typography: "{money-hero} figure + {label} meta row"
    description: "The credit alert. Flat plane, no shadow — elevation is the border only."

don_ts:
  - "Never volt on a light surface. Volt is text-on-dark only (design.md rule 1)."
  - "No full-screen linear gradients on {colors.surface} — they band under H.264. Radial or flat fill only."
  - "No second accent hue. No cyan, no purple, no neon glow."
  - "No gradient text, no left-edge stripes on cards, no identical card grids."
  - "No phone chrome, no cursor, no status bar, no scrollbar, no browser frame."
  - "No decimals on naira amounts. Money is integer minor units, tabular figures."
  - "Nothing in the letterbox's outer 1.7cqh top and bottom — that band is the hairlines' and the run bar's."
  - "The pitch never rotates between frames: it is landscape, attacking left to right, in every shot."
---

# Payday Pitch — Credit Alert promo

## Overview

Cobalt Grid lends the bones: a permanent grid on the ground, top and bottom
hairlines, a ledger row for dense readouts, hierarchy by size, and two-color
discipline. The brand is the app's own night pitch, taken from
`src/app/globals.css` verbatim. Where the preset's atoms cannot survive the
remix — the pixel-glitch column and the QR mosaic read as noise on a field —
they are replaced by chalk tactics markings, and that substitution is recorded
here rather than done silently in HTML.

The ground is `#101010`. `#FAFAFA` is ink. `#F5FF6B` (volt) is the single
accent, and it is scarce: the focal figure, the run bar, and one node ring per
frame at most. `#1B4638` pitch green is structural fill — the field, the shirt
discs — never a text color on dark. Chalk white at 35% and 60% carries lines
and grid, exactly as `--pitch-line` does in the app.

## The Frame

2560x1080. Every frame ground sets `container-type: size` and carries the
chalk-grid `background-image`; all frame-relative units are `cqw`/`cqh`
against it, never `vw`. Grid `background-size` is `2cqw 2cqw` so cell density
holds at any render size. Type and vertical rhythm are in `cqh`, horizontal
placement in `cqw`.

The canvas is wide enough to stop stacking. Frames 3-5 are two-column: the
pitch holds the left half, the readout holds the right column at `57cqw`, and
the gap between them is the letterbox breathing. Nothing overlaps the field,
so nothing has to be lifted out of it to stay legible.

- **Squint** — one element per frame dominates at 2-3x its nearest neighbour.
  Frame 1 and 2 own it (`money-hero`, ~151px). Frames 3-5 hand it to the shape.
- **Silence** — the wide ground reads 45-60% empty with the grid showing. The
  ledger frame is the density exception, and its density is quiet repetition.
- **Restraint** — one accent hue, volt, at full saturation only on focal
  elements. Atmosphere is chalk, not colour.
- **Reference** — a match-day formation graphic printed on risograph stock,
  laid out like a cinematic end frame. Failure looks like a fintech dashboard
  with a green gradient.

**Safe zones.** Content lives inside the `3.2cqw` edge inset and between
`1.7cqh` from the top and bottom — that outer band belongs to the hairlines
and the run bar. There is no caption reserve: this canvas is not a phone feed.

**Type floor.** Any load-bearing line at `2.8cqh` (30px) or above. `chrome` at
1.85cqh is metadata only and never carries an argument.

## Numbers, from the app

All figures are real arithmetic from `src/domain/formations.ts`, on a
₦1,240,000 salary. Basis points sum to 10,000, so unassigned is always ₦0.

| 4-4-2 · "Balanced classic"  | bp   | ₦           |
| --------------------------- | ---- | ----------- |
| GK — Emergency Fund         | 1000 | 124,000     |
| DEF — back four, 4 x 1000   | 4000 | 496,000     |
| MID — midfield, 4 x 750     | 3000 | 372,000     |
| FWD — two forwards, 2 x 750 | 1500 | 186,000     |
| BENCH — Guilt-Free Sub      | 500  | 62,000      |
| **Covered (GK+DEF+MID)**    | 8000 | **992,000** |
| **Unassigned**              | 0    | **0**       |

| 5-4-1 · "Park the Bus" | bp   | ₦       |
| ---------------------- | ---- | ------- |
| MID — Debt Repayment   | 2500 | 310,000 |
| GK — Emergency Fund    | 200  | 24,800  |
| BENCH — Guilt-Free Sub | 200  | 24,800  |

Shirt numbers are 1 for the keeper then sequential in seed order
(GK, DEF, MID, FWD) — the same rule `pitch-view.tsx` applies. Bench is the
12th node, in the right column under the headline rather than below the field,
and carries no shirt number. Field slots are the app's portrait coordinates
transposed to a landscape pitch: `x = 100 - y_portrait`, `y = x_portrait`,
attacking left to right.

## Motion posture

From the product-launch doctrine: no front-loading — at a beat's start only
what that beat says is on screen, and reveals run across its back half.
`power3` long tails as default; springs only where a shape physically settles.
End on a held read; stillness beats bad motion. Seek-safe: `fromTo` for every
entrance, no `repeat`/`yoyo`, no `Math.random`, no `Date.now`, no CSS
transitions or keyframes.
