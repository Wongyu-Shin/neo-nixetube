"use client";

import { useState } from "react";

type Tier = {
  id: string;
  level: "L0" | "L1" | "L2";
  label: string;
  color: string;
  behavior: string;
  examples: string[];
  carveOut: boolean;
};

const TIERS: Tier[] = [
  {
    id: "l0",
    level: "L0",
    label: "read / scoped edit",
    color: "#6BA368",
    behavior: "Silent. No operator signal.",
    examples: ["Read", "Grep / Glob", "Edit files in Scope", "Run Verify"],
    carveOut: false,
  },
  {
    id: "l1",
    level: "L1",
    label: "reversible mutation",
    color: "#D4A853",
    behavior: "Notify in statusline + 30s auto-approve window. No pause.",
    examples: ["rm inside Scope", "package install", "git commit (non-force)", "Write new file"],
    carveOut: false,
  },
  {
    id: "l2",
    level: "L2",
    label: "irreversible / out-of-scope",
    color: "#C17B5E",
    behavior: "Pause loop, write checkpoint, require explicit operator keystroke. Logged to report.mdx.",
    examples: ["git push --force", "rm outside Scope", "sudo", "release publish", "DELETE on prod"],
    carveOut: true,
  },
];

export default function SafetyTiers() {
  const [active, setActive] = useState<string>("l2");

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIERS.map((t) => {
          const open = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onMouseEnter={() => setActive(t.id)}
              onClick={() => setActive(t.id)}
              className={`text-left rounded-lg border p-4 transition-all bg-stone-950/40 ${
                open ? "border-stone-500 shadow-[0_0_24px_rgba(255,255,255,0.05)]" : "border-stone-800"
              }`}
              style={open ? { borderColor: t.color } : undefined}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono text-xl font-bold"
                  style={{ color: t.color }}
                >
                  {t.level}
                </span>
                <span className="text-sm text-stone-300">{t.label}</span>
                {t.carveOut && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-[#C17B5E]/50 text-[#C17B5E]">
                    Article III carve-out
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-stone-400 leading-relaxed min-h-[48px]">
                {t.behavior}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-800">
                <div className="text-[10px] uppercase tracking-wide text-stone-600 mb-1">examples</div>
                <div className="flex flex-wrap gap-1">
                  {t.examples.map((e) => (
                    <code
                      key={e}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800"
                    >
                      {e}
                    </code>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-stone-500 text-center mt-3 italic">
        Implemented by <code className="text-stone-400">harness-graduated-confirm</code> +{" "}
        <code className="text-stone-400">cc-hook-guardrail</code>. Only L2 constitutes an in-loop HITL carve-out (Article III).
      </div>
    </div>
  );
}
