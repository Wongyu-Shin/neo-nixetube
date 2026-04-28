"use client";

import { useState } from "react";

/**
 * Interactive 9-Article grid. Each card surfaces which loop phase
 * the Article binds and which page sections/components cite it.
 * Source of truth: harness/CONSTITUTION.md.
 */

type Art = {
  n: string;
  title: string;
  phase: "pre" | "in" | "post" | "all";
  summary: string;
  bindsTo: string;
};

const ARTICLES: Art[] = [
  {
    n: "I",
    title: "축 분류",
    phase: "pre",
    summary: "axis1 ∈ {내부, 외부}; axis2 ∈ {진입 전, 내부, 종료 후}. 피처별 일차 단계는 정확히 하나.",
    bindsTo: "spec.md — 피처 프론트매터",
  },
  {
    n: "II",
    title: "흡수 가능성",
    phase: "all",
    summary: "모든 피처는 rippable_check + tc_script + applicability를 가진다. 희망적 흡수 가능성은 금지.",
    bindsTo: "features/*.md 프론트매터; harness-rip-test",
  },
  {
    n: "III",
    title: "HITL은 루프 바깥에 산다",
    phase: "in",
    summary: "루프 내부 HITL 금지, 예외는 L2 단계적 확인과 비상 Ctrl+C 둘뿐.",
    bindsTo: "HarnessFlowDiagram, IterationPhaseRing, HITLBoundaryChart",
  },
  {
    n: "IV",
    title: "정렬 무관 분리",
    phase: "pre",
    summary: "평가 스킬 ≠ 자기 수정 스킬. Scope는 {harness, content} 중 정확히 한쪽에만 산다.",
    bindsTo: "D1 명료화 차원; ClarifyDimensionsRadar",
  },
  {
    n: "V",
    title: "명시적 명료화",
    phase: "pre",
    summary: "루프 내부 진입 전 Clarifications 절 필수. 가정은 [ASSUMPTION] 으로 표시.",
    bindsTo: "/harness:clarify; harness-clarify-gate",
  },
  {
    n: "VI",
    title: "모순 금지",
    phase: "in",
    summary: "매 이터레이션은 composite-guard = guard.sh + crosscheck.sh = 11/11 을 실행한다.",
    bindsTo: "Phase 6 결정; composite-guard.sh",
  },
  {
    n: "VII",
    title: "LLM 위키 영속",
    phase: "post",
    summary: "프로젝트 범위 루프 횡단 지식 → harness/wiki/<slug>.md 만 자격이 있다. 그 외는 해당 없음.",
    bindsTo: "PersistenceLayers, WikiLineageFlow, /harness:wiki-add",
  },
  {
    n: "VIII",
    title: "Git이 곧 메모리",
    phase: "in",
    summary: "Verify 전에 커밋. 폐기는 git revert로. 루프당 TSV 하나 (gitignored).",
    bindsTo: "Phase 4 커밋; harness-loop-scaffold",
  },
  {
    n: "IX",
    title: "개정 절차",
    phase: "all",
    summary: "이 헌법의 개정은 전용 루프 + [RATIFIED] 마커 + 재감사를 요구한다.",
    bindsTo: "loops/NNN-constitutional-amendment/",
  },
];

const PHASE_COLOR: Record<Art["phase"], string> = {
  pre: "#6BA368",
  in: "#D4A853",
  post: "#8B7BB8",
  all: "#6b7280",
};

const PHASE_LABEL: Record<Art["phase"], string> = {
  pre: "진입 전",
  in: "내부",
  post: "종료 후",
  all: "모든 단계",
};

export default function ArticleIndex() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ARTICLES.map((a) => {
        const isHover = hover === a.n;
        return (
          <button
            key={a.n}
            onMouseEnter={() => setHover(a.n)}
            onMouseLeave={() => setHover(null)}
            className={
              "group relative flex flex-col gap-1.5 rounded-md border p-3 text-left transition-all " +
              (isHover
                ? "scale-[1.02] border-neutral-500 shadow-md dark:border-neutral-400"
                : "border-neutral-300 dark:border-neutral-700")
            }
            style={{
              background: isHover
                ? PHASE_COLOR[a.phase] + "15"
                : undefined,
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                조항 {a.n}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                style={{
                  background: PHASE_COLOR[a.phase] + "22",
                  color: PHASE_COLOR[a.phase],
                }}
              >
                {PHASE_LABEL[a.phase]}
              </span>
            </div>
            <div className="text-[12.5px] font-semibold text-neutral-800 dark:text-neutral-200">
              {a.title}
            </div>
            <div
              className={
                "text-[11px] leading-snug text-neutral-600 dark:text-neutral-400 " +
                (isHover ? "" : "line-clamp-2")
              }
            >
              {a.summary}
            </div>
            {isHover && (
              <div className="mt-1 border-t border-neutral-300/50 pt-1.5 text-[10.5px] text-neutral-500 dark:border-neutral-700/50">
                <span className="font-mono">결속:</span> {a.bindsTo}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
