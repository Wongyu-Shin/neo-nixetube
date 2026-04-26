"use client";

import { useState } from "react";

/**
 * Gold-tier interactive octagonal ring for the 8 in-loop phases.
 *
 * Companion to HarnessFlowDiagram. While that diagram shows the full
 * pre → in → post lifecycle, this component zooms in on the amber
 * in-loop ring only, rendering each of the 8 phases (per
 * `harness/UX.md §4` and the phase table) as a wedge around a central
 * hub. Hover a wedge to surface its feature-spec + Article citation;
 * click to lock the selection. A secondary track shows the guard
 * checkpoints between phases (per `harness-progress-cadence` and
 * `cc-hook-guardrail`).
 */

type Phase = {
  n: number;
  key: string;
  label: string;
  action: string;
  article: string;
  feature: string;
  hitl: "forbidden" | "gated" | "silent";
  detail: string;
  writes: string[];
  guard: string;
};

const PHASES: Phase[] = [
  {
    n: 1,
    key: "review",
    label: "Review",
    action: "git log + TSV + wiki surface",
    article: "VII",
    feature: "harness-constitution",
    hitl: "forbidden",
    detail:
      "Loads CONSTITUTION.md, surfaces wiki entries by keyword, reads prior reflexion notes. Nothing is mutated.",
    writes: [],
    guard: "none (read-only)",
  },
  {
    n: 2,
    key: "ideate",
    label: "Ideate",
    action: "pick next candidate",
    article: "IV",
    feature: "reflexion",
    hitl: "forbidden",
    detail:
      "Chooses the next candidate from the axis-coverage gap list. Influenced by reflexion entries from previous iterations.",
    writes: ["iter-log line"],
    guard: "none",
  },
  {
    n: 3,
    key: "modify",
    label: "Modify",
    action: "edit scope files",
    article: "III",
    feature: "harness-graduated-confirm",
    hitl: "gated",
    detail:
      "Edits files inside Scope (Article IV domain boundary). L0 silent; L1 notify + 30s auto-approve; L2 pause + blocking HITL (one of the two in-loop carve-outs).",
    writes: ["scope files", "report.mdx (L2 events)"],
    guard: "cc-hook-guardrail (per-op)",
  },
  {
    n: 4,
    key: "commit",
    label: "Commit",
    action: "experiment(scope): desc",
    article: "VIII",
    feature: "harness-loop-scaffold",
    hitl: "forbidden",
    detail:
      "Commits BEFORE Verify, with the experiment(scope): prefix. Git is memory — even discards stay in history as lessons (Article VIII).",
    writes: ["git commit"],
    guard: "none",
  },
  {
    n: 5,
    key: "verify",
    label: "Verify",
    action: "run verify.sh",
    article: "II",
    feature: "statistical-tc-runner",
    hitl: "forbidden",
    detail:
      "Runs the measurement command specified in spec.md Metric. Outputs SCORE. Variance handled by noise-aware-ratchet.",
    writes: ["results TSV row"],
    guard: "verify exit=0",
  },
  {
    n: 6,
    key: "decide",
    label: "Decide",
    action: "keep | discard | rework",
    article: "VI",
    feature: "noise-aware-ratchet",
    hitl: "forbidden",
    detail:
      "composite-guard.sh = guard.sh + crosscheck.sh = 11/11 (Article VI). On discard: git revert (not reset). Ratchet uses SUM=MAX to dampen ±10 judge noise.",
    writes: ["decision in iter-log"],
    guard: "composite-guard (11/11)",
  },
  {
    n: 7,
    key: "log",
    label: "Log",
    action: "cadence + statusline",
    article: "VIII",
    feature: "harness-progress-cadence",
    hitl: "forbidden",
    detail:
      "Per-iter line + (every 5) milestone block + continuous statusline. Final summary on exit. No-op on checkpoint resume.",
    writes: ["iter-log", "statusline", "milestone block every 5"],
    guard: "none",
  },
  {
    n: 8,
    key: "repeat",
    label: "Repeat / exit",
    action: "→ 1 or stop condition",
    article: "III",
    feature: "plateau-detection",
    hitl: "gated",
    detail:
      "Six possible exits: bounded N, goal-achieved, plateau (ratchet-patience + trend-slope under σ), operator pause, operator abandon, emergency Ctrl+C. Operator messages arrive async via /harness:send.",
    writes: ["checkpoint on exit"],
    guard: "stop-condition check",
  },
];

