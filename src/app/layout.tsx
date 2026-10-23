import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import { SwRegister } from "@/components/sw-register"
import { Providers } from "@/components/providers"
import { PITCH_GREEN } from "@/lib/brand"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Payday Pitch",
  description:
    "Build wealth from your salary, payday by payday. Line it up like a football team: bills covered, debts cleared, the rest working for you.",
}

export const viewport: Viewport = {
  themeColor: PITCH_GREEN,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} flex min-h-full flex-col font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <SwRegister version={process.env.GIT_SHA ?? "dev"} />
      </body>
    </html>
  )
}
