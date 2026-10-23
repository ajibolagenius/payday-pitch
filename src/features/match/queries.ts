// The walk's reads (spec 0007 API surface). The screens derive their step from
// these rows, so the state of the data IS the progress: no pointer to store
// and nothing to go stale. Reads stay explicit about the user even though RLS
// already scopes them, the same defense in depth the write path uses.
import type { FormationRole } from "@/domain/formations"
import { currentLagosPeriod } from "@/domain/dates"
import {
  listFormations,
  type LibraryFormation,
  type ReadClient,
} from "@/features/match/library"

export type MoneyEntry = {
  id: number
  name: string
  amountMinorUnits: number
  currency: string
  paydayDay: number
}

export type CostEntry = {
  id: number
  name: string
  amountMinorUnits: number
  currency: string
}

export type MatchLine = {
  role: FormationRole
  spotIndex: number
  label: string
  basisPoints: number
  plannedMinorUnits: number
  actualMinorUnits: number | null
}

export type MatchSnapshot = {
  id: number
  period: string
  shapeId: number | null
  shapeName: string
  currency: string
  lines: MatchLine[]
}

export type MoneyState = {
  incomes: MoneyEntry[]
  costs: CostEntry[]
  incomeMinorUnits: number
  costMinorUnits: number
  currency: string
}

export type WalkState = MoneyState & {
  formations: LibraryFormation[]
  /** The played month for the current Lagos period, if any. */
  active: MatchSnapshot | null
  /** The most recent month, played or corrected: the fallback pitch. */
  last: MatchSnapshot | null
}

const MATCH_SELECT =
  "id, period, shape_name, library_id, currency, match_line(role, spot_index, label, basis_points, planned_minor, actual_minor)"

function failed(what: string, message: string): never {
  throw new Error(`read ${what} failed: ${message}`)
}

export async function loadMoney(
  client: ReadClient,
  userId: string,
): Promise<MoneyState> {
  const [income, cost, profile] = await Promise.all([
    client
      .from("income_stream")
      .select("id, name, amount_minor, currency, payday_day")
      .eq("user_id", userId)
      .order("id"),
    client
      .from("fixed_cost")
      .select("id, name, amount_minor, currency")
      .eq("user_id", userId)
      .order("id"),
    client
      .from("profile")
      .select("default_currency")
      .eq("user_id", userId)
      .maybeSingle(),
  ])
  if (income.error) failed("incomes", income.error.message)
  if (cost.error) failed("costs", cost.error.message)
  if (profile.error) failed("profile", profile.error.message)
  const incomes = income.data ?? []
  const costs = cost.data ?? []
  return {
    incomes: incomes.map((row) => ({
      id: row.id,
      name: row.name,
      amountMinorUnits: Number(row.amount_minor),
      currency: row.currency,
      paydayDay: row.payday_day,
    })),
    costs: costs.map((row) => ({
      id: row.id,
      name: row.name,
      amountMinorUnits: Number(row.amount_minor),
      currency: row.currency,
    })),
    incomeMinorUnits: incomes.reduce(
      (sum, row) => sum + Number(row.amount_minor),
      0,
    ),
    costMinorUnits: costs.reduce(
      (sum, row) => sum + Number(row.amount_minor),
      0,
    ),
    // The stored preference, naira when there is no profile row yet (AC-10
    // of spec 0004: the row is created lazily).
    currency: profile.data?.default_currency ?? "NGN",
  }
}

type MatchRow = {
  id: number
  period: string
  shape_name: string
  library_id: number | null
  currency: string
  match_line: {
    role: string | null
    spot_index: number
    label: string
    basis_points: number
    planned_minor: number
    actual_minor: number | null
  }[]
}

function toSnapshot(row: MatchRow): MatchSnapshot {
  return {
    id: row.id,
    period: row.period,
    shapeId: row.library_id,
    shapeName: row.shape_name,
    currency: row.currency,
    lines: (row.match_line ?? []).map((line) => ({
      role: line.role as FormationRole,
      spotIndex: line.spot_index,
      label: line.label,
      basisPoints: line.basis_points,
      plannedMinorUnits: Number(line.planned_minor),
      actualMinorUnits:
        line.actual_minor === null ? null : Number(line.actual_minor),
    })),
  }
}

/** The month this app is currently in, played and not yet corrected. */
export async function loadActiveMatch(
  client: ReadClient,
  userId: string,
  period = currentLagosPeriod(),
): Promise<MatchSnapshot | null> {
  const { data, error } = await client
    .from("match")
    .select(MATCH_SELECT)
    .eq("user_id", userId)
    .eq("period", period)
    .eq("status", "active")
    .order("spot_index", { foreignTable: "match_line" })
    .maybeSingle()
  if (error) failed("active match", error.message)
  return data ? toSnapshot(data) : null
}

/** The newest month on file: the latest insert of the latest period, which is
 *  the active one after any correction. */
export async function loadLastMatch(
  client: ReadClient,
  userId: string,
): Promise<MatchSnapshot | null> {
  const { data, error } = await client
    .from("match")
    .select(MATCH_SELECT)
    .eq("user_id", userId)
    .order("period", { ascending: false })
    .order("created_at", { ascending: false })
    .order("spot_index", { foreignTable: "match_line" })
    .limit(1)
  if (error) failed("last match", error.message)
  return data?.[0] ? toSnapshot(data[0]) : null
}

/** Everything the `/app` screen derives, in one round of parallel reads. */
export async function loadWalk(
  client: ReadClient,
  userId: string,
): Promise<WalkState> {
  const [money, formations, active, last] = await Promise.all([
    loadMoney(client, userId),
    listFormations(client),
    loadActiveMatch(client, userId),
    loadLastMatch(client, userId),
  ])
  return { ...money, formations, active, last }
}
