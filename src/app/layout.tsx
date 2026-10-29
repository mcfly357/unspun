import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Lora } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TopicNav } from "@/components/TopicNav";
import { ReadingModeProvider } from "@/components/ReadingMode";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Unspun — news, minus the spin",
  description: "Stories synthesized from many independent outlets, with framing and source identity stripped out.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-serif min-h-screen flex flex-col bg-paper text-ink antialiased">
        <ReadingModeProvider>
          <header className="sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-3 justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo />
              </Link>
              <div className="flex items-center gap-x-8 gap-y-3 flex-wrap">
                <Suspense fallback={null}>
                  <TopicNav />
                </Suspense>
                <Link
                  href="/how-it-works"
                  className="font-sans text-sm text-ink-soft hover:text-ink transition-colors whitespace-nowrap"
                >
                  How we verify
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-rule">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2 text-ink-soft">
                <svg viewBox="0 0 100 100" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 25.5 70.6 A 32 32 0 1 1 74.5 70.6" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 50 50 L 82 82" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
                </svg>
                <span className="font-sans text-xs font-semibold">Unspun</span>
              </div>
              <p className="font-sans text-xs text-ink-soft leading-relaxed max-w-md">
                Every story is synthesized from multiple independent news outlets spanning the
                political spectrum. Outlet names, bylines, and political leanings are withheld by
                default — only claims corroborated across sources are reported as fact. Disputed
                and single-source claims are labeled as such.
              </p>
            </div>
          </footer>
        </ReadingModeProvider>
      </body>
    </html>
  );
}
