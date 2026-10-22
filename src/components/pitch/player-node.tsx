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
        "flex flex-col items-center gap-0.5 rounded-md border border-white/30 bg-[var(--surface-black)]/75 px-1 py-0.5 text-[var(--paper)] backdrop-blur-sm",
        selected && "border-[var(--volt)] bg-[var(--surface-black)]",
      )}
    >
      {player.shirtNumber !== null ? (
        <span className="grid size-6 place-items-center rounded-full bg-[var(--volt)] text-[0.6rem] font-bold text-[var(--surface-black)]">
          {player.shirtNumber}
        </span>
      ) : (
        // The bench node has no shirt number: it names its purpose instead.
        <span className="text-[0.6rem] leading-none font-medium">
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
      className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--volt)]"
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
