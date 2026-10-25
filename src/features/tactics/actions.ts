// Saving, renaming, deleting and playing a tactic (spec 0008 API surface).
// Writes go through the user's own session under row level security, with an
// explicit owner filter on every statement as well. No action takes a user id,
// a version id, or a planned amount: identity comes from the claims, the version
// from the tactic head, and every amount from the domain over re-read money.
// The server validates a split against the board rules and then stores it
// unchanged, because re-running a delta on a draft that already satisfies them
// would move shares the user never touched.
"use server"

import { revalidatePath } from "next/cache"

import { formatKobo, splitMatch } from "@/domain/money"
import {
  MAX_TACTICS,
  splitProblem,
  toSplitPositions,
  type RawSplitItem,
  type SplitProblem,
} from "@/domain/tactics"
import { loadMoney } from "@/features/match/queries"
import { tacticList } from "@/features/tactics/board"
import {
  deleteTacticSchema,
  playSavedTacticSchema,
  renameTacticSchema,
  saveTacticSchema,
} from "@/features/tactics/schema"
import {
  actionError,
  actionOk,
  authedAction,
  type ActionClient,
} from "@/lib/actions"

const GONE_MESSAGE = "That tactic is gone. Reload the board."
const NAME_TAKEN_MESSAGE =
  "You already use that name. Names stay reserved even after a delete."
const CAP_MESSAGE = `You keep ${MAX_TACTICS} tactics. Delete one to save another.`

// One sentence per rule the split can break, so a refusal says what to fix.
const PROBLEM_COPY: Record<SplitProblem, string> = {
  count: "That plan does not match the shape it started from.",
  role: "Every spot has to belong to a position on the pitch.",
  label: "Every spot needs a name.",
  index: "Spot numbers have to be whole numbers.",
  sequence: "Each spot appears once, in order.",
  share: "A share cannot be more than the whole plan.",
  sum: "The shares have to add up to the whole plan.",
  def_zone: "Your costs keep their own share of the plan.",
}

type PlayResult = {
  code?: unknown
  match_id?: unknown
  period?: unknown
  shortfall_minor?: unknown
  message?: unknown
}

/** The base shape a tactic is built on, with what the split has to agree with:
 *  its spot count and its defense zone total. A retired shape still edits, so
 *  this read deliberately does not filter on `deprecated`. */
async function baseShape(client: ActionClient, name: string) {
  const { data, error } = await client
    .from("formation_shape")
    .select("id, name, formation_position(role, basis_points)")
    .eq("name", name)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const positions = data.formation_position ?? []
  return {
    name: data.name,
    spotCount: positions.length,
    defBasisPoints: positions
      .filter((spot) => spot.role === "DEF")
      .reduce((sum, spot) => sum + spot.basis_points, 0),
  }
}

function coverMessage(shortfallKobo: number, currency: string): string {
  return `This shape holds ${formatKobo({ kobo: shortfallKobo, currency })} short of your costs. Play a base shape with a wider defense, or change your costs and income. Shares alone cannot close this.`
}

