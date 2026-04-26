"use client";

import { useState } from "react";

/**
 * Radar chart for the 7 clarify dimensions (D1–D7) the
 * `harness-clarify-gate` feature walks before in-loop entry.
 *
 * Coverage values are illustrative ("what a well-clarified spec looks
 * like"). Hover a vertex to see the dimension's question + failure
 * mode. Unresolved D1 assumptions fail composite-guard (Article VI).
 */

type Dim = {
  id: string;
  short: string;
  question: string;
  failure: string;
  coverage: number; // 0..1 (illustrative)
  article: string;
};

const DIMS: Dim[] = [
  {
    id: "D1",
    short: "Scope-domain",
    question: "harness/ domain or content domain? (Article IV)",
    failure: "Unresolved D1 = scope straddle → composite-guard fail.",
    coverage: 1.0,
    article: "IV",
  },
  {
    id: "D2",
    short: "Metric",
    question: "Extractable by a single verify command?",
    failure: "Hand-judged metric → noise-aware-ratchet cannot apply SUM=MAX.",
    coverage: 0.92,
    article: "II",
  },
  {
    id: "D3",
    short: "Direction",
    question: "Higher or lower is better?",
    failure: "Ambiguous direction → ratchet ratchets the wrong way.",
    coverage: 1.0,
    article: "II",
  },
  {
    id: "D4",
    short: "HITL carve-outs",
    question: "Any irreversible ops expected? Which L2 tier?",
    failure: "Underspecified → L2 op surprises operator mid-loop.",
    coverage: 0.78,
    article: "III",
  },
  {
    id: "D5",
    short: "Stop",
    question: "Bounded / unbounded / plateau-detected?",
    failure: "Unbounded w/o plateau config → runs indefinitely.",
    coverage: 0.88,
    article: "III",
  },
  {
    id: "D6",
    short: "Wiki",
    question: "Which keywords will this loop emit on completion?",
    failure: "Empty D6 → wiki-refs.md write side is empty.",
    coverage: 0.65,
    article: "VII",
  },
  {
    id: "D7",
    short: "Guard",
    question: "Extra guards beyond composite-guard?",
    failure: "Domain-specific assertions not wired → silent pass-through.",
    coverage: 0.84,
    article: "VI",
  },
];

const CX = 200;
const CY = 200;
const R = 140;

function vertex(i: number, t: number) {
  const a = ((360 / DIMS.length) * i - 90) * (Math.PI / 180);
  return { x: CX + R * t * Math.cos(a), y: CY + R * t * Math.sin(a) };
}

export default function ClarifyDimensionsRadar() {
  const [hover, setHover] = useState<string | null>("D6");
  const active = DIMS.find((d) => d.id === hover) ?? DIMS[5];

  const polygonPoints = DIMS.map((d, i) => {
    const v = vertex(i, d.coverage);
    return `${v.x.toFixed(2)},${v.y.toFixed(2)}`;
  }).join(" ");

  return (
    <div className="my-6 grid gap-4 rounded-lg border border-neutral-300/70 bg-white/70 p-4 md:grid-cols-[1fr_minmax(0,260px)] dark:border-neutral-700/70 dark:bg-neutral-900/60">
      <svg
        viewBox="0 0 400 400"
        className="mx-auto w-full max-w-[400px]"
        role="img"
        aria-label="Seven-dimension radar for clarify coverage"
      >
        <defs>
          <radialGradient id="clarifyFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1.0].map((t) => (
          <polygon
            key={"grid-" + t}
            points={DIMS.map((_, i) => {
              const v = vertex(i, t);
              return `${v.x.toFixed(2)},${v.y.toFixed(2)}`;
            }).join(" ")}
            fill="none"
            stroke="#a3a3a3"
            strokeOpacity={t === 1 ? 0.35 : 0.15}
            strokeDasharray={t === 1 ? "0" : "2 3"}
          />
        ))}

        {DIMS.map((_, i) => {
          const v = vertex(i, 1);
          return (
            <line
              key={"axis-" + i}
              x1={CX}
              y1={CY}
              x2={v.x}
              y2={v.y}
              stroke="#a3a3a3"
              strokeOpacity="0.25"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="url(#clarifyFill)"
          stroke="#16a34a"
          strokeOpacity="0.7"
          strokeWidth="1.5"
        />

        {DIMS.map((d, i) => {
          const v = vertex(i, d.coverage);
          const lbl = vertex(i, 1.18);
          const isActive = d.id === hover;
          return (
            <g key={d.id}>
              <circle
                cx={v.x}
                cy={v.y}
                r={isActive ? 8 : 5}
                fill={isActive ? "#15803d" : "#22c55e"}
                stroke="#fff"
                strokeWidth="1.5"
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isActive ? 700 : 500}
                fill={isActive ? "#111827" : "#4b5563"}
              >
                {d.id}
              </text>
              <text
                x={lbl.x}
                y={lbl.y + 12}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
              >
                {d.short}
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r="3" fill="#374151" />
      </svg>

      <aside className="flex flex-col gap-2 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">
            Dimension
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {active.id} · {active.short}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">
            Question
          </div>
          <div className="text-[12.5px] text-neutral-700 dark:text-neutral-300">
            {active.question}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">
            Failure mode
          </div>
          <div className="text-[12px] italic text-red-700 dark:text-red-400">
            {active.failure}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] text-neutral-500">
          <span>Article {active.article}</span>
          <span>coverage {(active.coverage * 100).toFixed(0)}%</span>
        </div>
      </aside>
    </div>
  );
}
