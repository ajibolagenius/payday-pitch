// Shared field schemas for money entry forms (spec 0007 AC-2). The naira
// string converts to integer kobo through the domain parser here, at the
// validation boundary, so no component ever parses money.
import { z } from "zod"

import { parseNaira } from "@/domain/money"
import {
  TACTIC_NAME_MAX_LENGTH,
  TACTIC_NAME_MIN_LENGTH,
} from "@/domain/tactics"

export const nairaAmount = z
  .string()
  .trim()
  .transform((s) => parseNaira(s))
  .refine((kobo): kobo is number => kobo !== null, {
    message: "Enter a positive amount in naira, up to kobo.",
  })

export const entryName = z
  .string()
  .trim()
  .min(1, "Give it a name.")
  .max(80, "Keep the name under 80 characters.")

export const rowId = z.coerce.number().int().positive()

// An entered actual (spec 0007 AC-6): leaving the box blank means not logged,
// and "0.00" means moved nothing. Those are two different stored answers, so
// null and zero both pass and only a malformed amount is a field error.
export const nairaActual = z
  .union([z.string(), z.null()])
  .refine(
    (value) =>
      value === null ||
      value.trim() === "" ||
      parseNaira(value.trim(), true) !== null,
    { message: "Enter 0 or more, up to kobo." },
  )
  .transform((value) =>
    value === null || value.trim() === ""
      ? null
      : parseNaira(value.trim(), true),
  )

// A tactic name (spec 0008 AC-2). Uniqueness per user is the database's
// constraint, so a duplicate arrives as name_taken rather than a field error.
export const tacticName = z
  .string()
  .trim()
  .min(TACTIC_NAME_MIN_LENGTH, "Name your tactic.")
  .max(TACTIC_NAME_MAX_LENGTH, "Keep the name under 30 characters.")

// One spot of a split, in the schema's own snake_case: the same shape as the
// stored JSONB and the play function's payload, so nothing is re-keyed on the
// way through. The values are checked by the domain (splitProblem), which
// answers invalid_split for the whole payload, so these fields stay unknown
// here rather than half-validated twice.
export const splitItem = z.object({
  role: z.unknown(),
  spot_index: z.unknown(),
  label: z.unknown(),
  basis_points: z.unknown(),
})

// No minimum length here on purpose: an empty split is a structural problem of
// the payload, so it has to reach splitProblem and answer invalid_split, not a
// Zod field error.
export const tacticSplit = z.array(splitItem)

export type TacticSplitInput = z.output<typeof tacticSplit>
