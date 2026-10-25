// The tactics board rules (spec 0008): how a share edit moves money between
// spots, what counts as a risky shape, how far the emergency fund has come, and
// which shape to recommend. Pure data and arithmetic, no framework imports
// (spec 0001). The client preview and the server check read from this one
// implementation, so a board and a stored tactic can never disagree.

import { FORMATIONS } from "./formations"
import { zoneShareKobo, type SplitPosition } from "./money"

export type TacticsWarning = "costs_over_half" | "goalkeeper_at_zero"

/** Basis points in a whole plan. */
export const TOTAL_BASIS_POINTS = 10000

/** One tap on a stepper. */
export const SHARE_STEP_BASIS_POINTS = 50

/** The line the "costs over half" warning fires past, in basis points of income. */
export const COSTS_OVER_HALF_BASIS_POINTS = 5000

/** Months of defense costs in the fund that makes the goalkeeper spot generous. */
export const FUND_COMFORT_MONTHS = 3

/** Saved tactics per user, enforced in the save action, not the database. */
export const MAX_TACTICS = 5

export const TACTIC_NAME_MIN_LENGTH = 1
export const TACTIC_NAME_MAX_LENGTH = 30

// The three shapes the rules can recommend, named so debt mode (feature 8) can
// revise the whole suggestion table in one place.
export const DEBT_SHAPE = "5-4-1"
export const FUND_SHAPE = "4-3-3"
export const COSTS_SHAPE = "5-3-2"

// The reason is each shape's own when_to_play line, read from the seed instead
// of copied here, so a card can never disagree with the library (AC-7). Fixed
// strings, chosen by which rule fired: no model and no generated text.
function reasonFor(shapeName: string): string {
  return (
    FORMATIONS.find((shape) => shape.name === shapeName)?.whenToPlay ??
    shapeName
  )
}

export type ShareEdit = {
  /** The draft after the edit, in the order it arrived. */
  spots: SplitPosition[]
  /** Set only when the edit was cut short: the share the spot did reach, so
   *  the board can name the figure. Costs hold the rest. */
  stoppedAtBps: number | null
}

function zoneBasisPoints(
  spots: SplitPosition[],
  wanted: SplitPosition["role"],
): number {
  return spots
    .filter((spot) => spot.role === wanted)
    .reduce((sum, spot) => sum + spot.basisPoints, 0)
}

// Biggest holder first, lowest spot index on a tie: the same tie break
// src/domain/money.ts uses for its leftover kobo, so one plan never hands money
// out two different ways.
function bySizeThenSpot(a: SplitPosition, b: SplitPosition): number {
  return b.basisPoints - a.basisPoints || a.spotIndex - b.spotIndex
}

function isBench(spot: SplitPosition): boolean {
  return spot.role === "BENCH"
}

/**
 * The most a spot can hold. A DEF spot tops out at its own zone's total, which
 * is the fixed cost pool. Anything else tops out at everything the defense is
 * not holding, because the defense pool never moves.
 */
export function shareCeilingBps(
  spots: SplitPosition[],
  spotIndex: number,
): number {
  const target = spots.find((spot) => spot.spotIndex === spotIndex)
  if (!target) return 0
  return target.role === "DEF"
    ? zoneBasisPoints(spots, "DEF")
    : TOTAL_BASIS_POINTS - zoneBasisPoints(spots, "DEF")
}

/** Take `amount` from the holders matching `pick`, biggest first, and report
 *  what could not be placed. */
function drain(
  values: number[],
  spots: SplitPosition[],
  pick: (spot: SplitPosition, selfIndex: number) => boolean,
  selfIndex: number,
  amount: number,
): number {
  const order = spots
    .filter((spot) => pick(spot, selfIndex) && spot.basisPoints > 0)
    .sort(bySizeThenSpot)
  let remaining = amount
  for (const spot of order) {
    if (remaining <= 0) break
    const position = spots.indexOf(spot)
    const available = values[position]
    const move = Math.min(available, remaining)
    values[position] = available - move
    remaining -= move
  }
  return remaining
}

/** Give `amount` to the single largest holder matching `pick`. Splitting one
 *  user edit across several spots would move shares the user never touched. */
