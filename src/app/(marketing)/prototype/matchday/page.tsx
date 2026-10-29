import type { Metadata } from "next"

import { MatchdaySample } from "@/features/matchday-prototype/matchday-sample"

// Public sample study (spec 0011): fictional fixture only, kept out of search
// and off any sitemap. It is a test of the idea, not a released feature.
export const metadata: Metadata = {
  title: "Matchday sample · Payday Pitch",
  description:
    "A sample money plan with invented figures. Nothing is saved, sent or moved.",
  robots: { index: false, follow: false },
}

export default function MatchdayPrototypePage() {
  return <MatchdaySample />
}
