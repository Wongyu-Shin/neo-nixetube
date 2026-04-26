"use client";

import { useState } from "react";

type State = "needed" | "borderline" | "absorbed";

const SCENARIOS: Array<{
  id: string;
  feature: string;
  ccVersion: string;
  model: string;
  tcOutcome: State;
  explanation: string;
}> = [
  {
    id: "now",
    feature: "harness-constitution",
    ccVersion: "2.0.x",
    model: "claude-opus-4-7",
    tcOutcome: "needed",
    explanation:
      "Fresh session without the skill-wrapper does not cite Article III unprompted. tc_script passes — feature still load-bearing.",
  },
  {
    id: "edge",
    feature: "harness-clarify-gate",
    ccVersion: "2.5.0",
    model: "claude-opus-4-7",
    tcOutcome: "borderline",
    explanation:
      "Agent sometimes produces a Clarifications section unprompted but not always. Statistical tc_script (N=10 runs) needed to disambiguate.",
  },
  {
    id: "absorbed",
    feature: "cc-post-loop-slash",
    ccVersion: "3.0.0-hypothetical",
    model: "claude-opus-5-x",
    tcOutcome: "absorbed",
    explanation:
      "CC ships native post-loop slash-command hook. rippable_check fires green. Feature must be removed per Article II.",
  },
];

const STATE_META: Record<State, { color: string; label: string; x: number }> = {
  needed: { color: "#6BA368", label: "STILL NEEDED", x: 60 },
  borderline: { color: "#D4A853", label: "BORDERLINE", x: 280 },
  absorbed: { color: "#FF5555", label: "ABSORBED — RIP", x: 500 },
};

export default function RippabilityMeter() {
  const [idx, setIdx] = useState(0);
  const scenario = SCENARIOS[idx];
  const meta = STATE_META[scenario.tcOutcome];

  const needlePos =
    scenario.tcOutcome === "needed" ? 140 :
    scenario.tcOutcome === "borderline" ? 355 : 570;

  return (
    <figure className="my-8 rounded-xl border border-[#D4A853]/15 bg-[#0e0a06] p-5">
      <svg
        viewBox="0 0 680 280"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Article II rippability meter"
      >
        <defs>
          <linearGradient id="rip-scale" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6BA368" />
            <stop offset="50%" stopColor="#D4A853" />
            <stop offset="100%" stopColor="#FF5555" />
          </linearGradient>
          <filter id="rip-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <rect width="680" height="280" fill="#120c06" rx="10" />

        {/* Scale bar */}
        <rect x="40" y="100" width="600" height="22" rx="11" fill="url(#rip-scale)" opacity="0.4" />
        <rect x="40" y="100" width="600" height="22" rx="11" fill="none" stroke="#D4A853" strokeWidth="0.5" opacity="0.4" />

        {/* Tick marks */}
        {[140, 355, 570].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="96" x2={x} y2="126" stroke="#D4A853" strokeWidth="0.5" opacity="0.4" />
          </g>
        ))}

        {/* Zone labels */}
        {(Object.keys(STATE_META) as State[]).map((s) => {
          const m = STATE_META[s];
          return (
            <text
              key={s}
              x={m.x + 80}
              y="82"
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="10"
              fill={m.color}
              letterSpacing="2"
              fontWeight="600"
              opacity={s === scenario.tcOutcome ? 1 : 0.45}
            >
              {m.label}
            </text>
          );
        })}

        {/* Needle */}
        <g style={{ transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)" }} transform={`translate(${needlePos}, 0)`}>
          <circle cx="0" cy="111" r="14" fill={meta.color} opacity="0.25" filter="url(#rip-glow)" />
          <polygon
            points="0,70 -10,95 10,95"
            fill={meta.color}
            stroke="#15100a"
            strokeWidth="1.2"
          />
          <circle cx="0" cy="111" r="7" fill={meta.color} stroke="#15100a" strokeWidth="1.5" />
        </g>

        {/* Scenario card */}
        <g transform="translate(40, 160)">
          <rect width="600" height="92" rx="8" fill="#1a1208" stroke={meta.color} strokeOpacity="0.5" strokeWidth="1" />
          <text x="16" y="22" fontFamily="ui-monospace, monospace" fontSize="9" fill="#D4A853" opacity="0.6" letterSpacing="2">
            FEATURE
          </text>
          <text x="16" y="42" fontFamily="ui-monospace, monospace" fontSize="13" fill="#e8dbc2" fontWeight="500">
            {scenario.feature}
          </text>
          <text x="16" y="62" fontFamily="ui-sans-serif, system-ui" fontSize="11" fill="#bbb" opacity="0.85">
            CC {scenario.ccVersion} · {scenario.model}
          </text>
          <text x="16" y="80" fontFamily="ui-sans-serif, system-ui" fontSize="10" fill="#999" opacity="0.9">
            <tspan>{scenario.explanation.slice(0, 95)}</tspan>
          </text>
          {scenario.explanation.length > 95 && (
            <text x="16" y="94" fontFamily="ui-sans-serif, system-ui" fontSize="10" fill="#999" opacity="0.9">
              <tspan>{scenario.explanation.slice(95, 195)}</tspan>
            </text>
          )}
        </g>
      </svg>

      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-md border transition font-mono ${
              idx === i
                ? "bg-[#D4A853]/15 border-[#D4A853]/60 text-[#D4A853]"
                : "bg-transparent border-stone-700 text-stone-400 hover:border-stone-500"
            }`}
          >
            {s.feature}
          </button>
        ))}
      </div>

      <figcaption className="text-xs text-stone-500 text-center mt-3">
        <strong className="text-[#D4A853]">Article II</strong> — <code>tc_script</code> + <code>rippable_check</code> decide when a feature has been absorbed upstream.
      </figcaption>
    </figure>
  );
}
