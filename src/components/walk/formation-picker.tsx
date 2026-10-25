"use client"

// The formation picker (spec 0007 AC-3, AC-4, AC-5). Cards come from the
// library tables, never the static array. Each card previews what the shape
// would do to this person's real numbers: the zone shares always, and a
// shortfall badge when the shape's defense zone cannot hold the costs.
// Choosing a card only lifts it up: nothing is written until the pitch step.
import { MoneyText } from "@/components/money-text"
import type { LibraryFormation } from "@/features/match/library"
import { splitMatch, zoneShareKobo, type SplitPosition } from "@/domain/money"
import type { FormationRole } from "@/domain/formations"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ZONE_WORD, percent } from "@/components/pitch/zones"

const ZONE_ORDER: FormationRole[] = ["GK", "DEF", "MID", "FWD", "BENCH"]

function zoneShares(formation: LibraryFormation) {
  const totals = new Map<FormationRole, number>()
  for (const position of formation.positions) {
    totals.set(
      position.role,
      (totals.get(position.role) ?? 0) + position.basisPoints,
    )
  }
  return ZONE_ORDER.filter((role) => totals.has(role)).map((role) => ({
    role,
    basisPoints: totals.get(role)!,
  }))
}

function spots(formation: LibraryFormation): SplitPosition[] {
  return formation.positions.map((position, spotIndex) => ({
    role: position.role,
    spotIndex,
    label: position.label,
    basisPoints: position.basisPoints,
  }))
}

export function FormationPicker({
  formations,
  incomeMinorUnits,
  costMinorUnits,
  currency,
  selectedId,
  onSelect,
}: {
  formations: LibraryFormation[]
  incomeMinorUnits: number
  costMinorUnits: number
  currency: string
  selectedId: number | null
  onSelect: (shapeId: number) => void
}) {
  if (formations.length === 0) {
    return (
      <p className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
        The formation library did not load. Reload the page to try again.
      </p>
    )
  }

  // Income cannot cover the costs in any shape: every zone share of a
  // five-defender shape still falls short, so the picker says so up front
  // instead of leaving six dead ends (AC-5).
  const widestDefense = Math.max(
    ...formations.map(
      (formation) =>
        zoneShares(formation).find((zone) => zone.role === "DEF")
          ?.basisPoints ?? 0,
    ),
  )
  const nothingCovers =
    costMinorUnits > zoneShareKobo(incomeMinorUnits, widestDefense)

  return (
    <div className="space-y-4">
      {nothingCovers ? (
        <div
          role="status"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm"
        >
          <p className="font-medium">Your costs are more than you earn.</p>
          <p className="mt-1">
            No formation can cover{" "}
            <MoneyText
              amountMinorUnits={costMinorUnits}
              currency={currency}
              className="font-medium"
            />{" "}
            from{" "}
            <MoneyText
              amountMinorUnits={incomeMinorUnits}
              currency={currency}
              className="font-medium"
            />
            . Trim a cost or add income, then pick a shape.
          </p>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {formations.map((formation) => {
          const split = splitMatch(
            spots(formation),
            incomeMinorUnits,
            costMinorUnits,
          )
          const short = split.shortfallKobo
          const selected = formation.id === selectedId
          return (
            <li key={formation.id}>
              <button
                type="button"
                onClick={() => onSelect(formation.id)}
                aria-pressed={selected}
                className={cn(
                  "bg-card text-card-foreground w-full rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-primary ring-primary/40 ring-2"
                    : "border-border hover:bg-muted",
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-lg font-bold tracking-tight">
                    {formation.name}
                  </span>
                  {short !== null ? (
                    <Badge variant="destructive">
                      Short by{" "}
                      <MoneyText
                        amountMinorUnits={short}
                        currency={currency}
                        className="text-xs"
                      />
                    </Badge>
                  ) : null}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-sm">
                  {formation.style}
                </span>
                <span className="mt-2 block text-sm">
                  {formation.whenToPlay}
                </span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {zoneShares(formation).map((zone) => (
                    <span
                      key={zone.role}
                      className="bg-secondary text-secondary-foreground rounded-sm px-1.5 py-0.5 text-xs font-medium"
                    >
                      {ZONE_WORD[zone.role]} {percent(zone.basisPoints)}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
