"use client"

// The pitch step (spec 0007 AC-6, AC-7). The players render through the
// existing PitchView, so every amount on the grass goes through MoneyText and
// a formation switch moves them with Motion. Below the grass, the optional
// actuals: one box per slot, blank means not logged, 0.00 means moved nothing.
import { AmountField } from "@/components/walk/amount-field"
import { MoneyText } from "@/components/money-text"
import { PitchView } from "@/components/pitch/pitch-view"
import type { Formation, FormationRole } from "@/domain/formations"
import { Button } from "@/components/ui/button"

export type ReviewLine = {
  role: FormationRole
  spotIndex: number
  label: string
  plannedMinorUnits: number
  actualMinorUnits: number | null
}

export function PitchReview({
  formation,
  lines,
  currency,
  editable,
  actuals,
  onActual,
  onPlay,
  pending,
}: {
  formation: Formation
  lines: ReviewLine[]
  currency: string
  /** Draft: the person can still record what they moved. Saved: a frozen month. */
  editable: boolean
  actuals?: Record<number, string>
  onActual?: (spotIndex: number, value: string) => void
  onPlay?: () => void
  pending?: boolean
}) {
  return (
    <div className="space-y-5">
      <PitchView
        formation={formation}
        amounts={lines.map((line) => ({
          amountMinorUnits: line.plannedMinorUnits,
          currency,
        }))}
      />

      {editable ? (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Put in what you actually moved, if you want the month to show it.
            Leave a box empty and it stays not logged.
          </p>
          <ul className="space-y-3">
            {lines.map((line) => (
              <li key={line.spotIndex} className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.label}</p>
                  <p className="text-muted-foreground text-xs">
                    Planned{" "}
                    <MoneyText
                      amountMinorUnits={line.plannedMinorUnits}
                      currency={currency}
                    />
                  </p>
                </div>
                <AmountField
                  label="Moved"
                  name={`actual-${line.spotIndex}`}
                  currency={currency}
                  value={actuals?.[line.spotIndex] ?? ""}
                  onChange={(value) => onActual?.(line.spotIndex, value)}
                  className="w-36 shrink-0"
                />
              </li>
            ))}
          </ul>
          <Button
            type="button"
            onClick={onPlay}
            disabled={pending}
            className="w-full"
            size="lg"
          >
            {pending ? "Playing…" : "Play the match"}
          </Button>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {lines.map((line) => (
            <li key={line.spotIndex} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {line.label}
              </span>
              <MoneyText
                amountMinorUnits={line.plannedMinorUnits}
                currency={currency}
                className="text-sm"
              />
              <span className="text-muted-foreground w-24 text-right text-xs">
                {line.actualMinorUnits === null ? (
                  "not logged"
                ) : (
                  <MoneyText
                    amountMinorUnits={line.actualMinorUnits}
                    currency={currency}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