export const saveTactic = authedAction(
  saveTacticSchema,
  async ({ userId, client, input }) => {
    let tacticId = input.tacticId ?? null
    let shapeName = input.baseShapeName

    if (tacticId) {
      // An edit keeps its head's base shape: a client supplied name is ignored.
      const { data, error } = await client
        .from("user_tactic")
        .select("id, shape_name")
        .eq("id", tacticId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .maybeSingle()
      if (error) throw error
      if (!data) return actionError("not_found", GONE_MESSAGE)
      if (data.shape_name) shapeName = data.shape_name
    }

    const shape = await baseShape(client, shapeName)
    if (!shape) {
      return actionError("not_found", "That shape is not in the library.")
    }
    const problem = splitProblem(input.split, {
      spotCount: shape.spotCount,
      defBasisPoints: shape.defBasisPoints,
    })
    if (problem) return actionError("invalid_split", PROBLEM_COPY[problem])

    if (!tacticId) {
      // One definition of what a user holds: the same read the list uses, so a
      // head whose version never landed cannot fill the cap.
      const held = await tacticList(client, userId)
      if (held.length >= MAX_TACTICS) {
        return actionError("tactic_limit", CAP_MESSAGE)
      }
    }

    // Stored exactly as validated, in the schema's own keys: the server never
    // re-normalises a split the board already built by the rules.
    const split = input.split as RawSplitItem[]
    let createdHead = false
    if (!tacticId) {
      const { data, error } = await client
        .from("user_tactic")
        .insert({
          user_id: userId,
          name: input.name,
          shape_name: shape.name,
        })
        .select("id")
        .single()
      if (error) {
        if (error.code === "23505") {
          return actionError("name_taken", NAME_TAKEN_MESSAGE)
        }
        throw error
      }
      tacticId = data.id
      createdHead = true
    }

    const { data: version, error } = await client
      .from("user_tactic_version")
      .insert({ tactic_id: tacticId, split })
      .select("id")
      .single()
    if (error) {
      // A tactic with no version would take a slot under the cap and open as an
      // empty board, so the head made a moment ago goes back out.
      if (createdHead) {
        await client
          .from("user_tactic")
          .delete()
          .eq("id", tacticId)
          .eq("user_id", userId)
      }
      throw error
    }

    revalidatePath("/app/tactics")
    return actionOk({ tacticId, versionId: version.id })
  },
)

export const renameTactic = authedAction(
  renameTacticSchema,
  async ({ userId, client, input }) => {
    const { data, error } = await client
      .from("user_tactic")
      .update({ name: input.name })
      .eq("id", input.tacticId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select("id")
    if (error) {
      if (error.code === "23505") {
        return actionError("name_taken", NAME_TAKEN_MESSAGE)
      }
      throw error
    }
    if (!data || data.length === 0) {
      return actionError("not_found", GONE_MESSAGE)
    }
    revalidatePath("/app/tactics")
    return actionOk()
  },
)

/** Soft delete: the head and its versions stay, so a match played from this
 *  tactic keeps its pinned plan. The name stays reserved by the shipped unique
 *  constraint, which the copy above explains. */
export const deleteTactic = authedAction(
  deleteTacticSchema,
  async ({ userId, client, input }) => {
    const { data, error } = await client
      .from("user_tactic")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", input.tacticId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select("id")
    if (error) throw error
    if (!data || data.length === 0) {
      return actionError("not_found", GONE_MESSAGE)
    }
    revalidatePath("/app/tactics")
    return actionOk()
  },
)

/** Play a saved tactic for this month. The current version is read here, never
 *  accepted from the client, and the one atomic function writes the month and
 *  its lines, or nothing. */
export const playSavedTactic = authedAction(
  playSavedTacticSchema,
  async ({ userId, client, input }) => {
    const { data: head, error: headError } = await client
      .from("user_tactic")
      .select(
        "id, name, shape_name, user_tactic_version(id, split, is_current)",
      )
      .eq("id", input.tacticId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle()
    if (headError) throw headError
    const version = (head?.user_tactic_version ?? []).find(
      (row) => row.is_current,
    )
    if (!head || !version) return actionError("not_found", GONE_MESSAGE)

    const positions = toSplitPositions(version.split)
    const money = await loadMoney(client, userId)
    if (money.incomeMinorUnits === 0) {
      return actionError(
        "no_income",
        "Add what you earn first, then play the match.",
      )
    }

    const split = splitMatch(
      positions,
      money.incomeMinorUnits,
      money.costMinorUnits,
    )
    if (split.shortfallKobo !== null) {
      return actionError(
        "unable_to_cover",
        coverMessage(split.shortfallKobo, money.currency),
      )
    }

    const lines = split.lines.map((line) => ({
      role: line.role,
      spot_index: line.spotIndex,
      label: line.label,
      basis_points: line.basisPoints,
      planned_minor: line.plannedKobo,
      // Nothing is logged from the board: actuals are entered on the walk's
      // review step, and the function carries forward what is already there.
      actual_minor: null,
      currency: money.currency,
    }))

    // No shape id in this call: the version is the source, and the function
    // refuses any call that names both or neither.
    const { data, error } = await client.rpc("play_match", {
      p_lines: lines,
      p_tactic_version_id: version.id,
    })
    if (error) {
      // The one raw failure the function lets through: a concurrent second play
      // losing the one active match index for this period.
      if (error.code === "23505") {
        return actionError(
          "conflict",
          "This month was just played. Reload to see it.",
        )
      }
      throw error
    }
    const result = (data ?? {}) as PlayResult
    if (result.code === "ok") {
      revalidatePath("/app")
      revalidatePath("/app/tactics")
      return actionOk({
        matchId: Number(result.match_id),
        period: String(result.period),
      })
    }
    if (result.code === "unable_to_cover") {
      return actionError(
        "unable_to_cover",
        coverMessage(Number(result.shortfall_minor ?? 0), money.currency),
      )
    }
    const message =
      typeof result.message === "string" ? result.message : GONE_MESSAGE
    const code = typeof result.code === "string" ? result.code : "unexpected"
    return actionError(code, message)
  },
)
