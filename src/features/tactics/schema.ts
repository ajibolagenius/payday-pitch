// The tactics board payloads (spec 0008 API surface). Four actions, and none of
// them takes a user id, a period, a currency, a version id, or a planned amount:
// identity comes from the claims, the version from the tactic head, and every
// amount from the domain over re-read money. The split arrives as stored
// JSONB, so the board, the save, and the play function share one shape.
import { z } from "zod"

import { rowId, tacticName, tacticSplit } from "@/lib/schemas"

/** Create with no tacticId, edit with one. A name on an edit is ignored. */
export const saveTacticSchema = z.object({
  tacticId: rowId.optional(),
  name: tacticName,
  baseShapeName: z.string().trim().min(1).max(40),
  split: tacticSplit,
})

export const renameTacticSchema = z.object({
  tacticId: rowId,
  name: tacticName,
})

export const deleteTacticSchema = z.object({ tacticId: rowId })

export const playSavedTacticSchema = z.object({ tacticId: rowId })

export type SaveTacticInput = z.output<typeof saveTacticSchema>
