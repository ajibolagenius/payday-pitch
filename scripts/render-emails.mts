// Renders the auth emails to supabase/templates/*.html (spec 0006 AC-10).
// The Supabase placeholders ({{ .ConfirmationURL }}, {{ .RecoveryURL }}) pass
// through as literal hrefs; local Supabase serves the files, production gets
// the same HTML pasted into the dashboard. Run: pnpm emails:render
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { render } from "@react-email/render"

import { ConfirmationEmail } from "../src/emails/confirmation-email"
import { RecoveryEmail } from "../src/emails/recovery-email"

// Email clients need inline hex; these mirror the design tokens in
// src/app/globals.css (--pitch-green, --paper, --ink, --card, --muted-foreground).
const palette = {
  pitch: "#1b4638",
  ink: "#141414",
  paper: "#fafafa",
  card: "#ffffff",
  muted: "#71717a",
  onPitch: "#ffffff",
}

const outDir = path.resolve(import.meta.dirname, "../supabase/templates")
await mkdir(outDir, { recursive: true })

const confirmation = await render(ConfirmationEmail(palette), { pretty: true })
await writeFile(path.join(outDir, "confirmation.html"), confirmation)

const recovery = await render(RecoveryEmail(palette), { pretty: true })
await writeFile(path.join(outDir, "recovery.html"), recovery)

console.warn("rendered supabase/templates/confirmation.html and recovery.html")
