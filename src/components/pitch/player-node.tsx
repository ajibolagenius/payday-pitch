"use client"

import { motion } from "motion/react"
import { MoneyText } from "@/components/money-text"
import type { FormationRole } from "@/domain/formations"
import { formatKoboSpoken } from "@/domain/money"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const ROLE_WORD: Record<FormationRole, string> = {
  GK: "goalkeeper",
  DEF: "defender",
  MID: "midfielder",
  FWD: "forward",
  BENCH: "substitute",
}

export type PitchPlayer = {
  /** Stable across formations: role plus index within the role, e.g. DEF-1. */
  slotKey: string
  role: FormationRole
  label: string
  /** Null for the bench node: substitutes wear no shirt number. */
  shirtNumber: number | null
  amountMinorUnits: number
  currency: string
  /** Percent of the field box (0 to 100). */
  x: number
  y: number
}

export function PlayerNode({
  player,
  interactive,
  selected,
  onSelect,
  className,
}: {
  player: PitchPlayer
  interactive: boolean
  selected?: boolean
  onSelect?: (slotKey: string) => void
  className?: string
}) {
  const reduceMotion = usePrefersReducedMotion()

  const badge = (
    <span
      aria-label={`${player.label}, ${ROLE_WORD[player.role]}, ${formatKoboSpoken({ kobo: player.amountMinorUnits, currency: player.currency })}`}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-md border border-white/30 bg-[var(--night)]/75 px-1 py-0.5 text-[var(--paper-50)]",
        selected && "border-white/70",
      )}
    >
      {player.shirtNumber !== null ? (
        // Teko shirt number on the accent plate (spec 0009): gold-200 clears
        // 3:1 on both grass stripes in each theme; fill weight marks the
        // selected state (plate plus border, never color alone).
        <span
          className={cn(
            "font-accent bg-accent text-accent-foreground grid size-6 place-items-center rounded-full text-[0.95rem] leading-none font-bold",
            selected && "border-2 border-white/60",
          )}
        >
          {player.shirtNumber}
        </span>
      ) : (
        // The bench node has no shirt number: it names its purpose instead.
        <span className="font-accent text-[0.7rem] leading-none font-medium">
          {player.label}
        </span>
      )}
      <MoneyText
        amountMinorUnits={player.amountMinorUnits}
        currency={player.currency}
        className="text-[0.6rem] leading-none"
      />
    </span>
  )

  const node = interactive ? (
    <button
      type="button"
      onClick={() => onSelect?.(player.slotKey)}
      aria-pressed={selected ?? false}
      // Grass is dark in both themes, so white reads there; the bench sits on
      // bg-muted, which is light paper in the light theme, so it takes the
      // theme ring token (gold-700 light, gold-200 dark) instead.
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
        player.role === "BENCH"
          ? "focus-visible:ring-ring"
          : "focus-visible:ring-white",
      )}
    >
      {badge}
    </button>
  ) : (
    badge
  )

  return (
    <motion.span
      layout={!reduceMotion}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      data-slot-key={player.slotKey}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      className={cn(
        "absolute z-10 -translate-x-1/2 -translate-y-1/2",
        className,
      )}
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      {node}
    </motion.span>
  )
}
