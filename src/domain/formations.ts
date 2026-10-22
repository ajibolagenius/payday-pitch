// The six built-in formations. Pure data, the seed source for the
// formation_shape and formation_position tables (spec 0004, AC-4).
// basis_points are hundredths of a percent and must sum to 10000 per shape.
// Zone rule: DEF spots always share the real fixed cost total (the money
// engine in feature 6 splits defense by headcount, not by basis points);
// a DEF shape zone share below a user's costs renders that shape unable
// to cover, and the create action refuses it.

export type FormationRole = "GK" | "DEF" | "MID" | "FWD" | "BENCH"

export type FormationPosition = {
  role: FormationRole
  label: string
  basisPoints: number
}

export type Formation = {
  name: string
  style: string
  whenToPlay: string
  positions: FormationPosition[]
}

export const FORMATIONS: Formation[] = [
  {
    name: "4-4-2",
    style: "Balanced classic",
    whenToPlay: "Your default shape when life is steady.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 1000 },
      { role: "DEF", label: "Right Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Left Back", basisPoints: 1000 },
      { role: "MID", label: "Right Mid", basisPoints: 750 },
      { role: "MID", label: "Central Mid", basisPoints: 750 },
      { role: "MID", label: "Central Mid", basisPoints: 750 },
      { role: "MID", label: "Left Mid", basisPoints: 750 },
      { role: "FWD", label: "Striker", basisPoints: 750 },
      { role: "FWD", label: "Second Striker", basisPoints: 750 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
    ],
  },
  {
    name: "4-3-3",
    style: "Attacking",
    whenToPlay:
      "When your costs are covered and you want to build wealth faster.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 500 },
      { role: "DEF", label: "Right Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Left Back", basisPoints: 1000 },
      { role: "MID", label: "Defensive Mid", basisPoints: 667 },
      { role: "MID", label: "Central Mid", basisPoints: 666 },
      { role: "MID", label: "Attacking Mid", basisPoints: 667 },
      { role: "FWD", label: "Right Wing", basisPoints: 1000 },
      { role: "FWD", label: "Striker", basisPoints: 1000 },
      { role: "FWD", label: "Left Wing", basisPoints: 1000 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
    ],
  },
  {
    name: "3-5-2",
    style: "Midfield heavy",
    whenToPlay:
      "When upskilling and short term goals are the season's priority.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 500 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "MID", label: "Right Wing-Back", basisPoints: 700 },
      { role: "MID", label: "Debt Repayment", basisPoints: 700 },
      { role: "MID", label: "Upskilling", basisPoints: 1200 },
      { role: "MID", label: "Short-Term Goals", basisPoints: 700 },
      { role: "MID", label: "Left Wing-Back", basisPoints: 700 },
      { role: "FWD", label: "Striker", basisPoints: 1000 },
      { role: "FWD", label: "Second Striker", basisPoints: 1000 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
    ],
  },
  {
    name: "4-2-3-1",
    style: "Steady builder",
    whenToPlay:
      "When you want quiet growth: debt and goals on the double pivot, one striker investing.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 1000 },
      { role: "DEF", label: "Right Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Left Back", basisPoints: 1000 },
      { role: "MID", label: "Debt Repayment", basisPoints: 1000 },
      { role: "MID", label: "Upskilling", basisPoints: 1000 },
      { role: "MID", label: "Right Attacking Mid", basisPoints: 334 },
      { role: "MID", label: "Attacking Mid", basisPoints: 333 },
      { role: "MID", label: "Left Attacking Mid", basisPoints: 333 },
      { role: "FWD", label: "Striker", basisPoints: 1500 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
    ],
  },
  {
    name: "5-3-2",
    style: "Defensive",
    whenToPlay:
      "When your fixed costs are high and the month needs to bend around them.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 500 },
      { role: "DEF", label: "Right Wing-Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Centre Back", basisPoints: 1000 },
      { role: "DEF", label: "Left Wing-Back", basisPoints: 1000 },
      { role: "MID", label: "Debt Repayment", basisPoints: 834 },
      { role: "MID", label: "Upskilling", basisPoints: 833 },
      { role: "MID", label: "Short-Term Goals", basisPoints: 833 },
      { role: "FWD", label: "Striker", basisPoints: 750 },
      { role: "FWD", label: "Second Striker", basisPoints: 750 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 500 },
    ],
  },
  {
    name: "5-4-1",
    style: "Park the Bus",
    whenToPlay:
      "When a debt must fall: everything shields the defense and the midfield clears it.",
    positions: [
      { role: "GK", label: "Emergency Fund", basisPoints: 200 },
      { role: "DEF", label: "Right Wing-Back", basisPoints: 1040 },
      { role: "DEF", label: "Centre Back", basisPoints: 1040 },
      { role: "DEF", label: "Centre Back", basisPoints: 1040 },
      { role: "DEF", label: "Centre Back", basisPoints: 1040 },
      { role: "DEF", label: "Left Wing-Back", basisPoints: 1040 },
      { role: "MID", label: "Debt Repayment", basisPoints: 2500 },
      { role: "MID", label: "Upskilling", basisPoints: 500 },
      { role: "MID", label: "Short-Term Goals", basisPoints: 500 },
      { role: "MID", label: "Spare Mid", basisPoints: 500 },
      { role: "FWD", label: "Target Man", basisPoints: 400 },
      { role: "BENCH", label: "Guilt-Free Sub", basisPoints: 200 },
    ],
  },
]

export function sumBasisPoints(formation: Formation): number {
  return formation.positions.reduce((total, p) => total + p.basisPoints, 0)
}
