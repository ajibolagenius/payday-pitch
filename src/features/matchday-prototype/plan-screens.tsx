"use client"

// Sample preview, simulated account, setup, builder, review and saved
// (spec 0011 surfaces 1 to 5). Pitch and list are two drawings of the same
// purposes: both open the one PurposeDialog editor, so they cannot drift.
import { useState, type FormEvent } from "react"
import { ArrowRight, CheckCircle } from "@phosphor-icons/react"

import { PitchField } from "@/components/pitch/pitch-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AmountField } from "@/components/walk/amount-field"
import { formatKoboSpoken, koboToNairaInput } from "@/domain/money"
import { cn } from "@/lib/utils"

import {
  CURRENCY,
  DEC,
  FOOD,
  LINES,
  LINE_INFO,
  NOV,
  editAllowance,
  editIncome,
  editOpening,
  editPlanned,
  figures,
  longDate,
  parseAmount,
  plannedOf,
  reducibleOptional,
  savePlan,
  setAcknowledged,
  shortDate,
  warnings,
  weekRange,
  type Income,
  type Line,
  type PlanId,
  type Purpose,
  type Sample,
  type Warnings,
} from "./model"
import {
  AmountForm,
  Callout,
  FigureList,
  LINE_BORDER,
  LineChip,
  Money,
  Panel,
  ScreenHeader,
  WRAP,
  fieldClass,
  type SampleApi,
} from "./parts"

const PITCH_ORDER: Line[] = ["attack", "midfield", "defence", "keeper"]

// ---------------------------------------------------------------- preview

