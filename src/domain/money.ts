// Money lives in exact integer minor units (kobo), never floats. Spec 0001.
// This module owns every money computation: the formatter, the naira parser,
// and the two-step split engine of the first match loop (spec 0007).

export type Amount = {
  kobo: number
  /** ISO 4217 code as stored by the schema's char(3) columns. */
  currency: string
}

// One formatter per currency code, built on demand: the schema allows any
// ISO code, so nothing here may assume naira. Stored kobo is always hundredths
// (spec 0004), hence the /100 in formatKobo for every currency. Fraction
// digits are left to Intl per code: 2 for NGN and USD, 0 for JPY, 3 for KWD.
const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: string): Intl.NumberFormat {
  let built = formatters.get(currency)
  if (!built) {
    built = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    })
    formatters.set(currency, built)
  }
  return built
}

export function formatKobo(amount: Amount): string {
  return formatter(amount.currency).format(amount.kobo / 100)
}

const plain = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Screen reader form: "45,000 naira", never the raw "₦" glyph. Floored to
// whole units: a stored amount must never be announced larger than it is.
export function formatKoboSpoken(amount: Amount): string {
  const unit = amount.currency === "NGN" ? "naira" : amount.currency
  return `${plain.format(Math.floor(amount.kobo / 100))} ${unit}`
}

// AC-2: whole naira or up to two decimals, nothing else. No sign, no
// exponent, no thousands separators; "0" and negative strings fail the
// pattern or the > 0 guard below. Zero is a rejected amount for incomes and
// costs, but an entered actual may be zero (spec 0007 AC-6: moved nothing),
// so the caller says whether zero counts.
const NAIRA_PATTERN = /^\d+(\.\d{1,2})?$/

export function parseNaira(input: string, allowZero = false): number | null {
  if (!NAIRA_PATTERN.test(input)) return null
  // x100 before rounding keeps the value inside float safety for real
  // salaries; the pattern already rejected a third decimal.
  const kobo = Math.round(Number(input) * 100)
  if (kobo === 0) return allowZero ? 0 : null
  return kobo
}

// AC-5: a zone's share of income, floored, integer math only.
export function zoneShareKobo(incomeKobo: number, bps: number): number {
  return Math.floor((incomeKobo * bps) / 10000)
}

export type SplitPosition = {
  role: "GK" | "DEF" | "MID" | "FWD" | "BENCH"
  spotIndex: number
  label: string
  basisPoints: number
}

export type SplitLine = {
  role: SplitPosition["role"]
  spotIndex: number
  label: string
  basisPoints: number
  plannedKobo: number
}

export type SplitResult = {
  lines: SplitLine[]
  /** Null when income covers the costs; otherwise the defense gap in kobo. */
  shortfallKobo: number | null
}

// Largest remainder allocation (spec 0004's two step rule, AC-4): floor each
// spot's share, then hand out the leftover kobo one each, remainder
// descending, lower spot index first on a tie. The sum is exact by
// construction, so the lines always total the pool kobo for kobo.
function allocate(poolKobo: number, spots: SplitPosition[]): SplitLine[] {
  const totalBps = spots.reduce((sum, s) => sum + s.basisPoints, 0)
  const rows = spots.map((s) => {
    const exact = (poolKobo * s.basisPoints) / totalBps
    const floored = Math.floor(exact)
    return { spot: s, planned: floored, remainder: exact - floored }
  })
  let leftover = poolKobo - rows.reduce((sum, r) => sum + r.planned, 0)
  const order = rows
    .map((r, i) => i)
    .sort(
      (a, b) =>
        rows[b].remainder - rows[a].remainder ||
        rows[a].spot.spotIndex - rows[b].spot.spotIndex,
    )
  for (let i = 0; leftover > 0; i = (i + 1) % order.length) {
    rows[order[i]].planned += 1
    leftover -= 1
  }
  return rows.map((r) => ({
    role: r.spot.role,
    spotIndex: r.spot.spotIndex,
    label: r.spot.label,
    basisPoints: r.spot.basisPoints,
    plannedKobo: r.planned,
  }))
}

