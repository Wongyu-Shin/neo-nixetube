"use client";

import { useState, useMemo } from "react";

type Axis1 = "inner" | "outer";
type Axis2 = "pre-loop" | "in-loop" | "post-loop";

type Feature = {
  slug: string;
  axis1: Axis1;
  axis2: Axis2;
  short: string;
  article: string;
};

const FEATURES: Feature[] = [
  { slug: "harness-constitution", axis1: "inner", axis2: "pre-loop", short: "9 Articles, pinned", article: "I, IX" },
  { slug: "harness-loop-scaffold", axis1: "inner", axis2: "pre-loop", short: "loops/NNN dir template", article: "VIII" },
  { slug: "harness-clarify-gate", axis1: "inner", axis2: "pre-loop", short: "7-dim Q/A pass", article: "V" },
  { slug: "plan-mode-discipline", axis1: "inner", axis2: "pre-loop", short: "ExitPlanMode = HITL gate", article: "III" },
  { slug: "swe-agent-aci", axis1: "inner", axis2: "pre-loop", short: "agent-computer interface", article: "I" },
  { slug: "cc-hook-guardrail", axis1: "inner", axis2: "in-loop", short: "Bash deny hook", article: "III" },
  { slug: "harness-graduated-confirm", axis1: "inner", axis2: "in-loop", short: "L0/L1/L2 tiers", article: "III" },
  { slug: "harness-pause-resume", axis1: "inner", axis2: "in-loop", short: "checkpoint + resume", article: "III, VIII" },
  { slug: "cc-post-loop-slash", axis1: "inner", axis2: "post-loop", short: "report.mdx writer", article: "VIII" },
  { slug: "adas-meta-agent-search", axis1: "outer", axis2: "pre-loop", short: "search over agent programs", article: "IV" },
  { slug: "alignment-free-self-improvement", axis1: "outer", axis2: "pre-loop", short: "split eval ≠ modify skill", article: "IV" },
  { slug: "fpt-hyperagent-multirole", axis1: "outer", axis2: "pre-loop", short: "multi-role orchestration", article: "IV" },
  { slug: "gcli-skill-pack-distribution", axis1: "outer", axis2: "pre-loop", short: "skill pack fetch", article: "II" },
  { slug: "harness-llm-wiki", axis1: "outer", axis2: "pre-loop", short: "keyword-triggered store", article: "VII" },
  { slug: "voyager-skill-library", axis1: "outer", axis2: "pre-loop", short: "reusable skill accrual", article: "VII" },
  { slug: "dgm-h-archive-parent-selection", axis1: "outer", axis2: "in-loop", short: "parent pick from archive", article: "IV" },
  { slug: "gcli-agent-run-telemetry", axis1: "outer", axis2: "in-loop", short: "per-iter event log", article: "VI, VIII" },
  { slug: "harness-progress-cadence", axis1: "outer", axis2: "in-loop", short: "iter/milestone/statusline", article: "III" },
  { slug: "harness-rip-test", axis1: "outer", axis2: "in-loop", short: "obsolescence probe", article: "II" },
  { slug: "meta-hyperagents-metacognitive", axis1: "outer", axis2: "in-loop", short: "self-observing loop", article: "IV" },
  { slug: "noise-aware-ratchet", axis1: "outer", axis2: "in-loop", short: "σ-aware MAX ratchet", article: "VI" },
  { slug: "plateau-detection", axis1: "outer", axis2: "in-loop", short: "patience + slope", article: "VI" },
  { slug: "reflexion", axis1: "outer", axis2: "in-loop", short: "self-critique trace", article: "VII" },
  { slug: "sandboxed-open-ended-exploration", axis1: "outer", axis2: "in-loop", short: "worktree sandbox", article: "III, VIII" },
  { slug: "statistical-tc-runner", axis1: "outer", axis2: "in-loop", short: "n-trial verify", article: "VI" },
  { slug: "cross-domain-transfer-metric", axis1: "outer", axis2: "post-loop", short: "held-out domain verify", article: "IV" },
  { slug: "gcli-eval-compare-primitive", axis1: "outer", axis2: "post-loop", short: "paired A/B", article: "VI" },
  { slug: "llm-as-judge-audit", axis1: "outer", axis2: "post-loop", short: "rubric grade, diff model", article: "VI" },
];

const AXIS1_ORDER: Axis1[] = ["inner", "outer"];
const AXIS2_ORDER: Axis2[] = ["pre-loop", "in-loop", "post-loop"];

const AXIS1_LABEL: Record<Axis1, string> = {
  inner: "INNER · .claude/, hooks, skills",
  outer: "OUTER · scripts/, MCP, shell",
};
const AXIS2_LABEL: Record<Axis2, string> = {
  "pre-loop": "PRE-LOOP",
  "in-loop": "IN-LOOP",
  "post-loop": "POST-LOOP",
};

