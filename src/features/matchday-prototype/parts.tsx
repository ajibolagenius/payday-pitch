"use client"

// Small pieces every Matchday screen shares. Amounts render through
// MoneyText, and typed amounts go through the model's parseAmount, so no
// component here formats or parses money by hand.
import { useState, type FormEvent, type ReactNode } from "react"
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react"

import { MoneyText } from "@/components/money-text"
import { Button } from "@/components/ui/button"
import { AmountField } from "@/components/walk/amount-field"
import { koboToNairaInput } from "@/domain/money"
import { cn } from "@/lib/utils"

import {
  CURRENCY,
  LINE_INFO,
  parseAmount,
  type Line,
  type Outcome,
  type Sample,
} from "./model"

export type Screen =
  | "preview"
  | "account"
  | "setup"
  | "builder"
  | "review"
  | "saved"
  | "today"
  | "report"
  | "goal"
  | "reminders"
  | "share"

export type SampleApi = {
  sample: Sample
  /** Keeps an ok outcome; returns the error and keeps the old state otherwise. */
  apply: (outcome: Outcome) => string | null
  replace: (next: Sample) => void
  go: (screen: Screen) => void
}

export function Money({
  kobo,
  className,
}: {
  kobo: number
  className?: string
}) {
  return (
    <MoneyText
      amountMinorUnits={kobo}
      currency={CURRENCY}
      className={className}
    />
  )
}

/** A recorded amount, or the word that says it is not known yet. */
export function MaybeMoney({ kobo }: { kobo: number | null }) {
  return kobo === null ? (
    <span className="text-muted-foreground italic">Not recorded</span>
  ) : (
    <Money kobo={kobo} />
  )
}

export const fieldClass =
  "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-lg border bg-transparent px-2.5 text-base outline-none focus-visible:ring-3 md:text-sm"

/** One amount, typed as naira. Blank means unknown only where `blank` says. */
export function AmountForm({
  label,
  kobo,
  blank,
  onCommit,
  submitLabel = "Update",
  hint,
  onDone,
}: {
  label: string
  kobo: number | null
  blank: "unknown" | "required"
  onCommit: (kobo: number | null) => string | null
  submitLabel?: string
  hint?: string
  onDone?: () => void
}) {
  const [text, setText] = useState(kobo === null ? "" : koboToNairaInput(kobo))
  const [seen, setSeen] = useState(kobo)
  const [error, setError] = useState<string>()
  // A scenario load or another editor changed the value under us.
  if (seen !== kobo) {
    setSeen(kobo)
    setText(kobo === null ? "" : koboToNairaInput(kobo))
    setError(undefined)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = parseAmount(text, blank)
    if (!parsed.ok) return setError(parsed.error)
    const failure = onCommit(parsed.kobo)
    setError(failure ?? undefined)
    if (!failure) onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-1.5">
      <div className="flex flex-wrap items-start gap-2">
        <AmountField
          label={label}
          value={text}
          onChange={(value) => {
            setText(value)
            setError(undefined)
          }}
          currency={CURRENCY}
          error={error}
          className="min-w-0 flex-[1_1_9rem]"
        />
        <Button type="submit" variant="outline" size="lg" className="mt-6">
          {submitLabel}
        </Button>
      </div>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </form>
  )
}

const CALLOUT = {
  warning: {
    box: "border-destructive/40 bg-destructive/10",
    title: "text-destructive",
    Icon: WarningCircle,
  },
  success: {
    box: "border-success/40 bg-success/10",
    title: "text-success",
    Icon: CheckCircle,
  },
  info: { box: "border-border bg-muted", title: "text-foreground", Icon: Info },
}

export function Callout({
  tone,
  title,
  children,
  className,
}: {
  tone: keyof typeof CALLOUT
  title: ReactNode
  children?: ReactNode
  className?: string
}) {
  const { box, title: titleClass, Icon } = CALLOUT[tone]
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", box, className)}>
      <Icon
        size={20}
        weight="fill"
        aria-hidden
        className={cn("mt-0.5 shrink-0", titleClass)}
      />
      <div className="min-w-0 space-y-1 text-sm">
        <p className={cn("font-semibold", titleClass)}>{title}</p>
        {children ? (
          <div className="text-foreground space-y-1">{children}</div>
        ) : null}
      </div>
    </div>
  )
}

export const LINE_CHIP: Record<Line, string> = {
  keeper: "bg-secondary text-secondary-foreground",
  defence: "bg-primary text-primary-foreground",
  midfield: "bg-accent text-accent-foreground",
  attack: "bg-success text-success-foreground",
}

export const LINE_BORDER: Record<Line, string> = {
  keeper: "border-l-muted-foreground",
  defence: "border-l-primary",
  midfield: "border-l-accent-text",
  attack: "border-l-success",
}

/** The line's name as a coloured chip; the name carries the meaning. */
export function LineChip({
  line,
  className,
}: {
  line: Line
  className?: string
}) {
  return (
    <span
      className={cn(
        "font-accent inline-flex items-center rounded-sm px-2 pt-0.5 text-base leading-6 tracking-wide uppercase",
        LINE_CHIP[line],
        className,
      )}
    >
      {LINE_INFO[line].name}
    </span>
  )
}

/** Each screen's title; the shell moves focus here after navigation. */
export function ScreenHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="space-y-2">
      {eyebrow ? (
        <p className="text-accent-text text-xs font-semibold tracking-wide uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        tabIndex={-1}
        data-screen-heading
        className="text-2xl tracking-tight outline-none sm:text-4xl"
      >
        {title}
      </h2>
      {children ? (
        <div className="text-muted-foreground max-w-prose text-base">
          {children}
        </div>
      ) : null}
    </header>
  )
}

/** Label and amount rows; values stay in tabular figures. */
export function FigureList({
  rows,
}: {
  rows: {
    label: ReactNode
    value: ReactNode
    note?: ReactNode
    strong?: boolean
  }[]
}) {
  return (
    <dl className="divide-border divide-y">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
        >
          <dt
            className={cn(
              "text-sm",
              row.strong ? "font-semibold" : "text-muted-foreground",
            )}
          >
            {row.label}
            {row.note ? (
              <span className="text-muted-foreground block text-xs font-normal">
                {row.note}
              </span>
            ) : null}
          </dt>
          <dd
            className={cn("text-right", row.strong ? "text-xl" : "text-base")}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Panel({
  title,
  description,
  children,
  className,
  id,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "bg-card ring-foreground/10 min-w-0 space-y-4 rounded-xl p-4 ring-1 sm:p-5",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-lg">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

// At 320px and 200% text a long word, amount or button label must wrap
// rather than push the page sideways (AC-10). overflow-wrap is inherited and
// only breaks a word that cannot fit. Applied at the sample root and on dialogs,
// which portal outside it. Buttons are matched by data-variant: a dialog
// trigger (asChild) replaces the Button's data-slot with its own.
export const WRAP =
  "[overflow-wrap:anywhere] [&_button[data-variant]]:h-auto [&_button[data-variant]]:min-h-9 [&_button[data-variant]]:py-1.5 [&_button[data-variant]]:whitespace-normal [&_button[data-variant]]:max-w-full"
