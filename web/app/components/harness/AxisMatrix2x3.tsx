"use client";

import { useState } from "react";

type Axis1 = "inner" | "outer";
type Axis2 = "pre-loop" | "in-loop" | "post-loop";

interface Feature {
  slug: string;
  axis1: Axis1;
  axis2: Axis2;
}

// Axis classifications derived from harness/features/*.md primary axes.
const FEATURES: Feature[] = [
  { slug: "harness-loop-scaffold", axis1: "inner", axis2: "pre-loop" },
  { slug: "harness-clarify-gate", axis1: "inner", axis2: "pre-loop" },
  { slug: "plan-mode-discipline", axis1: "inner", axis2: "pre-loop" },
  { slug: "harness-constitution", axis1: "inner", axis2: "pre-loop" },

  { slug: "cc-hook-guardrail", axis1: "inner", axis2: "in-loop" },
  { slug: "harness-graduated-confirm", axis1: "inner", axis2: "in-loop" },
  { slug: "harness-pause-resume", axis1: "inner", axis2: "in-loop" },
  { slug: "harness-llm-wiki", axis1: "inner", axis2: "in-loop" },
  { slug: "reflexion", axis1: "inner", axis2: "in-loop" },
  { slug: "voyager-skill-library", axis1: "inner", axis2: "in-loop" },

  { slug: "cc-post-loop-slash", axis1: "inner", axis2: "post-loop" },

  { slug: "harness-progress-cadence", axis1: "outer", axis2: "pre-loop" },
  { slug: "adas-meta-agent-search", axis1: "outer", axis2: "pre-loop" },
  { slug: "meta-hyperagents-metacognitive", axis1: "outer", axis2: "pre-loop" },
  { slug: "fpt-hyperagent-multirole", axis1: "outer", axis2: "pre-loop" },

  { slug: "harness-rip-test", axis1: "outer", axis2: "in-loop" },
  { slug: "statistical-tc-runner", axis1: "outer", axis2: "in-loop" },
  { slug: "noise-aware-ratchet", axis1: "outer", axis2: "in-loop" },
  { slug: "plateau-detection", axis1: "outer", axis2: "in-loop" },
  { slug: "swe-agent-aci", axis1: "outer", axis2: "in-loop" },
  { slug: "sandboxed-open-ended-exploration", axis1: "outer", axis2: "in-loop" },
  { slug: "dgm-h-archive-parent-selection", axis1: "outer", axis2: "in-loop" },
  { slug: "alignment-free-self-improvement", axis1: "outer", axis2: "in-loop" },

  { slug: "llm-as-judge-audit", axis1: "outer", axis2: "post-loop" },
  { slug: "cross-domain-transfer-metric", axis1: "outer", axis2: "post-loop" },
  { slug: "gcli-eval-compare-primitive", axis1: "outer", axis2: "post-loop" },
  { slug: "gcli-agent-run-telemetry", axis1: "outer", axis2: "post-loop" },
  { slug: "gcli-skill-pack-distribution", axis1: "outer", axis2: "post-loop" },
];

const AX1: Axis1[] = ["inner", "outer"];
const AX2: Axis2[] = ["pre-loop", "in-loop", "post-loop"];

const AXIS2_COLOR: Record<Axis2, string> = {
  "pre-loop": "#6BA368",
  "in-loop": "#FF8C42",
  "post-loop": "#7B9EB8",
};

export default function AxisMatrix2x3() {
  const [filter, setFilter] = useState<{ a1: Axis1 | null; a2: Axis2 | null }>({ a1: null, a2: null });

  const matches = (f: Feature) =>
    (filter.a1 == null || f.axis1 === filter.a1) &&
    (filter.a2 == null || f.axis2 === filter.a2);

  const cell = (a1: Axis1, a2: Axis2) =>
    FEATURES.filter((f) => f.axis1 === a1 && f.axis2 === a2);

  return (
    <figure className="my-8 rounded-xl border border-[#D4A853]/15 bg-[#0e0a06] p-5">
      <div className="mb-3 flex flex-wrap gap-2 items-center text-xs text-stone-400 font-mono">
        <span className="opacity-60">filter:</span>
        {AX1.map((a) => (
          <button
            key={a}
            onClick={() => setFilter((f) => ({ ...f, a1: f.a1 === a ? null : a }))}
            className={`px-2 py-1 rounded border transition ${
              filter.a1 === a
                ? "border-[#D4A853] text-[#D4A853] bg-[#D4A853]/10"
                : "border-stone-700 text-stone-500 hover:border-stone-500"
            }`}
          >
            axis1={a}
          </button>
        ))}
        {AX2.map((a) => (
          <button
            key={a}
            onClick={() => setFilter((f) => ({ ...f, a2: f.a2 === a ? null : a }))}
            className={`px-2 py-1 rounded border transition ${
              filter.a2 === a
                ? "border-[#D4A853] text-[#D4A853] bg-[#D4A853]/10"
                : "border-stone-700 text-stone-500 hover:border-stone-500"
            }`}
            style={filter.a2 === a ? { color: AXIS2_COLOR[a], borderColor: AXIS2_COLOR[a] } : undefined}
          >
            axis2={a}
          </button>
        ))}
        {(filter.a1 || filter.a2) && (
          <button
            onClick={() => setFilter({ a1: null, a2: null })}
            className="px-2 py-1 rounded border border-stone-700 text-stone-500 hover:border-stone-500"
          >
            clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-[90px_1fr_1fr_1fr] gap-2 text-xs">
        <div />
        {AX2.map((a2) => (
          <div
            key={a2}
            className="font-mono text-center py-1 rounded opacity-80"
            style={{ color: AXIS2_COLOR[a2] }}
          >
            {a2}
          </div>
        ))}

        {AX1.map((a1) => (
          <>
            <div
              key={`label-${a1}`}
              className="font-mono flex items-center justify-end pr-2 text-stone-400 uppercase tracking-widest"
            >
              {a1}
            </div>
            {AX2.map((a2) => {
              const cellFeatures = cell(a1, a2);
              const visible = cellFeatures.filter(matches);
              return (
                <div
                  key={`${a1}-${a2}`}
                  className="rounded-lg border p-2 min-h-[110px] text-[11px] leading-relaxed"
                  style={{
                    borderColor: `${AXIS2_COLOR[a2]}35`,
                    background: `${AXIS2_COLOR[a2]}08`,
                    opacity:
                      (filter.a1 && filter.a1 !== a1) || (filter.a2 && filter.a2 !== a2)
                        ? 0.3
                        : 1,
                  }}
                >
                  <div
                    className="font-mono text-[9px] mb-1 opacity-60"
                    style={{ color: AXIS2_COLOR[a2] }}
                  >
                    {visible.length}/{cellFeatures.length}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {cellFeatures.map((f) => (
                      <code
                        key={f.slug}
                        className="text-[10px] text-stone-300 opacity-80"
                        style={{
                          opacity: matches(f) ? 0.9 : 0.25,
                        }}
                      >
                        {f.slug}
                      </code>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ))}
      </div>

      <figcaption className="text-xs text-stone-500 text-center mt-4">
        <strong className="text-[#D4A853]">Article I</strong> — 28 catalog features classified by axis1 × axis2. Click chips above to filter.
      </figcaption>
    </figure>
  );
}