const PHASE_COLOR: Record<Axis2, string> = {
  "pre-loop": "#7B9EB8",
  "in-loop": "#D4A853",
  "post-loop": "#6BA368",
};

const AXIS1_COLOR: Record<Axis1, string> = {
  inner: "#B8A9C9",
  outer: "#C17B5E",
};

// layout
const W = 960;
const H = 640;
const PAD_L = 180;
const PAD_T = 90;
const PAD_R = 40;
const PAD_B = 80;
const GRID_W = W - PAD_L - PAD_R;
const GRID_H = H - PAD_T - PAD_B;
const CELL_W = GRID_W / AXIS2_ORDER.length;
const CELL_H = GRID_H / AXIS1_ORDER.length;

type NodePos = { feature: Feature; cx: number; cy: number };

function layoutCell(cellFeatures: Feature[], cellX: number, cellY: number): NodePos[] {
  const n = cellFeatures.length;
  if (n === 0) return [];
  const cols = Math.min(n, 4);
  const rows = Math.ceil(n / cols);
  const innerPadX = 24;
  const innerPadY = 36;
  const usableW = CELL_W - innerPadX * 2;
  const usableH = CELL_H - innerPadY * 2;
  const stepX = cols > 1 ? usableW / (cols - 1) : 0;
  const stepY = rows > 1 ? usableH / (rows - 1) : 0;
  return cellFeatures.map((feature, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const cx = cellX + innerPadX + (cols === 1 ? usableW / 2 : c * stepX);
    const cy = cellY + innerPadY + (rows === 1 ? usableH / 2 : r * stepY);
    return { feature, cx, cy };
  });
}

