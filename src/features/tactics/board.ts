// The board's read (spec 0008 API surface). This is not a Server Action: it runs
// on the server for the page, from the read only client, and identity comes from
// the verified claims. One round of parallel reads gives the editor everything it
// needs to show real money, because a share that is not money yet is not a
// choice anyone can feel.
import type { SplitPosition } from "@/domain/money"
import {
  fundMonths,
  suggestFormation,
  toSplitPositions,
  type TacticSuggestion,
} from "@/domain/tactics"
import { getShapePositions, type ReadClient } from "@/features/match/library"
import { loadMoney } from "@/features/match/queries"
import { rowId } from "@/lib/schemas"

export type BoardSource = {
  /** The library shape this plan is built on. A tactic renders its base
   *  shape's layout, because the coordinate table is keyed by shape name. */
  baseShapeName: string
  /** What the board is called: the shape name, or the tactic's own name. */
  title: string
  style: string
  whenToPlay: string | null
  positions: SplitPosition[]
  tacticId: number | null
  versionId: number | null
}

export type SavedTacticSummary = {
  id: number
  name: string
  shapeName: string | null
}

export type BoardContext = {
  source: BoardSource
  tactics: SavedTacticSummary[]
  incomeKobo: number
  costKobo: number
  currency: string
  /** Whole months of one played match's defense total, in the fund (AC-6). */
  fundMonthsValue: number
  suggestion: TacticSuggestion | null
}

export type BoardParams = {
  shape?: string | null
  tactic?: string | null
}

type ShapeRow = {
  id: number
  name: string
  style: string
  when_to_play: string
}

function failed(what: string, message: string): never {
  throw new Error(`read ${what} failed: ${message}`)
}

async function shapeByName(
  client: ReadClient,
  name: string,
): Promise<ShapeRow | null> {
  const { data, error } = await client
    .from("formation_shape")
    .select("id, name, style, when_to_play")
    .eq("name", name)
    .eq("deprecated", false)
    .maybeSingle()
  if (error) failed("shape", error.message)
  return data
}

/** The first live shape in sort order, which is what the board opens with when
 *  the URL names nothing. */
async function firstShape(client: ReadClient): Promise<ShapeRow | null> {
  const { data, error } = await client
    .from("formation_shape")
    .select("id, name, style, when_to_play")
    .eq("deprecated", false)
    .order("sort")
    .limit(1)
  if (error) failed("shape list", error.message)
  return data?.[0] ?? null
}

async function liveShapeNames(client: ReadClient): Promise<string[]> {
  const { data, error } = await client
    .from("formation_shape")
    .select("name")
    .eq("deprecated", false)
  if (error) failed("shape list", error.message)
  return (data ?? []).map((row) => row.name)
}

