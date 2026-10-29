// Artwork exception (spec 0005): this directory may use literal colors for
// the grass, defined once here and used nowhere else. Spec 0009 moves the
// values to the raw layer (--grass-a, --grass-b) so the pair test can reach
// them; SVG fill attributes cannot read vars, so they go through style.

const STRIPE_HEIGHT = 133 / 13 // 13 alternating bands over the whole field

// `slice` fills a board of any height by cropping, so circles stay round.
export function PitchField({ fit = "meet" }: { fit?: "meet" | "slice" }) {
  return (
    <svg
      viewBox="0 0 100 133"
      preserveAspectRatio={`xMidYMid ${fit}`}
      className="block h-full w-full"
      role="presentation"
      aria-hidden
    >
      {Array.from({ length: 13 }, (_, i) => (
        <rect
          key={i}
          x={0}
          y={i * STRIPE_HEIGHT}
          width={100}
          height={STRIPE_HEIGHT}
          style={{
            fill: i % 2 === 0 ? "var(--grass-a)" : "var(--grass-b)",
          }}
        />
      ))}

      <g
        stroke="var(--pitch-line)"
        strokeWidth={0.5}
        fill="none"
        strokeLinecap="round"
      >
        {/* boundary, halfway line, center circle and spot */}
        <rect x={1.5} y={1.5} width={97} height={130} />
        <path d="M1.5 66.5h97" />
        <circle cx={50} cy={66.5} r={12} />
        <circle
          cx={50}
          cy={66.5}
          r={0.9}
          fill="var(--pitch-line)"
          stroke="none"
        />

        {/* penalty areas, goal areas, spots */}
        <rect x={20} y={110} width={60} height={21.5} />
        <rect x={20} y={1.5} width={60} height={21.5} />
        <rect x={34} y={122} width={32} height={9.5} />
        <rect x={34} y={1.5} width={32} height={9.5} />
        <circle
          cx={50}
          cy={119}
          r={0.9}
          fill="var(--pitch-line)"
          stroke="none"
        />
        <circle
          cx={50}
          cy={14}
          r={0.9}
          fill="var(--pitch-line)"
          stroke="none"
        />
        {/* D arcs, cut at the area edge */}
        <path d="M40 110a11 11 0 0 0 20 0" />
        <path d="M40 24a11 11 0 0 1 20 0" />

        {/* corner arcs */}
        <path d="M1.5 5.5a4 4 0 0 0 4-4" />
        <path d="M98.5 5.5a4 4 0 0 1-4-4" />
        <path d="M1.5 127.5a4 4 0 0 1 4 4" />
        <path d="M98.5 127.5a4 4 0 0 0-4 4" />

        {/* goals */}
        <path d="M38 1.5v-1h24v1M38 131.5v1h24v-1" />
      </g>
    </svg>
  )
}
