import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "neo-nixetube",
  description: "50년간 발전이 멈춘 닉시관에 현대 과학의 '연결되지 않은 지식'을 적용하는 PoC 프로젝트",
  themeColor: "#0D0D0D",
};

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/glossary", label: "Glossary" },
  { href: "/bridges", label: "Bridges" },
  { href: "/path-frit", label: "Path 1: Frit" },
  { href: "/path-roomtemp", label: "Path 2: Room-Temp" },
  { href: "/simulation", label: "Simulation" },
  { href: "/action-plan", label: "Action Plan" },
  { href: "/bom", label: "BOM" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0D0D0D] text-stone-100 font-[family-name:var(--font-space-grotesk)]">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto">
            <Link href="/" className="flex items-center gap-2 whitespace-nowrap group">
              <span className="text-2xl transition-transform group-hover:scale-110">&#x2609;</span>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                neo-nixetube
              </span>
            </Link>
            <div className="flex gap-0.5">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-[13px] text-stone-400 hover:text-amber-300 hover:bg-white/[0.04] transition-all duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-stone-600 text-sm">
            <p className="font-[family-name:var(--font-space-grotesk)]">
              neo-nixetube &mdash; Disconnected Knowledge for Nixie Tube Innovation
            </p>
            <p className="mt-1">Seoul, South Korea &middot; 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
