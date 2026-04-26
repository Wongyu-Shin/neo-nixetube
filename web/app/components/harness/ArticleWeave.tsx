"use client";

import { useState } from "react";

/*
 * ArticleWeave — 9 Articles × 10 phases grid.
 * Cell filled if the Article governs that phase. Hover for the "what
 * specifically does this Article do at this phase?" bullet.
 */

type Cell = { phase: number; article: number; note: string };

const PHASE_LABELS = [
  "0·Scaffold",
  "1·Clarify",
  "2·Plan",
  "3·Review",
  "4·Modify",
  "5·Verify",
  "6·Decide",
  "7·Log",
  "8·Repeat",
  "9·Report",
];

const ARTICLE_NAMES = [
  "I · Axis declaration",
  "II · Rippability",
  "III · HITL policy",
  "IV · Agent programs",
  "V · Clarify gate",
  "VI · Verify + ratchet",
  "VII · Persistence",
  "VIII · Commit history",
  "IX · Amendment",
];

const CELLS: Cell[] = [
  // Article I — axis declaration (touches clarify, plan, report)
  { phase: 1, article: 1, note: "every feature declares axis1/axis2 in clarif" },
  { phase: 2, article: 1, note: "plan wizard cross-checks axis against catalog" },
  { phase: 9, article: 1, note: "report.mdx § Axis coverage delta" },
  // Article II — rippability
  { phase: 1, article: 2, note: "clarify flags outer features whose rip-check nears trip" },
  { phase: 5, article: 2, note: "harness-rip-test ships one-line mechanical check" },
  { phase: 9, article: 2, note: "report notes any features ripped during the loop" },
  // Article III — HITL
  { phase: 2, article: 3, note: "ExitPlanMode = sole legal HITL entry into in-loop" },
  { phase: 3, article: 3, note: "review is silent to operator; no AskUserQuestion" },
  { phase: 4, article: 3, note: "L0/L1/L2 tiers; L2 may pause (carve-out 1)" },
  { phase: 5, article: 3, note: "verify runs unattended; no prompts" },
  { phase: 6, article: 3, note: "decide is deterministic; no operator judgment" },
  { phase: 7, article: 3, note: "statusline/telemetry are visibility, not HITL" },
  { phase: 8, article: 3, note: "Ctrl+C (carve-out 2); abandon command allowed" },
  // Article IV — agent programs
  { phase: 2, article: 4, note: "plan wizard selects modify strategy (adas/dgm)" },
  { phase: 3, article: 4, note: "reflexion trace reads → modulates parent selection" },
  { phase: 6, article: 4, note: "dgm-h parent-pick from archive" },
  { phase: 9, article: 4, note: "optional cross-domain-transfer audit" },
  // Article V — clarify gate
  { phase: 1, article: 5, note: "7-dim Q/A; [ASSUMPTION] on D1 fails guard" },
  { phase: 2, article: 5, note: "plan consumes clarif as input" },
  // Article VI — verify + ratchet
  { phase: 2, article: 6, note: "plan dry-runs verify to measure baseline" },
  { phase: 5, article: 6, note: "statistical-tc-runner with ≥N trials" },
  { phase: 6, article: 6, note: "noise-aware MAX ratchet; σ tolerance" },
  { phase: 8, article: 6, note: "plateau-detection (patience AND slope)" },
  { phase: 9, article: 6, note: "optional llm-as-judge-audit with rubric grade" },
  // Article VII — persistence
  { phase: 0, article: 7, note: "scaffold reads prior-loop wiki entries" },
  { phase: 3, article: 7, note: "wiki keyword-surfaced as <system-reminder>" },
  { phase: 7, article: 7, note: "reflexion entries appended to harness/reflexion/" },
  { phase: 9, article: 7, note: "/harness:wiki-add proposes new entries" },
  // Article VIII — commit history
  { phase: 0, article: 8, note: "loops/NNN-<slug>/ committed at scaffold" },
  { phase: 4, article: 8, note: "every candidate commits before verify" },
  { phase: 6, article: 8, note: "discards use git revert, not git reset" },
  { phase: 7, article: 8, note: "telemetry + per-iter line are committable artifacts" },
  { phase: 9, article: 8, note: "report.mdx is the handback artifact" },
  // Article IX — amendment
  { phase: 1, article: 9, note: "clarif can cite proposed amendment, but cannot redefine" },
  { phase: 9, article: 9, note: "report may propose amendment — separate loop to ratify" },
];

const COLORS = [
  "#B8A9C9",
  "#7B9EB8",
  "#C17B5E",
  "#D4A853",
  "#8FA376",
  "#6BA368",
  "#A87E4F",
  "#9A8CB8",
  "#C0A670",
];

