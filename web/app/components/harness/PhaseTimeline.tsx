"use client";

import { useState } from "react";

type Phase = {
  id: string;
  num: number;
  title: string;
  detail: string;
  features: string[];
  hitl: "allowed" | "forbidden" | "carve-out";
};

const PHASES: Phase[] = [
  {
    id: "scaffold",
    num: 0,
    title: "Scaffold",
    detail: "/harness:new-loop <slug> creates loops/NNN-<slug>/ with spec, clarif, plan skeletons.",
    features: ["harness-loop-scaffold"],
    hitl: "allowed",
  },
  {
    id: "clarify",
    num: 1,
    title: "Clarify (7-dim)",
    detail: "Scope, metric, direction, HITL, stop, wiki, guard. [ASSUMPTION] markers on D1 fail guard.",
    features: ["harness-clarify-gate", "harness-constitution"],
    hitl: "allowed",
  },
  {
    id: "plan",
    num: 2,
    title: "Plan + ExitPlanMode",
    detail: "autoresearch:plan wizard produces config, dry-runs verify. Operator ExitPlanMode = sole HITL gate.",
    features: ["plan-mode-discipline"],
    hitl: "allowed",
  },
  {
    id: "review",
    num: 3,
    title: "Review",
    detail: "Per-iter: git log, TSV, wiki keyword-surfaced, reflexion entries.",
    features: ["harness-llm-wiki", "reflexion"],
    hitl: "forbidden",
  },
  {
    id: "ideate-modify",
    num: 4,
    title: "Ideate → Modify → Commit",
    detail: "L0 silent, L1 notify+30s auto-approve, L2 pause+blocking. Commit before Verify (Article VIII).",
    features: ["harness-graduated-confirm", "cc-hook-guardrail", "sandboxed-open-ended-exploration"],
    hitl: "carve-out",
  },
  {
    id: "verify",
    num: 5,
    title: "Verify + Guard",
    detail: "n-trial statistical verify. composite-guard.sh must pass (schema + crosscheck 11/11).",
    features: ["statistical-tc-runner", "harness-rip-test"],
    hitl: "forbidden",
  },
  {
    id: "decide",
    num: 6,
    title: "Decide keep/discard/rework",
    detail: "Noise-aware MAX ratchet. Discards use git revert, not reset (Article VIII).",
    features: ["noise-aware-ratchet", "dgm-h-archive-parent-selection"],
    hitl: "forbidden",
  },
  {
    id: "log",
    num: 7,
    title: "Log + cadence",
    detail: "Per-iter line, 5-iter milestone block, persistent statusline, telemetry event.",
    features: ["harness-progress-cadence", "gcli-agent-run-telemetry"],
    hitl: "forbidden",
  },
  {
    id: "repeat",
    num: 8,
    title: "Repeat | plateau | bounded",
    detail: "Stop on Iterations=N, goal-achieved, plateau (patience+slope), or operator abandon.",
    features: ["plateau-detection", "harness-pause-resume"],
    hitl: "carve-out",
  },
  {
    id: "report",
    num: 9,
    title: "Report + wiki-add",
    detail: "/harness:report → report.mdx. /harness:wiki-add → keyword-triggered entries. Optional: judge audit, cross-domain, A/B.",
    features: ["cc-post-loop-slash", "llm-as-judge-audit", "cross-domain-transfer-metric", "gcli-eval-compare-primitive"],
    hitl: "allowed",
  },
];

const GROUPS: { label: string; ids: string[]; color: string; article: string }[] = [
  { label: "PRE-LOOP", ids: ["scaffold", "clarify", "plan"], color: "#7B9EB8", article: "V, III" },
  { label: "IN-LOOP", ids: ["review", "ideate-modify", "verify", "decide", "log", "repeat"], color: "#D4A853", article: "III, VI, VIII" },
  { label: "POST-LOOP", ids: ["report"], color: "#6BA368", article: "VII, VIII" },
];

const HITL_COLOR: Record<Phase["hitl"], string> = {
  allowed: "#6BA368",
  "carve-out": "#D4A853",
  forbidden: "#C17B5E",
};

const HITL_LABEL: Record<Phase["hitl"], string> = {
  allowed: "HITL allowed",
  "carve-out": "HITL carve-out only",
  forbidden: "HITL forbidden",
};

