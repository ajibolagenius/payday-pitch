// Hand drawn pen line stickers (DES_2 / DES_3 style). Decorative by default:
// aria-hidden, no title, color from currentColor (a token text class).

export function BallSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* circle through two arcs with a 0.5 wobble offset: the hand drawn feel */}
      <path d="M23.5 5.5a18 18 0 0 1 .5 36a18 18 0 0 1 0-36" />
      <path d="m24 15.5 6.5 4.7-2.5 7.6h-8l-2.5-7.6Z" />
      <path d="M24 15.5v-5M30.5 20.2l4.5-3.2M17.5 20.2 13 17M18 27.8l-3.5 5.5M30 27.8l3.5 5.5" />
    </svg>
  )
}

export function BootsSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* left boot */}
      <path d="M7 31.5v-10c.2-2.5 1.8-3.8 4-4.5l4.5 2.5 6 2.5c2 1 3 2.5 3 4.5v2.5c0 1-.6 2-2 2H8c-.6 0-1-.4-1-1" />
      <path d="M11.5 19.5 15 22M15 18.5 18.5 21" />
      <path d="M11 34v-2.5M17 34v-2.5M23 34v-2.5" />
      {/* right boot, mirrored and a touch lower */}
      <path d="M41 34.5v-10c-.2-2.5-1.8-3.8-4-4.5l-4.5 2.5-6 2.5c-2 1-3 2.5-3 4.5v2.5c0 1 .6 2 2 2h10c.6 0 1-.4 1-1" />
      <path d="M36.5 22.5 33 25M33 21.5 29.5 24" />
      <path d="M37 37v-2.5M31 37v-2.5M25 37v-2.5" />
    </svg>
  )
}

export function WhistleSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="40" cy="12" r="4" />
      <path d="M36.5 14.5 31 19" />
      <path d="M31 19c-2-1.5-4.5-2-7-1.5C16 19 10 24.5 7 31c-1 2.5.5 5 3.5 5H25c5.5 0 9.5-4 10.5-9 .5-2.5-.5-5.5-4.5-8" />
      <circle cx="19" cy="28.5" r="2.8" />
      <path d="M13.5 20.5c-3 2-5.5 4.5-7 7.5" />
    </svg>
  )
}

export function GoalNetSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* back of the net */}
      <path d="M11 36.5 14.5 10M37 36.5 33.5 10M14.5 10.5h19" />
      {/* front frame, slightly uneven for the pen line */}
      <path d="M6 39.5V15c.3-1.5 1.2-2.4 2.5-2.5h31c1.3.1 2.2 1 2.5 2.5v24" />
      <path d="M6 39.5c5 .8 9 .8 14 .5s14 .5 22 -.5" />
      {/* mesh */}
      <path d="M15.5 14.5 17 38M24 14v24.5M32.5 14.5 31 38M8 22.5h32M7.5 31h33" />
    </svg>
  )
}

export function SparkleSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* four-point stars: concave arcs drawn with q curves */}
      <path d="M22 4c1 7.5 3.5 10 11 11-7.5 1-10 3.5-11 11-1-7.5-3.5-10-11-11 7.5-1 10-3.5 11-11" />
      <path d="M37.5 26c.5 4 1.9 5.4 5.9 5.9-4 .5-5.4 1.9-5.9 5.9-.5-4-1.9-5.4-5.9-5.9 4-.5 5.4-1.9 5.9-5.9" />
      <path d="M11.5 30c.4 2.8 1.3 3.7 4 4.1-2.7.4-3.6 1.3-4 4-.4-2.7-1.3-3.6-4-4 2.7-.4 3.6-1.3 4-4.1" />
    </svg>
  )
}

export function WarningCardSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <g transform="rotate(-8 24 24)">
        <path d="M12.5 7h22c1.3.3 2.2 1.3 2.5 2.5v28c-.3 1.2-1.2 2.2-2.5 2.5h-22c-1.3-.3-2.2-1.3-2.5-2.5v-28c.3-1.2 1.2-2.2 2.5-2.5" />
        <path d="M24 14.5v10.5M24 31.5v-.5" />
      </g>
    </svg>
  )
}

// Outlined letter strokes (no <text>): no font dependency, no hydration risk.
// Each glyph is drawn in an 18x24 box and stepped along the baseline.
export function GoaaallBannerSticker(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 190 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* streamers behind the word */}
      <path d="M4 20c8 5 15 4 22-2M6 44c8 3 15 1 21-5" strokeWidth={2.5} />
      <path
        d="M186 20c-8 5-15 4-22-2M184 44c-8 3-15 1-21-5"
        strokeWidth={2.5}
      />
      <g transform="translate(30 6) rotate(-2 65 12)">
        {/* G */}
        <path d="M18 6C14 2 7 2 4 7c-3 5-1 13 5 15 6 2 10-1 10-6H12" />
        {/* O */}
        <path
          d="M37 3c-6 0-9 5-9 11s3 11 9 11 9-5 9-11-3-11-9-11"
          transform="translate(0 1)"
        />
        {/* O */}
        <path d="M58 4c-6 0-9 5-9 11s3 11 9 11 9-5 9-11-3-11-9-11" />
        {/* A */}
        <path d="m68 26 8-22 8 22M71 19h10" />
        {/* A */}
        <path d="m88 26 8-22 8 22M91 19h10" />
        {/* L */}
        <path d="M108 3v23h11" />
        {/* L */}
        <path d="M123 3v23h11" />
      </g>
    </svg>
  )
}
