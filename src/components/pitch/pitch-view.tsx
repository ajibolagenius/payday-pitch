"use client"

import { useId } from "react"
import { LayoutGroup } from "motion/react"
import { PitchField } from "@/components/pitch/pitch-field"
import { PlayerNode, type PitchPlayer } from "@/components/pitch/player-node"
import type { Formation } from "@/domain/formations"
import { formationSlotCoordinates } from "@/domain/formations"

export type PitchSlotAmount = {
  amountMinorUnits: number
  currency: string
}

// Shirt numbers: 1 for the keeper, then sequential in seed order (spec 0005).
function shirtNumber(role: string, pitchIndex: number): number | null {
  return role === "BENCH" ? null : pitchIndex + 1
}

function toPlayers(
  formation: Formation,
  amounts: PitchSlotAmount[],
): PitchPlayer[] {
  const coordinates = formationSlotCoordinates(formation.name)
  let pitchIndex = -1
  return formation.positions.map((position, i) => {
    if (position.role !== "BENCH") pitchIndex += 1
    return {
      slotKey: `${position.role}-${
        formation.positions.slice(0, i).filter((p) => p.role === position.role)
          .length
      }`,
      role: position.role,
      label: position.label,
      shirtNumber: shirtNumber(position.role, pitchIndex),
      amountMinorUnits: amounts[i].amountMinorUnits,
      currency: amounts[i].currency,
      x: coordinates[i].x,
      y: coordinates[i].y,
    }
  })
}

export function PitchView({
  formation,
  amounts,
  onSelectSlot,
  selectedSlotKey,
}: {
  formation: Formation
  /** One amount per position, index aligned with formation.positions. */
  amounts: PitchSlotAmount[]
  onSelectSlot?: (slotKey: string) => void
  selectedSlotKey?: string
}) {
  const headingId = useId()
  const players = toPlayers(formation, amounts)
  const onPitch = players.filter((p) => p.role !== "BENCH")
  const bench = players.filter((p) => p.role === "BENCH")

  return (
    <figure className="m-0">
      <figcaption id={headingId} className="sr-only">
        {formation.name} formation: {formation.positions.length - 1} money slots
        on the pitch, each labelled with its purpose and amount, plus a
        substitute slot below.
      </figcaption>

      <div
        className="border-border relative mx-auto w-full max-w-72 border sm:max-w-96 md:max-w-lg"
        style={{ aspectRatio: "100 / 133" }}
      >
        <PitchField />
        {/* Keys are role slots, so Motion pairs the same player across shapes. */}
        <LayoutGroup id={headingId}>
          {onPitch.map((player) => (
            <PlayerNode
              key={player.slotKey}
              player={player}
              interactive={onSelectSlot !== undefined}
              selected={player.slotKey === selectedSlotKey}
              onSelect={onSelectSlot}
            />
          ))}
        </LayoutGroup>
      </div>

      {/* The bench strip sits below the grass, visually apart from the eleven. */}
      <div className="bg-muted relative mx-auto mt-1 h-14 w-full max-w-72 rounded-md sm:max-w-96 md:max-w-lg">
        <p className="text-muted-foreground absolute top-1.5 left-2 text-xs font-medium">
          Bench
        </p>
        {bench.map((player) => (
          <PlayerNode
            key={player.slotKey}
            player={{ ...player, y: 60 }}
            interactive={onSelectSlot !== undefined}
            selected={player.slotKey === selectedSlotKey}
            onSelect={onSelectSlot}
          />
        ))}
      </div>
    </figure>
  )
}
