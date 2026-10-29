// The Matchday sample (spec 0011): fictional fixtures and every rule the
// prototype runs, as pure functions over one in memory `Sample`. Nothing here
// touches the network, storage, cookies, the URL or the console (AC-13). An
// edit returns either the next sample or a field error; a failed edit leaves
// the caller holding the last valid sample.
import { clippedWeeks, daysInLagosMonth } from "@/domain/dates"
import {
  distribute,
  parseNaira,
  planFigures,
  progressBasisPoints,
  type PlanFigures,
} from "@/domain/money"

export type Line = "keeper" | "defence" | "midfield" | "attack"

export const LINES: Line[] = ["keeper", "defence", "midfield", "attack"]

export const LINE_INFO: Record<Line, { name: string; meaning: string }> = {
  keeper: { name: "Keeper", meaning: "Your reserve" },
  defence: { name: "Defence", meaning: "Essentials and required debt" },
  midfield: {
    name: "Midfield",
    meaning: "Extra debt repayment and flexible spending",
  },
  attack: { name: "Attack", meaning: "Goals" },
}

export const NOV = "plan-2026-11"
export const DEC = "plan-2026-12"
export const FOOD = "p-food"
export const CURRENCY = "NGN"

export type PlanId = typeof NOV | typeof DEC

export type Plan = {
  id: PlanId
  coverageMonth: string
  currency: typeof CURRENCY
  openingCarryKobo: number
  openingReserveKobo: number
  status: "draft" | "saved"
  shortfallAcknowledged: boolean
}

export type Income = {
  id: string
  planId: PlanId
  label: string
  expectedKobo: number
  expectedOn: string
  receivedKobo: number
  receivedOn: string | null
}

export type Purpose = {
  id: string
  planId: PlanId
  label: string
  line: Line
  essential: boolean
  /** Food's stored value is ignored: its plan is the sum of its weeks. */
  plannedKobo: number
  recordedKobo: number | null
  requiredKobo: number | null
  dueOn: string | null
}

export type FoodWeek = {
  id: string
  purposeId: string
  startsOn: string
  endsOn: string
  allowanceKobo: number
  remainingKobo: number | null
}

export type Goal = {
  id: string
  purposeId: string
  targetKobo: number
  openingSavedKobo: number
}

export type Clock = "2026-10-30" | "2026-11-04" | "2026-11-30"

export const CLOCKS: { value: Clock; label: string }[] = [
  { value: "2026-10-30", label: "30 October" },
  { value: "2026-11-04", label: "4 November" },
  { value: "2026-11-30", label: "30 November" },
]

export type Sample = {
  scenario: ScenarioName
  clock: Clock
  plans: Record<PlanId, Plan>
  incomes: Income[]
  purposes: Purpose[]
  weeks: FoodWeek[]
  goal: Goal
  /** December's opening carry stays unconfirmed until explicitly applied. */
  carryConfirmed: boolean
  /** Any change since the fixture loaded: selecting a scenario asks first. */
  edited: boolean
}

export type Outcome =
  { ok: true; sample: Sample } | { ok: false; error: string }

const naira = (n: number) => n * 100

// Fixture order is the tie break for due dates (transport before data).
const PURPOSES: Omit<Purpose, "planId" | "recordedKobo">[] = [
  {
    id: "p-required-debt",
    label: "Required debt",
    line: "defence",
    essential: true,
    plannedKobo: naira(120_000),
    requiredKobo: naira(120_000),
    dueOn: "2026-11-05",
  },
  {
    id: "p-transport",
    label: "Transport",
    line: "defence",
    essential: true,
    plannedKobo: naira(50_000),
    requiredKobo: naira(50_000),
    dueOn: "2026-11-02",
  },
  {
    id: "p-data",
    label: "Data",
    line: "defence",
    essential: true,
    plannedKobo: naira(10_000),
    requiredKobo: naira(10_000),
    dueOn: "2026-11-02",
  },
  {
    id: FOOD,
    label: "Food",
    line: "defence",
    essential: true,
    plannedKobo: 0,
    requiredKobo: null,
    dueOn: null,
  },
  {
    id: "p-family",
    label: "Protected family support",
    line: "defence",
    essential: true,
    plannedKobo: naira(50_000),
    requiredKobo: naira(50_000),
    dueOn: "2026-11-10",
  },
  {
    id: "p-extra-debt",
    label: "Extra debt repayment",
    line: "midfield",
    essential: false,
    plannedKobo: naira(80_000),
    requiredKobo: null,
    dueOn: null,
  },
  {
    id: "p-misc",
    label: "Miscellaneous",
    line: "midfield",
    essential: false,
    plannedKobo: naira(35_000),
    requiredKobo: null,
    dueOn: null,
  },
  {
    id: "p-emergency",
    label: "Emergency contribution",
    line: "keeper",
    essential: false,
    plannedKobo: naira(80_000),
    requiredKobo: null,
    dueOn: null,
  },
  {
    id: "p-course",
    label: "Course goal",
    line: "attack",
    essential: false,
    plannedKobo: naira(75_000),
    requiredKobo: null,
    dueOn: null,
  },
]

