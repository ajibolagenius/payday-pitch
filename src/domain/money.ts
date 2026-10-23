// Money lives in exact integer minor units (kobo), never floats. Spec 0001.
// This seed module carries only the amount type and the minor-unit formatter;
// feature 3 (data model) owns the rest of the money maths.

export type Amount = {
  kobo: number
  /** ISO 4217 code as stored by the schema's char(3) columns. */
  currency: string
}

// One formatter per currency code, built on demand: the schema allows any
// ISO code, so nothing here may assume naira.
const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: string): Intl.NumberFormat {
  let built = formatters.get(currency)
  if (!built) {
    built = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    })
    formatters.set(currency, built)
  }
  return built
}

export function formatKobo(amount: Amount): string {
  return formatter(amount.currency).format(amount.kobo / 100)
}

const plain = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Screen reader form: "45,000 naira", never the raw "₦" glyph. Floored to
// whole units: a stored amount must never be announced larger than it is.
export function formatKoboSpoken(amount: Amount): string {
  const unit = amount.currency === "NGN" ? "naira" : amount.currency
  return `${plain.format(Math.floor(amount.kobo / 100))} ${unit}`
}
