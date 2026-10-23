// Playing a month (spec 0007 API surface). The action takes no money: planned
// amounts come from the domain, the period from the server, identity from the
// claims. What crosses the boundary is the shape choice and, per slot, the
// actual the person moved (blank means not logged, "0.00" means nothing moved).
import { z } from "zod"

import { nairaActual, rowId } from "@/lib/schemas"

// One entry per spot, in spot order. Twelve because every shape in the library
// has twelve spots, and the function refuses any other count.
const actualEntry = z.object({
  spotIndex: z.coerce.number().int().min(0).max(11),
  actualNaira: nairaActual,
})

export const playSchema = z
  .object({
    shapeId: rowId,
    actuals: z.array(actualEntry).length(12),
  })
  .refine(
    (input) => new Set(input.actuals.map((a) => a.spotIndex)).size === 12,
    { message: "Each spot is entered once.", path: ["actuals"] },
  )

export type PlayInput = z.output<typeof playSchema>
