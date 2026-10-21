import type { NextConfig } from "next"

// cacheComponents stays off (spec 0001): signed in data is never cached on the server.
const nextConfig: NextConfig = {
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
