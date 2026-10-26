// Brand mark, wordmark and line-up (spec 0010). Artwork: reads raw layer
// variables directly, the exception design.md grants the pitch and stickers.
// The forest chip serves light surfaces; the paper chip (gold 600 dots,
// forest keeper, the values the pair contract proves) serves dark ones.
// The primary tier renders at 48 px and above; below 48 the reduced tier is
// mandatory.

import { cn } from "@/lib/utils"

import {
  CHIP_RX,
  LINEUP_BOX,
  LINEUP_DOTS,
  LINEUP_DOT_R,
  LINEUP_KEEPER,
  PRIMARY_DOTS,
  PRIMARY_DOT_R,
  PRIMARY_KEEPER,
  REDUCED_DOTS,
  REDUCED_DOT_R,
  REDUCED_KEEPER,
} from "./geometry"

const PALETTES = {
  forest: {
    chip: "var(--forest-700)",
    dots: "var(--gold-200)",
    keeper: "var(--paper-50)",
  },
  paper: {
    chip: "var(--paper-50)",
    dots: "var(--gold-600)",
    keeper: "var(--forest-700)",
  },
} as const

const CHIPS = {
  ...PALETTES,
  /** Header and marketing slots: forest in light, paper in dark. */
  auto: {
    chip: "var(--brand-chip)",
    dots: "var(--brand-chip-dots)",
    keeper: "var(--brand-chip-keeper)",
  },
} as const

export type BrandMarkProps = React.ComponentProps<"svg"> & {
  tier: "primary" | "reduced"
  chip?: keyof typeof CHIPS
  /** Meaningful use gets a label; a labelled wordmark beside it stays silent. */
  label?: string
}

export function BrandMark({
  tier,
  chip = "forest",
  label,
  ...props
}: BrandMarkProps) {
  const colors = CHIPS[chip]
  const { dots, dotR, keeper } =
    tier === "primary"
      ? { dots: PRIMARY_DOTS, dotR: PRIMARY_DOT_R, keeper: PRIMARY_KEEPER }
      : { dots: REDUCED_DOTS, dotR: REDUCED_DOT_R, keeper: REDUCED_KEEPER }

  return (
    <svg
      viewBox="0 0 512 512"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <rect width="512" height="512" rx={CHIP_RX} fill={colors.chip} />
      <g fill={colors.dots}>
        {dots.map(({ cx, cy }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={dotR} />
        ))}
      </g>
      <circle cx={keeper.cx} cy={keeper.cy} r={keeper.r} fill={colors.keeper} />
    </svg>
  )
}

/** The name set in Melodrama 600, sentence case, tight tracking (AC-5). */
export function Wordmark({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("font-heading font-semibold tracking-tight", className)}
      {...props}
    >
      Payday Pitch
    </span>
  )
}

/** The eleven in a row, keeper leading left: divider and showcase art. */
export function Lineup(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox={`0 0 ${LINEUP_BOX.width} ${LINEUP_BOX.height}`}
      aria-hidden
      {...props}
    >
      <rect
        width={LINEUP_BOX.width}
        height={LINEUP_BOX.height}
        fill="var(--forest-700)"
      />
      <g fill="var(--gold-200)">
        {LINEUP_DOTS.map(({ cx, cy }) => (
          <circle key={cx} cx={cx} cy={cy} r={LINEUP_DOT_R} />
        ))}
      </g>
      <circle
        cx={LINEUP_KEEPER.cx}
        cy={LINEUP_KEEPER.cy}
        r={LINEUP_KEEPER.r}
        fill="var(--paper-50)"
      />
    </svg>
  )
}
