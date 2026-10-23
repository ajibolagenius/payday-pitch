"use client"

// The four step walk (spec 0007 AC-1, AC-8). Where the walk opens comes from
// the stored data on the server: no progress pointer to keep in sync, so
// reopening the app lands in the right place. After that first render the
// person's own navigation wins, so saving an income mid walk never yanks them
// to another step.
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { EntryList } from "@/components/walk/entry-list"
import { FormationPicker } from "@/components/walk/formation-picker"
import { MoneyText } from "@/components/money-text"
import { PitchReview, type ReviewLine } from "@/components/walk/pitch-review"
import { PitchTour } from "@/components/walk/pitch-tour"
import type { Formation } from "@/domain/formations"
import { splitMatch } from "@/domain/money"
import { playMatchAction } from "@/features/match/actions"
import type { LibraryFormation } from "@/features/match/library"
import type { MatchSnapshot, WalkState } from "@/features/match/queries"
import {
  addFixedCostAction,
  deleteFixedCostAction,
  updateFixedCostAction,
} from "@/features/costs/actions"
import {
  addIncomeAction,
  deleteIncomeAction,
  updateIncomeAction,
} from "@/features/streams/actions"
import { Button } from "@/components/ui/button"

type Step = "incomes" | "costs" | "shape" | "pitch"

const STEP_ORDER: { id: Step; label: string }[] = [
  { id: "incomes", label: "Income" },
  { id: "costs", label: "Costs" },
  { id: "shape", label: "Shape" },
  { id: "pitch", label: "Pitch" },
]

function spots(formation: LibraryFormation) {
  return formation.positions.map((position, spotIndex) => ({
    role: position.role,
    spotIndex,
    label: position.label,
    basisPoints: position.basisPoints,
  }))
}

/** A stored month replayed as a formation: the snapshot carries its own
 *  frozen positions, so a retired library shape still renders as played. */
function formationFromSnapshot(snapshot: MatchSnapshot): Formation {
  return {
    name: snapshot.shapeName,
    style: "",
    whenToPlay: "",
    positions: snapshot.lines.map((line) => ({
      role: line.role,
      label: line.label,
      basisPoints: line.basisPoints,
    })),
  }
}

function linesFromSnapshot(snapshot: MatchSnapshot): ReviewLine[] {
  return snapshot.lines.map((line) => ({
    role: line.role,
    spotIndex: line.spotIndex,
    label: line.label,
    plannedMinorUnits: line.plannedMinorUnits,
    actualMinorUnits: line.actualMinorUnits,
  }))
}

