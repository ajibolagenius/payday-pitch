// Income stream entry (spec 0007 API surface). Currency is fixed NGN for
// this slice: no selector reaches the database but the stored default.
import { z } from "zod"

import { entryName, nairaAmount, rowId } from "@/lib/schemas"

export const incomeSchema = z.object({
  id: rowId.optional(),
  name: entryName,
  amountNaira: nairaAmount,
  paydayDay: z.coerce
    .number()
    .int("Whole days only.")
    .min(1, "Payday day is 1 to 31.")
    .max(31, "Payday day is 1 to 31."),
})

export const idSchema = z.object({ id: rowId })

export type IncomeInput = z.output<typeof incomeSchema>
