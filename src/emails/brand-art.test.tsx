import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { render } from "@react-email/render"
import { describe, expect, it } from "vitest"

import { AuthEmail } from "@/emails/auth-email"
import { ConfirmationEmail } from "@/emails/confirmation-email"
import { BRAND } from "@/lib/brand-palette"

// Spec 0010 AC-6 and AC-9, the email path. Mail clients cannot read CSS
// variables and cannot fetch a stylesheet, so the brand art must arrive as
// inline SVG painted with the BRAND literals, and the templates Supabase serves
// must be what these components render today.

const count = (html: string, re: RegExp) => [...html.matchAll(re)].length

async function rendered() {
  return render(ConfirmationEmail(BRAND))
}

describe("the auth email brand block (AC-6)", () => {
  it("opens with the lockup, named for screen readers", async () => {
    const html = await rendered()
    expect(html).toContain('aria-label="Payday Pitch"')
    expect(count(html, /<svg/g)).toBe(2)
  })

  it("paints the forest chip, gold dots and light keeper from the palette", async () => {
    const html = await rendered()
    expect(html).toContain(`fill="${BRAND.pitch}"`)
    expect(html).toContain(`fill="${BRAND.gold}"`)
    expect(html).toContain(`fill="${BRAND.card}"`)
  })

  it("draws eleven dots in the header chip and six in the footer mark", async () => {
    const html = await rendered()
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) ?? []
    expect(svgs).toHaveLength(2)
    expect(count(svgs[0]!, /<circle/g)).toBe(11)
    expect(count(svgs[1]!, /<circle/g)).toBe(6)
  })

  it("draws the wordmark as paths, one per character, so no webfont is needed", async () => {
    const html = await rendered()
    const lockup = (html.match(/<svg[\s\S]*?<\/svg>/) ?? [])[0]!
    expect(count(lockup, /<path/g)).toBe(12)
    expect(count(lockup, /<text/g)).toBe(0)
  })

  it("keeps the lockup proportions on the 736 by 160 art", async () => {
    const html = await rendered()
    const lockup = (html.match(/<svg[\s\S]*?<\/svg>/) ?? [])[0]!
    const width = Number(/width="(\d+)"/.exec(lockup)?.[1])
    const height = Number(/height="(\d*\.?\d+)"/.exec(lockup)?.[1])
    expect(width).toBe(180)
    expect(height).toBeCloseTo((180 * 160) / 736, 1)
  })

  it("carries no CSS variable, which a mail client cannot read", async () => {
    const html = await rendered()
    expect(html).not.toMatch(/var\(--/)
  })

  it("keeps the footer mark decorative while the header lockup names the brand", async () => {
    const html = await rendered()
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) ?? []
    expect(svgs[1]).toContain("aria-hidden")
    expect(svgs[0]).not.toContain("aria-hidden")
  })
})

describe("the templates Supabase serves (AC-9)", () => {
  for (const name of ["confirmation", "recovery"] as const) {
    const file = readFileSync(
      fileURLToPath(
        new URL(`../../supabase/templates/${name}.html`, import.meta.url),
      ),
      "utf8",
    )

    it(`${name}.html already carries the formation brand`, () => {
      expect(count(file, /<circle/g)).toBe(17)
      expect(file).toContain(`fill="${BRAND.gold}"`)
      expect(file).toContain('aria-label="Payday Pitch"')
    })

    it(`${name}.html holds no trace of the old ball`, () => {
      expect(file).not.toContain("M256 206")
    })
  }
})

describe("the shared email shell", () => {
  it("keeps the call to action link on the Supabase placeholder, not a live URL", async () => {
    const html = await render(
      AuthEmail({
        ...BRAND,
        heading: "Recover your account",
        body: "Reset your password.",
        cta: "Reset password",
        href: "{{ .ConfirmationURL }}",
      }),
    )
    expect(html).toContain('href="{{ .ConfirmationURL }}"')
    expect(html).toContain("Recover your account")
  })

  it("paints the pitch band with the brand forest", async () => {
    const html = await rendered()
    expect(html).toContain(BRAND.pitch)
  })
})