async function tacticSource(
  client: ReadClient,
  userId: string,
  tacticId: number,
): Promise<BoardSource | null> {
  const { data, error } = await client
    .from("user_tactic")
    .select("id, name, shape_name, user_tactic_version(id, split, is_current)")
    .eq("id", tacticId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle()
  if (error) failed("tactic", error.message)
  if (!data) return null
  const version = (data.user_tactic_version ?? []).find((row) => row.is_current)
  // A head with no current version cannot be edited or played. There is nothing
  // to show, and the play path answers the same way.
  if (!version) return null
  const base = data.shape_name
    ? await shapeByName(client, data.shape_name)
    : null
  return {
    baseShapeName: data.shape_name ?? "",
    title: data.name,
    style: base ? base.style : "Your tactic",
    whenToPlay: base?.when_to_play ?? null,
    positions: toSplitPositions(version.split),
    tacticId: data.id,
    versionId: version.id,
  }
}

async function librarySource(
  client: ReadClient,
  shape: ShapeRow,
): Promise<BoardSource | null> {
  const positions = await getShapePositions(client, shape.id)
  if (!positions) return null
  return {
    baseShapeName: shape.name,
    title: shape.name,
    style: shape.style,
    whenToPlay: shape.when_to_play,
    positions,
    tacticId: null,
    versionId: null,
  }
}

/** Months of defense costs the fund covers. The denominator is one played
 *  match's frozen defense total (spec 0004), never today's rent, so a cost
 *  change cannot rewrite an old month's progress. */
async function fundState(client: ReadClient, userId: string): Promise<number> {
  const [saved, lastActive] = await Promise.all([
    client
      .from("gk_fund_progress")
      .select("gk_saved_minor")
      .eq("user_id", userId)
      .maybeSingle(),
    client
      .from("match")
      .select("id, period, match_line(role, planned_minor)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("period", { ascending: false })
      .limit(1),
  ])
  if (saved.error) failed("fund", saved.error.message)
  if (lastActive.error) failed("last match", lastActive.error.message)
  // A user who has played no match has no frozen defense total, so the
  // denominator is 0 and fundMonths returns 0 months. The spec's fallback (the
  // live cost total) gives the same answer, because the numerator is 0 too.
  const lines = lastActive.data?.[0]?.match_line ?? []
  const frozen = lines
    .filter((line) => line.role === "DEF")
    .reduce((sum, line) => sum + Number(line.planned_minor), 0)
  return fundMonths(Number(saved.data?.gk_saved_minor ?? 0), frozen)
}

/** A debt with a balance still to pay. Debt mode (feature 8) owns the table;
 *  this only asks whether one is open, because that rule wins the card. */
async function debtOutstanding(
  client: ReadClient,
  userId: string,
): Promise<boolean> {
  const [debts, progress] = await Promise.all([
    client
      .from("debt")
      .select("id, principal_minor")
      .eq("user_id", userId)
      .is("cleared_at", null),
    client.from("debt_progress").select("debt_id, paid_minor"),
  ])
  if (debts.error) failed("debts", debts.error.message)
  if (progress.error) failed("debt progress", progress.error.message)
  const paid = new Map(
    (progress.data ?? []).map((row) => [row.debt_id, Number(row.paid_minor)]),
  )
  return (debts.data ?? []).some(
    (debt) => Number(debt.principal_minor) - (paid.get(debt.id) ?? 0) > 0,
  )
}

/**
 * Everything the board renders, from the URL. Null when the named source is
 * missing, which the page shows as its not-found state.
 *
 * A `shape` and a `tactic` param together is not a state the board offers: the
 * tactic is the more specific of the two, so it wins and the shape is ignored.
 */
export async function readBoardContext(
  client: ReadClient,
  userId: string,
  params: BoardParams,
): Promise<BoardContext | null> {
  // The id goes through the same schema the actions use, so a malformed or
  // out of range param is the not-found state rather than a database error.
  const parsed = rowId.safeParse(params.tactic)
  const tacticId =
    parsed.success && parsed.data <= Number.MAX_SAFE_INTEGER
      ? parsed.data
      : null
  if (params.tactic && tacticId === null) return null

  let source: BoardSource | null = null
  if (tacticId !== null) {
    source = await tacticSource(client, userId, tacticId)
  } else {
    const shape = params.shape
      ? await shapeByName(client, params.shape)
      : await firstShape(client)
    source = shape ? await librarySource(client, shape) : null
  }
  if (!source) return null

  const [money, tactics, names, months, hasDebt] = await Promise.all([
    loadMoney(client, userId),
    tacticList(client, userId),
    liveShapeNames(client),
    fundState(client, userId),
    debtOutstanding(client, userId),
  ])

  const suggestion = suggestFormation({
    debtOutstanding: hasDebt,
    fundMonths: months,
    incomeKobo: money.incomeMinorUnits,
    costKobo: money.costMinorUnits,
  })

  return {
    source,
    tactics,
    incomeKobo: money.incomeMinorUnits,
    costKobo: money.costMinorUnits,
    currency: money.currency,
    fundMonthsValue: months,
    // A retired shape can never be recommended (AC-7), so a rule that names one
    // simply shows no card.
    suggestion:
      suggestion && names.includes(suggestion.shapeName) ? suggestion : null,
  }
}

/** The live tactics, oldest name first, for the list and the cap readout. A head
 *  whose version never landed is left out: it has no plan to open, so it must not
 *  hold a slot under the cap either. */
export async function tacticList(
  client: ReadClient,
  userId: string,
): Promise<SavedTacticSummary[]> {
  const { data, error } = await client
    .from("user_tactic")
    .select("id, name, shape_name, user_tactic_version(id, is_current)")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("name")
  if (error) failed("tactics", error.message)
  return (data ?? [])
    .filter((row) =>
      (row.user_tactic_version ?? []).some((version) => version.is_current),
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      shapeName: row.shape_name,
    }))
}
