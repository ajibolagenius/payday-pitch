"use client"

// The tactics board (spec 0008 AC-1, AC-2, AC-5, AC-8, AC-9). The draft lives
// here as shares, and every figure on screen comes from the same domain split
// the server runs, so what a person sees while editing is what a stored month
// will carry. Nothing is written until a save or a play: an edit is a draft, and
// a draft is nobody's history.
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { MoneyText } from "@/components/money-text"
import { ZONE_WORD, percent } from "@/components/pitch/zones"
import { PitchView, type PitchSlotAmount } from "@/components/pitch/pitch-view"
import { SuggestionCard } from "@/components/tactics/suggestion-card"
import { TacticList } from "@/components/tactics/tactic-list"
import { SpotEditor } from "@/components/tactics/spot-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Formation } from "@/domain/formations"
import { splitMatch, type SplitPosition } from "@/domain/money"
import {
  TACTIC_NAME_MAX_LENGTH,
  boardWarnings,
  editShare,
  setShare,
  shareCeilingBps,
  type RawSplitItem,
  type ShareEdit,
} from "@/domain/tactics"
import type { BoardContext } from "@/features/tactics/board"
import { playSavedTactic, saveTactic } from "@/features/tactics/actions"

/** The key PitchView gives a slot: role plus its number within the role. */
function slotKeys(spots: SplitPosition[]): string[] {
  return spots.map(
    (spot, at) =>
      `${spot.role}-${spots.slice(0, at).filter((s) => s.role === spot.role).length}`,
  )
}

function rawSplit(spots: SplitPosition[]): RawSplitItem[] {
  return spots.map((spot) => ({
    role: spot.role,
    spot_index: spot.spotIndex,
    label: spot.label,
    basis_points: spot.basisPoints,
  }))
}

