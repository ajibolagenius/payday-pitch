---
workflow: general-video
flow: companion
storyboard: yes
message: "Your payday doesn't vanish when every naira has a position"
destination: x-feed-wide
aspect: 2560x1080
language: en
length: 30s
angle: emotion-first-hook
narration: no
style_preset: cobalt-grid
---

## Intent

A 30-second ultrawide (21:9) promo for Payday Pitch, a mobile web app that
splits a monthly salary across a football formation. It opens on the
notification every Nigerian salary earner knows: a credit alert. Before the
amount is read, it is pulled at from five directions — rent, debt, data,
family, Friday. Then the money lines up into 4-4-2 and there is nothing left to
grab.

Sold, not toured. No app screenshots and no site capture — the field, the
shirt numbers, and the figures are the assets. Silent-first: built to hold in a
feed with the sound off, with the designed sound layer as the reward for those
who have it on.

Chosen concept: pitch 3, Credit Alert. Recommended over the eleven-slot
arithmetic version because its first frame is a feeling the audience already
has rather than a picture of the product.

## Assets

- `/Users/ajibolagenius/Desktop/payday-pitch/design.md` — the app's design
  system in prose. Brand truth for tone, type roles, and component behavior.
- `/Users/ajibolagenius/Desktop/payday-pitch/src/app/globals.css` — the raw
  tokens the Cobalt Grid preset is remixed onto: `--surface-black #101010`,
  `--pitch-green #1b4638`, `--volt #f5ff6b`, `--pitch-line` at 35% and 60%
  white, Space Grotesk 400/500/700.
- `/Users/ajibolagenius/Desktop/payday-pitch/src/lib/brand.ts` — `PITCH_GREEN`
  for anything a manifest or theme-color meta needs.
- `/Users/ajibolagenius/Desktop/payday-pitch/public/icons/master.svg` — the app
  mark, for the closing sting.
- `/Users/ajibolagenius/Desktop/payday-pitch/src/components/pitch/` —
  `pitch-field.tsx`, `pitch-view.tsx`, `player-node.tsx`. The geometry of the
  real formation; read it so the video's field matches the app's proportions
  and slot count. Not captured as pixels.

## Customizations

- Sound design: built from the bundled offline HyperFrames SFX library (HeyGen
  is not signed in, and a generated music bed would fight the silent-first
  brief). No bed — 14 cues on the picture's own hits, with real silence between
  them: notification at 0.05, five pings on the grabs (4.3 / 5.1 / 5.9 / 6.7 /
  7.5), a bass impact under the claim at 8.4, a chime when the eleven lock at
  13.4, whoosh + hit on the ledger (17.15) and `Unassigned ₦0` (20.3), whoosh +
  bass on the pivot (21.95 / 23.1), pop + chime on the sting (26.6 / 27.6).
  Each cue sits on its own track lane so the percussive decays overlap instead
  of being clipped to fit.
- Static key graphic: the alert mid-grab with the formation resolving behind
  it, exported as a real frame from the composition at 2560x1080, plus a 1:1
  and a 9:16 crop. Same artwork as the film, not a second illustration.
- Shareable link: publish the finished piece to a stable URL after render
  approval.

## Notes

- Canvas changed from 1080x1920 to 2560x1080 mid-build, at the user's request
  for an "HD feel". That is a re-layout, not a resize: the pitch is transposed
  to landscape (attacking left to right), the type ramp anchors to frame height
  (`cqh`) because the short edge governs legibility, and every frame gains a
  right-hand column at `57cqw` for the readout. Letterbox-safe: 1920x1080 is
  the same image scaled.
- The resolution beat shows the shape first — eleven positions with large
  shirt numbers — then a three-line list: `Pay ₦1,240,000 · Debts covered
₦310,000 · Unassigned ₦0`. Eleven legible amounts do not survive a phone
  screen; this was confirmed with the user after the brief was otherwise
  locked.
- Delivered. Film: `renders/payday-credit-alert_2026-10-25_16-49-00.mp4`
  (2560x1080, 30 fps, 30 s, `-12.7 LUFS` / `-5.3 dBTP`). Key graphic in three
  canvases under `assets/key-graphic/`; the 1:1 and 9:16 are native layouts
  (`compositions/stills/`), not crops of the ultrawide, because a 1080-wide
  slice of a 2560 frame cuts three of the five hands in half. The exported
  ultrawide has the run bar painted out — a progress line is an artifact of the
  film, not of a still. Shareable: `https://hyperframes.dev/p/ad293ea3-a277-4e47-a23c-3e80bd1934a9`
  (public once claimed; the earlier `8b833dba…` capture is superseded).
- Amounts are invented for the film at ₦1,240,000. Swap in the app's demo
  figures if the user asks.
- Cobalt Grid supplies layout bones only — the permanent grid, top and bottom
  hairlines, mono for figures. Its cream paper and cobalt ink are remixed to
  the app's night-pitch palette. Volt stays text-on-dark only, per the app's
  own brand rule.
- No voice-over, no burned-in narration. On-screen type carries the argument.
- Money is rendered as tabular figures with ₦ and no decimals, matching how
  `MoneyText` displays kobo in the app.
- Nothing is committed to git. This project sits at
  `videos/payday-credit-alert/` inside the payday-pitch repo.
