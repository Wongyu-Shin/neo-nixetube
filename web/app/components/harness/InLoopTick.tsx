"use client";

import { useState, useMemo } from "react";

/*
 * InLoopTick — gold-tier interactive radial diagram of ONE iteration tick.
 *
 * PhaseTimeline shows the whole loop (scaffold → report, phases 0..9).
 * This component zooms into the *in-loop block only* — what happens between
 * one commit and the next. Eight wedges, eight gates, arranged as a clock
 * face so the reader sees the cyclic structure at a glance.
 *
 * Interaction: hover a wedge → highlight wedge + surface the feature slugs,
 * Article refs, and failure mode in the side panel. Click to pin.
 */

type HitlPolicy = "forbidden" | "carve-out" | "allowed";

type Gate = {
  id: string;
  idx: number; // 0-based position around the clock (0 = 12 o'clock)
  title: string;
  short: string;
  detail: string;
  features: string[];
  articles: string[];
  hitl: HitlPolicy;
  failure: string; // what goes wrong if this gate is skipped
  color: string;
  category: "read" | "write" | "check" | "decide" | "log";
};

const GATES: Gate[] = [
  {
    id: "review",
    idx: 0,
    title: "1 · Review",
    short: "load state",
    detail:
      "Pull git log, TSV, reflexion trace, and wiki keyword-surface. The Constitution is already pinned.",
    features: ["harness-llm-wiki", "reflexion", "harness-constitution"],
    articles: ["I", "VII"],
    hitl: "forbidden",
    failure: "skipping review → ideation loses the prior-iter lesson ledger",
    color: "#7B9EB8",
    category: "read",
  },
  {
    id: "ideate",
    idx: 1,
    title: "2 · Ideate",
    short: "propose change",
    detail:
      "Agent drafts one atomic change. No side effects yet. Direction is set by the spec, not the operator.",
    features: ["adas-meta-agent-search", "dgm-h-archive-parent-selection"],
    articles: ["IV", "V"],
    hitl: "forbidden",
    failure: "unscoped ideation → drift from Direction, later-phase discard",
    color: "#B8A9C9",
    category: "write",
  },
  {
    id: "modify",
    idx: 2,
    title: "3 · Modify",
    short: "edit files",
    detail:
      "L0 ops silent · L1 ops notify with 30s auto-approve · L2 ops pause. Hook guardrail denies Bash outside scope.",
    features: ["harness-graduated-confirm", "cc-hook-guardrail", "sandboxed-open-ended-exploration"],
    articles: ["III"],
    hitl: "carve-out",
    failure: "modify without sandbox → irreversible damage on L2 miss",
    color: "#D4A853",
    category: "write",
  },
  {
    id: "commit",
    idx: 3,
    title: "4 · Commit",
    short: "git commit",
    detail:
      "Every candidate commits before verify — discards use git revert, not git reset (Article VIII). Failure is a lesson in history.",
    features: ["harness-loop-scaffold"],
    articles: ["VIII"],
    hitl: "forbidden",
    failure: "reset --hard on discard → lost lesson, un-auditable history",
    color: "#C17B5E",
    category: "write",
  },
  {
    id: "verify",
    idx: 4,
    title: "5 · Verify",
    short: "n-trial run",
    detail:
      "Statistical runner with ≥N trials; noise-aware. composite-guard.sh must pass schema + crosscheck 11/11.",
    features: ["statistical-tc-runner", "harness-rip-test"],
    articles: ["VI"],
    hitl: "forbidden",
    failure: "single-trial verify → noise mistaken for signal, false keep",
    color: "#6BA368",
    category: "check",
  },
  {
    id: "decide",
    idx: 5,
    title: "6 · Decide",
    short: "keep / discard",
    detail:
      "Ratchet on MAX with σ tolerance — never weaken anchor on noise. Parent-selection pulls from the archive if none pass.",
    features: ["noise-aware-ratchet", "dgm-h-archive-parent-selection", "plateau-detection"],
    articles: ["VI"],
    hitl: "forbidden",
    failure: "MEAN ratchet → ratchet walks backward on a bad-luck iter",
    color: "#8FA376",
    category: "decide",
  },
  {
    id: "log",
    idx: 6,
    title: "7 · Log",
    short: "telemetry tick",
    detail:
      "One-line per-iter entry, a 5-iter milestone block, a statusline refresh, a telemetry event. No operator prompt.",
    features: ["harness-progress-cadence", "gcli-agent-run-telemetry"],
    articles: ["III", "VIII"],
    hitl: "forbidden",
    failure: "silent loop → operator can't glance-monitor; oversight dies",
    color: "#7B9EB8",
    category: "log",
  },
  {
    id: "reflect",
    idx: 7,
    title: "8 · Reflect",
    short: "critique → wiki",
    detail:
      "Append a reflexion entry. Check plateau (patience AND slope). If either trips, exit loop; else return to Review.",
    features: ["reflexion", "plateau-detection", "meta-hyperagents-metacognitive"],
    articles: ["IV", "VII"],
    hitl: "forbidden",
    failure: "no reflexion → next iter repeats the same dead-end",
    color: "#D4A853",
    category: "check",
  },
];

