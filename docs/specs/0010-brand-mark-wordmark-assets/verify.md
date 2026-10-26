# 0010 verify steps · brand mark & wordmark

Written by `/develop` at the end of the build (spec 0010 AC-1 to AC-9). `/check verify` runs these against the real app; `/test` can lock the automatable ones.

1. [x] **Rasters reproducible** (AC-1, AC-2, AC-3): run `pnpm icons`, then `git diff --stat public/icons src/app/*.png` shows no change. Every PNG regenerates from the committed masters.
2. [x] **Primary mark reads as a formation** (AC-1, AC-8): open `/design-system` in light mode, Brand section. The forest row shows 3/3/4 dots plus keeper (primary) and 3/2 plus keeper (reduced), and the seven real rasters render at 512, 192, 180, 64, 48, 32, 16 px.
3. [ ] **Theme swap** (AC-4, AC-7): switch to dark. The header marks on `/`, `/sign-in` and `/app` flip from the forest chip to the paper chip (gold 600 dots, forest keeper) via `--brand-chip`; the paper row in the Brand section reads clearly on the night canvas. `/` and `/sign-in` verified dark on 2026-10-25 (screenshots `/tmp/verify-dark-home.png`, `/tmp/verify-dark-signin.png`). `/app` blocked: needs a signed in session, which needs the local Supabase stack (Docker was down; run `supabase start`, then revisit `/app` in dark).
4. [x] **Maskable safe zone** (AC-3): in the Brand section, the dashed safe circle (radius 156 of 512) contains the whole maskable formation, keeper edge included.
5. [x] **Lockup regenerates, does not drift** (AC-6): run `pnpm brand:lockup`, then `git diff public/brand src/lib/brand-art.ts` shows no change.
6. [x] **Lockup matches live text** (AC-5, AC-6): on `/design-system`, compare the lockup row to the live wordmark beside it: same Melodrama 600 letterforms, tight tracking, no fallback shapes.
7. [x] **Emails carry the brand** (AC-6, AC-9): run `pnpm emails:render`, open `supabase/templates/confirmation.html` in a browser. Forest chip lockup header (gold dots, paper keeper), reduced mark in the footer, nothing clipped at 360 px wide.
8. [x] **Offline page** (AC-4): visit `/offline` (or throttle the dev server): the primary forest mark shows above the heading.
9. [x] **Old ball gone** (AC-9): `grep -rn "M256 206" src public scripts supabase tests` returns nothing, and `ls public/icons` shows no ball asset files.
10. [x] **Gates** (AC-7, AC-9): `pnpm test src/lib/tokens.test.ts` and `pnpm check:hex` both green. The pair contract proves the four mark pairs at 3:1; no hex literals outside `globals.css`, the carve-out dirs, and `brand-palette.ts`.