const HITL_COLOR: Record<Phase["hitl"], string> = {
  forbidden: "#C1563E",
  gated: "#D4A853",
  silent: "#6BA368",
};

const HITL_LABEL: Record<Phase["hitl"], string> = {
  forbidden: "HITL forbidden",
  gated: "HITL gated (carve-out)",
  silent: "silent",
};

// --- geometry helpers ---------------------------------------------------

const CX = 300;
const CY = 300;
const OUTER = 240;
const INNER = 150;
const GUARD_R = 112;

function polar(r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function wedgePath(i: number, hovered: boolean) {
  const total = PHASES.length;
  const gap = hovered ? 1.2 : 2.2;
  const start = (360 / total) * i + gap;
  const end = (360 / total) * (i + 1) - gap;
  const r1 = hovered ? OUTER + 8 : OUTER;
  const r0 = INNER;
  const p1 = polar(r1, start);
  const p2 = polar(r1, end);
  const p3 = polar(r0, end);
  const p4 = polar(r0, start);
  const largeArc = end - start > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${r0} ${r0} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function wedgeLabelPos(i: number) {
  const total = PHASES.length;
  const mid = (360 / total) * (i + 0.5);
  return polar((OUTER + INNER) / 2, mid);
}

function guardPos(i: number) {
  const total = PHASES.length;
  const mid = (360 / total) * (i + 1);
  return polar(GUARD_R, mid);
}

// --- component ---------------------------------------------------------

export default function IterationPhaseRing() {
  const [hover, setHover] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>("decide");

  const active = PHASES.find((p) => p.key === (hover ?? locked)) ?? PHASES[5];

  return (
    <div className="my-8 rounded-lg border border-neutral-300/70 bg-gradient-to-br from-amber-50/40 to-neutral-50 p-4 dark:border-neutral-700/70 dark:from-amber-950/20 dark:to-neutral-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
          In-loop — 8-phase iteration ring
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-neutral-600 dark:text-neutral-400">
          {(["forbidden", "gated", "silent"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: HITL_COLOR[k] }}
              />
              {HITL_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative aspect-square w-full max-w-[600px]">
          <svg
            viewBox="0 0 600 600"
            className="h-full w-full"
            role="img"
            aria-label="Octagonal ring showing the 8 in-loop phases"
          >
            <defs>
              <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.15" />
              </radialGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
              <pattern
                id="ringHatch"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="#fbbf24"
                  strokeWidth="1"
                  strokeOpacity="0.25"
                />
              </pattern>
            </defs>

            {/* outer reference circles + tick marks */}
            <circle
              cx={CX}
              cy={CY}
              r={OUTER + 20}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.10"
            />
            <circle
              cx={CX}
              cy={CY}
              r={OUTER + 16}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.18"
              strokeDasharray="2 6"
            />
            <circle
              cx={CX}
              cy={CY}
              r={OUTER + 8}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.05"
            />
            <circle
              cx={CX}
              cy={CY}
              r={OUTER + 4}
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.10"
            />
            <ellipse
              cx={CX}
              cy={CY}
              rx={OUTER + 28}
              ry={OUTER + 22}
              fill="none"
              stroke="#fde68a"
              strokeOpacity="0.25"
              strokeDasharray="1 4"
            />
            <line
              x1={CX - (OUTER + 30)}
              y1={CY}
              x2={CX - (OUTER + 20)}
              y2={CY}
              stroke="#fbbf24"
              strokeOpacity="0.35"
            />
            <line
              x1={CX + (OUTER + 20)}
              y1={CY}
              x2={CX + (OUTER + 30)}
              y2={CY}
              stroke="#fbbf24"
              strokeOpacity="0.35"
            />
            <line
              x1={CX}
              y1={CY - (OUTER + 30)}
              x2={CX}
              y2={CY - (OUTER + 20)}
              stroke="#fbbf24"
              strokeOpacity="0.35"
            />
            <line
              x1={CX}
              y1={CY + (OUTER + 20)}
              x2={CX}
              y2={CY + (OUTER + 30)}
              stroke="#fbbf24"
              strokeOpacity="0.35"
            />

            {/* wedges */}
            {PHASES.map((p, i) => {
              const isActive = p.key === (hover ?? locked);
              const isDimmed = (hover ?? locked) !== null && !isActive;
              return (
                <path
                  key={p.key}
                  d={wedgePath(i, isActive)}
                  fill={HITL_COLOR[p.hitl]}
                  fillOpacity={isActive ? 0.85 : isDimmed ? 0.18 : 0.45}
                  stroke={HITL_COLOR[p.hitl]}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeOpacity={isActive ? 1 : 0.55}
                  onMouseEnter={() => setHover(p.key)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setLocked(p.key)}
                  style={{ cursor: "pointer", transition: "all 180ms ease" }}
                />
              );
            })}

            {/* wedge labels */}
            {PHASES.map((p, i) => {
              const pos = wedgeLabelPos(i);
              const isActive = p.key === (hover ?? locked);
              return (
                <g key={p.key + "-lbl"} pointerEvents="none">
                  <text
                    x={pos.x}
                    y={pos.y - 6}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight={700}
                    fill={isActive ? "#1f2937" : "#374151"}
                    fillOpacity={isActive ? 1 : 0.85}
                  >
                    {p.n}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 10}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={600}
                    fill={isActive ? "#1f2937" : "#4b5563"}
                    fillOpacity={isActive ? 1 : 0.85}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}

            {/* inner guard dots between phases */}
            {PHASES.map((p, i) => {
              const pos = guardPos(i);
              const hasGuard = p.guard !== "none" && p.guard !== "none (read-only)";
              return (
                <g key={p.key + "-guard"}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={hasGuard ? 6 : 3}
                    fill={hasGuard ? "#1f2937" : "#9ca3af"}
                    stroke="#f9fafb"
                    strokeWidth={1.5}
                  />
                  {hasGuard && (
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#fbbf24"
                      fontWeight={700}
                      pointerEvents="none"
                    >
                      ✓
                    </text>
                  )}
                </g>
              );
            })}

            {/* arrow ring between wedges */}
            {PHASES.map((_, i) => {
              const from = wedgeLabelPos(i);
              const to = wedgeLabelPos((i + 1) % PHASES.length);
              const mid = {
                x: (from.x + to.x) / 2,
                y: (from.y + to.y) / 2,
              };
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.hypot(dx, dy);
              const nx = dx / len;
              const ny = dy / len;
              const ax = mid.x + nx * 6;
              const ay = mid.y + ny * 6;
              const left = {
                x: mid.x - nx * 6 + ny * 4,
                y: mid.y - ny * 6 - nx * 4,
              };
              const right = {
                x: mid.x - nx * 6 - ny * 4,
                y: mid.y - ny * 6 + nx * 4,
              };
              return (
                <polygon
                  key={"arrow-" + i}
                  points={`${ax},${ay} ${left.x},${left.y} ${right.x},${right.y}`}
                  fill="#92400e"
                  fillOpacity={0.45}
                  pointerEvents="none"
                />
              );
            })}

            {/* center hub */}
            <circle
              cx={CX}
              cy={CY}
              r={INNER - 8}
              fill="url(#hub)"
              stroke="#f59e0b"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <circle
              cx={CX}
              cy={CY}
              r={INNER - 28}
              fill="url(#ringHatch)"
              stroke="#f59e0b"
              strokeOpacity="0.12"
            />

            <text
              x={CX}
              y={CY - 34}
              textAnchor="middle"
              fontSize="11"
              fill="#78350f"
              fontWeight={600}
              letterSpacing="1.5"
            >
              IN-LOOP
            </text>
            <text
              x={CX}
              y={CY - 12}
              textAnchor="middle"
              fontSize="34"
              fontWeight={800}
              fill="#b45309"
            >
              {active.n}
            </text>
            <text
              x={CX}
              y={CY + 14}
              textAnchor="middle"
              fontSize="18"
              fontWeight={700}
              fill="#1f2937"
            >
              {active.label}
            </text>
            <text
              x={CX}
              y={CY + 34}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              Article {active.article}
            </text>
            <text
              x={CX}
              y={CY + 50}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {active.feature}
            </text>

            {/* HITL boundary annotation */}
            <g transform={`translate(${CX - 60} ${CY + 72})`}>
              <rect
                x="0"
                y="0"
                width="120"
                height="22"
                rx="11"
                fill={HITL_COLOR[active.hitl]}
                fillOpacity="0.15"
                stroke={HITL_COLOR[active.hitl]}
                strokeOpacity="0.55"
              />
              <circle
                cx="14"
                cy="11"
                r="4"
                fill={HITL_COLOR[active.hitl]}
              />
              <text
                x="60"
                y="15"
                textAnchor="middle"
                fontSize="10"
                fontWeight={600}
                fill="#374151"
              >
                {HITL_LABEL[active.hitl]}
              </text>
            </g>
          </svg>
        </div>

        <aside className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white/70 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <header className="flex items-baseline justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                Phase {active.n}
              </div>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {active.label}
              </div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{
                background: HITL_COLOR[active.hitl] + "22",
                color: HITL_COLOR[active.hitl],
              }}
            >
              {active.hitl}
            </span>
          </header>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">
              Action
            </div>
            <code className="font-mono text-[12px] text-neutral-800 dark:text-neutral-200">
              {active.action}
            </code>
          </div>

          <p className="text-[12.5px] leading-snug text-neutral-700 dark:text-neutral-300">
            {active.detail}
          </p>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              Article {active.article}
            </span>
            <span className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              {active.feature}
            </span>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">
              Writes
            </div>
            {active.writes.length === 0 ? (
              <div className="text-[11px] italic text-neutral-500">
                nothing (read-only phase)
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5 text-[11.5px] text-neutral-700 dark:text-neutral-300">
                {active.writes.map((w) => (
                  <li key={w} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-neutral-400" />
                    <code className="font-mono">{w}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">
              Guard
            </div>
            <code className="font-mono text-[11.5px] text-neutral-700 dark:text-neutral-300">
              {active.guard}
            </code>
          </div>

          <footer className="mt-auto border-t border-neutral-200 pt-2 text-[10.5px] text-neutral-500 dark:border-neutral-800">
            {hover
              ? "Hovering — click to lock"
              : locked
                ? "Locked — hover to preview"
                : "Hover or click a wedge"}
          </footer>
        </aside>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-neutral-600 sm:grid-cols-4 dark:text-neutral-400">
        {PHASES.map((p) => (
          <button
            key={p.key + "-btn"}
            onClick={() => setLocked(p.key)}
            onMouseEnter={() => setHover(p.key)}
            onMouseLeave={() => setHover(null)}
            className={
              "flex items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors " +
              (p.key === (hover ?? locked)
                ? "bg-amber-100/80 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800")
            }
          >
            <span className="font-mono text-[10px] text-neutral-500">
              {p.n}
            </span>
            <span className="font-medium">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