export function Walk({ walk }: { walk: WalkState }) {
  const [step, setStep] = useState<Step>(() => {
    if (walk.incomes.length === 0) return "incomes"
    if (walk.costs.length === 0) return "costs"
    return "pitch"
  })
  const [shapeId, setShapeId] = useState<number | null>(
    walk.active?.shapeId ?? walk.formations[0]?.id ?? null,
  )
  const [draft, setDraft] = useState(false)
  const [actuals, setActuals] = useState<Record<number, string>>({})
  const [pending, start] = useTransition()

  const selected =
    walk.formations.find((formation) => formation.id === shapeId) ?? null
  const split = selected
    ? splitMatch(spots(selected), walk.incomeMinorUnits, walk.costMinorUnits)
    : null
  const draftLines: ReviewLine[] = (split?.lines ?? []).map((line) => ({
    role: line.role,
    spotIndex: line.spotIndex,
    label: line.label,
    plannedMinorUnits: line.plannedKobo,
    actualMinorUnits: null,
  }))

  const moneyEmpty = walk.incomes.length === 0 || walk.costs.length === 0
  const leftToWork = walk.incomeMinorUnits - walk.costMinorUnits

  function goTo(next: Step) {
    if (next === "pitch" && step === "shape") setDraft(true)
    else if (next !== "pitch") setDraft(false)
    setStep(next)
  }

  function play() {
    if (!selected) return
    const payload = {
      shapeId: selected.id,
      actuals: selected.positions.map((_, spotIndex) => ({
        spotIndex,
        actualNaira: actuals[spotIndex] ?? "",
      })),
    }
    start(async () => {
      const result = await playMatchAction(payload)
      if (result.ok) {
        setActuals({})
        setDraft(false)
        toast.success(`Played. ${result.data.period} is on the books.`)
        return
      }
      toast.error(result.error.message)
    })
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Walk steps">
        <ol className="border-border flex gap-1 border-b pb-2">
          {STEP_ORDER.map((entry, index) => {
            const reachable =
              entry.id === "incomes" ||
              entry.id === "costs" ||
              (entry.id === "shape" && !moneyEmpty) ||
              (entry.id === "pitch" &&
                !moneyEmpty &&
                (walk.active !== null ||
                  walk.last !== null ||
                  selected !== null))
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => goTo(entry.id)}
                  disabled={!reachable}
                  aria-current={entry.id === step ? "step" : undefined}
                  className={
                    entry.id === step
                      ? "text-foreground font-bold"
                      : "text-muted-foreground font-medium"
                  }
                >
                  <span className="text-xs">
                    {index + 1}. {entry.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "incomes" && "What comes in"}
          {step === "costs" && "What must go out"}
          {step === "shape" && "Pick your shape"}
          {step === "pitch" && (walk.active ? "This month" : "Your pitch")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === "incomes" &&
            "Every salary, hustle and stipend you expect this month."}
          {step === "costs" &&
            "Rent, data, transport, debt payments: the real amounts, not a share."}
          {step === "shape" &&
            "Six shapes from the library. Defence always takes your costs in full."}
          {step === "pitch" &&
            "Your money lined up. Each player is one slot, wearing its amount."}
        </p>
      </header>

      {step !== "incomes" && step !== "costs" ? (
        <p className="text-muted-foreground flex flex-wrap gap-x-4 text-sm">
          <span>
            Income{" "}
            <MoneyText
              amountMinorUnits={walk.incomeMinorUnits}
              currency={walk.currency}
              className="text-foreground font-medium"
            />
          </span>
          <span>
            Costs{" "}
            <MoneyText
              amountMinorUnits={walk.costMinorUnits}
              currency={walk.currency}
              className="text-foreground font-medium"
            />
          </span>
          <span>
            Left to work{" "}
            <MoneyText
              amountMinorUnits={leftToWork}
              currency={walk.currency}
              className={
                leftToWork < 0
                  ? "text-destructive font-medium"
                  : "text-success font-medium"
              }
            />
          </span>
        </p>
      ) : null}

      {moneyEmpty && step !== "incomes" && step !== "costs" ? (
        <div className="bg-muted rounded-lg p-3 text-sm">
          <p>
            {walk.incomes.length === 0
              ? "No income entered yet."
              : "No fixed costs entered yet."}
          </p>
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() =>
              goTo(walk.incomes.length === 0 ? "incomes" : "costs")
            }
          >
            Update your numbers
          </Button>
        </div>
      ) : null}

      {step === "incomes" ? (
        <div className="space-y-4">
          <EntryList
            entries={walk.incomes}
            currency={walk.currency}
            payday
            totalLabel="Total in each month"
            emptyTitle="Nothing logged yet"
            emptyHint="Add your first income to start the walk."
            nameLabel="What is it"
            namePlaceholder="Salary"
            add={addIncomeAction}
            update={updateIncomeAction}
            remove={deleteIncomeAction}
          />
          <Button
            type="button"
            onClick={() => goTo("costs")}
            disabled={pending}
          >
            Next: fixed costs
          </Button>
        </div>
      ) : null}

      {step === "costs" ? (
        <div className="space-y-4">
          <EntryList
            entries={walk.costs}
            currency={walk.currency}
            totalLabel="Total out each month"
            emptyTitle="Nothing logged yet"
            emptyHint="Defence is built from these amounts, so add what you truly pay."
            nameLabel="What is it"
            namePlaceholder="Rent"
            add={addFixedCostAction}
            update={updateFixedCostAction}
            remove={deleteFixedCostAction}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => goTo("incomes")}
              disabled={pending}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => goTo("shape")}
              disabled={moneyEmpty || pending}
            >
              Next: pick a shape
            </Button>
          </div>
        </div>
      ) : null}

      {step === "shape" ? (
        <div className="space-y-4">
          <FormationPicker
            formations={walk.formations}
            incomeMinorUnits={walk.incomeMinorUnits}
            costMinorUnits={walk.costMinorUnits}
            currency={walk.currency}
            selectedId={shapeId}
            onSelect={setShapeId}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => goTo("costs")}
              disabled={pending}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => goTo("pitch")}
              disabled={selected === null || split?.lines.length !== 12}
            >
              Review the pitch
            </Button>
          </div>
        </div>
      ) : null}

      {step === "pitch" ? (
        <div className="space-y-4">
          <PitchTour />
          {draft && selected && split?.lines.length === 12 ? (
            <PitchReview
              formation={selected}
              lines={draftLines}
              currency={walk.currency}
              editable
              actuals={actuals}
              onActual={(spotIndex, value) =>
                setActuals((current) => ({ ...current, [spotIndex]: value }))
              }
              onPlay={play}
              pending={pending}
            />
          ) : draft && selected ? (
            <div role="status" className="bg-muted rounded-lg p-4 text-sm">
              <p className="font-medium">This shape cannot cover your costs</p>
              <p className="text-muted-foreground mt-1">
                It is short by{" "}
                <MoneyText
                  amountMinorUnits={split?.shortfallKobo ?? 0}
                  currency={walk.currency}
                  className="text-foreground font-medium"
                />
                . Choose a wider defence or trim a cost.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => goTo("shape")}
              >
                Back to shapes
              </Button>
            </div>
          ) : walk.active ? (
            <>
              <p className="text-muted-foreground text-sm">
                Played for {walk.active.period}. Editing your costs later will
                not change this month.
              </p>
              <PitchReview
                formation={formationFromSnapshot(walk.active)}
                lines={linesFromSnapshot(walk.active)}
                currency={walk.active.currency}
                editable={false}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => goTo("shape")}>
                  Play this month again
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goTo("incomes")}
                >
                  Update your numbers
                </Button>
              </div>
            </>
          ) : walk.last ? (
            <>
              <p className="text-muted-foreground text-sm">
                Your last match: {walk.last.shapeName}, played for{" "}
                {walk.last.period}.
              </p>
              <PitchReview
                formation={formationFromSnapshot(walk.last)}
                lines={linesFromSnapshot(walk.last)}
                currency={walk.last.currency}
                editable={false}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => goTo("shape")}>
                  Start this month
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goTo("incomes")}
                >
                  Update your numbers
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">No match played yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Pick a shape and the pitch fills in with your amounts.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => goTo("shape")}
              >
                Pick a shape
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
