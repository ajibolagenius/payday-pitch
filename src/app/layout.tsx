import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { SwRegister } from "@/components/sw-register"
import { Providers } from "@/components/providers"
import { BRAND } from "@/lib/brand-palette"
import "./globals.css"

// Spec 0009 type contract: four Fontshare faces, one variable file per family
// plus Switzer's roman italic cut (variable files cannot synthesize it).
const heading = localFont({
  variable: "--font-melodrama",
  display: "swap",
  fallback: ["Georgia", "serif"],
  src: [
    {
      path: "./styles/fonts/melodrama-variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
})

const sans = localFont({
  variable: "--font-switzer",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  src: [
    {
      path: "./styles/fonts/switzer-variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./styles/fonts/switzer-italic-400.woff2",
      weight: "400",
      style: "italic",
    },
  ],
})

// Tabular is the only vendored face with a naira glyph, and the browser hands
// U+20A6 to any later family in the stack, which paints it as two overlapping
// marks. Keep this list to the one family so amounts own their own sign.
const money = localFont({
  variable: "--font-tabular",
  display: "swap",
  adjustFontFallback: false,
  src: [
    {
      path: "./styles/fonts/tabular-variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
})

const accent = localFont({
  variable: "--font-teko",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  src: [
    {
      path: "./styles/fonts/teko-variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
})

export const metadata: Metadata = {
  title: "Payday Pitch",
  description:
    "Build wealth from your salary, payday by payday. Line it up like a football team: bills covered, debts cleared, the rest working for you.",
}

export const viewport: Viewport = {
  themeColor: BRAND.forest,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${heading.variable} ${sans.variable} ${money.variable} ${accent.variable}`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
        <SwRegister version={process.env.GIT_SHA ?? "dev"} />
      </body>
    </html>
  )
}
