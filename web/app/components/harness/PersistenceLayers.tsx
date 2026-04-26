"use client";

import { useState } from "react";

type Layer = {
  id: string;
  name: string;
  location: string;
  scope: string;
  trigger: string;
  halfLife: string;
  color: string;
  widthPct: number;
};

const LAYERS: Layer[] = [
  {
    id: "user",
    name: "User memory",
    location: "~/.claude/.../memory/*.md",
    scope: "cross-repo",
    trigger: "always loaded",
    halfLife: "no explicit half-life",
    color: "#B8A9C9",
    widthPct: 92,
  },
  {
    id: "claudemd",
    name: "CLAUDE.md",
    location: "repo root + nested",
    scope: "project",
    trigger: "always loaded",
    halfLife: "as long as in repo",
    color: "#7B9EB8",
    widthPct: 78,
  },
  {
    id: "wiki",
    name: "Harness wiki",
    location: "harness/wiki/*.md",
    scope: "project",
    trigger: "keyword-triggered (SessionStart surface)",
    halfLife: "last_verified + half_life_days (tracked)",
    color: "#D4A853",
    widthPct: 64,
  },
  {
    id: "research",
    name: "Research notes",
    location: "harness/research/*.md",
    scope: "project",
    trigger: "explicit read",
    halfLife: "citations pinned",
    color: "#6BA368",
    widthPct: 48,
  },
];

export default function PersistenceLayers() {
  const [active, setActive] = useState<string | null>("wiki");

  const activeLayer = active ? LAYERS.find((l) => l.id === active) ?? null : null;

  return (
    <figure className="my-8">
      <div className="max-w-3xl mx-auto space-y-2">
        {LAYERS.map((l, i) => {
          const isActive = active === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onMouseEnter={() => setActive(l.id)}
              onClick={() => setActive(isActive ? null : l.id)}
              className={`block w-full text-left rounded-md border px-4 py-3 transition-all ${
                isActive
                  ? "bg-stone-900/80 border-stone-600"
                  : "bg-stone-950/40 border-stone-800 hover:border-stone-700"
              }`}
              style={{
                width: `${l.widthPct}%`,
                marginLeft: `${(100 - l.widthPct) / 2}%`,
                borderLeftWidth: "4px",
                borderLeftColor: l.color,
              }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-xs text-stone-600 font-mono">L{i + 1}</span>
                <span className="text-sm font-semibold" style={{ color: l.color }}>
                  {l.name}
                </span>
                <code className="text-[11px] text-stone-500 font-mono">{l.location}</code>
                <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded border border-stone-700 text-stone-500">
                  {l.scope}
                </span>
              </div>
              {isActive && (
                <div className="mt-2 pt-2 border-t border-stone-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-stone-600 uppercase text-[10px] tracking-wide">trigger</div>
                    <div className="text-stone-300 mt-0.5">{l.trigger}</div>
                  </div>
                  <div>
                    <div className="text-stone-600 uppercase text-[10px] tracking-wide">durability</div>
                    <div className="text-stone-300 mt-0.5">{l.halfLife}</div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto mt-4 text-xs text-stone-500 text-center italic px-4">
        {activeLayer
          ? `${activeLayer.name}: ${activeLayer.scope} · ${activeLayer.trigger}`
          : "Hover a layer. Only the harness wiki is project-scoped, cross-loop, committable, and keyword-triggered (Article VII)."}
      </div>
    </figure>
  );
}