function gift(
  values: number[],
  spots: SplitPosition[],
  pick: (spot: SplitPosition, selfIndex: number) => boolean,
  selfIndex: number,
  amount: number,
): void {
  if (amount <= 0) return
  const holder = spots
    .map((spot, position) => ({ spot, position }))
    .filter(({ spot }) => pick(spot, selfIndex))
    .sort((a, b) => bySizeThenSpot(a.spot, b.spot))[0]
  if (holder) values[holder.position] += amount
}

// Who pays for an edit on a spot, and who collects from it.
function counterparties(target: SplitPosition): {
  pays: (spot: SplitPosition, selfIndex: number) => boolean
  collects: (spot: SplitPosition, selfIndex: number) => boolean
} {
  const notDef = (spot: SplitPosition) => spot.role !== "DEF"
  if (target.role === "DEF") {
    const other = (spot: SplitPosition, self: number) =>
      spot.role === "DEF" && spot.spotIndex !== self
    return { pays: other, collects: other }
  }
  if (isBench(target)) {
    // Bench never trades with itself.
    const forward = (spot: SplitPosition, self: number) =>
      notDef(spot) && !isBench(spot) && spot.spotIndex !== self
    return { pays: forward, collects: forward }
  }
  // Raising takes from BENCH first, then the largest other non DEF spot.
  // Lowering always hands the whole delta back to BENCH.
  return {
    pays: (spot, self) => notDef(spot) && spot.spotIndex !== self,
    collects: isBench,
  }
}

/**
 * One share edit, applied so the plan still totals 10000 basis points with no
 * arithmetic step left to the user. A raise is capped at the spot's ceiling; a
 * spot cannot go below zero. A DEF edit only redistributes the fixed cost pool,
 * so the zone total and every defense amount stay put.
 */
export function editShare(
  spots: SplitPosition[],
  spotIndex: number,
  deltaBps: number,
): ShareEdit {
  const position = spots.findIndex((spot) => spot.spotIndex === spotIndex)
  if (position < 0 || deltaBps === 0) return { spots, stoppedAtBps: null }
  const target = spots[position]
  const room = shareCeilingBps(spots, spotIndex) - target.basisPoints
  const wanted = Math.max(-target.basisPoints, Math.min(deltaBps, room))
  if (wanted === 0) {
    return { spots, stoppedAtBps: target.basisPoints }
  }

  const values = spots.map((spot) => spot.basisPoints)
  const { pays, collects } = counterparties(target)
  values[position] = target.basisPoints + wanted

  if (wanted > 0) {
    // A GK, MID or FWD raise takes from BENCH first, then from the rest.
    if (target.role !== "DEF" && target.role !== "BENCH") {
      const left = drain(values, spots, isBench, position, wanted)
      if (left > 0) drain(values, spots, pays, position, left)
    } else {
      drain(values, spots, pays, position, wanted)
    }
  } else {
    gift(values, spots, collects, position, -wanted)
  }

  return {
    spots: spots.map((spot, at) => ({ ...spot, basisPoints: values[at] })),
    stoppedAtBps: wanted === deltaBps ? null : values[position],
  }
}

/** A typed exact share: the same rules as the equivalent delta. */
export function setShare(
  spots: SplitPosition[],
  spotIndex: number,
  targetBps: number,
): ShareEdit {
  const current = spots.find((spot) => spot.spotIndex === spotIndex)
  if (!current) return { spots, stoppedAtBps: null }
  return editShare(spots, spotIndex, targetBps - current.basisPoints)
}

/**
 * The shape a saved split must have, checked against its base shape rather than
 * trusted from the client. A hand written payload is refused here before it ever
 * reaches a version row (AC-2, AC-4). The five problems are what the save action
 * answers as invalid_split, each with its own message.
 */
export type SplitProblem =
  | "count"
  | "role"
  | "label"
  | "index"
  | "share"
  | "sequence"
  | "sum"
  | "def_zone"

const ZONE_ROLES: readonly string[] = ["GK", "DEF", "MID", "FWD", "BENCH"]

/** A split item on the wire and in the stored JSONB, in the schema's own
 *  snake_case, so one payload shape serves the board, the save, and the play
 *  function. The domain reads and writes camelCase spots. */
export type RawSplitItem = {
  role: string
  spot_index: number
  label: string
  basis_points: number
}

