import type { NextConfig } from "next"

// cacheComponents stays off (spec 0001): signed in data is never cached on the server.
const nextConfig: NextConfig = {
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
