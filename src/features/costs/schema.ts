// Fixed cost entry (spec 0007 API surface): a name and a real naira amount,
// no payday. Same kobo parsing boundary as incomes.
import { z } from "zod"

import { entryName, nairaAmount, rowId } from "@/lib/schemas"

export const costSchema = z.object({
  id: rowId.optional(),
  name: entryName,
  amountNaira: nairaAmount,
})

export const idSchema = z.object({ id: rowId })

export type CostInput = z.output<typeof costSchema>