export default function ArticleWeave() {
  const [hover, setHover] = useState<{ phase: number; article: number } | null>(null);

  const W = 820;
  const H = 380;
  const LEFT = 180;
  const TOP = 60;
  const CELL_W = (W - LEFT - 20) / 10;
  const CELL_H = (H - TOP - 40) / 9;

  const hoverCell = hover
    ? CELLS.find((c) => c.phase === hover.phase && c.article === hover.article)
    : null;

  return (
    <figure className="my-8">
      <div className="max-w-5xl mx-auto rounded-xl border border-stone-800 bg-stone-950/50 p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Weave of 9 Articles across 10 loop phases"
        >
          <rect x="0" y="0" width={W} height={H} fill="#0b0b0b" />

          <text
            x={LEFT}
            y={28}
            fill="#888"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1"
          >
            CONSTITUTION WEAVE · which Article governs which phase
          </text>

          {/* column headers (phases) */}
          {PHASE_LABELS.map((pl, i) => (
            <text
              key={pl}
              x={LEFT + CELL_W * (i + 0.5)}
              y={TOP - 8}
              textAnchor="middle"
              fill="#888"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              {pl}
            </text>
          ))}

          {/* row labels (articles) */}
          {ARTICLE_NAMES.map((an, r) => (
            <text
              key={an}
              x={LEFT - 10}
              y={TOP + CELL_H * (r + 0.5) + 4}
              textAnchor="end"
              fill={COLORS[r]}
              fontSize="10"
              fontFamily="ui-monospace, monospace"
            >
              {an}
            </text>
          ))}

          {/* grid cells */}
          {Array.from({ length: 9 }).map((_, r) =>
            Array.from({ length: 10 }).map((__, c) => {
              const cell = CELLS.find((x) => x.article === r + 1 && x.phase === c);
              const isHover = hover?.article === r + 1 && hover?.phase === c;
              return (
                <g
                  key={`${r}-${c}`}
                  onMouseEnter={() => setHover({ phase: c, article: r + 1 })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: cell ? "pointer" : "default" }}
                >
                  <rect
                    x={LEFT + CELL_W * c + 1}
                    y={TOP + CELL_H * r + 1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    fill={cell ? COLORS[r] : "#111"}
                    fillOpacity={cell ? (isHover ? 0.9 : 0.35) : 0.5}
                    stroke={cell ? COLORS[r] : "#1d1d1d"}
                    strokeOpacity={cell ? (isHover ? 1 : 0.7) : 1}
                    strokeWidth={isHover ? 1.6 : 0.8}
                  />
                  {cell && (
                    <circle
                      cx={LEFT + CELL_W * (c + 0.5)}
                      cy={TOP + CELL_H * (r + 0.5)}
                      r={3}
                      fill="#0b0b0b"
                    />
                  )}
                </g>
              );
            }),
          )}

          {/* column divider for pre/in/post */}
          <line
            x1={LEFT + CELL_W * 3}
            y1={TOP - 18}
            x2={LEFT + CELL_W * 3}
            y2={TOP + CELL_H * 9}
            stroke="#2a2a2a"
            strokeDasharray="3 3"
          />
          <line
            x1={LEFT + CELL_W * 9}
            y1={TOP - 18}
            x2={LEFT + CELL_W * 9}
            y2={TOP + CELL_H * 9}
            stroke="#2a2a2a"
            strokeDasharray="3 3"
          />
          <text
            x={LEFT + CELL_W * 1.5}
            y={TOP - 28}
            textAnchor="middle"
            fill="#7B9EB8"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1"
          >
            PRE-LOOP
          </text>
          <text
            x={LEFT + CELL_W * 6}
            y={TOP - 28}
            textAnchor="middle"
            fill="#D4A853"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1"
          >
            IN-LOOP
          </text>
          <text
            x={LEFT + CELL_W * 9.5}
            y={TOP - 28}
            textAnchor="middle"
            fill="#6BA368"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1"
          >
            POST
          </text>
        </svg>

        <div className="mt-3 rounded border border-stone-800 bg-stone-950/70 p-3 min-h-[70px] text-sm">
          {hoverCell ? (
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{
                    color: COLORS[hoverCell.article - 1],
                    border: `1px solid ${COLORS[hoverCell.article - 1]}`,
                  }}
                >
                  {ARTICLE_NAMES[hoverCell.article - 1]}
                </span>
                <span className="text-stone-500 text-xs font-mono">
                  × phase {PHASE_LABELS[hoverCell.phase]}
                </span>
              </div>
              <div className="mt-2 text-stone-300 text-[13px]">{hoverCell.note}</div>
            </div>
          ) : hover ? (
            <div className="text-stone-600 italic text-[13px]">
              {ARTICLE_NAMES[hover.article - 1]} does not govern phase{" "}
              {PHASE_LABELS[hover.phase]} — empty cell is a signal, not an omission.
            </div>
          ) : (
            <div className="text-stone-500 italic text-[13px]">
              Hover any cell. Filled = Article governs that phase. Empty columns
              are rare (phase 0 touches only Art. VII + VIII); Article III is the
              most horizontal — HITL policy is enforced at nearly every phase.
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
