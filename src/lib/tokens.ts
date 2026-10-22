// The AC-3 contract from spec 0005: every pair listed here must clear WCAG AA
// in BOTH themes. src/lib/tokens.test.ts reads the values out of globals.css
// and checks them, so a token change that breaks contrast fails CI.

export type TokenPair = {
  /** Semantic token names, without the leading dashes. */
  background: string
  foreground: string
  /** 4.5 for body text, 3 for large text and graphics. */
  min: number
  /** Where this pair appears, used as the demo page caption. */
  use: string
}

export const CONTRAST_PAIRS: TokenPair[] = [
  {
    background: "background",
    foreground: "foreground",
    min: 4.5,
    use: "Page canvas and body copy",
  },
  {
    background: "background",
    foreground: "muted-foreground",
    min: 4.5,
    use: "Secondary copy on canvas",
  },
  {
    background: "background",
    foreground: "destructive",
    min: 4.5,
    use: "Error text on canvas",
  },
  {
    background: "card",
    foreground: "card-foreground",
    min: 4.5,
    use: "Surfaces and their titles",
  },
  {
    background: "card",
    foreground: "muted-foreground",
    min: 4.5,
    use: "Captions on surfaces",
  },
  {
    background: "primary",
    foreground: "primary-foreground",
    min: 4.5,
    use: "Filled buttons, key actions",
  },
  {
    background: "accent",
    foreground: "accent-foreground",
    min: 4.5,
    use: "Highlight fills",
  },
  {
    background: "secondary",
    foreground: "secondary-foreground",
    min: 4.5,
    use: "Quiet chips and tabs",
  },
  {
    background: "muted",
    foreground: "muted-foreground",
    min: 4.5,
    use: "Bench strip, helper blocks",
  },
  {
    background: "popover",
    foreground: "popover-foreground",
    min: 4.5,
    use: "Menus and dialogs",
  },
  {
    background: "background",
    foreground: "ring",
    min: 3,
    use: "Focus ring against the canvas",
  },
]
