import { readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

// Spec 0009, AC-3: the vendored payload is a product budget, not a nicety.
// This app has to open fast on a Nigerian data plan, so the four Fontshare
// families together stay under 350 kB.
const FONT_DIR = fileURLToPath(new URL("../app/styles/fonts", import.meta.url))
const BUDGET_BYTES = 350 * 1024

describe("vendored fonts", () => {
  it("fit the 350 kB payload budget", () => {
    const files = readdirSync(FONT_DIR).filter((name) =>
      name.endsWith(".woff2"),
    )
    const total = files.reduce(
      (sum, name) => sum + statSync(`${FONT_DIR}/${name}`).size,
      0,
    )
    expect(total).toBeLessThan(BUDGET_BYTES)
  })

  it("ship all four families plus the Switzer italic cut", () => {
    const files = readdirSync(FONT_DIR).filter((name) =>
      name.endsWith(".woff2"),
    )
    expect(files).toEqual(
      expect.arrayContaining([
        "melodrama-variable.woff2",
        "switzer-variable.woff2",
        "switzer-italic-400.woff2",
        "tabular-variable.woff2",
        "teko-variable.woff2",
      ]),
    )
  })
})
