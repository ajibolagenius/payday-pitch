// The formation library read (spec 0007 AC-3). The picker shows the database
// rows, never the static FORMATIONS array, and a deprecated shape leaves the
// new picks while the write path still refuses it by name. Positions come back
// in spot_index order, which is the seed order the pitch coordinates use, so
// the array index of a position IS its spot.
import type { SupabaseClient } from "@supabase/supabase-js"

import type { Formation, FormationRole } from "@/domain/formations"
import type { SplitPosition } from "@/domain/money"
import type { Database } from "@/lib/supabase/database.types"

export type ReadClient = SupabaseClient<Database>

/** A library shape as the picker needs it: the domain shape plus its id. */
export type LibraryFormation = Formation & { id: number }

export type PositionRow = {
  role: string | null
  spot_index: number
  label: string
  basis_points: number
}

// The schema's check constraint lists these five roles, so the cast holds for
// any row that came from the database.
export function toSplitPosition(row: PositionRow): SplitPosition {
  return {
    role: row.role as FormationRole,
    spotIndex: row.spot_index,
    label: row.label,
    basisPoints: row.basis_points,
  }
}

export async function listFormations(
  client: ReadClient,
): Promise<LibraryFormation[]> {
  const { data, error } = await client
    .from("formation_shape")
    .select(
      "id, name, style, when_to_play, formation_position(role, spot_index, label, basis_points)",
    )
    .eq("deprecated", false)
    .order("sort")
    .order("spot_index", { foreignTable: "formation_position" })
  if (error) throw new Error(`read formations failed: ${error.message}`)
  return (data ?? []).map((shape) => ({
    id: shape.id,
    name: shape.name,
    style: shape.style,
    whenToPlay: shape.when_to_play,
    positions: (shape.formation_position ?? []).map((position) => {
      const spot = toSplitPosition(position)
      return {
        role: spot.role,
        label: spot.label,
        basisPoints: spot.basisPoints,
      }
    }),
  }))
}

/** The twelve spots of one shape, for the split. Null when the shape has no
 *  spots at all, which the write path answers as shape_not_found. */
export async function getShapePositions(
  client: ReadClient,
  shapeId: number,
): Promise<SplitPosition[] | null> {
  const { data, error } = await client
    .from("formation_position")
    .select("role, spot_index, label, basis_points")
    .eq("shape_id", shapeId)
    .order("spot_index")
  if (error) {
    throw new Error(`read shape ${shapeId} failed: ${error.message}`)
  }
  if (!data || data.length === 0) return null
  return data.map(toSplitPosition)
}