export function PreviewScreen({ api }: { api: SampleApi }) {
  const f = figures(api.sample)
  return (
    <div className="space-y-8">
      <ScreenHeader
        eyebrow="Sample month · November 2026"
        title="See where your pay goes before it goes."
      >
        Payday Pitch is a money planner for salary earners. You line up each
        month&apos;s pay in four lines, like a football team: essentials and
        debts covered first, the rest put to work.
      </ScreenHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-card ring-foreground/10 min-w-0 rounded-xl p-4 ring-1">
          <p className="text-muted-foreground text-sm font-medium">
            Received so far
          </p>
          <p className="text-3xl tracking-tight">
            <Money kobo={f.receivedKobo} />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Money that has actually arrived.
          </p>
        </div>
        <div className="bg-muted min-w-0 rounded-xl p-4">
          <p className="text-muted-foreground text-sm font-medium">
            Still expected
          </p>
          <p className="text-3xl tracking-tight">
            <Money kobo={f.outstandingKobo} />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            A forecast. You can&apos;t spend it yet.
          </p>
        </div>
      </div>

      <LineViews sample={api.sample} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          className="h-11 px-5"
          onClick={() => api.go("account")}
        >
          Explore the sample <ArrowRight size={20} aria-hidden />
        </Button>
        <p className="text-muted-foreground text-sm">
          About 30 minutes. Fictional figures only.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- account

export function AccountScreen({ api }: { api: SampleApi }) {
  return (
    <div className="space-y-6">
      <ScreenHeader eyebrow="Step 2" title="Your account" />
      <Panel title="In the real app you would create an account here.">
        <p className="text-base">Continue with fictional figures.</p>
        <p className="text-muted-foreground text-sm">
          No email, no password and no sign up. Nothing on this page creates an
          account or connects to a bank.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="h-11 px-5"
            onClick={() => api.go("setup")}
          >
            Continue with fictional figures
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-11"
            onClick={() => api.go("preview")}
          >
            Back
          </Button>
        </div>
      </Panel>
    </div>
  )
}

// ---------------------------------------------------------------- setup

function incomeStatus(i: Income): string {
  if (i.planId === DEC) return "Moved to December"
  const late =
    i.receivedOn !== null && i.receivedOn > i.expectedOn ? ", arrived late" : ""
  if (i.receivedKobo === 0) return "Not received yet"
  if (i.receivedKobo < i.expectedKobo) return `Part received${late}`
  return `Received${late}`
}

function IncomeForm({ income, api }: { income: Income; api: SampleApi }) {
  const fresh = () => ({
    expected: koboToNairaInput(income.expectedKobo),
    received: koboToNairaInput(income.receivedKobo),
    on: income.receivedOn ?? "",
    planId: income.planId,
  })
  const [form, setForm] = useState(fresh)
  const [errors, setErrors] = useState<{
    expected?: string
    received?: string
    form?: string
  }>({})
  const [seen, setSeen] = useState(income)
  if (seen !== income) {
    setSeen(income)
    setForm(fresh())
    setErrors({})
  }
  const dateId = `${income.id}-on`
  const planSelectId = `${income.id}-plan`

  function submit(event: FormEvent) {
    event.preventDefault()
    const expected = parseAmount(form.expected, "required")
    const received = parseAmount(form.received, "required")
    if (!expected.ok || !received.ok) {
      return setErrors({
        expected: expected.ok ? undefined : expected.error,
        received: received.ok ? undefined : received.error,
      })
    }
    const error = api.apply(
      editIncome(api.sample, income.id, {
        expectedKobo: expected.kobo!,
        receivedKobo: received.kobo!,
        receivedOn: form.on || null,
        planId: form.planId,
      }),
    )
    setErrors(error ? { form: error } : {})
  }

  const late =
    income.planId === NOV &&
    income.receivedOn !== null &&
    income.receivedOn >= "2026-11-01"

  return (
    <li className="bg-card ring-foreground/10 min-w-0 rounded-xl p-4 ring-1">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-lg">{income.label}</h4>
          <Badge variant={income.planId === DEC ? "outline" : "secondary"}>
            {incomeStatus(income)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Expected {longDate(income.expectedOn)}.{" "}
          {income.receivedOn
            ? `Latest receipt ${longDate(income.receivedOn)}.`
            : "Nothing recorded yet."}
        </p>
        {late ? (
          <p className="text-sm">
            It arrived in November but still covers <strong>November</strong>,
            the month you chose. Move it only if you mean to.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
          <AmountField
            label="Expected amount"
            value={form.expected}
            onChange={(v) => setForm({ ...form, expected: v })}
            currency={CURRENCY}
            error={errors.expected}
          />
          <AmountField
            label="Received so far (total)"
            value={form.received}
            onChange={(v) => setForm({ ...form, received: v })}
            currency={CURRENCY}
            error={errors.received}
          />
          <div className="space-y-1.5">
            <label htmlFor={dateId} className="text-sm font-medium">
              Latest receipt date
            </label>
            <Input
              id={dateId}
              type="date"
              value={form.on}
              onChange={(e) => setForm({ ...form, on: e.target.value })}
              aria-describedby={`${dateId}-hint`}
            />
            <p id={`${dateId}-hint`} className="text-muted-foreground text-xs">
              Needed once anything has arrived.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={planSelectId} className="text-sm font-medium">
              Covers
            </label>
            <select
              id={planSelectId}
              className={fieldClass}
              value={form.planId}
              onChange={(e) =>
                setForm({ ...form, planId: e.target.value as PlanId })
              }
            >
              <option value={NOV}>November 2026</option>
              <option value={DEC}>December 2026</option>
            </select>
          </div>
        </div>
        {errors.form ? (
          <p role="alert" className="text-destructive text-sm">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" variant="outline" size="lg">
          Update {income.label}
        </Button>
      </form>
    </li>
  )
}

export function SetupScreen({ api }: { api: SampleApi }) {
  const plan = api.sample.plans[NOV]
  return (
    <div className="space-y-8">
      <ScreenHeader eyebrow="Step 3 · Setup" title="Set up November">
        Three sample salaries cover November. Each keeps what was expected apart
        from what actually arrived.
      </ScreenHeader>

      <section aria-labelledby="incomes-heading" className="space-y-3">
        <h3 id="incomes-heading" className="text-lg">
          Income
        </h3>
        <ul className="grid gap-3 lg:grid-cols-2">
          {api.sample.incomes.map((income) => (
            <IncomeForm key={income.id} income={income} api={api} />
          ))}
        </ul>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel
          title="Opening carry forward"
          description="Money still held from last month. It is not income."
        >
          <AmountForm
            label="Carried into November"
            kobo={plan.openingCarryKobo}
            blank="required"
            onCommit={(kobo) =>
              api.apply(editOpening(api.sample, "openingCarryKobo", kobo!))
            }
          />
        </Panel>
        <Panel
          title="Reserve balance"
          description="Your existing reserve. It sits outside this month's plan."
        >
          <AmountForm
            label="Reserve at the start of November"
            kobo={plan.openingReserveKobo}
            blank="required"
            onCommit={(kobo) =>
              api.apply(editOpening(api.sample, "openingReserveKobo", kobo!))
            }
          />
        </Panel>
      </div>

      <StepNav
        back={() => api.go("account")}
        next={() => api.go("builder")}
        nextLabel="Line up the plan"
      />
    </div>
  )
}

// ---------------------------------------------------------------- builder

function PurposeFlags({
  sample,
  purpose,
}: {
  sample: Sample
  purpose: Purpose
}) {
  const short =
    purpose.requiredKobo === null
      ? 0
      : Math.max(purpose.requiredKobo - plannedOf(sample, purpose), 0)
  return short > 0 ? (
    <span className="bg-destructive text-destructive-foreground inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold">
      Short of required by <Money kobo={short} />
    </span>
  ) : null
}

function PurposeDialog({
  sample,
  purpose,
  api,
  children,
}: {
  sample: Sample
  purpose: Purpose
  api?: SampleApi
  children: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  if (!api) return children
  const info = LINE_INFO[purpose.line]
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn("max-h-[90dvh] overflow-y-auto sm:max-w-md", WRAP)}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{purpose.label}</DialogTitle>
          <DialogDescription>
            {info.name}: {info.meaning.toLowerCase()}.{" "}
            {purpose.essential ? "Essential." : "Optional."}
          </DialogDescription>
        </DialogHeader>
        {purpose.requiredKobo !== null ? (
          <p className="text-sm">
            Required payment <Money kobo={purpose.requiredKobo} />
            {purpose.dueOn ? `, due ${shortDate(purpose.dueOn)}` : ""}.
          </p>
        ) : null}
        {purpose.id === FOOD ? (
          <div className="space-y-3">
            <p className="text-sm">
              Food is a weekly budget, not a bill. Its plan is the sum of these
              weeks: <Money kobo={plannedOf(sample, purpose)} />.
            </p>
            {sample.weeks.map((w) => (
              <AmountForm
                key={w.id}
                label={`Allowance, ${weekRange(w)}`}
                kobo={w.allowanceKobo}
                blank="required"
                onCommit={(kobo) =>
                  api.apply(editAllowance(api.sample, w.id, kobo!))
                }
              />
            ))}
          </div>
        ) : (
          <AmountForm
            label="Planned for November"
            kobo={purpose.plannedKobo}
            blank="required"
            submitLabel="Save amount"
            onCommit={(kobo) =>
              api.apply(editPlanned(api.sample, purpose.id, kobo!))
            }
            onDone={() => setOpen(false)}
          />
        )}
        <PurposeFlags sample={sample} purpose={purpose} />
      </DialogContent>
    </Dialog>
  )
}

function PitchBoard({ sample, api }: { sample: Sample; api?: SampleApi }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0" aria-hidden>
        <PitchField fit="slice" />
      </div>
      <ol className="relative flex flex-col gap-6 px-3 py-5 sm:px-6">
        {PITCH_ORDER.map((line) => (
          <li key={line} className="space-y-2">
            <h3 className="flex flex-wrap items-center justify-center gap-2 text-center">
              <LineChip line={line} />
              <span className="bg-background/90 text-foreground rounded-sm px-2 py-0.5 font-sans text-xs font-medium">
                {LINE_INFO[line].meaning}
              </span>
            </h3>
            <ul className="flex flex-wrap justify-center gap-2">
              {sample.purposes
                .filter((p) => p.planId === NOV && p.line === line)
                .map((p) => (
                  <li key={p.id}>
                    <PurposeDialog sample={sample} purpose={p} api={api}>
                      <PlateBody
                        sample={sample}
                        purpose={p}
                        interactive={!!api}
                      />
                    </PurposeDialog>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

const PLATE =
  "bg-accent text-accent-foreground ring-foreground/15 flex min-h-11 min-w-32 flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left shadow-sm ring-1 outline-none"

// A gold plate per purpose. Read only on the preview; a dialog trigger on the
// builder, where Radix passes its props and ref through `props`.
function PlateBody({
  sample,
  purpose,
  interactive,
  ...props
}: {
  sample: Sample
  purpose: Purpose
  interactive: boolean
} & React.ComponentProps<"button">) {
  const body = (
    <>
      <span className="text-xs font-semibold">{purpose.label}</span>
      <Money kobo={plannedOf(sample, purpose)} className="text-base" />
      {interactive ? <span className="sr-only">, edit amount</span> : null}
      <PurposeFlags sample={sample} purpose={purpose} />
    </>
  )
  if (!interactive) return <div className={PLATE}>{body}</div>
  return (
    <button
      type="button"
      {...props}
      className={cn(
        PLATE,
        "focus-visible:ring-ring focus-visible:ring-offset-background hover:brightness-95 focus-visible:ring-3 focus-visible:ring-offset-2",
      )}
    >
      {body}
    </button>
  )
}

function ListBoard({ sample, api }: { sample: Sample; api?: SampleApi }) {
  return (
    <div className="grid gap-3">
      {LINES.map((line) => {
        const purposes = sample.purposes.filter(
          (p) => p.planId === NOV && p.line === line,
        )
        const total = purposes.reduce((a, p) => a + plannedOf(sample, p), 0)
        return (
          <section
            key={line}
            aria-label={LINE_INFO[line].name}
            className={cn(
              "bg-card ring-foreground/10 rounded-xl border-l-4 ring-1",
              LINE_BORDER[line],
            )}
          >
            <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
              <h3 className="flex flex-wrap items-center gap-2">
                <LineChip line={line} />
                <span className="text-muted-foreground font-sans text-sm">
                  {LINE_INFO[line].meaning}
                </span>
              </h3>
              <Money kobo={total} className="text-base font-semibold" />
            </header>
            <ul className="divide-border divide-y px-4 pb-1">
              {purposes.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{p.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {p.essential ? "Essential" : "Optional"}
                      {p.requiredKobo !== null && p.dueOn
                        ? ` · due ${shortDate(p.dueOn)}`
                        : ""}
                      {p.id === FOOD ? " · weekly budget" : ""}
                    </p>
                    <PurposeFlags sample={sample} purpose={p} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Money kobo={plannedOf(sample, p)} className="text-base" />
                    {api ? (
                      <PurposeDialog sample={sample} purpose={p} api={api}>
                        <Button
                          variant="outline"
                          size="lg"
                          aria-label={`Edit ${p.label}`}
                        >
                          Edit
                        </Button>
                      </PurposeDialog>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

// Radix marks the selected tab with data-state, which the shared trigger's
// data-active styles never match, so the selection is restated here.
const TAB =
  "px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/30"

/** Pitch and list, equal: same purposes, same flags, same editor. */
function LineViews({ sample, api }: { sample: Sample; api?: SampleApi }) {
  return (
    <Tabs defaultValue="pitch" className="gap-3">
      <TabsList aria-label="View" className="h-9">
        <TabsTrigger value="pitch" className={TAB}>
          Pitch
        </TabsTrigger>
        <TabsTrigger value="list" className={TAB}>
          List
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pitch">
        <PitchBoard sample={sample} api={api} />
      </TabsContent>
      <TabsContent value="list">
        <ListBoard sample={sample} api={api} />
      </TabsContent>
    </Tabs>
  )
}

export function Headlines({ sample }: { sample: Sample }) {
  const f = figures(sample)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-card ring-foreground/10 min-w-0 rounded-xl p-4 ring-1">
          <p className="text-sm font-semibold">Received remainder</p>
          <p
            className={cn(
              "text-3xl tracking-tight sm:text-4xl",
              f.receivedRemainderKobo < 0 && "text-destructive",
            )}
          >
            <Money kobo={f.receivedRemainderKobo} />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Money in hand after essentials and required debt.
          </p>
        </div>
        <div className="bg-muted min-w-0 rounded-xl p-4">
          <p className="text-sm font-semibold">Forecast remainder</p>
          <p className="text-3xl tracking-tight sm:text-4xl">
            <Money kobo={f.forecastRemainderKobo} />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            The same, if every expected salary arrives. Not spendable yet.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold">Left to assign</span>{" "}
          <span className="text-muted-foreground">
            money in hand minus everything planned, not a bank balance
          </span>
        </p>
        <Money
          kobo={f.leftToAssignKobo}
          className={cn(
            "text-xl",
            f.leftToAssignKobo < 0 && "text-destructive",
          )}
        />
      </div>
      <p className="sr-only" role="status">
        Received remainder{" "}
        {formatKoboSpoken({
          kobo: f.receivedRemainderKobo,
          currency: CURRENCY,
        })}
        , left to assign{" "}
        {formatKoboSpoken({ kobo: f.leftToAssignKobo, currency: CURRENCY })}.
      </p>
    </div>
  )
}

export function WarningList({ w }: { w: Warnings }) {
  if (!w.any) {
    return (
      <Callout tone="success" title="Fully funded from money in hand">
        Every planned amount is covered by money already received.
      </Callout>
    )
  }
  return (
    <div className="space-y-2">
      {w.overallGapKobo > 0 ? (
        <Callout
          tone="warning"
          title={
            <>
              Overall funding gap: <Money kobo={w.overallGapKobo} />
            </>
          }
        >
          You&apos;ve planned more than the money in hand. Expected salaries
          don&apos;t close this until they arrive.
        </Callout>
      ) : null}
      {w.essentialGapKobo > 0 ? (
        <Callout
          tone="warning"
          title={
            <>
              Essentials are short: <Money kobo={w.essentialGapKobo} />
            </>
          }
        >
          Money in hand doesn&apos;t yet cover essentials and required debt.
        </Callout>
      ) : null}
      {w.underallocated.map(({ purpose, kobo }) => (
        <Callout
          key={purpose.id}
          tone="warning"
          title={
            <>
              {purpose.label} is planned below its required payment by{" "}
              <Money kobo={kobo} />
            </>
          }
        />
      ))}
    </div>
  )
}

export function BuilderScreen({ api }: { api: SampleApi }) {
  const plan = api.sample.plans[NOV]
  return (
    <div className="space-y-6">
      <ScreenHeader eyebrow="Step 4 · Builder" title="November 2026">
        Four lines. Tap any purpose, on the pitch or in the list, to change its
        amount.
      </ScreenHeader>
      <Headlines sample={api.sample} />
      <WarningList w={warnings(api.sample)} />
      <LineViews sample={api.sample} api={api} />
      <p className="text-muted-foreground text-sm">
        Plan status:{" "}
        <strong className="text-foreground">
          {plan.status === "saved" ? "Saved" : "Draft"}
        </strong>
        . Any change here returns it to draft.
      </p>
      <StepNav
        back={() => api.go("setup")}
        next={() => api.go("review")}
        nextLabel="Review the plan"
      />
    </div>
  )
}

// ---------------------------------------------------------------- review

export function ReviewScreen({ api }: { api: SampleApi }) {
  const s = api.sample
  const f = figures(s)
  const w = warnings(s)
  const plan = s.plans[NOV]
  const reducible = reducibleOptional(s)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Step 5 · Review"
        title="Check the plan before you save"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="The numbers">
          <FigureList
            rows={[
              { label: "Received", value: <Money kobo={f.receivedKobo} /> },
              {
                label: "Still expected",
                note: "Forecast only",
                value: <Money kobo={f.outstandingKobo} />,
              },
              {
                label: "Opening carry forward",
                value: <Money kobo={plan.openingCarryKobo} />,
              },
              {
                label: "Essentials and required debt",
                value: <Money kobo={f.essentialKobo} />,
              },
              {
                label: "Everything planned",
                value: <Money kobo={f.plannedKobo} />,
              },
              {
                label: "Received remainder",
                value: <Money kobo={f.receivedRemainderKobo} />,
                strong: true,
              },
              {
                label: "Forecast remainder",
                value: <Money kobo={f.forecastRemainderKobo} />,
                strong: true,
              },
              {
                label: "Left to assign",
                value: <Money kobo={f.leftToAssignKobo} />,
                strong: true,
              },
            ]}
          />
        </Panel>
        <div className="space-y-3">
          <WarningList w={w} />
          {w.overallGapKobo > 0 && reducible.length > 0 ? (
            <p className="text-sm">
              To close the <Money kobo={w.overallGapKobo} /> gap you could
              reduce {reducible.map((p) => p.label).join(", ")}. Nothing changes
              unless you edit them.
            </p>
          ) : null}
          {w.any ? (
            <label className="bg-card ring-foreground/10 flex items-start gap-3 rounded-xl p-4 text-sm ring-1">
              <input
                type="checkbox"
                className="accent-primary mt-0.5 size-5 shrink-0"
                checked={plan.shortfallAcknowledged}
                onChange={(e) => {
                  setError(null)
                  api.replace(setAcknowledged(s, e.target.checked))
                }}
              />
              <span>
                I&apos;ve seen the gap and want to save this plan anyway.
              </span>
            </label>
          ) : null}
          {error ? (
            <p role="alert" className="text-destructive text-sm font-medium">
              {error}
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            Saving keeps this plan for this visit only. It does not pay or move
            anything.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              className="h-11 px-5"
              onClick={() => {
                const failure = api.apply(savePlan(s))
                setError(failure)
                if (!failure) api.go("saved")
              }}
            >
              Save sample plan
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11"
              onClick={() => api.go("builder")}
            >
              Back to builder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- saved

export function SavedScreen({ api }: { api: SampleApi }) {
  const plan = api.sample.plans[NOV]
  if (plan.status !== "saved") {
    return (
      <div className="space-y-6">
        <ScreenHeader eyebrow="Step 6" title="This plan is still a draft">
          It changed since it was saved, or it hasn&apos;t been saved yet.
        </ScreenHeader>
        <Button
          size="lg"
          className="h-11 px-5"
          onClick={() => api.go("review")}
        >
          Review and save
        </Button>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <CheckCircle
          size={32}
          weight="fill"
          aria-hidden
          className="text-success mt-1 shrink-0"
        />
        <ScreenHeader
          eyebrow="Step 6 · Saved"
          title="Sample plan saved for this visit. Your money has not moved."
        >
          Nothing is marked paid. Record each payment on Today when it actually
          happens.
        </ScreenHeader>
      </div>
      {plan.shortfallAcknowledged && warnings(api.sample).any ? (
        <Callout tone="info" title="Saved with a gap you acknowledged">
          The plan still asks for more than the money in hand. Review shows the
          details.
        </Callout>
      ) : null}
      <StepNav
        back={() => api.go("builder")}
        backLabel="Edit the plan"
        next={() => api.go("today")}
        nextLabel="Go to Today"
      />
    </div>
  )
}

export function StepNav({
  back,
  next,
  backLabel = "Back",
  nextLabel = "Next",
}: {
  back?: () => void
  next?: () => void
  backLabel?: string
  nextLabel?: string
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-t pt-6">
      {back ? (
        <Button size="lg" variant="ghost" className="h-11" onClick={back}>
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button size="lg" className="h-11 px-5" onClick={next}>
          {nextLabel} <ArrowRight size={20} aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
