import type { MetadataRoute } from "next";

// Placeholder values until the design system spec (feature 4) replaces them.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Payday Pitch",
    short_name: "Payday Pitch",
    description: "Turn your monthly salary into a football lineup.",
    start_url: "/app",
    display: "standalone",
    background_color: "#1B4638",
    theme_color: "#1B4638",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