// The split itself: defense takes the real cost total in full (a formation
// never shrinks rent), split across DEF spots by intra-zone basis points;
// whatever income remains goes to the GK/MID/FWD/BENCH spots by their basis
// points. Positions arrive in spot_index order (the library read guarantees
// it), so the array index is the spot index.
export function splitMatch(
  positions: SplitPosition[],
  incomeKobo: number,
  costKobo: number,
): SplitResult {
  const def = positions.filter((p) => p.role === "DEF")
  const rest = positions.filter((p) => p.role !== "DEF")
  const defBps = def.reduce((sum, p) => sum + p.basisPoints, 0)
  const shortfall =
    costKobo > zoneShareKobo(incomeKobo, defBps)
      ? costKobo - zoneShareKobo(incomeKobo, defBps)
      : null
  if (shortfall !== null) {
    return { lines: [], shortfallKobo: shortfall }
  }
  // Back in spot order, so lines[i] belongs to positions[i]: the pitch renders
  // the two zipped by index, and a defense first line up would mislabel every
  // shirt after the back four.
  const lines = [
    ...allocate(costKobo, def),
    ...allocate(incomeKobo - costKobo, rest),
  ].sort((a, b) => a.spotIndex - b.spotIndex)
  return { lines, shortfallKobo: null }
}

// Matchday sample (spec 0011): exact distribution, a plan's headline figures
// and goal progress. Separate from the split engine above, which stays the
// production contract.

/** Largest remainder split of `total` by integer weights: floor each share,
 *  then hand the leftover units out by remainder, earliest index first on a
 *  tie. BigInt keeps total × weight exact past 2^53. A zero weight total
 *  gives all zeros rather than invented shares. */
export function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, w) => acc + w, 0)
  if (sum === 0) return weights.map(() => 0)
  const t = BigInt(total)
  const s = BigInt(sum)
  const rows = weights.map((w, i) => {
    const product = t * BigInt(w)
    return { i, share: product / s, remainder: product % s }
  })
  let leftover = rows.reduce((acc, r) => acc - r.share, t)
  const order = [...rows].sort((a, b) =>
    a.remainder === b.remainder
      ? a.i - b.i
      : a.remainder > b.remainder
        ? -1
        : 1,
  )
  for (const row of order) {
    if (leftover === BigInt(0)) break
    row.share += BigInt(1)
    leftover -= BigInt(1)
  }
  return rows.map((r) => Number(r.share))
}

export type PlanIncome = { expectedKobo: number; receivedKobo: number }
export type PlanPurpose = {
  plannedKobo: number
  essential: boolean
  requiredKobo: number | null
}

export type PlanFigures = {
  /** R: received income in the coverage month. */
  receivedKobo: number
  /** U: expected income not yet received, never negative per source. */
  outstandingKobo: number
  /** E: essential budget (fixed required amount, else planned allowance). */
  essentialKobo: number
  /** P: every planned allocation, optional ones included. */
  plannedKobo: number
  receivedRemainderKobo: number
  forecastRemainderKobo: number
  leftToAssignKobo: number
  overallGapKobo: number
  essentialGapKobo: number
  /** Per purpose, aligned with the input: max(required − planned, 0). */
  underallocatedKobo: number[]
}

// The value sourcing table of spec 0011, verbatim. Opening reserve and goal
// savings never enter; expected income never closes a received gap.
export function planFigures(
  incomes: PlanIncome[],
  purposes: PlanPurpose[],
  openingCarryKobo: number,
): PlanFigures {
  const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)
  const r = sum(incomes.map((i) => i.receivedKobo))
  const u = sum(
    incomes.map((i) => Math.max(i.expectedKobo - i.receivedKobo, 0)),
  )
  const e = sum(
    purposes
      .filter((p) => p.essential)
      .map((p) => p.requiredKobo ?? p.plannedKobo),
  )
  const p = sum(purposes.map((x) => x.plannedKobo))
  const o = openingCarryKobo
  return {
    receivedKobo: r,
    outstandingKobo: u,
    essentialKobo: e,
    plannedKobo: p,
    receivedRemainderKobo: r + o - e,
    forecastRemainderKobo: r + o + u - e,
    leftToAssignKobo: r + o - p,
    overallGapKobo: Math.max(p - r - o, 0),
    essentialGapKobo: Math.max(e - r - o, 0),
    underallocatedKobo: purposes.map((x) =>
      x.requiredKobo === null ? 0 : Math.max(x.requiredKobo - x.plannedKobo, 0),
    ),
  }
}

/** Goal bar width in basis points: floor(progress × 10000 / target), capped. */
export function progressBasisPoints(progressKobo: number, targetKobo: number) {
  if (targetKobo <= 0) return 0
  const bps = (BigInt(progressKobo) * BigInt(10000)) / BigInt(targetKobo)
  return Math.min(Number(bps), 10000)
}

/** Kobo back to the plain naira text an amount field accepts ("3333.34"). */
export function koboToNairaInput(kobo: number): string {
  const fraction = kobo % 100
  const whole = String(Math.floor(kobo / 100))
  return fraction === 0
    ? whole
    : `${whole}.${String(fraction).padStart(2, "0")}`
}
