"use client";

import { useState } from "react";

type Trigger = {
  id: string;
  num: number;
  label: string;
  source: "auto" | "operator";
  feature: string;
  article: string;
  lossy: boolean;
  detail: string;
};

const TRIGGERS: Trigger[] = [
  {
    id: "bounded",
    num: 1,
    label: "Iterations: N reached",
    source: "auto",
    feature: "harness-progress-cadence",
    article: "VI",
    lossy: false,
    detail:
      "Spec declares a hard budget. Counter in the statusline ticks toward N; when it hits, the loop exits cleanly and /harness:report fires.",
  },
  {
    id: "goal",
    num: 2,
    label: "Goal-achieved (metric hits target)",
    source: "auto",
    feature: "statistical-tc-runner",
    article: "VI",
    lossy: false,
    detail:
      "Verify returns a run where the ratchet meets spec's target. The statistical runner must confirm with ≥N trials — single-trial wins do not stop the loop.",
  },
  {
    id: "plateau",
    num: 3,
    label: "Plateau (patience AND slope)",
    source: "auto",
    feature: "plateau-detection",
    article: "VI",
    lossy: false,
    detail:
      "Both conditions fire: patience (P iters without a new MAX) AND slope (linear fit over window < ε). Either alone is insufficient — ratchet noise can fake a plateau.",
  },
  {
    id: "abandon",
    num: 4,
    label: "Operator abandon",
    source: "operator",
    feature: "harness-pause-resume",
    article: "III, VIII",
    lossy: false,
    detail:
      "/harness:abandon writes a final checkpoint, commits any in-flight candidate, and calls /harness:report. The loop exits but history stays intact.",
  },
  {
    id: "ctrlc",
    num: 5,
    label: "Ctrl+C (emergency stop)",
    source: "operator",
    feature: "harness-pause-resume",
    article: "III",
    lossy: true,
    detail:
      "The second Article III carve-out. Immediate interrupt — any in-flight modification is NOT committed, telemetry may miss the last event, and the report must be reconstructed from the last stable commit.",
  },
];

export default function StopConditionsChart() {
  const [active, setActive] = useState<string | null>(null);
  const W = 780;
  const H = 300;
  const PAD_L = 110;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 70;
  const STEP = (W - PAD_L - PAD_R) / TRIGGERS.length;

  const rowY = (source: "auto" | "operator") =>
    source === "auto" ? PAD_T + 40 : PAD_T + 140;

  const activeTrigger = active ? TRIGGERS.find((t) => t.id === active) ?? null : null;

  return (
    <figure className="my-8">
      <div className="max-w-5xl mx-auto rounded-xl border border-stone-800 bg-stone-950/50 p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Five stop conditions grouped by auto vs operator"
        >
          <rect x="0" y="0" width={W} height={H} fill="#0b0b0b" />

          {/* row labels */}
          <g>
            <rect
              x={20}
              y={PAD_T + 14}
              width={PAD_L - 40}
              height={52}
              fill="#7B9EB8"
              fillOpacity="0.08"
              stroke="#7B9EB8"
              strokeOpacity="0.4"
              rx="4"
            />
            <text
              x={PAD_L / 2}
              y={PAD_T + 42}
              textAnchor="middle"
              fill="#7B9EB8"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              AUTOMATIC
            </text>
            <text
              x={PAD_L / 2}
              y={PAD_T + 56}
              textAnchor="middle"
              fill="#7B9EB8"
              fillOpacity="0.6"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              3 of 5
            </text>

            <rect
              x={20}
              y={PAD_T + 114}
              width={PAD_L - 40}
              height={52}
              fill="#C17B5E"
              fillOpacity="0.08"
              stroke="#C17B5E"
              strokeOpacity="0.4"
              rx="4"
            />
            <text
              x={PAD_L / 2}
              y={PAD_T + 142}
              textAnchor="middle"
              fill="#C17B5E"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              OPERATOR
            </text>
            <text
              x={PAD_L / 2}
              y={PAD_T + 156}
              textAnchor="middle"
              fill="#C17B5E"
              fillOpacity="0.6"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              2 of 5
            </text>
          </g>

          {/* header */}
          <text
            x={PAD_L}
            y={30}
            fill="#888"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1"
          >
            FIVE STOP TRIGGERS · a loop terminates on exactly one
          </text>

          {/* triggers */}
          {TRIGGERS.map((t, i) => {
            const cx = PAD_L + STEP * (i + 0.5);
            const cy = rowY(t.source);
            const isActive = active === t.id;
            const color = t.source === "auto" ? "#7B9EB8" : "#C17B5E";
            return (
              <g
                key={t.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActive(t.id)}
                onMouseLeave={() => setActive(null)}
              >
                <rect
                  x={cx - 52}
                  y={cy - 26}
                  width={104}
                  height={52}
                  rx={6}
                  fill={color}
                  fillOpacity={isActive ? 0.22 : 0.08}
                  stroke={color}
                  strokeOpacity={isActive ? 0.95 : 0.55}
                  strokeWidth={isActive ? 1.8 : 1}
                />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill={color}
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                >
                  #{t.num}
                </text>
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fill="#d4d4d4"
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                >
                  {t.label.split(" ").slice(0, 2).join(" ")}
                </text>
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill="#999"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                >
                  {t.label.split(" ").slice(2).join(" ") || " "}
                </text>
                {t.lossy && (
                  <g>
                    <circle cx={cx + 44} cy={cy - 18} r={6} fill="#C17B5E" />
                    <text
                      x={cx + 44}
                      y={cy - 15}
                      textAnchor="middle"
                      fill="#0b0b0b"
                      fontSize="8"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="700"
                    >
                      !
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* footer annotation */}
          <g transform={`translate(${PAD_L}, ${H - 16})`}>
            <circle cx="4" cy="-4" r="5" fill="#C17B5E" />
            <text
              x="4"
              y="-1"
              textAnchor="middle"
              fill="#0b0b0b"
              fontSize="8"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
            >
              !
            </text>
            <text x="16" y="0" fill="#888" fontSize="10" fontFamily="ui-monospace, monospace">
              lossy: in-flight work may not be fully committed/reported
            </text>
          </g>
        </svg>

        <div className="mt-3 rounded-lg border border-stone-800 bg-stone-950/70 p-3 text-sm min-h-[88px]">
          {activeTrigger ? (
            <>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded border"
                  style={{
                    color: activeTrigger.source === "auto" ? "#7B9EB8" : "#C17B5E",
                    borderColor: activeTrigger.source === "auto" ? "#7B9EB8" : "#C17B5E",
                  }}
                >
                  {activeTrigger.source.toUpperCase()}
                </span>
                <span className="font-semibold text-stone-100">
                  #{activeTrigger.num} · {activeTrigger.label}
                </span>
                <code className="text-[11px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800 ml-auto">
                  {activeTrigger.feature}
                </code>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853] font-mono">
                  Art. {activeTrigger.article}
                </span>
              </div>
              <div className="mt-2 text-stone-300 text-[13px] leading-relaxed">
                {activeTrigger.detail}
              </div>
            </>
          ) : (
            <div className="text-stone-500 italic text-[13px]">
              Hover a trigger. Exactly one fires per loop — three are automatic
              (bounded, goal, plateau), two are operator-initiated (abandon,
              Ctrl+C). Only Ctrl+C is lossy.
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
