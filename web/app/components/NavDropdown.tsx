"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface DropdownGroup {
  label: string;
  items: { href: string; label: string; hint?: string }[];
}

export interface DropdownItem {
  id: string;
  label: string;
  shortLabel: string;
  activePrefixes: string[];
  groups: DropdownGroup[];
}

export function NavDropdown({ item, pathname }: { item: DropdownItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = item.activePrefixes.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 whitespace-nowrap ${
          isActive || open
            ? "text-amber-300 bg-amber-400/10 border border-amber-400/20"
            : "text-stone-400 hover:text-amber-300 hover:bg-white/[0.04] border border-transparent"
        }`}
      >
        <span className="hidden sm:inline">{item.label}</span>
        <span className="sm:hidden">{item.shortLabel}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 3 L5 7 L9 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 z-[60] w-72 md:w-80 rounded-xl border border-amber-400/30 bg-[#141414] ring-1 ring-amber-400/10 shadow-2xl shadow-amber-900/30 overflow-hidden"
        >
          <div className="max-h-[70vh] overflow-y-auto py-2">
            {item.groups.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? "mt-1 pt-2 border-t border-white/[0.06]" : ""}>
                <div className="px-4 py-1 text-[10px] font-semibold tracking-wider uppercase text-amber-400/70">
                  {group.label}
                </div>
                {group.items.map((entry) => {
                  const active = pathname === entry.href || pathname.startsWith(entry.href + "/");
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-2 transition-colors ${
                        active
                          ? "bg-amber-400/10 border-l-2 border-amber-400"
                          : "hover:bg-amber-400/[0.06] border-l-2 border-transparent"
                      }`}
                    >
                      <div className={`text-sm ${active ? "text-amber-200 font-medium" : "text-stone-200"}`}>
                        {entry.label}
                      </div>
                      {entry.hint ? <div className="text-xs text-stone-500 mt-0.5">{entry.hint}</div> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
