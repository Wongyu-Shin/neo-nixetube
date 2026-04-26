"use client";

import { useState } from "react";

const STEPS = [
  {
    n: 1,
    label: "Scope lock",
    detail: "A loop is opened whose Scope: is harness/CONSTITUTION.md alone — nothing else.",
    cite: "Art. IV",
  },
  {
    n: 2,
    label: "Amendment spec",
    detail: "loops/NNN-constitutional-amendment/spec.md states WHICH Article and WHY.",
    cite: "Art. IX.2",
  },
  {
    n: 3,
    label: "Clarification + [RATIFIED]",
    detail: "Operator writes [RATIFIED] in the Clarifications section of the spec.",
    cite: "Art. V + Art. IX.3",
  },
  {
    n: 4,
    label: "Iteration + Guard",
    detail: "Loop runs. Every iter: commit → composite-guard (schema + 11/11 crosscheck) → verify.",
    cite: "Art. VI + Art. VIII",
  },
  {
    n: 5,
    label: "Post-merge audit",
    detail: "Every feature's applicability is re-checked against the amended Articles.",
    cite: "Art. IX.4",
  },
];

export default function AmendmentProcedureFlow() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure className="my-8 rounded-xl border border-[#6BA368]/20 bg-[#0e0a06] p-5">
      <svg
        viewBox="0 0 820 260"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Article IX amendment procedure — self-referential flow"
      >
        <defs>
          <linearGradient id="amend-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6BA368" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6BA368" stopOpacity="0" />
          </linearGradient>
          <marker id="amend-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6BA368" opacity="0.7" />
          </marker>
        </defs>

        <rect width="820" height="260" fill="#120c06" rx="10" />

        {/* Self-reference loop indicator — subtle ring around the whole flow */}
        <path
          d="M 40 130 C 40 40, 780 40, 780 130 C 780 220, 40 220, 40 130 Z"
          fill="none"
          stroke="#6BA368"
          strokeWidth="0.8"
          strokeDasharray="2 5"
          opacity="0.18"
        />

        {/* Step nodes */}
        {STEPS.map((step, i) => {
          const x = 70 + i * 156;
          const y = 130;
          const isActive = active === step.n;
          return (
            <g
              key={step.n}
              onMouseEnter={() => setActive(step.n)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Connector */}
              {i > 0 && (
                <line
                  x1={x - 112}
                  y1={y}
                  x2={x - 44}
                  y2={y}
                  stroke="#6BA368"
                  strokeWidth="1.5"
                  opacity={isActive || active === step.n - 1 ? 0.9 : 0.35}
                  markerEnd="url(#amend-arrow)"
                  style={{ transition: "opacity 0.25s" }}
                />
              )}

              {/* Node */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? 34 : 30}
                fill="#15100a"
                stroke="#6BA368"
                strokeWidth={isActive ? 2 : 1.2}
                style={{ transition: "all 0.25s" }}
              />
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                fontFamily="ui-serif, Georgia, serif"
                fontSize="20"
                fontWeight="600"
                fill="#6BA368"
              >
                {step.n}
              </text>

              {/* Label above */}
              <text
                x={x}
                y={y - 50}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui"
                fontSize="11"
                fontWeight="500"
                fill="#e8dbc2"
                opacity={isActive ? 1 : 0.75}
              >
                {step.label}
              </text>

              {/* Citation below */}
              <text
                x={x}
                y={y + 54}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="9"
                fill="#6BA368"
                opacity="0.7"
                letterSpacing="1"
              >
                {step.cite}
              </text>
            </g>
          );
        })}

        {/* Feedback loop — step 5 → step 1 shown via curved arrow */}
        <path
          d="M 850 130 Q 820 210, 412 220 Q 60 220, 40 130"
          fill="none"
          stroke="#6BA368"
          strokeWidth="0.8"
          strokeDasharray="3 4"
          opacity="0.35"
        />
        <text
          x="410"
          y="240"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="9"
          fill="#6BA368"
          opacity="0.55"
          letterSpacing="1"
        >
          this procedure governs changes to this procedure
        </text>
      </svg>

      <div
        className="mt-4 min-h-[60px] text-sm text-stone-300 px-4 py-3 rounded-md border border-[#6BA368]/20 bg-[#6BA368]/[0.05]"
      >
        {active ? (
          <>
            <strong className="text-[#6BA368]">Step {active} — {STEPS[active - 1].label}</strong>
            <span className="block text-stone-400 mt-1">{STEPS[active - 1].detail}</span>
          </>
        ) : (
          <span className="text-stone-400 italic">
            Hover a step. Article IX is self-referential — changing it requires using the procedure it describes.
          </span>
        )}
      </div>

      <figcaption className="text-xs text-stone-500 text-center mt-3">
        <strong className="text-[#6BA368]">Article IX</strong> — Amendment procedure is fixed-point: it applies to itself.
      </figcaption>
    </figure>
  );
}
