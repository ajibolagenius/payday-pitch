import type { NextConfig } from "next"
import { execFileSync } from "node:child_process"

// The service worker cache version (spec 0001). Host-independent: any CI or
// machine can set GIT_SHA, otherwise it is read from the repo at build time.
function gitSha(): string {
  if (process.env.GIT_SHA) return process.env.GIT_SHA
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim()
  } catch {
    return "dev"
  }
}

// cacheComponents stays off (spec 0001): signed in data is never cached on the server.
const nextConfig: NextConfig = {
  env: { GIT_SHA: gitSha() },
  // The local Supabase stack pins SITE_URL to http://127.0.0.1:3000 (session
  // cookies and the email redirect allow list are set for that exact host).
  // Without this entry the dev server refuses its own assets on that host, so
  // pages render but never hydrate.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
