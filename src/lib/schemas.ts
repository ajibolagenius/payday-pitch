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
