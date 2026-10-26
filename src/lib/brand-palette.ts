// Email clients and browser chrome cannot read CSS variables, so the raw brand
// values they need are defined once here (spec 0009). Everything on screen
// still reads the semantic tokens in src/app/globals.css; this module is the
// only other place a brand color is written as a literal, and it mirrors
// layer 1 of that file.
const FOREST = "#1C4534"
const GOLD = "#F0C75E"

export const BRAND = {
  /** forest 700, the brand hue: theme color, manifest, filled bands. */
  forest: FOREST,
  /** gold 200, the formation dots on a forest chip (spec 0010 emails). */
  gold: GOLD,
  /** The seven inline slots the auth emails take. */
  pitch: FOREST,
  ink: "#241F17",
  card: "#FFFDF8",
  paper: "#F6F3EB",
  muted: "#5C564C",
  onPitch: "#FFFFFF",
} as const
