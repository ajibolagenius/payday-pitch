// Renders the auth emails to supabase/templates/*.html (spec 0006 AC-10).
// The Supabase placeholders ({{ .ConfirmationURL }}, {{ .RecoveryURL }}) pass
// through as literal hrefs; local Supabase serves the files, production gets
// the same HTML pasted into the dashboard. Run: pnpm emails:render
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { render } from "@react-email/render"

import { ConfirmationEmail } from "../src/emails/confirmation-email"
import { RecoveryEmail } from "../src/emails/recovery-email"
import { BRAND } from "../src/lib/brand-palette"

// Email clients need inline hex, so the values come from the one brand palette
// (src/lib/brand-palette.ts), which mirrors the tokens in src/app/globals.css.
const palette = BRAND

const outDir = path.resolve(import.meta.dirname, "../supabase/templates")
await mkdir(outDir, { recursive: true })

const confirmation = await render(ConfirmationEmail(palette), { pretty: true })
await writeFile(path.join(outDir, "confirmation.html"), confirmation)

const recovery = await render(RecoveryEmail(palette), { pretty: true })
await writeFile(path.join(outDir, "recovery.html"), recovery)

console.warn("rendered supabase/templates/confirmation.html and recovery.html")
