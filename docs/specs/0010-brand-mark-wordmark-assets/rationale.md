# 10. Brand mark, wordmark and identity assets

## Context

> ⚠️ Premise note: the inverted variant chosen in the interview said gold dots and a gold keeper on a paper chip. Measured, every `#F0C75E` shape on paper `#FFFDF8` sits near 1.6:1, far below the 3:1 minimum WCAG 1.4.11 requires for a graphic that carries meaning (the keeper signals the secured position, and the dots are the formation). The paper chip therefore pins contrast tested raw ramp values, `--gold-600` (measured 3.5:1 on paper) outfield dots and a forest keeper (near 8:1), proven by the pair contract in AC-7; the forest chip keeps the chosen colors untouched. The second premise force: spec 0009 is a hard precondition. It is still `In Progress`, so this branch starts from its tip and its `/check verify` must run and pass before this slice's merge gate.

The current app mark (spec 0009, `public/icons/master.svg`) is a gold football drawn as panel seams on a forest field. It says football app, which is the category, not the product, and at favicon size the seams collapse into a gear. Scope feature 19 redraws it as dots in a real formation. The measured facts already on record: an eleven dot formation at 16px puts every dot under one pixel, so the system needs two tiers, and a four dot reduction dissolves into two bars over a dot, so the small tier is five gold dots plus the keeper. The maskable launcher circle is radius 156 on the 512 canvas; art scaled to 0.72 keeps the deepest dot at radius 152, 0.76 cuts it.

Forces in play: hex literals may only live in the `globals.css` raw layer, the artwork carve out (`src/components/pitch/**`, `src/components/stickers/**`), and `src/lib/brand-palette.ts` (enforced by `pnpm check:hex`). The raw layer carries a real gold ramp (`--gold-50` to `--gold-700`), but the semantic `--accent` in light theme is the gold 50 tint, so brand art must read raw ramp variables, not semantic tokens. Emails cannot read CSS variables or load webfonts, so they need inline SVG with literals from the palette module and a drawn wordmark. The icon set regenerates through `pnpm icons` (sharp at density 384) from master SVGs. Fonts are vendored through `next/font/local` (Melodrama variable is already loaded as `--font-melodrama`). No production users exist yet, so asset swap risk is low.

## Options considered

### Option 1: Fix in place (redraw the ball cleaner)

Keep one ball based mark, simplify the seams so it survives favicon size.

**Pros**:

- Smallest change, the chip shape and pipeline untouched.

**Cons**:

- Still says football app, not money lined up; at 16 px even clean seams read as noise; the dot grammar (line-up, later loading states) never exists, so the brand stays a picture pasted on pages.

### Option 2: Direct replacement in one slice (formation masters, token components, pipeline, all surfaces)

Replace the ball in one coordinated branch: new master SVGs feed `pnpm icons`, one `src/components/brand/` set renders every inline use from tokens, drawn lockup and line-up assets cover email and wide uses, and every surface switches in the same PR.

**Pros**:

- One reviewed change, no half migrated identity; matches how spec 0009 shipped its own swap; the component set becomes the single geometry source later slices reuse.

**Cons**:

- Touches emails, manifest, offline page and the demo in one branch, so review must be careful; two tiers plus two chip variants means more assets and more contrast pairs to maintain.

### Option 3: Strangler (new marks alongside the ball, migrate surface by surface)

Add the formation assets first, switch surfaces over several PRs, delete the ball last.

**Pros**:

- Each PR is small; rollback per surface is trivial.

**Cons**:

- Between PRs the product shows two logos at once, which defeats the point of an identity change; there are no live users to protect, so the safety the strangler pattern buys costs review effort for nothing.

## Rationale

The scope brief already settled the mark design itself (two tiers, dot counts, equal row spacing, quiet editorial voice) and the geometry measurements; re litigating that would relitigate measurements. What was still open, the engineer settled in the interview: feature 19 ships marks, wordmark and line-up only (dot grammar loading states and dynamic OG cards move to the features that need them, 15, 16 and 18); the wordmark is live text plus one drawn SVG lockup; Melodrama stays with no parallel Tanker or Expose test; inline uses go through React components, not `<img>` tags to static files. Option 2 over Option 3 follows the same reasoning spec 0009 used: a strangler protects live traffic, and there is none yet. Option 1 fails the product statement the redraw exists to make.

An independent cross check of this draft closed the load bearing holes the first write left: the gitignored proof folder was the only home of the coordinates (now inlined in full), gold on paper fails contrast for every dot and not only the keeper (now pinned to tested ramp values), and the drawn lockup had no production path in a repo that cannot turn fonts into outlines (now a small committed generator script). Where the fix changed an interview wording it changed only the value, never the decision.

The cross check also floated a cheaper variant: drop the paper chip and let the forest chip sit on dark surfaces with a hairline border, the treatment spec 0009 already ratified for filled buttons. It loses on one force: the scope's Done when demands light and dark versions of both marks, and a bordered chip on the night canvas still reads as a pasted tile rather than a theme native surface. The cost of keeping the paper chip (a more muted gold in dark) is recorded in Consequences.
