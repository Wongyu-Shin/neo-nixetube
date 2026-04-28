"use client";

import { useState } from "react";

const STEPS = [
  {
    n: 1,
    label: "Scope 잠금",
    detail: "Scope: 가 harness/CONSTITUTION.md 하나뿐인 루프를 연다 — 다른 파일 없음.",
    cite: "조항 IV",
  },
  {
    n: 2,
    label: "개정 spec",
    detail: "loops/NNN-constitutional-amendment/spec.md가 어느 조항을 왜 바꾸는지 명시한다.",
    cite: "조항 IX.2",
  },
  {
    n: 3,
    label: "명료화 + [RATIFIED]",
    detail: "운영자가 spec의 Clarifications 절에 [RATIFIED] 마커를 적는다.",
    cite: "조항 V + 조항 IX.3",
  },
  {
    n: 4,
    label: "이터레이션 + 가드",
    detail: "루프 실행. 매 이터레이션: 커밋 → composite-guard (스키마 + 11/11 crosscheck) → verify.",
    cite: "조항 VI + 조항 VIII",
  },
  {
    n: 5,
    label: "머지 후 감사",
    detail: "모든 피처의 applicability를 개정된 조항에 비추어 재검토한다.",
    cite: "조항 IX.4",
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
        aria-label="조항 IX 개정 절차 — 자기 참조 플로우"
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
          이 절차가 자기 자신의 변경을 관장한다
        </text>
      </svg>

      <div
        className="mt-4 min-h-[60px] text-sm text-stone-300 px-4 py-3 rounded-md border border-[#6BA368]/20 bg-[#6BA368]/[0.05]"
      >
        {active ? (
          <>
            <strong className="text-[#6BA368]">단계 {active} — {STEPS[active - 1].label}</strong>
            <span className="block text-stone-400 mt-1">{STEPS[active - 1].detail}</span>
          </>
        ) : (
          <span className="text-stone-400 italic">
            단계 위에 마우스를 올린다. 조항 IX는 자기 참조적이다 — 이를 바꾸려면 자신이 기술하는 절차를 거쳐야 한다.
          </span>
        )}
      </div>

      <figcaption className="text-xs text-stone-500 text-center mt-3">
        <strong className="text-[#6BA368]">조항 IX</strong> — 개정 절차는 고정점이다: 자기 자신에게 적용된다.
      </figcaption>
    </figure>
  );
}
