"use client";

import { useState } from "react";

/**
 * SUM-over-iterations timeline for the `noise-aware-ratchet` feature.
 *
 * Illustrates the SUM=MAX ratchet: raw verdicts wobble (±10 LLM-judge
 * noise), but the ratchet only moves up, never down. Plateau-detection
 * combines `ratchet-patience` (no new max in k iters) AND `trend-slope`
 * (slope under σ) — both must trip. Hover an iter to see its state.
 */

type Iter = {
  n: number;
  raw: number;
  decision: "keep" | "discard" | "rework";
  note: string;
};

const RAW: Iter[] = [
  { n: 1, raw: 42, decision: "keep", note: "baseline established" },
  { n: 2, raw: 51, decision: "keep", note: "response caching" },
  { n: 3, raw: 48, decision: "discard", note: "noise — raw below anchor" },
  { n: 4, raw: 55, decision: "keep", note: "batching" },
  { n: 5, raw: 54, decision: "rework", note: "within σ" },
  { n: 6, raw: 62, decision: "keep", note: "parallel reads" },
  { n: 7, raw: 60, decision: "discard", note: "judge flake" },
  { n: 8, raw: 65, decision: "keep", note: "prompt caching" },
  { n: 9, raw: 63, decision: "rework", note: "plateau candidate" },
  { n: 10, raw: 64, decision: "rework", note: "no new max" },
  { n: 11, raw: 62, decision: "discard", note: "regression + plateau trip" },
  { n: 12, raw: 65, decision: "keep", note: "tie to anchor" },
];

const SIGMA = 10;

function ratchet(iters: Iter[]): number[] {
  let best = -Infinity;
  return iters.map((i) => {
    best = Math.max(best, i.raw);
    return best;
  });
}

const DECISION_COLOR: Record<Iter["decision"], string> = {
  keep: "#16a34a",
  discard: "#dc2626",
  rework: "#d97706",
};

const W = 640;
const H = 240;
const PAD = { top: 18, right: 24, bottom: 36, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

export default function RatchetTimeline() {
  const [hover, setHover] = useState<number | null>(9);
  const ratcheted = ratchet(RAW);
  const yMin = 30;
  const yMax = 80;

  const x = (n: number) =>
    PAD.left + ((n - 1) / (RAW.length - 1)) * PLOT_W;
  const y = (v: number) =>
    PAD.top + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;

  const active = RAW.find((r) => r.n === hover);
  const activeRatchet = hover ? ratcheted[hover - 1] : null;

  return (
    <div className="my-6 rounded-lg border border-neutral-300/70 bg-white/70 p-4 dark:border-neutral-700/70 dark:bg-neutral-900/60">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          SUM=MAX ratchet — 12 iterations (simulated ±{SIGMA} judge noise)
        </h4>
        <div className="flex gap-3 text-[11px] text-neutral-600 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-5 bg-emerald-600" />
            ratchet
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-5"
              style={{
                background:
                  "repeating-linear-gradient(to right, #9ca3af 0 3px, transparent 3px 6px)",
              }}
            />
            raw
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Ratchet timeline chart"
      >
        <defs>
          <linearGradient id="ratchetFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {[40, 50, 60, 70, 80].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={y(v)}
              x2={W - PAD.right}
              y2={y(v)}
              stroke="#e5e7eb"
              strokeDasharray="2 3"
            />
            <text
              x={PAD.left - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize="9"
              fill="#9ca3af"
            >
              {v}
            </text>
          </g>
        ))}

        {/* noise band around ratchet */}
        <path
          d={
            `M ${x(1)} ${y(ratcheted[0] + SIGMA)} ` +
            ratcheted
              .map((r, i) => `L ${x(i + 1)} ${y(r + SIGMA)}`)
              .join(" ") +
            ` L ${x(RAW.length)} ${y(ratcheted[RAW.length - 1] - SIGMA)} ` +
            ratcheted
              .slice()
              .reverse()
              .map((r, i) => `L ${x(RAW.length - i)} ${y(r - SIGMA)}`)
              .join(" ") +
            " Z"
          }
          fill="#16a34a"
          fillOpacity="0.08"
        />

        {/* raw line */}
        <polyline
          points={RAW.map((r) => `${x(r.n)},${y(r.raw)}`).join(" ")}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* ratchet fill area */}
        <path
          d={
            `M ${x(1)} ${y(yMin)} ` +
            ratcheted
              .map((r, i) => `L ${x(i + 1)} ${y(r)}`)
              .join(" ") +
            ` L ${x(RAW.length)} ${y(yMin)} Z`
          }
          fill="url(#ratchetFill)"
        />

        {/* ratchet stepped line */}
        <polyline
          points={ratcheted.map((r, i) => `${x(i + 1)},${y(r)}`).join(" ")}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.25"
        />

        {/* points */}
        {RAW.map((r) => {
          const isHover = hover === r.n;
          return (
            <g
              key={r.n}
              onMouseEnter={() => setHover(r.n)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x(r.n) - 12}
                y={PAD.top}
                width="24"
                height={PLOT_H}
                fill="transparent"
              />
              <circle
                cx={x(r.n)}
                cy={y(r.raw)}
                r={isHover ? 6 : 3.5}
                fill={DECISION_COLOR[r.decision]}
                stroke="#fff"
                strokeWidth="1.5"
              />
              <text
                x={x(r.n)}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fontSize="9"
                fill={isHover ? "#111827" : "#6b7280"}
                fontWeight={isHover ? 700 : 400}
              >
                {r.n}
              </text>
            </g>
          );
        })}

        {/* plateau trigger annotation */}
        <g transform={`translate(${x(10)} ${PAD.top + 4})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={PLOT_H - 4}
            stroke="#d97706"
            strokeDasharray="2 3"
            strokeOpacity="0.55"
          />
          <rect
            x="-40"
            y="-2"
            width="80"
            height="14"
            rx="3"
            fill="#fef3c7"
            stroke="#d97706"
            strokeOpacity="0.4"
          />
          <text
            x="0"
            y="8"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#92400e"
          >
            plateau window
          </text>
        </g>

        {/* axis labels */}
        <text
          x={PAD.left}
          y={H - 6}
          fontSize="10"
          fill="#6b7280"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          iter →
        </text>
        <text
          x={PAD.left - 28}
          y={PAD.top + 6}
          fontSize="10"
          fill="#6b7280"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          transform={`rotate(-90 ${PAD.left - 28} ${PAD.top + 6})`}
        >
          SUM
        </text>
      </svg>

      <div className="mt-2 flex items-start gap-3 border-t border-neutral-200 pt-2 text-[11.5px] dark:border-neutral-800">
        <div className="flex-1">
          {active ? (
            <>
              <span className="font-mono font-bold">iter {active.n}</span>
              <span className="mx-1 text-neutral-500">·</span>
              <span>raw={active.raw}</span>
              <span className="mx-1 text-neutral-500">·</span>
              <span>ratchet={activeRatchet}</span>
              <span className="mx-1 text-neutral-500">·</span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  background: DECISION_COLOR[active.decision] + "22",
                  color: DECISION_COLOR[active.decision],
                }}
              >
                {active.decision}
              </span>
              <span className="ml-2 italic text-neutral-500">{active.note}</span>
            </>
          ) : (
            <span className="italic text-neutral-500">hover a point</span>
          )}
        </div>
        <div className="flex gap-3 text-[10.5px]">
          {(["keep", "rework", "discard"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: DECISION_COLOR[k] }}
              />
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
