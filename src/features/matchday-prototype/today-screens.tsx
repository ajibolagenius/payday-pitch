"use client"

// Today, the month end report and the three short branches (spec 0011
// surfaces 6 and 7, AC-5 to AC-9). Recording is evidence, never a transfer:
// every record here is a total the person typed, replacing the last one.
import { useRef, useState, type FormEvent, type RefObject } from "react"
import { Bell, ShareNetwork, Target, Trophy } from "@phosphor-icons/react"
import { motion } from "motion/react"

import { PitchField } from "@/components/pitch/pitch-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AmountField } from "@/components/walk/amount-field"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import {
  CURRENCY,
  FOOD,
  LINE_INFO,
  NOV,
  adjustmentDestinations,
  adjustmentSources,
  applyAdjustment,
  applyCarry,
  availableOf,
  cleanSheet,
  clockWeek,
  decemberPreview,
  editDue,
  editRecord,
  editRemaining,
  endpointLabel,
  figures,
  foodReport,
  goalProgress,
  inMonth,
  longDate,
  nextDue,
  novPurposes,
  parseAmount,
  previewAdjustment,
  setClock,
  shareShape,
  shortDate,
  unknownSources,
  unusedAllocation,
  weekRange,
  type AdjustmentPreview,
  type CleanSheet,
  type Endpoint,
  type Line,
  type Purpose,
  type ShareLine,
} from "./model"
import {
  AmountForm,
  Callout,
  FigureList,
  LineChip,
  MaybeMoney,
  Money,
  Panel,
  ScreenHeader,
  fieldClass,
  type SampleApi,
} from "./parts"
import { StepNav } from "./plan-screens"

const endpointKey = (e: Endpoint) => `${e.kind}:${e.id}`

function parseEndpoint(key: string): Endpoint | null {
  const [kind, id] = key.split(":")
  return (kind === "purpose" || kind === "week") && id ? { kind, id } : null
}

// ---------------------------------------------------------------- today

function recordStatus(p: Purpose): { text: string; warn: boolean } {
  if (p.recordedKobo === null) return { text: "Not recorded", warn: false }
  if (p.requiredKobo !== null) {
    return p.recordedKobo >= p.requiredKobo
      ? { text: "Paid in full", warn: false }
      : { text: "Partly paid", warn: true }
  }
  return { text: "Recorded", warn: false }
}

function DueForm({ purpose, api }: { purpose: Purpose; api: SampleApi }) {
  const [value, setValue] = useState(purpose.dueOn ?? "")
  const [seen, setSeen] = useState(purpose.dueOn)
  const [error, setError] = useState<string | null>(null)
  if (seen !== purpose.dueOn) {
    setSeen(purpose.dueOn)
    setValue(purpose.dueOn ?? "")
  }
  const id = `${purpose.id}-due`
  function submit(event: FormEvent) {
    event.preventDefault()
    setError(api.apply(editDue(api.sample, purpose.id, value)))
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-wrap items-end gap-2"
    >
      <div className="min-w-0 flex-[1_1_9rem] space-y-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          Due date
        </label>
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <Button type="submit" variant="outline" size="lg">
        Correct date
      </Button>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive w-full text-sm"
        >
          {error}
        </p>
      ) : null}
    </form>
  )
}

