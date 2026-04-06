import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "neo-nixetube",
  description: "50년간 발전이 멈춘 닉시관에 현대 과학의 '연결되지 않은 지식'을 적용하는 PoC 프로젝트",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-950 text-stone-100">
        <nav className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur border-b border-stone-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto">
            <Link href="/" className="text-amber-400 font-bold text-lg whitespace-nowrap flex items-center gap-2">
              <span className="text-2xl">&#x2609;</span> neo-nixetube
            </Link>
            <div className="flex gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-sm text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-stone-800 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-stone-500 text-sm">
            <p>neo-nixetube &mdash; Disconnected Knowledge for Nixie Tube Innovation</p>
            <p className="mt-1">Seoul, South Korea &middot; 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