const INCOMES: Omit<Income, "planId" | "receivedKobo" | "receivedOn">[] = [
  {
    id: "i-a",
    label: "Salary A",
    expectedKobo: naira(250_000),
    expectedOn: "2026-10-29",
  },
  {
    id: "i-b",
    label: "Salary B",
    expectedKobo: naira(200_000),
    expectedOn: "2026-10-30",
  },
  {
    id: "i-c",
    label: "Salary C",
    expectedKobo: naira(150_000),
    expectedOn: "2026-10-31",
  },
]

type Receipts = Record<string, [number, string | null]>

const BASELINE: Receipts = {
  "i-a": [250_000, "2026-10-29"],
  "i-b": [150_000, "2026-10-30"],
  "i-c": [0, null],
}

const FULL: Receipts = {
  "i-a": [250_000, "2026-10-29"],
  "i-b": [200_000, "2026-11-02"],
  "i-c": [150_000, "2026-11-04"],
}

const REPORT: Record<string, number> = {
  "p-required-debt": 120_000,
  "p-transport": 50_000,
  "p-data": 10_000,
  "p-family": 50_000,
  "p-emergency": 80_000,
  "p-extra-debt": 80_000,
  "p-misc": 20_000,
  "p-course": 0,
}

type Scenario = {
  label: string
  clock: Clock
  status: Plan["status"]
  receipts: Receipts
  /** Naira per purpose; any purpose not listed is unknown. */
  records: Record<string, number>
}

export const SCENARIOS = {
  baseline: {
    label: "Baseline",
    clock: "2026-10-30",
    status: "draft",
    receipts: BASELINE,
    records: {},
  },
  "salary-shortfall": {
    label: "Salary shortfall",
    clock: "2026-10-30",
    status: "draft",
    receipts: { ...BASELINE, "i-b": [0, null] },
    records: {},
  },
  "late-receipt": {
    label: "Late receipt",
    clock: "2026-11-04",
    status: "draft",
    receipts: { ...BASELINE, "i-c": [150_000, "2026-11-04"] },
    records: {},
  },
  "fully-received": {
    label: "Fully received",
    clock: "2026-11-04",
    status: "saved",
    receipts: FULL,
    records: {},
  },
  "adjustment-before": {
    label: "Adjustment before repayment",
    clock: "2026-11-04",
    status: "saved",
    receipts: FULL,
    records: { "p-extra-debt": 0, "p-course": 0 },
  },
  "adjustment-after": {
    label: "Adjustment after repayment",
    clock: "2026-11-04",
    status: "saved",
    receipts: FULL,
    records: { "p-extra-debt": 80_000, "p-course": 0 },
  },
  "report-complete": {
    label: "Report complete",
    clock: "2026-11-30",
    status: "saved",
    receipts: FULL,
    records: REPORT,
  },
  "report-incomplete": {
    label: "Report incomplete",
    clock: "2026-11-30",
    status: "saved",
    receipts: FULL,
    records: { ...REPORT, "p-required-debt": 60_000 },
  },
  "report-unknown": {
    label: "Report unknown",
    clock: "2026-11-30",
    status: "saved",
    receipts: FULL,
    records: Object.fromEntries(
      Object.entries(REPORT).filter(
        ([id]) => id !== "p-required-debt" && id !== "p-emergency",
      ),
    ),
  },
} satisfies Record<string, Scenario>

