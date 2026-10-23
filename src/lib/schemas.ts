// Shared field schemas for money entry forms (spec 0007 AC-2). The naira
// string converts to integer kobo through the domain parser here, at the
// validation boundary, so no component ever parses money.
import { z } from "zod"

import { parseNaira } from "@/domain/money"

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
