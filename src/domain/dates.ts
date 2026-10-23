// "This month" is Lagos month (spec 0001): a UTC evening is already tomorrow
// in Nigeria, so the period is computed from Africa/Lagos wall time, never
// from the server UTC clock. Pure TS, no imports.
// The period string ("YYYY-MM-01") matches the `match.period` date column
// (day 1 enforced by a check constraint, spec 0004 AC-6).

const LAGOS = "Africa/Lagos"

export function currentLagosPeriod(now: Date = new Date()): string {
  const ym = new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS,
    year: "numeric",
    month: "2-digit",
  }).format(now)
  return `${ym}-01`
}

// Days in the month a period ("YYYY-MM-01") names, for clamping a payday
// day of 29 to 31 in a shorter month (feature 10 consumes this).
export function daysInLagosMonth(period: string): number {
  const [year, month] = period.split("-").map(Number)
  const next = month === 12 ? [year + 1, 1] : [year, month + 1]
  const first = new Date(Date.UTC(year, month - 1, 1))
  const following = new Date(Date.UTC(next[0], next[1] - 1, 1))
  return Math.round((following.getTime() - first.getTime()) / 86_400_000)
}

export function clampPaydayDay(day: number, period: string): number {
  return Math.min(day, daysInLagosMonth(period))
}