export type ScenarioName = keyof typeof SCENARIOS

export const SCENARIO_NAMES = Object.keys(SCENARIOS) as ScenarioName[]

function plan(id: PlanId, coverageMonth: string, status: Plan["status"]): Plan {
  return {
    id,
    coverageMonth,
    currency: CURRENCY,
    openingCarryKobo: 0,
    openingReserveKobo: id === NOV ? naira(100_000) : 0,
    status,
    shortfallAcknowledged: false,
  }
}

// Food is prorated once, here, by days per clipped week; after this the
// weeks are the food plan and nothing redistributes them (spec 0011).
function foodWeeks(month: string, foodKobo: number): FoodWeek[] {
  const weeks = clippedWeeks(month)
  const allowances = distribute(
    foodKobo,
    weeks.map((w) => w.days),
  )
  return weeks.map((w, i) => ({
    id: `w-${i + 1}`,
    purposeId: FOOD,
    startsOn: w.startsOn,
    endsOn: w.endsOn,
    allowanceKobo: allowances[i],
    remainingKobo: null,
  }))
}

export function loadFixture(name: ScenarioName = "baseline"): Sample {
  const scenario: Scenario = SCENARIOS[name]
  const records: Record<string, number> = scenario.records
  return {
    scenario: name,
    clock: scenario.clock,
    plans: {
      [NOV]: plan(NOV, "2026-11", scenario.status),
      [DEC]: plan(DEC, "2026-12", "draft"),
    },
    incomes: INCOMES.map((income) => {
      const [received, on] = scenario.receipts[income.id]
      return {
        ...income,
        planId: NOV,
        receivedKobo: naira(received),
        receivedOn: on,
      }
    }),
    purposes: PURPOSES.map((p) => ({
      ...p,
      planId: NOV,
      recordedKobo: p.id in records ? naira(records[p.id]) : null,
    })),
    weeks: foodWeeks("2026-11", naira(100_000)),
    goal: {
      id: "g-course",
      purposeId: "p-course",
      targetKobo: naira(300_000),
      openingSavedKobo: naira(50_000),
    },
    carryConfirmed: false,
    edited: false,
  }
}

// ---------------------------------------------------------------- reading

export function foodTotal(s: Sample): number {
  return s.weeks.reduce((sum, w) => sum + w.allowanceKobo, 0)
}

export function plannedOf(s: Sample, p: Purpose): number {
  return p.id === FOOD ? foodTotal(s) : p.plannedKobo
}

export function novPurposes(s: Sample): Purpose[] {
  return s.purposes.filter((p) => p.planId === NOV)
}

export function figures(s: Sample): PlanFigures {
  return planFigures(
    s.incomes.filter((i) => i.planId === NOV),
    novPurposes(s).map((p) => ({ ...p, plannedKobo: plannedOf(s, p) })),
    s.plans[NOV].openingCarryKobo,
  )
}

export type Warnings = {
  overallGapKobo: number
  essentialGapKobo: number
  underallocated: { purpose: Purpose; kobo: number }[]
  any: boolean
}

export function warnings(s: Sample): Warnings {
  const f = figures(s)
  const purposes = novPurposes(s)
  const underallocated = f.underallocatedKobo
    .map((kobo, i) => ({ purpose: purposes[i], kobo }))
    .filter((u) => u.kobo > 0)
  return {
    overallGapKobo: f.overallGapKobo,
    essentialGapKobo: f.essentialGapKobo,
    underallocated,
    any:
      f.overallGapKobo > 0 ||
      f.essentialGapKobo > 0 ||
      underallocated.length > 0,
  }
}

/** Optional purposes that could shrink to close a gap (review copy only). */
export function reducibleOptional(s: Sample): Purpose[] {
  return novPurposes(s).filter((p) => !p.essential && plannedOf(s, p) > 0)
}

export function inMonth(date: string | null, month: string): boolean {
  return date !== null && date.slice(0, 7) === month
}

