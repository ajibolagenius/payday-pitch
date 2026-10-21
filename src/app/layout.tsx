import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payday Pitch",
  description: "Build wealth from your salary, payday by payday. Line it up like a football team: bills covered, debts cleared, the rest working for you.",
};

export const viewport: Viewport = {
  themeColor: "#1B4638",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SwRegister version={process.env.VERCEL_GIT_COMMIT_SHA ?? "dev"} />
      </body>
    </html>
  );
}
