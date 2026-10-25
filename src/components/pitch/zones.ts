// The five zones in the words the app uses, and the one way a share reads as a
// percentage. Both the walk's picker and the tactics board say the same thing
// about the same zone, so the wording lives here once.
import type { FormationRole } from "@/domain/formations"

export const ZONE_WORD: Record<FormationRole, string> = {
  GK: "Keeper",
  DEF: "Defence",
  MID: "Midfield",
  FWD: "Attack",
  BENCH: "Bench",
}

// Basis points are hundredths of a percent: 4000 is 40%, 333 is 3.33%.
export function percent(basisPoints: number): string {
  const value = basisPoints / 100
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/0+$/, "")}%`
}