export function purposeById(s: Sample, id: string): Purpose | undefined {
  return s.purposes.find((p) => p.id === id)
}

export function weekById(s: Sample, id: string): FoodWeek | undefined {
  return s.weeks.find((w) => w.id === id)
}

/** The week holding the scenario date, else the first week (30 October). */
export function clockWeek(s: Sample): FoodWeek {
  return (
    s.weeks.find((w) => w.startsOn <= s.clock && s.clock <= w.endsOn) ??
    s.weeks[0]
  )
}

export function isFixed(p: Purpose): boolean {
  return p.requiredKobo !== null
}

/** Earliest due fixed payment not fully recorded; unknown counts as not. */
export function nextDue(s: Sample): Purpose | null {
  const open = novPurposes(s).filter(
    (p) =>
      p.requiredKobo !== null &&
      p.dueOn !== null &&
      (p.recordedKobo === null || p.recordedKobo < p.requiredKobo),
  )
  // Array.sort is stable, so fixture order breaks a due date tie.
  open.sort((a, b) => (a.dueOn! < b.dueOn! ? -1 : a.dueOn! > b.dueOn! ? 1 : 0))
  return open[0] ?? null
}

// ---------------------------------------------------------------- input

export type Parsed =
  { ok: true; kobo: number | null } | { ok: false; error: string }

/** The prototype boundary: commas out, parseNaira with zero allowed, then a
 *  safe integer check. Blank is unknown (null) only where `blank` says so. */
export function parseAmount(
  text: string,
  blank: "unknown" | "required",
): Parsed {
  const cleaned = text.trim().replace(/,/g, "")
  if (cleaned === "") {
    return blank === "unknown"
      ? { ok: true, kobo: null }
      : { ok: false, error: "Enter an amount. 0 is fine." }
  }
  const kobo = parseNaira(cleaned, true)
  if (kobo === null) {
    return {
      ok: false,
      error: "Use naira digits with up to two decimals, like 25000 or 3333.34.",
    }
  }
  if (!Number.isSafeInteger(kobo)) {
    return { ok: false, error: "That amount is too large for this sample." }
  }
  return { ok: true, kobo }
}

export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  )
}

// Every kobo the sample holds, summed: if this stays safe, every aggregate
// the screens compute (R, U, E, P and their combinations) stays safe too.
function grandTotal(s: Sample): number {
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
  return (
    sum(s.incomes.map((i) => i.expectedKobo + i.receivedKobo)) +
    sum(
      s.purposes.map(
        (p) => p.plannedKobo + (p.recordedKobo ?? 0) + (p.requiredKobo ?? 0),
      ),
    ) +
    sum(s.weeks.map((w) => w.allowanceKobo)) +
    sum(
      Object.values(s.plans).map(
        (p) => p.openingCarryKobo + p.openingReserveKobo,
      ),
    ) +
    s.goal.openingSavedKobo +
    s.goal.targetKobo
  )
}

function commit(next: Sample): Outcome {
  if (grandTotal(next) > Number.MAX_SAFE_INTEGER) {
    return {
      ok: false,
      error: "Totals would exceed what this sample can count.",
    }
  }
  return { ok: true, sample: { ...next, edited: true } }
}

const fail = (error: string): Outcome => ({ ok: false, error })

// Setup and Builder edits return the plan to draft and clear the shortfall
// acknowledgement (AC-4): the reviewed plan is no longer the one on screen.
function toDraft(s: Sample): Sample {
  return {
    ...s,
    plans: {
      ...s.plans,
      [NOV]: { ...s.plans[NOV], status: "draft", shortfallAcknowledged: false },
    },
  }
}

function mapPurpose(s: Sample, id: string, change: Partial<Purpose>): Sample {
  return {
    ...s,
    purposes: s.purposes.map((p) => (p.id === id ? { ...p, ...change } : p)),
  }
}

function mapWeek(s: Sample, id: string, change: Partial<FoodWeek>): Sample {
  return {
    ...s,
    weeks: s.weeks.map((w) => (w.id === id ? { ...w, ...change } : w)),
  }
}

// ---------------------------------------------------------------- edits

