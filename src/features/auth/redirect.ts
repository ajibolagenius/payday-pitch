// Open redirect defense (spec 0006 AC-9, key invariants). A `next` value is
// honored only as a site-relative path: it starts with `/`, its second
// character is neither `/` nor `\` (so `//host` and `/\host` fail), and it
// carries no scheme. Anything else falls back to the default target.
const DEFAULT_TARGET = "/app"

export function isSafeRelativePath(
  value: string | null | undefined,
): value is string {
  if (!value || !value.startsWith("/")) return false
  const second = value[1]
  if (second === "/" || second === "\\") return false
  return true
}

export function safeRedirectPath(next: string | null | undefined): string {
  return isSafeRelativePath(next) ? next : DEFAULT_TARGET
}

// Email links never carry a destination. Any absolute target an attacker might
// plant is accepted only if it exactly matches this environment's own origin.
export function resolveRedirect(
  next: string | null | undefined,
  siteUrl: string,
): string {
  if (isSafeRelativePath(next)) return next
  if (next) {
    try {
      const target = new URL(next)
      if (target.origin === new URL(siteUrl).origin) {
        // Re-check the stripped path: URL parsing keeps a leading double slash,
        // so "http://<own host>//evil.example" would otherwise hand back the
        // protocol-relative "//evil.example" and leave the site.
        const path = target.pathname + target.search + target.hash
        if (isSafeRelativePath(path)) return path
      }
    } catch {
      // not a URL and not a safe path: fall through
    }
  }
  return DEFAULT_TARGET
}
