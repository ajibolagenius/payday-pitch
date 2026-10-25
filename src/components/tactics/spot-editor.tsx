"use client"

// One spot's controls (spec 0008 AC-1). Steppers move in the domain's step and
// an exact field takes a typed percentage, because the shape of a plan is chosen
// in shares while the decision is felt in money: the amount below the share is
// the same split the server will run, recomputed live from the draft.
import { useState } from "react"

import { MoneyText } from "@/components/money-text"
import { ZONE_WORD, percent } from "@/components/pitch/zones"
import { SHARE_STEP_BASIS_POINTS, TOTAL_BASIS_POINTS } from "@/domain/tactics"
import type { SplitPosition } from "@/domain/money"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SpotEditor({
  spot,
  amountKobo,
  currency,
  ceilingBps,
  lockedPoolKobo,
  stoppedAtBps,
  onStep,
  onSet,
}: {
  spot: SplitPosition
  currency: string
  amountKobo: number
  /** The most this spot can hold. Costs hold the rest (AC-4). */
  ceilingBps: number
  /** Set only for a defender: the cost pool the zone is locked to. */
  lockedPoolKobo: number | null
  /** Set when the last edit was cut short at this spot: the share it did reach. */
  stoppedAtBps: number | null
  onStep: (deltaBps: number) => void
  onSet: (basisPoints: number) => void
}) {
  // While the field is focused it shows exactly what the person typed, so a
  // multi digit share like "12.5%" survives its own keystrokes instead of being
  // rewritten by the recomputed value under the cursor. Leaving the field, or a
  // stepper tap, drops the draft and the field settles on the share the plan
  // really holds. No effect, so no second render.
  const share = percent(spot.basisPoints)
  const [draft, setDraft] = useState<string | null>(null)
  const typed = draft ?? share

  function commit(value: string) {
    const parsed = Number(value.replace("%", "").trim())
    if (!Number.isFinite(parsed) || value.trim() === "") {
      setDraft(value)
      return
    }
    // A percentage is hundredths of a basis point times 100: integer math from
    // the first step, so no float share ever reaches the draft.
    const wanted = Math.max(
      0,
      Math.min(TOTAL_BASIS_POINTS, Math.round(parsed * 100)),
    )
    onSet(wanted)
    // The one number typed too high is echoed back clamped, so the field and
    // the ceiling message below agree on where the spot stopped.
    setDraft(wanted > ceilingBps ? percent(ceilingBps) : value)
  }

  // A stepper tap means the typed share is done with: the field goes back to
  // what the plan holds rather than keeping a draft the steppers just changed.
  function step(deltaBps: number) {
    setDraft(null)
    onStep(deltaBps)
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {ZONE_WORD[spot.role]}
      </p>
      <h3 className="text-lg font-bold tracking-tight">{spot.label}</h3>

      <p className="mt-2 text-sm">
        <MoneyText
          amountMinorUnits={amountKobo}
          currency={currency}
          className="text-lg font-bold"
        />{" "}
        this month, from <span className="font-medium">{share}</span> of your
        plan
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => step(-SHARE_STEP_BASIS_POINTS)}
            aria-label={`Lower ${spot.label} by ${percent(SHARE_STEP_BASIS_POINTS)}`}
          >
            &minus; {percent(SHARE_STEP_BASIS_POINTS)}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStep(SHARE_STEP_BASIS_POINTS)}
            aria-label={`Raise ${spot.label} by ${percent(SHARE_STEP_BASIS_POINTS)}`}
          >
            + {percent(SHARE_STEP_BASIS_POINTS)}
          </Button>
        </div>
        <label className="block text-sm">
          <span className="text-muted-foreground mb-1 block">Exact share</span>
          <Input
            type="text"
            inputMode="decimal"
            value={typed}
            onChange={(event) => commit(event.target.value)}
            onBlur={() => setDraft(null)}
            className="w-28"
            aria-describedby={
              stoppedAtBps === null ? undefined : "share-ceiling"
            }
          />
        </label>
      </div>

      {lockedPoolKobo !== null ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Defence holds your costs, here{" "}
          <MoneyText
            amountMinorUnits={lockedPoolKobo}
            currency={currency}
            className="font-medium"
          />
          . Moving a defender changes which defender gets more of it, never how
          much of your pay goes to defence.
        </p>
      ) : null}

      {stoppedAtBps !== null ? (
        <p id="share-ceiling" role="status" className="mt-3 text-sm">
          {spot.basisPoints >= ceilingBps
            ? `${percent(ceilingBps)} is the most this spot can hold. Your costs hold the rest.`
            : "A share cannot go below zero."}
        </p>
      ) : null}
    </div>
  )
}