const HITL_COLOR: Record<HitlPolicy, string> = {
  forbidden: "#C17B5E",
  "carve-out": "#D4A853",
  allowed: "#6BA368",
};

const HITL_LABEL: Record<HitlPolicy, string> = {
  forbidden: "HITL forbidden",
  "carve-out": "HITL carve-out",
  allowed: "HITL allowed",
};

const CATEGORY_LABEL: Record<Gate["category"], string> = {
  read: "READ",
  write: "WRITE",
  check: "CHECK",
  decide: "DECIDE",
  log: "LOG",
};

/* polar → cartesian around (cx, cy) */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* build an SVG annular-wedge path */
function wedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
) {
  const p1 = polar(cx, cy, rOuter, startDeg);
  const p2 = polar(cx, cy, rOuter, endDeg);
  const p3 = polar(cx, cy, rInner, endDeg);
  const p4 = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function InLoopTick() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>("verify");

  const activeId = hovered ?? pinned;
  const active = useMemo(
    () => (activeId ? GATES.find((g) => g.id === activeId) ?? null : null),
    [activeId],
  );

  const W = 720;
  const H = 520;
  const CX = 260;
  const CY = 260;
  const R_OUTER = 210;
  const R_INNER = 100;
  const R_LABEL = 240;
  const R_CATEGORY = 75;
  const N = GATES.length;
  const SLICE = 360 / N;
  const GAP = 2.2; // visual gap between wedges (deg)

  return (
    <figure className="my-8">
      <div className="max-w-5xl mx-auto rounded-xl border border-stone-800 bg-stone-950/50 p-4">
        <div className="grid md:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Eight-wedge radial diagram of one in-loop iteration tick"
          >
            <defs>
              <radialGradient id="tick-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0b0b0b" />
              </radialGradient>
              <filter id="tick-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
            </defs>

            <rect x="0" y="0" width={W} height={H} fill="#0b0b0b" />

            {/* faint guide rings */}
            <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#1d1d1d" />
            <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#1d1d1d" />
            <circle cx={CX} cy={CY} r={(R_OUTER + R_INNER) / 2} fill="none" stroke="#1d1d1d" strokeDasharray="2 3" />

            {/* center disc */}
            <circle cx={CX} cy={CY} r={R_INNER - 6} fill="url(#tick-bg)" stroke="#2a2a2a" />
            <text
              x={CX}
              y={CY - 18}
              textAnchor="middle"
              fill="#666"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              letterSpacing="2"
            >
              IN-LOOP TICK
            </text>
            <text
              x={CX}
              y={CY + 2}
              textAnchor="middle"
              fill="#D4A853"
              fontSize="26"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
            >
              8
            </text>
            <text
              x={CX}
              y={CY + 22}
              textAnchor="middle"
              fill="#888"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              gates / iter
            </text>
            <text
              x={CX}
              y={CY + 42}
              textAnchor="middle"
              fill="#6BA368"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              opacity="0.8"
            >
              Article III, VI, VIII
            </text>

            {/* wedges */}
            {GATES.map((g) => {
              const startDeg = g.idx * SLICE + GAP / 2;
              const endDeg = (g.idx + 1) * SLICE - GAP / 2;
              const midDeg = (startDeg + endDeg) / 2;
              const isActive = activeId === g.id;
              const path = wedgePath(CX, CY, R_INNER, R_OUTER, startDeg, endDeg);
              const labelPt = polar(CX, CY, R_LABEL, midDeg);
              const catPt = polar(CX, CY, R_CATEGORY + 20, midDeg);
              const hitlPt = polar(CX, CY, R_OUTER - 14, midDeg);
              const titlePt = polar(CX, CY, (R_OUTER + R_INNER) / 2 + 2, midDeg);
              const subPt = polar(CX, CY, (R_OUTER + R_INNER) / 2 - 18, midDeg);
              return (
                <g
                  key={g.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(g.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setPinned(g.id)}
                >
                  {isActive && (
                    <path
                      d={path}
                      fill={g.color}
                      fillOpacity="0.35"
                      filter="url(#tick-glow)"
                    />
                  )}
                  <path
                    d={path}
                    fill={g.color}
                    fillOpacity={isActive ? 0.28 : 0.11}
                    stroke={g.color}
                    strokeOpacity={isActive ? 0.95 : 0.55}
                    strokeWidth={isActive ? 1.8 : 1}
                  />
                  {/* HITL dot near outer edge */}
                  <circle
                    cx={hitlPt.x}
                    cy={hitlPt.y}
                    r={4}
                    fill={HITL_COLOR[g.hitl]}
                    fillOpacity={isActive ? 1 : 0.6}
                  />
                  {/* wedge title */}
                  <text
                    x={titlePt.x}
                    y={titlePt.y}
                    textAnchor="middle"
                    fill={isActive ? "#fff" : "#d4d4d4"}
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {g.title}
                  </text>
                  <text
                    x={subPt.x}
                    y={subPt.y}
                    textAnchor="middle"
                    fill={g.color}
                    fillOpacity="0.85"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    style={{ pointerEvents: "none" }}
                  >
                    {g.short}
                  </text>
                  {/* outer label (category) */}
                  <text
                    x={labelPt.x}
                    y={labelPt.y}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    letterSpacing="1"
                    style={{ pointerEvents: "none" }}
                  >
                    {CATEGORY_LABEL[g.category]}
                  </text>
                  {/* inner category dot */}
                  <circle
                    cx={catPt.x}
                    cy={catPt.y}
                    r={2.5}
                    fill={g.color}
                    fillOpacity="0.8"
                  />
                </g>
              );
            })}

            {/* direction arrow (clockwise) */}
            <g transform={`translate(${CX}, ${CY})`} opacity="0.45">
              <path
                d="M -40 -60 A 72 72 0 0 1 40 -60"
                fill="none"
                stroke="#D4A853"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <path d="M 40 -60 L 34 -66 L 34 -54 Z" fill="#D4A853" />
            </g>

            {/* legend (HITL dots) */}
            <g transform={`translate(${W - 210}, 30)`}>
              <text
                x="0"
                y="0"
                fill="#777"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                letterSpacing="1"
              >
                HITL DOT (Art. III)
              </text>
              <circle cx="6" cy="22" r="4" fill={HITL_COLOR.forbidden} />
              <text x="18" y="26" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">
                forbidden
              </text>
              <circle cx="6" cy="42" r="4" fill={HITL_COLOR["carve-out"]} />
              <text x="18" y="46" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">
                carve-out (L2)
              </text>
              <circle cx="6" cy="62" r="4" fill={HITL_COLOR.allowed} />
              <text x="18" y="66" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">
                allowed
              </text>
            </g>

            {/* ring annotation */}
            <g transform={`translate(${W - 210}, 110)`}>
              <text
                x="0"
                y="0"
                fill="#777"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                letterSpacing="1"
              >
                GATE CATEGORY
              </text>
              {(["read", "write", "check", "decide", "log"] as Gate["category"][]).map(
                (cat, i) => (
                  <g key={cat} transform={`translate(0, ${18 + i * 14})`}>
                    <rect x="0" y="-7" width="10" height="10" fill="#333" />
                    <text
                      x="18"
                      y="2"
                      fill="#9a9a9a"
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                    >
                      {CATEGORY_LABEL[cat]}
                    </text>
                  </g>
                ),
              )}
            </g>

            {/* arrow out of 8 → back to 1 */}
            <g opacity="0.55">
              <path
                d={`M ${polar(CX, CY, R_OUTER + 8, -SLICE / 2 + 4).x} ${
                  polar(CX, CY, R_OUTER + 8, -SLICE / 2 + 4).y
                } A ${R_OUTER + 8} ${R_OUTER + 8} 0 0 1 ${
                  polar(CX, CY, R_OUTER + 8, SLICE / 2 - 4).x
                } ${polar(CX, CY, R_OUTER + 8, SLICE / 2 - 4).y}`}
                fill="none"
                stroke="#D4A853"
                strokeWidth="1.5"
              />
              <text
                x={CX}
                y={CY - (R_OUTER + 28)}
                textAnchor="middle"
                fill="#D4A853"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                letterSpacing="1"
              >
                loop back
              </text>
            </g>
          </svg>

          <aside className="min-h-[440px] rounded-lg border border-stone-800 bg-stone-950/70 p-4 text-sm">
            {active ? (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ color: active.color, borderColor: active.color, border: "1px solid" }}
                  >
                    {CATEGORY_LABEL[active.category]}
                  </span>
                  <span className="text-base font-semibold text-stone-100">{active.title}</span>
                </div>
                <div
                  className="mt-2 text-xs uppercase tracking-wide"
                  style={{ color: HITL_COLOR[active.hitl] }}
                >
                  {HITL_LABEL[active.hitl]}
                </div>
                <p className="mt-3 text-stone-300 leading-relaxed text-[13px]">
                  {active.detail}
                </p>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-stone-500">
                    Features
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {active.features.map((f) => (
                      <code
                        key={f}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800"
                      >
                        {f}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-wide text-stone-500">
                    Articles
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {active.articles.map((a) => (
                      <span
                        key={a}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853] font-mono"
                      >
                        Art. {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded border border-[#C17B5E]/30 bg-[#C17B5E]/[0.06] p-2.5">
                  <div className="text-[10px] uppercase tracking-wide text-[#C17B5E]">
                    Failure mode
                  </div>
                  <div className="mt-1 text-[12px] text-stone-300 leading-snug">
                    {active.failure}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-stone-500 italic text-[13px]">
                Hover or click a wedge. Eight gates fire in fixed clockwise order
                per iteration — seven are HITL-forbidden, one (Modify) carves out
                L2 graduated-confirm. The wheel is <em>cyclic</em>: Reflect loops
                back to Review unless plateau or goal-achieved trips.
              </div>
            )}
          </aside>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          <div className="rounded border border-stone-800 bg-stone-900/40 p-2.5">
            <div className="text-stone-600 uppercase tracking-wide text-[9px]">
              commit-before-verify
            </div>
            <div className="mt-1 text-stone-300">
              every candidate lives in history (Art. VIII); discard = git revert.
            </div>
          </div>
          <div className="rounded border border-stone-800 bg-stone-900/40 p-2.5">
            <div className="text-stone-600 uppercase tracking-wide text-[9px]">
              ratchet = MAX, not MEAN
            </div>
            <div className="mt-1 text-stone-300">
              judge noise (σ≈10) cannot walk anchor backward (Art. VI).
            </div>
          </div>
          <div className="rounded border border-stone-800 bg-stone-900/40 p-2.5">
            <div className="text-stone-600 uppercase tracking-wide text-[9px]">
              7/8 gates silent
            </div>
            <div className="mt-1 text-stone-300">
              only Modify can pause; visibility runs on the statusline (Art. III).
            </div>
          </div>
          <div className="rounded border border-stone-800 bg-stone-900/40 p-2.5">
            <div className="text-stone-600 uppercase tracking-wide text-[9px]">
              reflexion in-band
            </div>
            <div className="mt-1 text-stone-300">
              gate 8 writes a lesson read at gate 1 next tick (Art. VII).
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