export function editIncome(
  s: Sample,
  id: string,
  input: {
    expectedKobo: number
    receivedKobo: number
    receivedOn: string | null
    planId: PlanId
  },
): Outcome {
  if (!s.incomes.some((i) => i.id === id))
    return fail("That income is not in the sample.")
  if (input.receivedKobo > 0 && !input.receivedOn) {
    return fail("Add the date the money arrived.")
  }
  if (input.receivedOn && !isDate(input.receivedOn))
    return fail("Use a real date.")
  // Zero received needs no receipt date, and keeps none.
  const receivedOn = input.receivedKobo === 0 ? null : input.receivedOn
  const next = toDraft(s)
  return commit({
    ...next,
    incomes: next.incomes.map((i) =>
      i.id === id ? { ...i, ...input, receivedOn } : i,
    ),
  })
}

export function editOpening(
  s: Sample,
  field: "openingCarryKobo" | "openingReserveKobo",
  kobo: number,
): Outcome {
  const next = toDraft(s)
  return commit({
    ...next,
    plans: { ...next.plans, [NOV]: { ...next.plans[NOV], [field]: kobo } },
  })
}

export function editPlanned(s: Sample, id: string, kobo: number): Outcome {
  const p = purposeById(s, id)
  if (!p) return fail("That purpose is not in the sample.")
  if (p.id === FOOD) return fail("Edit food by its weeks.")
  return commit(mapPurpose(toDraft(s), id, { plannedKobo: kobo }))
}

/** Builder food editor. Keeps reported spending when a week is checked. */
export function editAllowance(
  s: Sample,
  weekId: string,
  kobo: number,
): Outcome {
  const w = weekById(s, weekId)
  if (!w) return fail("That week is not in the sample.")
  const spent = w.remainingKobo === null ? 0 : w.allowanceKobo - w.remainingKobo
  if (kobo < spent)
    return fail("That is less than this week's reported spending.")
  const remainingKobo = w.remainingKobo === null ? null : kobo - spent
  return commit(
    mapWeek(toDraft(s), weekId, { allowanceKobo: kobo, remainingKobo }),
  )
}

/** An absolute total that replaces the record, or null for unknown. */
export function editRecord(
  s: Sample,
  id: string,
  kobo: number | null,
): Outcome {
  const p = purposeById(s, id)
  if (!p) return fail("That purpose is not in the sample.")
  if (p.id === FOOD)
    return fail("Food is a weekly budget check, not a payment.")
  return commit(mapPurpose(s, id, { recordedKobo: kobo }))
}

export function editDue(s: Sample, id: string, dueOn: string): Outcome {
  const p = purposeById(s, id)
  if (!p || !isFixed(p)) return fail("Only a fixed payment has a due date.")
  if (!isDate(dueOn)) return fail("Use a real date.")
  return commit(mapPurpose(s, id, { dueOn }))
}

export function editRemaining(
  s: Sample,
  weekId: string,
  kobo: number | null,
): Outcome {
  const w = weekById(s, weekId)
  if (!w) return fail("That week is not in the sample.")
  if (kobo !== null && kobo > w.allowanceKobo) {
    return fail("Remaining cannot be more than the week's allowance.")
  }
  return commit(mapWeek(s, weekId, { remainingKobo: kobo }))
}

export function setAcknowledged(s: Sample, value: boolean): Sample {
  return {
    ...s,
    edited: true,
    plans: {
      ...s.plans,
      [NOV]: { ...s.plans[NOV], shortfallAcknowledged: value },
    },
  }
}

export function savePlan(s: Sample): Outcome {
  if (warnings(s).any && !s.plans[NOV].shortfallAcknowledged) {
    return fail("Tick the box to say you've seen the gap before saving.")
  }
  return commit({
    ...s,
    plans: { ...s.plans, [NOV]: { ...s.plans[NOV], status: "saved" } },
  })
}

export function setClock(s: Sample, clock: Clock): Sample {
  return { ...s, clock }
}

// ---------------------------------------------------------------- adjustment

export type Endpoint = { kind: "purpose" | "week"; id: string }

const same = (a: Endpoint, b: Endpoint) => a.kind === b.kind && a.id === b.id

