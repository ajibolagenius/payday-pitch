import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DesignSystemDemo } from "./design-system-demo"

export const metadata: Metadata = {
  title: "Design system · Payday Pitch",
  robots: { index: false, follow: false },
}

// Dev only proof page for spec 0005: never served from a production build.
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <DesignSystemDemo />
}
