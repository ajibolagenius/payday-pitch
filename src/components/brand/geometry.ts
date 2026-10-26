// Canonical formation geometry (spec 0010). The master SVGs in
// public/icons carry the same coordinates as literals; changing the
// formation means editing both in the same commit.

export const CHIP_RX = 112

/** Primary tier, 512 box: rows of 3, 3 and 4, keeper alone at the base. */
export const PRIMARY_DOTS: ReadonlyArray<{ cx: number; cy: number }> = [
  { cx: 136, cy: 118 },
  { cx: 256, cy: 118 },
  { cx: 376, cy: 118 },
  { cx: 172, cy: 220 },
  { cx: 256, cy: 220 },
  { cx: 340, cy: 220 },
  { cx: 100, cy: 322 },
  { cx: 206, cy: 322 },
  { cx: 306, cy: 322 },
  { cx: 412, cy: 322 },
]
export const PRIMARY_DOT_R = 23
export const PRIMARY_KEEPER = { cx: 256, cy: 436, r: 31 }

/** Reduced tier, 512 box: rows of 3 and 2, keeper at the base. */
export const REDUCED_DOTS: ReadonlyArray<{ cx: number; cy: number }> = [
  { cx: 136, cy: 160 },
  { cx: 256, cy: 160 },
  { cx: 376, cy: 160 },
  { cx: 188, cy: 292 },
  { cx: 324, cy: 292 },
]
export const REDUCED_DOT_R = 32
export const REDUCED_KEEPER = { cx: 256, cy: 424, r: 42 }

/** Line-up asset, 512 by 144: eleven in one row, keeper leading left. */
export const LINEUP_DOTS: ReadonlyArray<{ cx: number; cy: number }> =
  Array.from({ length: 10 }, (_, i) => ({ cx: 108 + i * 37, cy: 72 }))
export const LINEUP_DOT_R = 15
export const LINEUP_KEEPER = { cx: 71, cy: 72, r: 21 }
export const LINEUP_BOX = { width: 512, height: 144 }
