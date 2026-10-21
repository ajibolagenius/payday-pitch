// Money lives in exact integer minor units (kobo), never floats. Spec 0001.
// This seed module carries only the amount type and the kobo formatter;
// feature 3 (data model) owns the rest of the money maths.

export type Amount = {
  kobo: number
  currency: "NGN" | (string & {})
}

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
})

export function formatKobo(amount: Amount): string {
  return ngn.format(amount.kobo / 100)
}