function RecordRow({ purpose, api }: { purpose: Purpose; api: SampleApi }) {
  const s = api.sample
  const status = recordStatus(purpose)
  const owed =
    purpose.requiredKobo !== null && purpose.recordedKobo !== null
      ? Math.max(purpose.requiredKobo - purpose.recordedKobo, 0)
      : null
  const over =
    purpose.recordedKobo !== null && purpose.recordedKobo > purpose.plannedKobo
  const month = s.plans[NOV].coverageMonth
  const passed =
    purpose.dueOn !== null &&
    purpose.dueOn < s.clock &&
    status.text !== "Paid in full"

  return (
    <li className="bg-card ring-foreground/10 min-w-0 space-y-3 rounded-xl p-4 ring-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-lg">{purpose.label}</h4>
          <p className="text-muted-foreground text-sm">
            {LINE_INFO[purpose.line].name} · planned{" "}
            <Money kobo={purpose.plannedKobo} />
            {purpose.requiredKobo !== null ? (
              <>
                {" "}
                · required <Money kobo={purpose.requiredKobo} />
              </>
            ) : null}
          </p>
          {purpose.dueOn ? (
            <p className="text-sm">
              Due {shortDate(purpose.dueOn)}
              {!inMonth(purpose.dueOn, month) ? (
                <Badge variant="outline" className="ml-2">
                  Outside this month
                </Badge>
              ) : null}
              {passed ? (
                <span className="text-destructive ml-2 font-medium">
                  Due date passed
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        <Badge
          variant={
            status.warn
              ? "destructive"
              : status.text === "Paid in full"
                ? "default"
                : "secondary"
          }
        >
          {status.text}
        </Badge>
      </div>
      <p className="text-sm">
        Recorded so far: <MaybeMoney kobo={purpose.recordedKobo} />
        {owed !== null && owed > 0 ? (
          <>
            {" "}
            · <span className="font-medium">still due</span>{" "}
            <Money kobo={owed} />
          </>
        ) : null}
      </p>
      {over ? (
        <Callout
          tone="warning"
          title={
            <>
              More than planned by{" "}
              <Money kobo={purpose.recordedKobo! - purpose.plannedKobo} />
            </>
          }
        >
          Nothing else was reduced to make room. This record doesn&apos;t prove
          the money existed.
        </Callout>
      ) : null}
      <AmountForm
        label={`Total paid toward ${purpose.label.toLowerCase()}`}
        kobo={purpose.recordedKobo}
        blank="unknown"
        submitLabel="Record"
        hint="Your total so far, replacing the last one. Leave blank if you don't know; enter 0 if nothing went out."
        onCommit={(kobo) => api.apply(editRecord(s, purpose.id, kobo))}
      />
      {purpose.requiredKobo !== null ? (
        <DueForm purpose={purpose} api={api} />
      ) : null}
    </li>
  )
}

function FoodCheck({
  api,
  onMove,
}: {
  api: SampleApi
  onMove: (weekId: string) => void
}) {
  const s = api.sample
  const current = clockWeek(s)
  return (
    <Panel
      title="Weekly food check"
      description="How much of each week's allowance is left? A budget check: it doesn't read a bank balance or prove a payment."
    >
      <ul className="grid gap-3 md:grid-cols-2">
        {s.weeks.map((w) => (
          <li
            key={w.id}
            className={cn(
              "min-w-0 space-y-3 rounded-xl border p-4",
              w.id === current.id
                ? "border-accent-text bg-accent/40 border-2"
                : "",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-base font-semibold">{weekRange(w)}</h4>
              {w.id === current.id ? (
                <Badge variant="outline">This week</Badge>
              ) : null}
            </div>
            <p className="text-sm">
              Allowance <Money kobo={w.allowanceKobo} />
              {w.remainingKobo !== null ? (
                <>
                  {" "}
                  · spent <Money kobo={w.allowanceKobo - w.remainingKobo} />
                </>
              ) : (
                <span className="text-muted-foreground"> · not checked</span>
              )}
            </p>
            <AmountForm
              label="Left this week"
              kobo={w.remainingKobo}
              blank="unknown"
              submitLabel="Check"
              onCommit={(kobo) => api.apply(editRemaining(s, w.id, kobo))}
            />
            {(w.remainingKobo ?? 0) > 0 ? (
              <Button
                variant="link"
                className="h-auto px-0"
                onClick={() => onMove(w.id)}
              >
                Move what&apos;s left
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-sm">
        Unused allowance stays in its week until you move it. Moving it never
        creates income.
      </p>
    </Panel>
  )
}

function AdjustmentPanel({
  api,
  sourceKey,
  setSourceKey,
  sourceRef,
}: {
  api: SampleApi
  sourceKey: string
  setSourceKey: (key: string) => void
  sourceRef: RefObject<HTMLSelectElement | null>
}) {
  const s = api.sample
  const sources = adjustmentSources(s)
  const source = sources.find((e) => endpointKey(e) === sourceKey) ?? null
  const destinations = source ? adjustmentDestinations(s, source) : []
  const [destKey, setDestKey] = useState("")
  const [weekId, setWeekId] = useState(clockWeek(s).id)
  const [amount, setAmount] = useState("")
  const [preview, setPreview] = useState<AdjustmentPreview | null>(null)
  const [ack, setAck] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<AdjustmentPreview | null>(null)

  const purposeDests = destinations.filter((e) => e.kind === "purpose")
  const weekDests = destinations.filter((e) => e.kind === "week")
  // From a purpose, food is one choice plus a week; from a week, the only
  // food destination is the next week, listed by name.
  const destination: Endpoint | null =
    destKey === "food" ? { kind: "week", id: weekId } : parseEndpoint(destKey)

  function reset() {
    setPreview(null)
    setError(null)
    setAck(false)
  }

  function review(event: FormEvent) {
    event.preventDefault()
    setApplied(null)
    if (!source || !destination)
      return setError("Choose where the money comes from and where it goes.")
    const parsed = parseAmount(amount, "required")
    if (!parsed.ok) return setError(parsed.error)
    const result = previewAdjustment(s, source, destination, parsed.kobo!)
    if (!result.ok) return setError(result.error)
    setError(null)
    setPreview(result.preview)
  }

  function apply() {
    if (!preview) return
    const failure = api.apply(applyAdjustment(s, preview, ack))
    if (failure) return setError(failure)
    setApplied(preview)
    setPreview(null)
    setAck(false)
    setAmount("")
  }

  const unknown = unknownSources(s)

  return (
    <Panel
      id="adjustment"
      title="Adjust the plan"
      description="Move planned money you haven't used from one purpose to another. The total stays the same."
    >
      {unknown.length > 0 ? (
        <Callout tone="info" title="Waiting for a record">
          {unknown.map((p) => p.label).join(", ")} can&apos;t move until you
          record what has gone out. Enter 0 on the checklist if nothing has.
        </Callout>
      ) : null}

      {sources.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing can move right now. Only known, unused planned money can move:
          record an optional purpose or check a food week first.
        </p>
      ) : (
        <form onSubmit={review} noValidate className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="adj-source" className="text-sm font-medium">
                Take from
              </label>
              <select
                id="adj-source"
                ref={sourceRef}
                className={fieldClass}
                value={source ? sourceKey : ""}
                onChange={(e) => {
                  setSourceKey(e.target.value)
                  setDestKey("")
                  reset()
                }}
              >
                <option value="">Choose a source</option>
                {sources.map((e) => (
                  <option key={endpointKey(e)} value={endpointKey(e)}>
                    {endpointLabel(s, e)}
                  </option>
                ))}
              </select>
              {source ? (
                <p className="text-muted-foreground text-xs">
                  Available <Money kobo={availableOf(s, source)} />
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="adj-dest" className="text-sm font-medium">
                Give to
              </label>
              <select
                id="adj-dest"
                className={fieldClass}
                value={destKey}
                disabled={!source}
                onChange={(e) => {
                  setDestKey(e.target.value)
                  reset()
                }}
              >
                <option value="">Choose a destination</option>
                {source?.kind === "week"
                  ? weekDests.map((e) => (
                      <option key={endpointKey(e)} value={endpointKey(e)}>
                        {endpointLabel(s, e)} (next week)
                      </option>
                    ))
                  : weekDests.length > 0 && (
                      <option value="food">Food (choose a week)</option>
                    )}
                {purposeDests.map((e) => (
                  <option key={endpointKey(e)} value={endpointKey(e)}>
                    {endpointLabel(s, e)}
                  </option>
                ))}
              </select>
            </div>
            {destKey === "food" ? (
              <div className="space-y-1.5">
                <label htmlFor="adj-week" className="text-sm font-medium">
                  Food week
                </label>
                <select
                  id="adj-week"
                  className={fieldClass}
                  value={weekId}
                  onChange={(e) => {
                    setWeekId(e.target.value)
                    reset()
                  }}
                >
                  {s.weeks.map((w) => (
                    <option key={w.id} value={w.id}>
                      {weekRange(w)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <AmountField
              label="Amount to move"
              value={amount}
              onChange={(v) => {
                setAmount(v)
                reset()
              }}
              currency={CURRENCY}
            />
          </div>
          {error ? (
            <p role="alert" className="text-destructive text-sm font-medium">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="outline" size="lg">
            Preview the move
          </Button>
        </form>
      )}

      {preview ? (
        <div
          className="space-y-3 rounded-xl border-2 border-dashed p-4"
          aria-live="polite"
        >
          <p className="font-semibold">
            Move <Money kobo={preview.amountKobo} /> from{" "}
            {endpointLabel(s, preview.source)} to{" "}
            {endpointLabel(s, preview.destination)}
          </p>
          <FigureList
            rows={[
              {
                label: endpointLabel(s, preview.source),
                value: (
                  <>
                    <Money kobo={preview.sourceBefore} /> →{" "}
                    <Money kobo={preview.sourceAfter} />
                  </>
                ),
              },
              {
                label: endpointLabel(s, preview.destination),
                value: (
                  <>
                    <Money kobo={preview.destinationBefore} /> →{" "}
                    <Money kobo={preview.destinationAfter} />
                  </>
                ),
              },
              ...(preview.foodBefore !== null
                ? [
                    {
                      label: "Food, whole month",
                      value: (
                        <>
                          <Money kobo={preview.foodBefore} /> →{" "}
                          <Money kobo={preview.foodAfter!} />
                        </>
                      ),
                    },
                  ]
                : []),
              {
                label: "Everything planned",
                value: <Money kobo={figures(s).plannedKobo} />,
                note: "Unchanged",
              },
            ]}
          />
          {preview.newWarnings.map((w) => (
            <Callout
              key={w.kind}
              tone="warning"
              title={
                <>
                  {w.kind === "overall"
                    ? "Overall funding gap grows to"
                    : w.kind === "essential"
                      ? "Essentials gap grows to"
                      : "Required payments short by"}{" "}
                  <Money kobo={w.kobo} />
                </>
              }
            />
          ))}
          {preview.newWarnings.length > 0 ? (
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="accent-primary mt-0.5 size-5 shrink-0"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              <span>
                I&apos;ve seen the new gap and want to apply this anyway.
              </span>
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={apply}>
              Apply the move
            </Button>
            <Button size="lg" variant="ghost" onClick={reset}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}

      {applied ? (
        <p role="status" className="text-success text-sm font-medium">
          Moved <Money kobo={applied.amountKobo} /> from{" "}
          {endpointLabel(s, applied.source)} to{" "}
          {endpointLabel(s, applied.destination)}. Total plan unchanged.
        </p>
      ) : null}
    </Panel>
  )
}

export function TodayScreen({ api }: { api: SampleApi }) {
  const s = api.sample
  const due = nextDue(s)
  const [sourceKey, setSourceKey] = useState("")
  const sourceRef = useRef<HTMLSelectElement>(null)
  const checklist = novPurposes(s).filter((p) => p.id !== FOOD)

  return (
    <div className="space-y-8">
      <ScreenHeader eyebrow="Step 7 · Today" title="What to do next">
        The sample date is {longDate(s.clock)}. Change it in Sample scenario.
      </ScreenHeader>

      {s.plans[NOV].status === "draft" ? (
        <Callout tone="info" title="This plan is a draft">
          You can still record payments. Save the plan from Review when
          you&apos;re ready.
        </Callout>
      ) : null}

      <section className="bg-primary text-primary-foreground space-y-1 rounded-xl p-5">
        <p className="text-sm font-medium opacity-90">Next due</p>
        {due ? (
          <>
            <p className="font-heading text-2xl">
              {due.label}, <Money kobo={due.requiredKobo!} />
            </p>
            <p className="text-sm">
              Due {shortDate(due.dueOn!)}.{" "}
              {due.recordedKobo === null ? (
                "Not recorded yet, so it might be paid or not."
              ) : (
                <>
                  <Money kobo={due.recordedKobo} /> recorded so far.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="font-heading text-2xl">
            Every fixed payment is recorded in full.
          </p>
        )}
      </section>

      <section aria-labelledby="checklist-heading" className="space-y-3">
        <h3 id="checklist-heading" className="text-lg">
          Checklist
        </h3>
        <p className="text-muted-foreground text-sm">
          Saving the plan didn&apos;t tick anything. Record what has actually
          gone out.
        </p>
        <ul className="grid gap-3 lg:grid-cols-2">
          {checklist.map((p) => (
            <RecordRow key={p.id} purpose={p} api={api} />
          ))}
        </ul>
      </section>

      <FoodCheck
        api={api}
        onMove={(weekId) => {
          setSourceKey(`week:${weekId}`)
          sourceRef.current?.focus()
        }}
      />

      <AdjustmentPanel
        api={api}
        sourceKey={sourceKey}
        setSourceKey={setSourceKey}
        sourceRef={sourceRef}
      />

      <section aria-labelledby="more-heading" className="space-y-3">
        <h3 id="more-heading" className="text-lg">
          Also in the sample
        </h3>
        <ul className="grid gap-3 sm:grid-cols-3">
          {(
            [
              {
                screen: "goal",
                label: "Course goal",
                note: "Progress from recorded money",
                Icon: Target,
              },
              {
                screen: "reminders",
                label: "Reminders",
                note: "Four previews, all off",
                Icon: Bell,
              },
              {
                screen: "share",
                label: "Share preview",
                note: "Shape only, no amounts",
                Icon: ShareNetwork,
              },
            ] as const
          ).map(({ screen, label, note, Icon }) => (
            <li key={screen}>
              <button
                type="button"
                onClick={() => api.go(screen)}
                className="bg-card ring-foreground/10 hover:bg-muted focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-xl p-4 text-left ring-1 outline-none focus-visible:ring-3"
              >
                <Icon
                  size={20}
                  aria-hidden
                  className="text-accent-text mt-0.5 shrink-0"
                />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="text-muted-foreground block text-sm">
                    {note}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <StepNav
        back={() => api.go("saved")}
        next={() => api.go("report")}
        nextLabel="Month end report"
      />
    </div>
  )
}

// ---------------------------------------------------------------- report

function CleanSheetResult({ cs, api }: { cs: CleanSheet; api: SampleApi }) {
  const reduced = usePrefersReducedMotion()
  switch (cs.status) {
    case "not-finished":
      return (
        <Callout tone="info" title="Month not finished">
          <p>The month settles on 30 November. No award yet.</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => api.replace(setClock(api.sample, "2026-11-30"))}
          >
            Simulate 30 November
          </Button>
        </Callout>
      )
    case "empty":
      return (
        <Callout tone="info" title="Nothing planned">
          An empty plan earns no clean sheet.
        </Callout>
      )
    case "no-due":
      return (
        <Callout tone="info" title="No due payments">
          No fixed essential payment falls due in November, so there is nothing
          to award.
        </Callout>
      )
    case "still-due":
      return (
        <Callout tone="warning" title="Still due">
          <p>
            {cs.unpaid} required{" "}
            {cs.unpaid === 1 ? "payment isn't" : "payments aren't"} fully paid.
          </p>
          {cs.unknown > 0 ? <p>{cs.unknown} not recorded</p> : null}
        </Callout>
      )
    case "unknown":
      return (
        <Callout tone="warning" title="Not enough information">
          {cs.unknown} required{" "}
          {cs.unknown === 1 ? "payment isn't" : "payments aren't"} recorded yet.
          Record
          {cs.unknown === 1 ? " it" : " them"} on Today to settle the month.
        </Callout>
      )
    case "clean":
      return (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
          <motion.p
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 32 }
            }
            className="bg-accent text-accent-foreground font-accent inline-flex items-center gap-2 rounded-md px-4 pt-1 pb-0.5 text-3xl tracking-wide uppercase"
          >
            <Trophy size={24} weight="fill" aria-hidden />
            Clean sheet
          </motion.p>
          <p className="text-sm">
            All {cs.eligible} required essential payments due in November are
            recorded in full. Optional saving and repayment don&apos;t count
            against you.
          </p>
        </div>
      )
  }
}

function recordWord(p: Purpose): string {
  if (p.recordedKobo === null) return "Not recorded"
  if (p.requiredKobo !== null)
    return p.recordedKobo >= p.requiredKobo ? "Paid in full" : "Still due"
  return p.recordedKobo > p.plannedKobo ? "Over plan" : "Recorded"
}

export function ReportScreen({ api }: { api: SampleApi }) {
  const s = api.sample
  const cs = cleanSheet(s)
  const food = foodReport(s)
  const unused = unusedAllocation(s)
  const dec = decemberPreview(s)
  const [carryRun, setCarryRun] = useState(0)
  const decRef = useRef<HTMLHeadingElement>(null)

  return (
    <div className="space-y-8">
      <ScreenHeader eyebrow="Step 8 · Period report" title="November report">
        Planned against recorded, as of the sample date {longDate(s.clock)}.
      </ScreenHeader>

      <CleanSheetResult cs={cs} api={api} />

      <Panel title="Planned and recorded">
        <ul className="divide-border divide-y">
          {novPurposes(s)
            .filter((p) => p.id !== FOOD)
            .map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
              >
                <span className="font-medium">{p.label}</span>
                <span className="flex flex-wrap items-baseline gap-x-3 text-sm">
                  <span className="text-muted-foreground">
                    planned <Money kobo={p.plannedKobo} />
                  </span>
                  <span>
                    recorded <MaybeMoney kobo={p.recordedKobo} />
                  </span>
                  <Badge
                    variant={
                      recordWord(p) === "Still due"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {recordWord(p)}
                  </Badge>
                </span>
              </li>
            ))}
          <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
            <span>
              <span className="font-medium">Food</span>
              <span className="text-muted-foreground block text-xs">
                Budget check, not a payment record
              </span>
            </span>
            <span className="flex flex-wrap items-baseline gap-x-3 text-sm">
              <span className="text-muted-foreground">
                allowance <Money kobo={food.plannedKobo} />
              </span>
              <span>
                reported spending <Money kobo={food.spentKobo} />
              </span>
              {food.unchecked > 0 ? (
                <Badge variant="outline">
                  {food.unchecked} {food.unchecked === 1 ? "week" : "weeks"}{" "}
                  unchecked
                </Badge>
              ) : null}
            </span>
          </li>
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Unused allocation"
          description="Planned money that wasn't used, from records you've made."
        >
          <p className="text-3xl tracking-tight">
            <Money kobo={unused.totalKobo} />
          </p>
          {unused.stillDue.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {unused.stillDue.map(({ purpose, kobo }) => (
                <li key={purpose.id}>
                  <span className="text-destructive font-medium">
                    Still due:
                  </span>{" "}
                  {purpose.label} <Money kobo={kobo} /> (not unused)
                </li>
              ))}
            </ul>
          ) : null}
          {unused.unknown.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              Not recorded, so left out:{" "}
              {unused.unknown.map((p) => p.label).join(", ")}.
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            Unused budget is not the same as money you still hold.
          </p>
        </Panel>

        <Panel
          title="Next month preview"
          description="Only money you confirm you still hold carries into December."
        >
          <AmountForm
            key={carryRun}
            label="Money still held"
            kobo={null}
            blank="required"
            submitLabel="Carry into December"
            onCommit={(kobo) => api.apply(applyCarry(s, kobo!))}
            onDone={() => {
              setCarryRun((n) => n + 1)
              decRef.current?.focus()
            }}
          />
          <div className="space-y-2">
            <h4
              ref={decRef}
              tabIndex={-1}
              className="text-base font-semibold outline-none"
            >
              December 2026, opening
            </h4>
            <FigureList
              rows={[
                {
                  label: "Opening carry forward",
                  value:
                    dec.carryKobo === null ? (
                      <span className="text-muted-foreground">
                        Not confirmed
                      </span>
                    ) : (
                      <Money kobo={dec.carryKobo} />
                    ),
                },
                {
                  label: "Opening reserve",
                  note: "November reserve plus recorded Keeper",
                  value:
                    dec.reserveKobo === null ? (
                      <span className="text-destructive text-sm">
                        Incomplete: record the Keeper contribution
                      </span>
                    ) : (
                      <Money kobo={dec.reserveKobo} />
                    ),
                },
                {
                  label: "Course goal savings",
                  note: "Opening savings plus recorded contribution",
                  value:
                    dec.goalSavedKobo === null ? (
                      <span className="text-destructive text-sm">
                        Incomplete: record the course contribution
                      </span>
                    ) : (
                      <Money kobo={dec.goalSavedKobo} />
                    ),
                },
                ...dec.incomes.map((i) => ({
                  label: `${i.label}, moved to December`,
                  note: i.receivedOn
                    ? `Received ${longDate(i.receivedOn)}`
                    : "Not received yet",
                  value: <Money kobo={i.receivedKobo} />,
                })),
              ]}
            />
            <p className="text-muted-foreground text-xs">
              No purposes, receipts or contributions are copied from November.
            </p>
          </div>
        </Panel>
      </div>

      <StepNav back={() => api.go("today")} />
    </div>
  )
}

// ---------------------------------------------------------------- branches

export function GoalScreen({ api }: { api: SampleApi }) {
  const g = goalProgress(api.sample)
  return (
    <div className="space-y-6">
      <ScreenHeader eyebrow="Today · Goal" title="Course goal">
        Linked to the Attack line. Only money you record moves the bar; planning
        it doesn&apos;t.
      </ScreenHeader>
      <Panel
        title={
          <>
            <Money kobo={g.knownProgressKobo} /> of{" "}
            <Money kobo={g.targetKobo} />
          </>
        }
      >
        <div className="bg-muted h-3 overflow-hidden rounded-full" aria-hidden>
          <div
            className="bg-success h-full"
            style={{ width: `${g.basisPoints / 100}%` }}
          />
        </div>
        <FigureList
          rows={[
            { label: "Target", value: <Money kobo={g.targetKobo} /> },
            { label: "Opening savings", value: <Money kobo={g.openingKobo} /> },
            {
              label: "Planned this month",
              note: "Not counted until recorded",
              value: <Money kobo={g.plannedKobo} />,
            },
            {
              label: "Recorded this month",
              value: <MaybeMoney kobo={g.recordedKobo} />,
            },
            {
              label: "Known progress",
              value: <Money kobo={g.knownProgressKobo} />,
              strong: true,
            },
          ]}
        />
        <AmountForm
          label="Total put toward the course this month"
          kobo={g.recordedKobo}
          blank="unknown"
          submitLabel="Record"
          onCommit={(kobo) =>
            api.apply(editRecord(api.sample, api.sample.goal.purposeId, kobo))
          }
        />
      </Panel>
      <StepNav back={() => api.go("today")} backLabel="Back to Today" />
    </div>
  )
}

const REMINDERS = [
  {
    id: "payday",
    title: "Expected payday",
    text: "Tomorrow: salary A is expected. Record it when it arrives.",
  },
  {
    id: "essential",
    title: "Upcoming essential",
    text: "Tomorrow: transport is due.",
  },
  {
    id: "food",
    title: "Weekly food check",
    text: "Monday: check what is left of this week's food allowance.",
  },
  {
    id: "review",
    title: "Month review",
    text: "30 November: review your month.",
  },
]

export function RemindersScreen({
  api,
  on,
  setOn,
}: {
  api: SampleApi
  on: Record<string, boolean>
  setOn: (next: Record<string, boolean>) => void
}) {
  return (
    <div className="space-y-6">
      <ScreenHeader eyebrow="Today · Reminders" title="Reminder previews">
        Four moments a reminder might help. Previews only: nothing is scheduled,
        sent or asked of your browser.
      </ScreenHeader>
      <ul className="grid gap-3 md:grid-cols-2">
        {REMINDERS.map((r) => (
          <li
            key={r.id}
            className="bg-card ring-foreground/10 min-w-0 space-y-3 rounded-xl p-4 ring-1"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold" id={`rem-${r.id}`}>
                {r.title}
              </h3>
              <button
                type="button"
                role="switch"
                aria-checked={!!on[r.id]}
                aria-labelledby={`rem-${r.id}`}
                onClick={() => setOn({ ...on, [r.id]: !on[r.id] })}
                className={cn(
                  "focus-visible:ring-ring/50 inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 p-0.5 transition-colors outline-none focus-visible:ring-3",
                  on[r.id]
                    ? "bg-primary border-primary justify-end"
                    : "bg-muted border-input justify-start",
                )}
              >
                <span className="bg-card size-5 rounded-full shadow-sm" />
              </button>
            </div>
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="text-muted-foreground text-xs">
                Payday Pitch · 18:00 Lagos time
              </p>
              <p>{r.text}</p>
            </div>
            <p className="text-muted-foreground text-xs">
              {on[r.id] ? "On in this preview" : "Off"}
            </p>
          </li>
        ))}
      </ul>
      <StepNav back={() => api.go("today")} backLabel="Back to Today" />
    </div>
  )
}

const SHARE_ORDER: Line[] = ["attack", "midfield", "defence", "keeper"]

/** Receives only basis points and dot counts, so no amount or purpose name
 *  can reach this DOM, hidden or otherwise (AC-9). */
export function SharePreview({ lines }: { lines: ShareLine[] | null }) {
  if (!lines) {
    return (
      <Callout tone="info" title="Nothing to share yet">
        Plan an amount first. An empty plan has no shape.
      </Callout>
    )
  }
  const byLine = new Map(lines.map((l) => [l.line, l]))
  return (
    <figure className="mx-auto w-full max-w-sm space-y-2">
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0" aria-hidden>
          <PitchField fit="slice" />
        </div>
        <ul className="relative flex flex-col gap-5 px-4 py-6">
          {SHARE_ORDER.map((line) => {
            const l = byLine.get(line)!
            return (
              <li key={line} className="flex flex-col items-center gap-2">
                <span
                  className="flex flex-wrap justify-center gap-2"
                  aria-hidden
                >
                  {Array.from({ length: l.dots }, (_, i) => (
                    <span
                      key={i}
                      className="bg-accent ring-foreground/20 size-5 rounded-full ring-2"
                    />
                  ))}
                </span>
                <span className="flex items-center gap-2">
                  <LineChip line={line} />
                  <span className="bg-background/90 text-foreground rounded-sm px-2 text-sm font-semibold tabular-nums">
                    {(l.basisPoints / 100).toFixed(2)}%
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <figcaption className="text-muted-foreground text-center text-xs">
        My November line up
      </figcaption>
    </figure>
  )
}

export function ShareScreen({ api }: { api: SampleApi }) {
  return (
    <div className="space-y-6">
      <ScreenHeader eyebrow="Today · Share" title="Private share preview">
        What a friend would see: your shape and percentages. No amounts, no
        purposes, no name.
      </ScreenHeader>
      <SharePreview lines={shareShape(api.sample)} />
      <p className="text-muted-foreground text-center text-sm">
        Preview only. Nothing is shared or exported.
      </p>
      <StepNav back={() => api.go("today")} backLabel="Back to Today" />
    </div>
  )
}
