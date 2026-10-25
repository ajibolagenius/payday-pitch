// The pair contract from specs 0005 and 0009 (AC-5): every pair listed here
// must clear WCAG AA in the theme(s) it declares. src/lib/tokens.test.ts reads
// the values out of globals.css and checks them, so a token change that breaks
// contrast fails CI.

export type TokenPair = {
  /** Token names, without the leading dashes (semantic or raw). */
  background: string
  foreground: string
  /** 4.5 for body text, 3 for large text and graphics. */
  min: number
  /** Where this pair appears, used as the demo page caption. */
  use: string
  /** Theme specific pairs by design; "both" is the default. */
  theme?: "light" | "dark" | "both"
  /**
   * The background is not a flat token: it is `background` composited at
   * `alpha` over `over` (the shadcn surface tints, e.g. bg-destructive/20).
   */
  over?: { token: string; alpha: number }
  /**
   * Tint checks normally paint this pair's `background` token as the text.
   * When the fill role and the text role use different tokens in one theme
   * (spec 0009 amendment A1: light success fills forest-600, text rides
   * forest-700), name the text token per theme; omitted themes keep default.
   */
  text?: { light?: string; dark?: string }
}

const both = (
  background: string,
  foreground: string,
  min: number,
  use: string,
): TokenPair => ({ background, foreground, min, use, theme: "both" })

export const CONTRAST_PAIRS: TokenPair[] = [
  both("background", "foreground", 4.5, "Page canvas and body copy"),
  both("background", "muted-foreground", 4.5, "Secondary copy on canvas"),
  both("background", "destructive", 4.5, "Error text on canvas"),
  both("card", "card-foreground", 4.5, "Surfaces and their titles"),
  both("card", "muted-foreground", 4.5, "Captions on surfaces"),
  both("primary", "primary-foreground", 4.5, "Filled buttons, key actions"),
  both("accent", "accent-foreground", 4.5, "Highlight fills"),
  both("background", "accent-text", 4.5, "Links and accent copy on canvas"),
  both("card", "accent-text", 4.5, "Links and accent copy on cards"),
  both("secondary", "secondary-foreground", 4.5, "Quiet chips and tabs"),
  both("muted", "muted-foreground", 4.5, "Bench strip, helper blocks"),
  both("popover", "popover-foreground", 4.5, "Menus and dialogs"),
  both("background", "ring", 3, "Focus ring against the canvas"),
  // Spec 0009 amendment A1: the accent pair is theme aware (gold tint with
  // brown ink in light, gold fill with ink in dark), money ink on paper is
  // checked in light, and gold text on forest/turf is an explicit raw pair.
  {
    background: "background",
    foreground: "accent-foreground",
    min: 4.5,
    use: "Gold money ink on paper",
    theme: "light",
  },
  {
    background: "card",
    foreground: "accent-foreground",
    min: 4.5,
    use: "Gold money ink on cards",
    theme: "light",
  },
  {
    background: "primary",
    foreground: "gold-200",
    min: 4.5,
    use: "Gold text on the forest button",
    theme: "dark",
  },
  {
    background: "grass-a",
    foreground: "gold-200",
    min: 3,
    use: "Gold shirt number on the dark grass stripe",
    theme: "both",
  },
  {
    background: "grass-b",
    foreground: "gold-200",
    min: 3,
    use: "Gold shirt number on the light grass stripe",
    theme: "both",
  },
  // The player plate on turf replaces spec 0005's volt-on-grass check.
  both("grass-a", "accent", 3, "Player plate on the dark grass stripe"),
  both("grass-b", "accent", 3, "Player plate on the light grass stripe"),
  // State text over its own 0.2 tint, the way shadcn paints alert surfaces.
  {
    background: "destructive",
    foreground: "destructive",
    min: 4.5,
    use: "Error text on its own tint, canvas",
    theme: "both",
    over: { token: "background", alpha: 0.2 },
  },
  {
    background: "destructive",
    foreground: "destructive",
    min: 4.5,
    use: "Error text on its own tint, card",
    theme: "both",
    over: { token: "card", alpha: 0.2 },
  },
  {
    background: "success",
    foreground: "success",
    text: { light: "forest-700" },
    min: 4.5,
    use: "Success text on its own tint, canvas",
    theme: "both",
    over: { token: "background", alpha: 0.2 },
  },
  {
    background: "success",
    foreground: "success",
    text: { light: "forest-700" },
    min: 4.5,
    use: "Success text on its own tint, card",
    theme: "both",
    over: { token: "card", alpha: 0.2 },
  },
]