export default function AxisMatrix() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [filterAxis1, setFilterAxis1] = useState<Axis1 | null>(null);
  const [filterAxis2, setFilterAxis2] = useState<Axis2 | null>(null);

  const nodes = useMemo(() => {
    const out: NodePos[] = [];
    AXIS1_ORDER.forEach((a1, yi) => {
      AXIS2_ORDER.forEach((a2, xi) => {
        const cellFeatures = FEATURES.filter((f) => f.axis1 === a1 && f.axis2 === a2);
        const cellX = PAD_L + xi * CELL_W;
        const cellY = PAD_T + yi * CELL_H;
        out.push(...layoutCell(cellFeatures, cellX, cellY));
      });
    });
    return out;
  }, []);

  const activeFeature = hovered ? FEATURES.find((f) => f.slug === hovered) ?? null : null;

  const isDimmed = (f: Feature): boolean => {
    if (filterAxis1 && f.axis1 !== filterAxis1) return true;
    if (filterAxis2 && f.axis2 !== filterAxis2) return true;
    if (hovered && hovered !== f.slug) return true;
    return false;
  };

  const cellCounts: Record<string, number> = {};
  FEATURES.forEach((f) => {
    const k = `${f.axis1}|${f.axis2}`;
    cellCounts[k] = (cellCounts[k] ?? 0) + 1;
  });

  return (
    <figure className="my-8">
      <div className="flex flex-wrap gap-2 justify-center mb-4 text-xs">
        <span className="text-stone-500 self-center mr-2">filter:</span>
        {AXIS1_ORDER.map((a) => (
          <button
            key={a}
            onClick={() => setFilterAxis1(filterAxis1 === a ? null : a)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              filterAxis1 === a
                ? "bg-[#B8A9C9]/20 border-[#B8A9C9] text-[#B8A9C9]"
                : "border-stone-700 text-stone-400 hover:border-stone-500"
            }`}
            style={
              filterAxis1 === a
                ? { borderColor: AXIS1_COLOR[a], color: AXIS1_COLOR[a] }
                : undefined
            }
          >
            axis1 = {a}
          </button>
        ))}
        <span className="text-stone-700 self-center mx-1">·</span>
        {AXIS2_ORDER.map((a) => (
          <button
            key={a}
            onClick={() => setFilterAxis2(filterAxis2 === a ? null : a)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              filterAxis2 === a
                ? "bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]"
                : "border-stone-700 text-stone-400 hover:border-stone-500"
            }`}
            style={
              filterAxis2 === a
                ? { borderColor: PHASE_COLOR[a], color: PHASE_COLOR[a] }
                : undefined
            }
          >
            axis2 = {a}
          </button>
        ))}
        {(filterAxis1 || filterAxis2) && (
          <button
            onClick={() => {
              setFilterAxis1(null);
              setFilterAxis2(null);
            }}
            className="px-3 py-1 rounded-full border border-stone-800 text-stone-500 hover:text-stone-300"
          >
            reset
          </button>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-5xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Harness 2x2 axis matrix plotting 28 features by axis1 (inner/outer) and axis2 (pre/in/post-loop)"
      >
        <defs>
          <radialGradient id="am-bg" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0e0e0e" />
          </radialGradient>
          <linearGradient id="am-inner-band" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B8A9C9" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B8A9C9" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="am-outer-band" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C17B5E" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#C17B5E" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="am-preloop" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7B9EB8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7B9EB8" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="am-inloop" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.02" />
            <stop offset="50%" stopColor="#D4A853" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="am-postloop" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6BA368" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#6BA368" stopOpacity="0.12" />
          </linearGradient>
          <filter id="am-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>

        {/* background */}
        <rect x="0" y="0" width={W} height={H} fill="url(#am-bg)" />

        {/* axis1 bands (inner / outer) */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={GRID_W}
          height={CELL_H}
          fill="url(#am-inner-band)"
        />
        <rect
          x={PAD_L}
          y={PAD_T + CELL_H}
          width={GRID_W}
          height={CELL_H}
          fill="url(#am-outer-band)"
        />

        {/* axis2 phase overlays */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={CELL_W}
          height={GRID_H}
          fill="url(#am-preloop)"
        />
        <rect
          x={PAD_L + CELL_W}
          y={PAD_T}
          width={CELL_W}
          height={GRID_H}
          fill="url(#am-inloop)"
        />
        <rect
          x={PAD_L + CELL_W * 2}
          y={PAD_T}
          width={CELL_W}
          height={GRID_H}
          fill="url(#am-postloop)"
        />

        {/* grid frame + cells */}
        <rect
          x={PAD_L}
          y={PAD_T}
          width={GRID_W}
          height={GRID_H}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="1"
        />
        {AXIS2_ORDER.slice(0, -1).map((_, xi) => (
          <line
            key={`vline-${xi}`}
            x1={PAD_L + (xi + 1) * CELL_W}
            y1={PAD_T}
            x2={PAD_L + (xi + 1) * CELL_W}
            y2={PAD_T + GRID_H}
            stroke="#2a2a2a"
            strokeWidth="1"
          />
        ))}
        {/* Rippability boundary — inner/outer is the ripability line (Article I + II) */}
        <line
          x1={PAD_L}
          y1={PAD_T + CELL_H}
          x2={PAD_L + GRID_W}
          y2={PAD_T + CELL_H}
          stroke="#C17B5E"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />
        <text
          x={PAD_L + GRID_W - 8}
          y={PAD_T + CELL_H - 6}
          textAnchor="end"
          fill="#C17B5E"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          opacity="0.8"
        >
          ↕ rippability boundary (Article I, II)
        </text>

        {/* axis2 column headers */}
        {AXIS2_ORDER.map((a2, xi) => (
          <g key={`h2-${a2}`}>
            <rect
              x={PAD_L + xi * CELL_W + 4}
              y={PAD_T - 40}
              width={CELL_W - 8}
              height={26}
              fill={PHASE_COLOR[a2]}
              fillOpacity={filterAxis2 === a2 ? 0.35 : 0.12}
              stroke={PHASE_COLOR[a2]}
              strokeOpacity={filterAxis2 === a2 ? 1 : 0.4}
              rx="4"
              style={{ cursor: "pointer" }}
              onClick={() => setFilterAxis2(filterAxis2 === a2 ? null : a2)}
            />
            <text
              x={PAD_L + xi * CELL_W + CELL_W / 2}
              y={PAD_T - 22}
              textAnchor="middle"
              fill={PHASE_COLOR[a2]}
              fontSize="13"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
              style={{ pointerEvents: "none" }}
            >
              {AXIS2_LABEL[a2]}
            </text>
          </g>
        ))}

        {/* axis1 row headers */}
        {AXIS1_ORDER.map((a1, yi) => (
          <g key={`h1-${a1}`}>
            <rect
              x={8}
              y={PAD_T + yi * CELL_H + 4}
              width={PAD_L - 20}
              height={CELL_H - 8}
              fill={AXIS1_COLOR[a1]}
              fillOpacity={filterAxis1 === a1 ? 0.28 : 0.08}
              stroke={AXIS1_COLOR[a1]}
              strokeOpacity={filterAxis1 === a1 ? 1 : 0.35}
              rx="4"
              style={{ cursor: "pointer" }}
              onClick={() => setFilterAxis1(filterAxis1 === a1 ? null : a1)}
            />
            <text
              x={24}
              y={PAD_T + yi * CELL_H + 22}
              fill={AXIS1_COLOR[a1]}
              fontSize="13"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
              style={{ pointerEvents: "none" }}
            >
              {a1.toUpperCase()}
            </text>
            <text
              x={24}
              y={PAD_T + yi * CELL_H + 40}
              fill={AXIS1_COLOR[a1]}
              fillOpacity="0.6"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              style={{ pointerEvents: "none" }}
            >
              {AXIS1_LABEL[a1].split("·")[1]?.trim()}
            </text>
          </g>
        ))}

        {/* cell count badges */}
        {AXIS1_ORDER.map((a1, yi) =>
          AXIS2_ORDER.map((a2, xi) => {
            const count = cellCounts[`${a1}|${a2}`] ?? 0;
            return (
              <text
                key={`count-${a1}-${a2}`}
                x={PAD_L + xi * CELL_W + CELL_W - 14}
                y={PAD_T + yi * CELL_H + 18}
                textAnchor="end"
                fill="#555"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                style={{ pointerEvents: "none" }}
              >
                {count}
              </text>
            );
          })
        )}

        {/* feature nodes */}
        {nodes.map(({ feature, cx, cy }) => {
          const dim = isDimmed(feature);
          const isHover = hovered === feature.slug;
          const color = AXIS1_COLOR[feature.axis1];
          const phaseColor = PHASE_COLOR[feature.axis2];
          return (
            <g
              key={feature.slug}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(feature.slug)}
              onMouseLeave={() => setHovered(null)}
              opacity={dim ? 0.22 : 1}
            >
              {isHover && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={22}
                  fill={phaseColor}
                  opacity="0.4"
                  filter="url(#am-glow)"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isHover ? 11 : 8}
                fill={color}
                stroke={phaseColor}
                strokeWidth="1.5"
              />
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill="#0e0e0e"
              />
              {isHover && (
                <text
                  x={cx}
                  y={cy - 18}
                  textAnchor="middle"
                  fill="#f5efe6"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  style={{ pointerEvents: "none" }}
                >
                  {feature.slug}
                </text>
              )}
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(${PAD_L}, ${H - 50})`}>
          <text
            x="0"
            y="0"
            fill="#888"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
          >
            28 features · axis1 fill = inner/outer · axis2 ring = phase
          </text>
          <g transform="translate(0, 14)">
            <circle cx="6" cy="6" r="6" fill={AXIS1_COLOR.inner} stroke={PHASE_COLOR["pre-loop"]} strokeWidth="1.5" />
            <text x="18" y="10" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">inner · pre-loop (5)</text>
            <circle cx="170" cy="6" r="6" fill={AXIS1_COLOR.inner} stroke={PHASE_COLOR["in-loop"]} strokeWidth="1.5" />
            <text x="182" y="10" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">inner · in-loop (3)</text>
            <circle cx="320" cy="6" r="6" fill={AXIS1_COLOR.outer} stroke={PHASE_COLOR["in-loop"]} strokeWidth="1.5" />
            <text x="332" y="10" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">outer · in-loop (10)</text>
            <circle cx="480" cy="6" r="6" fill={AXIS1_COLOR.outer} stroke={PHASE_COLOR["post-loop"]} strokeWidth="1.5" />
            <text x="492" y="10" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">outer · post-loop (3)</text>
          </g>
        </g>
      </svg>

      {/* detail panel */}
      <div className="max-w-5xl mx-auto mt-3 min-h-[88px] rounded-lg border border-stone-800 bg-stone-950/60 p-4 text-sm">
        {activeFeature ? (
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <code
                className="font-mono text-base"
                style={{ color: AXIS1_COLOR[activeFeature.axis1] }}
              >
                {activeFeature.slug}
              </code>
              <span
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  color: AXIS1_COLOR[activeFeature.axis1],
                  borderColor: AXIS1_COLOR[activeFeature.axis1],
                }}
              >
                axis1: {activeFeature.axis1}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  color: PHASE_COLOR[activeFeature.axis2],
                  borderColor: PHASE_COLOR[activeFeature.axis2],
                }}
              >
                axis2: {activeFeature.axis2}
              </span>
              <span className="text-xs text-stone-500">
                binds Article {activeFeature.article}
              </span>
            </div>
            <div className="mt-2 text-stone-300">{activeFeature.short}</div>
          </div>
        ) : (
          <div className="text-stone-500 italic">
            28 features across the 2×3 matrix. Hover a node to inspect; click a row/column header to isolate.
            The dashed line between rows is the <span className="text-[#C17B5E]">rippability boundary</span> (Article I + II) —
            when Claude Code absorbs an outer feature upstream, it crosses this line and becomes removable.
          </div>
        )}
      </div>

      <figcaption className="text-xs text-stone-500 text-center mt-2">
        2×3 axis matrix · inner vs outer (rippability) × pre/in/post-loop (HITL phase, Article III)
      </figcaption>
    </figure>
  );
}
