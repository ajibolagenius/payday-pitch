---
format: 2560x1080
arc: Pain (hook) → Cost (stakes + promise) → Proof (shape, ledger) → Adapt (tactics) → Name (CTA)
---

## Frame 1 — The alert

- duration: 4s
- poster: 3.2s
- transition_in: none
- status: outline
- src: compositions/frames/01-alert.html
- blueprint: `kinetic-type-beats` (hook role) · rules `spring-pop-entrance`, `counting-dynamic-scale`

<fill in: this video's content for the "The alert" beat — keep the layout role, replace the words.>

## Frame 2 — Five hands

- duration: 6.5s
- poster: 6.0s
- transition_in: cut
- status: outline
- src: compositions/frames/02-grab.html
- blueprint: `overwhelm-surround` · rules `reactive-displacement`, `counting-dynamic-scale`, `spring-pop-entrance`

<fill in: this video's content for the "Five hands" beat — keep the layout role, replace the words.>

## Frame 3 — Eleven positions

- duration: 6s
- poster: 5.0s
- transition_in: grid dissolve
- status: outline
- src: compositions/frames/03-shape.html
- rules: `svg-path-draw` (chalk markings), `center-outward-expansion` + `spring-pop-entrance` (the eleven). No shipped blueprint fits a formation shape, so this frame composes named rules.

<fill in: this video's content for the "Eleven positions" beat — keep the layout role, replace the words.>

## Frame 4 — The three lines

- duration: 4.5s
- poster: 3.8s
- transition_in: cut (match on the held field)
- status: outline
- src: compositions/frames/04-ledger.html
- blueprint: `titlecard-reveal` (one restrained move, then still hold) · rule `dynamic-content-sequencing`

<fill in: this video's content for the "The three lines" beat — keep the layout role, replace the words.>

## Frame 5 — Park the Bus

- duration: 4.5s
- poster: 4.0s
- transition_in: none — the field carries over
- status: outline
- src: compositions/frames/05-pivot.html
- rules: `depth-scatter-assemble` (settle to a clean flat layout), `press-release-spring`

<fill in: this video's content for the "Park the Bus" beat — keep the layout role, replace the words.>

## Frame 6 — The name of it

- duration: 4.5s
- poster: 4.0s
- transition_in: dip to dark
- status: outline
- src: compositions/frames/06-sting.html
- blueprint: `logo-assemble-lockup`

<fill in: this video's content for the "The name of it" beat — keep the layout role, replace the words.>

## Structure notes

- Canvas is 2560x1080 (21:9), chosen for an "HD feel". Because the short edge
  governs legibility on a frame this wide, the type ramp and vertical rhythm are
  in `cqh` and horizontal placement in `cqw`. 1920x1080 is the same image
  scaled; nothing is repositioned for it.
- Six frames, six files, one visual track. Root `data-duration="30"`. Slots adjoin
  at 0 / 4 / 10.5 / 16.5 / 21 / 25.5.
- Frames 3, 4, and 5 each carry the pitch field in their own file, with
  identical geometry and coordinates, so the cut from the assembled shape into
  the ledger reads as one held shot rather than a redraw. If the build finds a
  seam, the fix is to merge 03-05 into one sub-composition with internal phase
  divs (composition-patterns archetype C) rather than to nudge the coordinates.
- Audio (ping, five impacts, one calm hit) mounts as a root-level `<audio>` at
  the assembly stage, never inside a frame file.
- `index.html` is now the orchestrator: six slots on one visual track, root
  timeline empty. Every frame file is a sub-composition, so each carries its own
  `@font-face` block — the runtime discards a sub-comp `<head>`, and ₦ (U+20A6)
  lives in `latin-ext`, so a latin-only face would render every currency sign in
  a fallback.
- Sketches are wireframes: real words, plain blocks, frame.md ground and ink,
  volt only on the focal read of each frame. Full treatment and motion arrive
  after the board is confirmed.
- Derivative canvases are recomposed, never cropped. A 1080-wide slice of this
  2560 frame cuts three of the five hands in half, so the 1:1 and 9:16 key
  graphics are their own layouts (`compositions/stills/`): the square keeps the
  block system and breaks the band three-over-two, the portrait turns the hands
  into the app's ledger row. A still also loses the run bar — progress is an
  artifact of the film.
- Sound is silent-first: no music bed, cues hand-placed as root-level
  `<audio>`, one lane each, because two clips on a track force the earlier one
  to end and would clip every decaying tail.
