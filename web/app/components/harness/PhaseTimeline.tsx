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
    title: "스캐폴드",
    detail: "/harness:new-loop <slug> 가 loops/NNN-<slug>/ 를 spec, clarif, plan 스켈레톤과 함께 생성한다.",
    features: ["harness-loop-scaffold"],
    hitl: "allowed",
  },
  {
    id: "clarify",
    num: 1,
    title: "명료화 (7차원)",
    detail: "Scope, metric, direction, HITL, stop, wiki, guard. D1의 [ASSUMPTION] 마커는 가드를 실패시킨다.",
    features: ["harness-clarify-gate", "harness-constitution"],
    hitl: "allowed",
  },
  {
    id: "plan",
    num: 2,
    title: "계획 + ExitPlanMode",
    detail: "autoresearch:plan 위저드가 컨피그를 생성하고 verify를 드라이런한다. 운영자의 ExitPlanMode가 유일한 HITL 게이트.",
    features: ["plan-mode-discipline"],
    hitl: "allowed",
  },
  {
    id: "review",
    num: 3,
    title: "리뷰",
    detail: "이터레이션마다: git log, TSV, 키워드로 표면화된 위키, reflexion 항목.",
    features: ["harness-llm-wiki", "reflexion"],
    hitl: "forbidden",
  },
  {
    id: "ideate-modify",
    num: 4,
    title: "발상 → 수정 → 커밋",
    detail: "L0 침묵, L1 알림 + 30초 자동 승인, L2 일시 정지 + 블로킹. Verify 전에 커밋 (조항 VIII).",
    features: ["harness-graduated-confirm", "cc-hook-guardrail", "sandboxed-open-ended-exploration"],
    hitl: "carve-out",
  },
  {
    id: "verify",
    num: 5,
    title: "검증 + 가드",
    detail: "n회 통계적 verify. composite-guard.sh 통과 필수 (스키마 + crosscheck 11/11).",
    features: ["statistical-tc-runner", "harness-rip-test"],
    hitl: "forbidden",
  },
  {
    id: "decide",
    num: 6,
    title: "keep/discard/rework 결정",
    detail: "노이즈 인지 MAX 래칫. 폐기는 git reset이 아니라 git revert로 (조항 VIII).",
    features: ["noise-aware-ratchet", "dgm-h-archive-parent-selection"],
    hitl: "forbidden",
  },
  {
    id: "log",
    num: 7,
    title: "로그 + 케이던스",
    detail: "이터레이션 행, 5회마다 마일스톤 블록, 영구 상태 줄, 텔레메트리 이벤트.",
    features: ["harness-progress-cadence", "gcli-agent-run-telemetry"],
    hitl: "forbidden",
  },
  {
    id: "repeat",
    num: 8,
    title: "반복 | 플래토 | 종료",
    detail: "Iterations=N 도달, 목표 달성, 플래토 (patience + slope), 또는 운영자의 포기에서 정지한다.",
    features: ["plateau-detection", "harness-pause-resume"],
    hitl: "carve-out",
  },
  {
    id: "report",
    num: 9,
    title: "리포트 + wiki-add",
    detail: "/harness:report → report.mdx. /harness:wiki-add → 키워드 트리거 항목. 선택: 저지 감사, 교차 도메인, A/B.",
    features: ["cc-post-loop-slash", "llm-as-judge-audit", "cross-domain-transfer-metric", "gcli-eval-compare-primitive"],
    hitl: "allowed",
  },
];

const GROUPS: { label: string; ids: string[]; color: string; article: string }[] = [
  { label: "루프 진입 전", ids: ["scaffold", "clarify", "plan"], color: "#7B9EB8", article: "V, III" },
  { label: "루프 내부", ids: ["review", "ideate-modify", "verify", "decide", "log", "repeat"], color: "#D4A853", article: "III, VI, VIII" },
  { label: "루프 종료 후", ids: ["report"], color: "#6BA368", article: "VII, VIII" },
];

const HITL_COLOR: Record<Phase["hitl"], string> = {
  allowed: "#6BA368",
  "carve-out": "#D4A853",
  forbidden: "#C17B5E",
};

const HITL_LABEL: Record<Phase["hitl"], string> = {
  allowed: "HITL 허용",
  "carve-out": "HITL 예외만",
  forbidden: "HITL 금지",
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
        aria-label="스캐폴드부터 리포트까지의 10단계 하네스 타임라인"
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
                조항 {g.article}
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
            상단 점 = HITL 정책 (조항 III):
          </text>
          <circle cx="4" cy="18" r="4" fill={HITL_COLOR.allowed} />
          <text x="14" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">허용</text>
          <circle cx="104" cy="18" r="4" fill={HITL_COLOR["carve-out"]} />
          <text x="114" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">예외</text>
          <circle cx="214" cy="18" r="4" fill={HITL_COLOR.forbidden} />
          <text x="224" y="22" fill="#aaa" fontSize="10" fontFamily="ui-monospace, monospace">금지</text>
        </g>
      </svg>

      <div className="max-w-5xl mx-auto mt-3 min-h-[96px] rounded-lg border border-stone-800 bg-stone-950/60 p-4 text-sm">
        {activePhase ? (
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-stone-500 font-mono text-xs">단계 {activePhase.num}</span>
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
            단계 노드 위에 마우스를 올린다. 단계별 HITL 정책은 조항 III를 따른다 —
            루프 진입 전/종료 후는 능동적 HITL을 허용하고, 루프 내부는 L2 단계적 확인과 Ctrl-C를 제외하면 금지된다.
          </div>
        )}
      </div>
    </figure>
  );
}