export function TacticsBoard({ board }: { board: BoardContext }) {
  const { source, incomeKobo, costKobo, currency } = board
  const [spots, setSpots] = useState<SplitPosition[]>(source.positions)
  const [selected, setSelected] = useState<number>(
    source.positions.find((spot) => spot.role === "FWD")?.spotIndex ?? 0,
  )
  // Set only when the last edit was cut short, so the clamp note can appear and
  // disappear on its own rather than sitting on the screen as a warning.
  const [stoppedAtBps, setStoppedAtBps] = useState<number | null>(null)
  const [name, setName] = useState(source.tacticId ? "" : source.title)
  const [review, setReview] = useState(false)
  const [pending, start] = useTransition()
  const router = useRouter()

  const split = useMemo(
    () => splitMatch(spots, incomeKobo, costKobo),
    [spots, incomeKobo, costKobo],
  )
  const keys = slotKeys(spots)
  // One figure per spot, matched by spot index. A plan that cannot cover the
  // costs has no lines at all (splitMatch writes none), and the grass still
  // shows the shape, so those spots read as zero.
  const amounts: PitchSlotAmount[] = spots.map((spot) => ({
    amountMinorUnits:
      split.lines.find((line) => line.spotIndex === spot.spotIndex)
        ?.plannedKobo ?? 0,
    currency,
  }))
  const formation: Formation = {
    name: source.baseShapeName,
    style: source.style,
    whenToPlay: source.whenToPlay ?? "",
    positions: spots.map((spot) => ({
      role: spot.role,
      label: spot.label,
      basisPoints: spot.basisPoints,
    })),
  }
  const target = spots.find((spot) => spot.spotIndex === selected) ?? spots[0]
  const targetLine = split.lines.find(
    (line) => line.spotIndex === target.spotIndex,
  )
  const warnings = boardWarnings(spots, incomeKobo, costKobo)
  const moneyEmpty = incomeKobo === 0 || costKobo === 0
  const defPoolKobo = split.lines
    .filter((line) => line.role === "DEF")
    .reduce((sum, line) => sum + line.plannedKobo, 0)

  function apply(edit: ShareEdit) {
    setSpots(edit.spots)
    setStoppedAtBps(edit.stoppedAtBps)
  }

  function step(delta: number) {
    apply(editShare(spots, target.spotIndex, delta))
  }

  function save() {
    start(async () => {
      const result = await saveTactic({
        tacticId: source.tacticId ?? undefined,
        // An edit shows no name field, so it carries the tactic's own name.
        name: source.tacticId ? source.title : name,
        baseShapeName: source.baseShapeName,
        split: rawSplit(spots),
      })
      if (result.ok) {
        toast.success(
          source.tacticId
            ? "Saved. Your tactic keeps this plan as a new version."
            : `Saved as ${name}.`,
        )
        // A new tactic becomes the board's source, so the next save is an edit
        // of it rather than a second tactic with the same name.
        if (!source.tacticId) {
          router.push(`/app/tactics?tactic=${result.data.tacticId}`)
        } else {
          router.refresh()
        }
        return
      }
      toast.error(result.error.message)
    })
  }

  function play() {
    if (!source.tacticId) return
    start(async () => {
      const result = await playSavedTactic({ tacticId: source.tacticId! })
      if (result.ok) {
        setReview(false)
        toast.success(`Played. ${result.data.period} is on the books.`)
        return
      }
      // A refusal is a toast, never a silent failure (AC-9). The board keeps the
      // draft, so the person can act on the shortfall without losing their edit.
      toast.error(result.error.message)
    })
  }

  return (
    <div className="space-y-5">
      {board.suggestion ? (
        <SuggestionCard
          suggestion={board.suggestion}
          fundMonthsValue={board.fundMonthsValue}
        />
      ) : null}

      <header>
        <h1 className="text-2xl font-bold tracking-tight">{source.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {source.style}
          {source.tacticId ? " · your tactic" : " · from the library"}
        </p>
      </header>

      {moneyEmpty ? (
        <div role="status" className="bg-muted rounded-lg p-4 text-sm">
          <p className="font-medium">
            {incomeKobo === 0
              ? "You have not added what you earn yet."
              : "You have not added a cost yet."}
          </p>
          <p className="text-muted-foreground mt-1">
            The board still moves shares, but the money at each spot appears
            once there is a pay and a cost to split. Add them on the pitch page.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
        <div className="space-y-4">
          <PitchView
            formation={formation}
            amounts={amounts}
            selectedSlotKey={keys[target.spotIndex]}
            onSelectSlot={(slotKey) => {
              const at = keys.indexOf(slotKey)
              if (at >= 0) {
                setSelected(spots[at].spotIndex)
                setStoppedAtBps(null)
              }
            }}
          />
          <p className="text-muted-foreground text-sm">
            Tap a player, then move their share. The plan always adds up to the
            whole:{" "}
            <span className="text-foreground font-medium">
              {percent(spots.reduce((sum, spot) => sum + spot.basisPoints, 0))}
            </span>
            .
          </p>
        </div>

        <div className="space-y-4">
          <SpotEditor
            spot={target}
            amountKobo={targetLine?.plannedKobo ?? 0}
            currency={currency}
            ceilingBps={shareCeilingBps(spots, target.spotIndex)}
            lockedPoolKobo={target.role === "DEF" ? defPoolKobo : null}
            stoppedAtBps={stoppedAtBps}
            onStep={step}
            onSet={(basisPoints) =>
              apply(setShare(spots, target.spotIndex, basisPoints))
            }
          />

          {split.shortfallKobo !== null ? (
            <div
              role="status"
              className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm"
            >
              <p className="font-medium">
                This shape cannot cover{" "}
                <MoneyText
                  amountMinorUnits={split.shortfallKobo}
                  currency={currency}
                  className="font-medium"
                />
                .
              </p>
              <p className="mt-1">
                Your costs keep their own share of the plan, so no stepper fixes
                this. Start from a base shape with a wider defence, or change
                your costs and income.
              </p>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {warnings.includes("costs_over_half") ? (
                <li
                  role="status"
                  className="bg-muted text-muted-foreground rounded-lg p-3"
                >
                  Your costs are more than half of what you earn. Shares cannot
                  change that: it lives in your costs and your income.
                </li>
              ) : null}
              {warnings.includes("goalkeeper_at_zero") ? (
                <li
                  role="status"
                  className="bg-muted text-muted-foreground rounded-lg p-3"
                >
                  Nothing goes to the keeper spot. That is your emergency fund,
                  so a plan with none in it is a plan with no cushion.
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>

      <section
        aria-labelledby="save-tactic"
        className="bg-card text-card-foreground rounded-xl border p-4"
      >
        <h2 id="save-tactic" className="text-lg font-bold tracking-tight">
          {source.tacticId ? "Save this plan" : "Save as your own tactic"}
        </h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {!source.tacticId ? (
            <label className="block flex-1 text-sm">
              <span className="text-muted-foreground mb-1 block">Name</span>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={TACTIC_NAME_MAX_LENGTH}
                placeholder="My 4-4-2"
              />
            </label>
          ) : null}
          <Button type="button" onClick={save} disabled={pending}>
            {source.tacticId ? "Save changes" : "Save tactic"}
          </Button>
          {source.tacticId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setReview(true)}
            >
              Play this month
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm">
              Save it first, then it can be played.
            </p>
          )}
        </div>

        {review ? (
          <div className="border-border mt-4 border-t pt-4">
            <h3 className="font-medium">This month, as it will be written</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {split.lines.map((line) => (
                <li key={line.spotIndex} className="flex justify-between gap-3">
                  <span className="text-muted-foreground min-w-0 truncate">
                    {ZONE_WORD[line.role]} · {line.label}
                  </span>
                  <MoneyText
                    amountMinorUnits={line.plannedKobo}
                    currency={currency}
                    className="font-medium"
                  />
                </li>
              ))}
            </ul>
            {warnings.length > 0 ? (
              <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                {warnings.includes("costs_over_half") ? (
                  <li>
                    Worth one more look before you play it: your costs are over
                    half of what you earn.
                  </li>
                ) : null}
                {warnings.includes("goalkeeper_at_zero") ? (
                  <li>Nothing goes to the keeper spot.</li>
                ) : null}
              </ul>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button type="button" onClick={play} disabled={pending}>
                Play it
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReview(false)}
                disabled={pending}
              >
                Back to editing
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <TacticList tactics={board.tactics} activeId={source.tacticId} />
    </div>
  )
}
