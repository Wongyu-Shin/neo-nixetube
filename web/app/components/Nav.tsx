"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavDropdown, type DropdownItem } from "./NavDropdown";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/glossary", label: "Glossary" },
  { href: "/bridges", label: "Bridges" },
  { href: "/bootstrap", label: "Phase 0" },
  { href: "/path-frit", label: "Path 1: Frit" },
  { href: "/path-roomtemp", label: "Path 2: Room-Temp" },
  { href: "/simulation", label: "Simulation" },
  { href: "/action-plan", label: "Action Plan" },
  { href: "/bom", label: "BOM" },
];

const HARNESS_DROPDOWN: DropdownItem = {
  id: "harness",
  label: "Harness",
  shortLabel: "Hrns",
  activePrefixes: ["/harness"],
  groups: [
    {
      label: "Harness Docs",
      items: [
        { href: "/harness", label: "Overview", hint: "axis matrix + 28 features" },
        { href: "/harness/constitution", label: "Constitution", hint: "9 Articles" },
        { href: "/harness/flow", label: "UX Flow", hint: "entry → completion" },
        { href: "/harness/wiki", label: "LLM-Wiki", hint: "keyword-triggered knowledge" },
        { href: "/harness/catalog", label: "Catalog", hint: "all 29 entries" },
      ],
    },
  ],
};

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 flex-wrap">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap group">
          <span className="text-2xl transition-transform group-hover:scale-110">&#x2609;</span>
          <span className="font-bold text-lg bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            neo-nixietube
          </span>
        </Link>
        <div className="flex gap-0.5 items-center flex-wrap">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "text-amber-300 bg-amber-400/10 border border-amber-400/20"
                    : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <NavDropdown item={HARNESS_DROPDOWN} pathname={pathname} />
        </div>
      </div>
    </nav>
  );
}