export default function PhaseTimeline() {
  const [active, setActive] = useState<string | null>(null);

  const W = 900;
  const H = 340;
  const TRACK_Y = 150;
  const PAD = 50;
  const STEP = (W - PAD * 2) / (PHASES.length - 1);

  const activePhase = active ? PHASES.find((p) => p.id === active) ?? null : null;

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-5xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="10-phase harness timeline from scaffold to report"
      >
        <defs>
          <linearGradient id="pt-track" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7B9EB8" />
            <stop offset="33%" stopColor="#7B9EB8" />
            <stop offset="34%" stopColor="#D4A853" />
            <stop offset="88%" stopColor="#D4A853" />
            <stop offset="89%" stopColor="#6BA368" />
            <stop offset="100%" stopColor="#6BA368" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="#0e0e0e" />

        {/* group bands */}
        {GROUPS.map((g, gi) => {
          const firstIdx = PHASES.findIndex((p) => p.id === g.ids[0]);
          const lastIdx = PHASES.findIndex((p) => p.id === g.ids[g.ids.length - 1]);
          const x1 = PAD + firstIdx * STEP - 24;
          const x2 = PAD + lastIdx * STEP + 24;
          return (
            <g key={g.label}>
              <rect
                x={x1}
                y={62}
                width={x2 - x1}
                height={30}
                fill={g.color}
                fillOpacity="0.1"
                stroke={g.color}
                strokeOpacity="0.45"
                rx="4"
              />
              <text
                x={(x1 + x2) / 2}
                y={82}
                textAnchor="middle"
                fill={g.color}
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                {g.label}
              </text>
              <text
                x={(x1 + x2) / 2}
                y={56}
                textAnchor="middle"
                fill={g.color}
                fillOpacity="0.55"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                Article {g.article}
              </text>
            </g>
          );
        })}

        {/* main track */}
        <line
          x1={PAD}
          y1={TRACK_Y}
          x2={W - PAD}
          y2={TRACK_Y}
          stroke="url(#pt-track)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* phase nodes */}
        {PHASES.map((p, i) => {
          const cx = PAD + i * STEP;
          const isActive = active === p.id;
          const group = GROUPS.find((g) => g.ids.includes(p.id))!;
          return (
            <g
              key={p.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
            >
              <circle
                cx={cx}
                cy={TRACK_Y}
                r={isActive ? 18 : 13}
                fill={group.color}
                fillOpacity={isActive ? 0.35 : 0.12}
              />
              <circle
                cx={cx}
                cy={TRACK_Y}
                r={9}
                fill="#111"
                stroke={group.color}
                strokeWidth="2"
              />
              <text
                x={cx}
                y={TRACK_Y + 4}
                textAnchor="middle"
                fill={group.color}
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                style={{ pointerEvents: "none" }}
              >
                {p.num}
              </text>
              <text
                x={cx}
                y={TRACK_Y + 38}
                textAnchor="middle"
                fill="#d4d4d4"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                style={{ pointerEvents: "none" }}
              >
                {p.title.split(" ")[0]}
              </text>
              <circle
                cx={cx}
                cy={TRACK_Y - 26}
                r={4}
                fill={HITL_COLOR[p.hitl]}
                fillOpacity={isActive ? 1 : 0.55}
              />
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(${PAD}, ${H - 40})`}>
          <text x="0" y="0" fill="#888" fontSize="10" fontFamily="ui-monospace, monospace">
            top dot = HITL policy (Article III):
          </text>
          <circle cx="4" cy="18" r="4" fill={HITL_COLOR.allowed} />
          <text x="14" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">allowed</text>
          <circle cx="104" cy="18" r="4" fill={HITL_COLOR["carve-out"]} />
          <text x="114" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">carve-out</text>
          <circle cx="214" cy="18" r="4" fill={HITL_COLOR.forbidden} />
          <text x="224" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">forbidden</text>
        </g>
      </svg>

      <div className="max-w-5xl mx-auto mt-3 min-h-[96px] rounded-lg border border-stone-800 bg-stone-950/60 p-4 text-sm">
        {activePhase ? (
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-stone-500 font-mono text-xs">phase {activePhase.num}</span>
              <span className="text-base font-semibold text-stone-200">{activePhase.title}</span>
              <span
                className="text-xs px-2 py-0.5 rounded border"
                style={{ color: HITL_COLOR[activePhase.hitl], borderColor: HITL_COLOR[activePhase.hitl] }}
              >
                {HITL_LABEL[activePhase.hitl]}
              </span>
            </div>
            <div className="mt-2 text-stone-300">{activePhase.detail}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activePhase.features.map((f) => (
                <code
                  key={f}
                  className="text-[11px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800"
                >
                  {f}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-stone-500 italic">
            Hover a phase node. HITL policy per phase follows Article III —
            pre/post-loop allow active HITL, in-loop is forbidden except for L2 graduated-confirm and Ctrl-C.
          </div>
        )}
      </div>
    </figure>
  );
}
