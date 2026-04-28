"use client";

import { useState } from "react";

type Zone = "pre" | "in" | "post";

const ACTIONS = [
  {
    id: "goal-design",
    label: "목표 설계",
    zone: "pre" as Zone,
    allowed: true,
    note: "능동 HITL",
  },
  {
    id: "clarify",
    label: "/harness:clarify",
    zone: "pre" as Zone,
    allowed: true,
    note: "조항 V",
  },
  {
    id: "plan-approve",
    label: "ExitPlanMode",
    zone: "pre" as Zone,
    allowed: true,
    note: "운영자 승인",
  },
  {
    id: "askuser-in-loop",
    label: "AskUserQuestion (루프 내부)",
    zone: "in" as Zone,
    allowed: false,
    note: "프로토콜 위반",
  },
  {
    id: "guardrail-deny",
    label: "hook-guardrail 거부 → 단계적 확인",
    zone: "in" as Zone,
    allowed: true,
    note: "예외 (a)",
  },
  {
    id: "ctrl-c",
    label: "Ctrl+C 비상 정지",
    zone: "in" as Zone,
    allowed: true,
    note: "예외 (b)",
  },
  {
    id: "handback",
    label: "/harness:report 인계",
    zone: "post" as Zone,
    allowed: true,
    note: "능동 HITL",
  },
  {
    id: "rubric-audit",
    label: "llm-as-judge-audit",
    zone: "post" as Zone,
    allowed: true,
    note: "선택",
  },
];

const ZONE_META: Record<Zone, { label: string; color: string; x: number; w: number }> = {
  pre: { label: "루프 진입 전", color: "#6BA368", x: 20, w: 220 },
  in: { label: "루프 내부", color: "#FF8C42", x: 260, w: 220 },
  post: { label: "루프 종료 후", color: "#7B9EB8", x: 500, w: 220 },
};

export default function HitlBoundaryDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = ACTIONS.find((a) => a.id === selected) ?? null;

  return (
    <figure className="my-8 rounded-xl border border-[#D4A853]/15 bg-[#0e0a06] p-4">
      <svg
        viewBox="0 0 740 320"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="조항 III HITL 경계 — 루프 진입 전/내부/종료 후 영역"
      >
        <defs>
          <linearGradient id="hitl-pre" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6BA368" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6BA368" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="hitl-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="hitl-post" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B9EB8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7B9EB8" stopOpacity="0.04" />
          </linearGradient>
          <pattern id="hitl-forbidden" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ff3b3b" strokeWidth="1" opacity="0.25" />
          </pattern>
        </defs>

        <rect width="740" height="320" fill="#120c06" rx="10" />

        {/* Zone blocks */}
        {(Object.keys(ZONE_META) as Zone[]).map((z) => {
          const m = ZONE_META[z];
          const grad = z === "pre" ? "hitl-pre" : z === "in" ? "hitl-in" : "hitl-post";
          return (
            <g key={z}>
              <rect
                x={m.x}
                y="40"
                width={m.w}
                height="240"
                fill={`url(#${grad})`}
                stroke={m.color}
                strokeOpacity="0.45"
                strokeWidth="1"
                rx="8"
              />
              {z === "in" && (
                <rect
                  x={m.x}
                  y="40"
                  width={m.w}
                  height="240"
                  fill="url(#hitl-forbidden)"
                  rx="8"
                />
              )}
              <text
                x={m.x + m.w / 2}
                y="28"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="12"
                fill={m.color}
                letterSpacing="3"
                fontWeight="600"
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Flow arrows between zones */}
        <g stroke="#D4A853" strokeOpacity="0.35" strokeWidth="1.2" fill="none" markerEnd="url(#hitl-arrow)">
          <path d="M 240 160 L 258 160" />
          <path d="M 480 160 L 498 160" />
        </g>
        <defs>
          <marker id="hitl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#D4A853" opacity="0.6" />
          </marker>
        </defs>

        {/* Actions */}
        {ACTIONS.map((a) => {
          const m = ZONE_META[a.zone];
          const actionsInZone = ACTIONS.filter((x) => x.zone === a.zone);
          const idx = actionsInZone.findIndex((x) => x.id === a.id);
          const y = 70 + idx * 62;
          const isActive = selected === a.id;
          return (
            <g
              key={a.id}
              onClick={() => setSelected(selected === a.id ? null : a.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={m.x + 12}
                y={y}
                width={m.w - 24}
                height="48"
                rx="6"
                fill={a.allowed ? "#1a1208" : "#2a0b0b"}
                stroke={a.allowed ? m.color : "#ff5555"}
                strokeWidth={isActive ? 2 : 0.8}
                strokeOpacity={a.allowed ? 0.7 : 0.9}
              />
              <text
                x={m.x + 24}
                y={y + 20}
                fontFamily="ui-sans-serif, system-ui"
                fontSize="11"
                fontWeight="500"
                fill={a.allowed ? "#e8dbc2" : "#ffb8b8"}
              >
                {a.label}
              </text>
              <text
                x={m.x + 24}
                y={y + 36}
                fontFamily="ui-monospace, monospace"
                fontSize="9"
                fill={a.allowed ? m.color : "#ff7878"}
                opacity="0.8"
              >
                {a.allowed ? "✓" : "✗"} {a.note}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="text-xs text-stone-500 mt-3 text-center">
        <strong className="text-[#D4A853]">조항 III</strong> — HITL은 루프 진입 전과 종료 후에 허용된다. 루프 내부에서는 단계적 확인과 Ctrl+C를 제외하면 금지.
        {active && (
          <span className="block mt-1 text-stone-400">
            <code className="text-[#D4A853]">{active.label}</code>
            {active.allowed ? " — 허용. " : " — 금지. "}
            {active.note}.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