export function allocationOf(s: Sample, e: Endpoint): number {
  if (e.kind === "week") return weekById(s, e.id)?.allowanceKobo ?? 0
  const p = purposeById(s, e.id)
  return p ? plannedOf(s, p) : 0
}

/** Known, uncompleted allocation only. Fixed payments are never sources. */
export function availableOf(s: Sample, e: Endpoint): number {
  if (e.kind === "week") return weekById(s, e.id)?.remainingKobo ?? 0
  const p = purposeById(s, e.id)
  if (!p || p.essential || p.recordedKobo === null) return 0
  return Math.max(p.plannedKobo - p.recordedKobo, 0)
}

export function endpointLabel(s: Sample, e: Endpoint): string {
  if (e.kind === "purpose") return purposeById(s, e.id)?.label ?? e.id
  const w = weekById(s, e.id)
  return w ? `Food, ${weekRange(w)}` : e.id
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function longDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`
}

export function weekRange(w: FoodWeek): string {
  return w.startsOn === w.endsOn
    ? shortDate(w.startsOn)
    : `${shortDate(w.startsOn)} to ${shortDate(w.endsOn)}`
}

export function adjustmentSources(s: Sample): Endpoint[] {
  const purposes = novPurposes(s)
    .filter((p) => availableOf(s, { kind: "purpose", id: p.id }) > 0)
    .map((p): Endpoint => ({ kind: "purpose", id: p.id }))
  const weeks = s.weeks
    .filter((w) => (w.remainingKobo ?? 0) > 0)
    .map((w): Endpoint => ({ kind: "week", id: w.id }))
  return [...purposes, ...weeks]
}

/** Optional purposes held back until their completion is recorded. */
export function unknownSources(s: Sample): Purpose[] {
  return novPurposes(s).filter(
    (p) => !p.essential && p.recordedKobo === null && p.plannedKobo > 0,
  )
}

export function adjustmentDestinations(
  s: Sample,
  source: Endpoint,
): Endpoint[] {
  const others = novPurposes(s).filter(
    (p) => p.id !== FOOD && !same(source, { kind: "purpose", id: p.id }),
  )
  if (source.kind === "week") {
    // Food money: on to next week, or to a purpose not yet fully recorded.
    const i = s.weeks.findIndex((w) => w.id === source.id)
    const next = s.weeks[i + 1]
    return [
      ...(next ? [{ kind: "week" as const, id: next.id }] : []),
      ...others
        .filter(
          (p) => p.recordedKobo === null || p.recordedKobo < plannedOf(s, p),
        )
        .map((p): Endpoint => ({ kind: "purpose", id: p.id })),
    ]
  }
  return [
    ...others
      .filter(
        (p) =>
          !(p.requiredKobo !== null && (p.recordedKobo ?? 0) >= p.requiredKobo),
      )
      .map((p): Endpoint => ({ kind: "purpose", id: p.id })),
    ...s.weeks.map((w): Endpoint => ({ kind: "week", id: w.id })),
  ]
}

export type WarningChange = {
  kind: "overall" | "essential" | "required"
  kobo: number
}

export type AdjustmentPreview = {
  source: Endpoint
  destination: Endpoint
  amountKobo: number
  sourceBefore: number
  sourceAfter: number
  destinationBefore: number
  destinationAfter: number
  /** Food parent total, when a week is on either side. */
  foodBefore: number | null
  foodAfter: number | null
  /** Warnings this move would create or enlarge; Apply needs a fresh tick. */
  newWarnings: WarningChange[]
}

function move(
  s: Sample,
  source: Endpoint,
  destination: Endpoint,
  amount: number,
): Sample {
  let next = s
  if (source.kind === "week") {
    const w = weekById(next, source.id)!
    next = mapWeek(next, w.id, {
      allowanceKobo: w.allowanceKobo - amount,
      remainingKobo: w.remainingKobo! - amount,
    })
  } else {
    const p = purposeById(next, source.id)!
    next = mapPurpose(next, p.id, { plannedKobo: p.plannedKobo - amount })
  }
  if (destination.kind === "week") {
    const w = weekById(next, destination.id)!
    next = mapWeek(next, w.id, {
      allowanceKobo: w.allowanceKobo + amount,
      remainingKobo: w.remainingKobo === null ? null : w.remainingKobo + amount,
    })
  } else {
    const p = purposeById(next, destination.id)!
    next = mapPurpose(next, p.id, { plannedKobo: p.plannedKobo + amount })
  }
  return next
}

function warningChanges(before: Warnings, after: Warnings): WarningChange[] {
  const sumUnder = (w: Warnings) =>
    w.underallocated.reduce((a, u) => a + u.kobo, 0)
  const changes: WarningChange[] = []
  if (after.overallGapKobo > before.overallGapKobo)
    changes.push({ kind: "overall", kobo: after.overallGapKobo })
  if (after.essentialGapKobo > before.essentialGapKobo)
    changes.push({ kind: "essential", kobo: after.essentialGapKobo })
  if (sumUnder(after) > sumUnder(before))
    changes.push({ kind: "required", kobo: sumUnder(after) })
  return changes
}

export function previewAdjustment(
  s: Sample,
  source: Endpoint,
  destination: Endpoint,
  amountKobo: number,
): { ok: true; preview: AdjustmentPreview } | { ok: false; error: string } {
  if (!adjustmentSources(s).some((e) => same(e, source))) {
    return { ok: false, error: "That source has no known, unspent allocation." }
  }
  if (!adjustmentDestinations(s, source).some((e) => same(e, destination))) {
    return { ok: false, error: "Choose a different destination." }
  }
  if (amountKobo <= 0) return { ok: false, error: "Move more than zero." }
  if (amountKobo > availableOf(s, source)) {
    return { ok: false, error: "That is more than the source has available." }
  }
  const after = move(s, source, destination, amountKobo)
  const touchesFood = source.kind === "week" || destination.kind === "week"
  return {
    ok: true,
    preview: {
      source,
      destination,
      amountKobo,
      sourceBefore: allocationOf(s, source),
      sourceAfter: allocationOf(after, source),
      destinationBefore: allocationOf(s, destination),
      destinationAfter: allocationOf(after, destination),
      foodBefore: touchesFood ? foodTotal(s) : null,
      foodAfter: touchesFood ? foodTotal(after) : null,
      newWarnings: warningChanges(warnings(s), warnings(after)),
    },
  }
}

// Applying keeps the plan saved: the total is preserved. A changed before
// value (including a second apply of the same preview) means review again.
export function applyAdjustment(
  s: Sample,
  preview: AdjustmentPreview,
  acknowledged: boolean,
): Outcome {
  if (
    allocationOf(s, preview.source) !== preview.sourceBefore ||
    allocationOf(s, preview.destination) !== preview.destinationBefore
  ) {
    return fail("These figures changed. Review the move again.")
  }
  const check = previewAdjustment(
    s,
    preview.source,
    preview.destination,
    preview.amountKobo,
  )
  if (!check.ok) return check
  if (check.preview.newWarnings.length > 0 && !acknowledged) {
    return fail("Tick the box to accept the new gap first.")
  }
  let next = move(s, preview.source, preview.destination, preview.amountKobo)
  if (check.preview.newWarnings.length > 0) {
    next = {
      ...next,
      plans: {
        ...next.plans,
        [NOV]: { ...next.plans[NOV], shortfallAcknowledged: true },
      },
    }
  }
  return commit(next)
}

// ---------------------------------------------------------------- report

export type CleanSheet =
  | { status: "not-finished" }
  | { status: "empty" }
  | { status: "no-due" }
  | { status: "still-due"; unpaid: number; unknown: number }
  | { status: "unknown"; unknown: number }
  | { status: "clean"; eligible: number }

export function monthEnd(month: string): string {
  return `${month}-${daysInLagosMonth(`${month}-01`)}`
}

export function cleanSheet(s: Sample): CleanSheet {
  const month = s.plans[NOV].coverageMonth
  if (s.clock < monthEnd(month)) return { status: "not-finished" }
  if (figures(s).plannedKobo === 0) return { status: "empty" }
  const eligible = novPurposes(s).filter(
    (p) => p.essential && p.requiredKobo !== null && inMonth(p.dueOn, month),
  )
  if (eligible.length === 0) return { status: "no-due" }
  const unknown = eligible.filter((p) => p.recordedKobo === null).length
  const unpaid = eligible.filter(
    (p) => p.recordedKobo !== null && p.recordedKobo < p.requiredKobo!,
  ).length
  if (unpaid > 0) return { status: "still-due", unpaid, unknown }
  if (unknown > 0) return { status: "unknown", unknown }
  return { status: "clean", eligible: eligible.length }
}

export function foodReport(s: Sample) {
  const checked = s.weeks.filter((w) => w.remainingKobo !== null)
  return {
    plannedKobo: foodTotal(s),
    spentKobo: checked.reduce(
      (a, w) => a + w.allowanceKobo - w.remainingKobo!,
      0,
    ),
    unchecked: s.weeks.length - checked.length,
  }
}

export function unusedAllocation(s: Sample) {
  const purposes = novPurposes(s).filter((p) => p.id !== FOOD)
  const optionalKobo = purposes
    .filter((p) => !p.essential && p.recordedKobo !== null)
    .reduce((a, p) => a + Math.max(p.plannedKobo - p.recordedKobo!, 0), 0)
  const foodKobo = s.weeks.reduce((a, w) => a + (w.remainingKobo ?? 0), 0)
  return {
    totalKobo: optionalKobo + foodKobo,
    stillDue: purposes
      .filter((p) => p.requiredKobo !== null && p.recordedKobo !== null)
      .map((p) => ({
        purpose: p,
        kobo: Math.max(p.requiredKobo! - p.recordedKobo!, 0),
      }))
      .filter((d) => d.kobo > 0),
    unknown: purposes.filter((p) => p.recordedKobo === null),
  }
}

/** Opening plus recorded contribution; null when the record is unknown. */
function openingPlusRecorded(
  s: Sample,
  opening: number,
  purposeId: string,
): number | null {
  const recorded = purposeById(s, purposeId)?.recordedKobo ?? null
  return recorded === null ? null : opening + recorded
}

export function goalProgress(s: Sample) {
  const course = purposeById(s, s.goal.purposeId)!
  const known = s.goal.openingSavedKobo + (course.recordedKobo ?? 0)
  return {
    targetKobo: s.goal.targetKobo,
    openingKobo: s.goal.openingSavedKobo,
    plannedKobo: course.plannedKobo,
    recordedKobo: course.recordedKobo,
    knownProgressKobo: known,
    basisPoints: progressBasisPoints(known, s.goal.targetKobo),
  }
}

export function decemberPreview(s: Sample) {
  return {
    carryKobo: s.carryConfirmed ? s.plans[DEC].openingCarryKobo : null,
    reserveKobo: openingPlusRecorded(
      s,
      s.plans[NOV].openingReserveKobo,
      "p-emergency",
    ),
    goalSavedKobo: openingPlusRecorded(
      s,
      s.goal.openingSavedKobo,
      s.goal.purposeId,
    ),
    incomes: s.incomes.filter((i) => i.planId === DEC),
  }
}

/** Sets (never adds to) December's opening carry from money declared held. */
export function applyCarry(s: Sample, kobo: number): Outcome {
  return commit({
    ...s,
    carryConfirmed: true,
    plans: { ...s.plans, [DEC]: { ...s.plans[DEC], openingCarryKobo: kobo } },
  })
}

// ---------------------------------------------------------------- share

export type ShareLine = { line: Line; basisPoints: number; dots: number }

/** Line shape only: basis points and dot counts, never an amount or name. */
export function shareShape(s: Sample): ShareLine[] | null {
  const purposes = novPurposes(s)
  const totals = LINES.map((line) =>
    purposes
      .filter((p) => p.line === line)
      .reduce((a, p) => a + plannedOf(s, p), 0),
  )
  if (totals.every((t) => t === 0)) return null
  const bps = distribute(10000, totals)
  return LINES.map((line, i) => ({
    line,
    basisPoints: bps[i],
    dots: purposes.filter((p) => p.line === line && plannedOf(s, p) > 0).length,
  }))
}
