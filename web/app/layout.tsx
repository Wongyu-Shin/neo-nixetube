import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import ScrollToTop from "./components/ScrollToTop";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "neo-nixietube",
  description: "50년간 발전이 멈춘 닉시관에 현대 과학의 '연결되지 않은 지식'을 적용하는 PoC 프로젝트",
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
};


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
        {/* Navigation — client component with active state */}
        <Nav />
        <ScrollToTop />

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-stone-600 text-sm">
            <p className="font-[family-name:var(--font-space-grotesk)]">
              neo-nixietube &mdash; Disconnected Knowledge for Nixie Tube Innovation
            </p>
            <p className="mt-1">Seoul, South Korea &middot; 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