export function splitProblem(
  rawSplit: unknown,
  expected: { spotCount: number; defBasisPoints: number },
): SplitProblem | null {
  if (!Array.isArray(rawSplit) || rawSplit.length !== expected.spotCount) {
    return "count"
  }
  const spots: RawSplitItem[] = []
  for (const item of rawSplit) {
    if (typeof item !== "object" || item === null) return "role"
    const spot = item as Record<string, unknown>
    if (typeof spot.role !== "string" || !ZONE_ROLES.includes(spot.role)) {
      return "role"
    }
    if (!Number.isInteger(spot.spot_index)) return "index"
    if (typeof spot.label !== "string" || spot.label.trim() === "") {
      return "label"
    }
    if (
      !Number.isInteger(spot.basis_points) ||
      (spot.basis_points as number) < 0 ||
      (spot.basis_points as number) > TOTAL_BASIS_POINTS
    ) {
      return "share"
    }
    spots.push(spot as unknown as RawSplitItem)
  }
  // One line per spot, numbered from zero with no gap and no duplicate.
  if (spots.some((spot, at) => spot.spot_index !== at)) return "sequence"
  if (
    spots.reduce((sum, spot) => sum + spot.basis_points, 0) !==
    TOTAL_BASIS_POINTS
  ) {
    return "sum"
  }
  // The defense zone keeps the base shape's total, which is what keeps the cost
  // pool locked and what keeps allocate's division safe (a zone of zero basis
  // points would divide by zero).
  const defBps = spots
    .filter((spot) => spot.role === "DEF")
    .reduce((sum, spot) => sum + spot.basis_points, 0)
  if (defBps !== expected.defBasisPoints) return "def_zone"
  return null
}

/** A split that passed splitProblem, as the domain reads a shape. */
export function toSplitPositions(rawSplit: unknown): SplitPosition[] {
  const spots = rawSplit as RawSplitItem[]
  return spots.map((spot) => ({
    role: spot.role as SplitPosition["role"],
    spotIndex: spot.spot_index,
    label: spot.label,
    basisPoints: spot.basis_points,
  }))
}

/** The two things worth saying about a plan, neither of which blocks a save. */
export function boardWarnings(
  spots: SplitPosition[],
  incomeKobo: number,
  costKobo: number,
): TacticsWarning[] {
  const warnings: TacticsWarning[] = []
  if (
    incomeKobo > 0 &&
    costKobo > zoneShareKobo(incomeKobo, COSTS_OVER_HALF_BASIS_POINTS)
  ) {
    warnings.push("costs_over_half")
  }
  if (zoneBasisPoints(spots, "GK") === 0) warnings.push("goalkeeper_at_zero")
  return warnings
}

/**
 * Months of defense costs the emergency fund covers. The denominator is one
 * played match's frozen defense total (spec 0004), never today's rent, so the
 * number cannot chase a cost change. A zero denominator is zero months: no
 * divide by zero, and no nudge.
 */
export function fundMonths(
  gkSavedKobo: number,
  frozenDefenseKobo: number,
): number {
  if (frozenDefenseKobo <= 0) return 0
  return Math.floor(gkSavedKobo / frozenDefenseKobo)
}

export type SuggestionContext = {
  debtOutstanding: boolean
  /** Months of defense costs already in the fund. */
  fundMonths: number
  incomeKobo: number
  costKobo: number
}

export type TacticSuggestion = {
  shapeName: string
  reason: string
}

/**
 * The shape to recommend, by the first rule that fires, in this fixed order: an
 * outstanding debt, a fund at FUND_COMFORT_MONTHS or more, costs over half of
 * income. No rule, no card, and no card before the user has both income and a
 * cost. A comfortable fund and a live debt never read as opposite advice,
 * because one card carries one rule and debt wins the slot.
 */
export function suggestFormation(
  context: SuggestionContext,
): TacticSuggestion | null {
  if (context.incomeKobo <= 0 || context.costKobo <= 0) return null
  if (context.debtOutstanding) {
    return { shapeName: DEBT_SHAPE, reason: reasonFor(DEBT_SHAPE) }
  }
  if (context.fundMonths >= FUND_COMFORT_MONTHS) {
    return { shapeName: FUND_SHAPE, reason: reasonFor(FUND_SHAPE) }
  }
  if (
    context.costKobo >
    zoneShareKobo(context.incomeKobo, COSTS_OVER_HALF_BASIS_POINTS)
  ) {
    return { shapeName: COSTS_SHAPE, reason: reasonFor(COSTS_SHAPE) }
  }
  return null
}
