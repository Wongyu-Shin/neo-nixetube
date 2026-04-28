"use client";

import { useState } from "react";

type Article = {
  num: string;
  title: string;
  oneLine: string;
  body: string;
  keyFeatures: string[];
};

const ARTICLES: Article[] = [
  {
    num: "I",
    title: "축 분류",
    oneLine: "모든 피처는 axis1 (내부/외부) + axis2 (루프 진입 전/내부/종료 후) 를 선언한다.",
    body: "axis1은 흡수 가능성 경계다 — 외부 피처는 CC 본체로 흡수되면 제거되어야 한다. axis2는 HITL 경계다 (→ 조항 III).",
    keyFeatures: ["harness-constitution"],
  },
  {
    num: "II",
    title: "흡수 가능성",
    oneLine: "모든 피처는 기계적 노후화 테스트를 함께 가진다.",
    body: "rippable_check 프론트매터 + tc_script 가 피처가 여전히 필요하면 통과하고 흡수되면 실패한다. applicability 블록은 CC semver + 모델 목록을 선언한다.",
    keyFeatures: ["harness-rip-test"],
  },
  {
    num: "III",
    title: "HITL은 루프 바깥에 산다",
    oneLine: "루프 내부의 AskUserQuestion은 금지된다 — 예외는 둘뿐.",
    body: "(a) 비가역 작업에 대한 harness-graduated-confirm L2; (b) Ctrl-C 비상 정지. 트랜스크립트 린터가 위반을 사후에 표시한다.",
    keyFeatures: ["plan-mode-discipline", "harness-graduated-confirm", "harness-pause-resume"],
  },
  {
    num: "IV",
    title: "정렬 무관 분리",
    oneLine: "Scope는 {harness/, content/} 중 정확히 한쪽에만 산다 — 양쪽 동시 금지.",
    body: "Goal 평가에 필요한 스킬과 하네스 자기 개선에 필요한 스킬은 달라야 한다. eval 스킬 ≈ self-mod 스킬일 때 DGM 스타일 정렬 자기 개선은 실패한다.",
    keyFeatures: ["alignment-free-self-improvement", "cross-domain-transfer-metric"],
  },
  {
    num: "V",
    title: "명시적 명료화",
    oneLine: "루프 내부 실행 전에 7차원 Q/A 기록.",
    body: "spec-kit /speckit.clarify 패턴. 암묵적인 에이전트 가정에 대한 [ASSUMPTION] 마커. D1 (범위 가로지름) 미해결 시 composite-guard 실패.",
    keyFeatures: ["harness-clarify-gate"],
  },
  {
    num: "VI",
    title: "모순 금지",
    oneLine: "매 이터레이션은 composite-guard.sh를 실행한다 (스키마 + crosscheck 11/11).",
    body: "비대칭 교차 참조, 명확한 구분 깨짐, 삼각 구조 축소는 자동으로 리버트된다.",
    keyFeatures: ["noise-aware-ratchet", "statistical-tc-runner", "llm-as-judge-audit"],
  },
  {
    num: "VII",
    title: "LLM 위키 영속",
    oneLine: "루프 횡단 지식은 harness/wiki/ 에 산다 — 키워드 트리거, 반감기 추적.",
    body: "프로젝트 범위, 루프 횡단, 커밋 가능을 동시에 만족하는 유일한 지식 저장소. 일시적 출력은 harness/build/ (gitignored), 사용자 범위 메모리는 CC memory 디렉터리에 머문다.",
    keyFeatures: ["harness-llm-wiki", "voyager-skill-library", "reflexion"],
  },
  {
    num: "VIII",
    title: "Git이 곧 메모리",
    oneLine: "Verify 전에 커밋. 폐기는 git reset이 아니라 git revert로.",
    body: "매 이터레이션은 Verify 이전에 experiment(<scope>): <desc> 를 커밋한다. 폐기된 후보는 교훈으로서 히스토리에 남는다. 루프별 TSV 행은 autoresearch-harness-<slug>-results.tsv 에 기록.",
    keyFeatures: ["cc-post-loop-slash", "sandboxed-open-ended-exploration"],
  },
  {
    num: "IX",
    title: "개정 절차",
    oneLine: "헌법 변경은 전용 범위 루프 + [RATIFIED] 마커를 요구한다.",
    body: "Scope: 가 이 파일 하나뿐인 루프. spec.md가 어느 조항을 왜 바꾸는지 명시. 머지 후 모든 피처의 applicability를 재감사한다.",
    keyFeatures: ["harness-constitution"],
  },
];

export default function ConstitutionCards() {
  const [openNum, setOpenNum] = useState<string | null>("III");

  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ARTICLES.map((a) => {
        const open = openNum === a.num;
        return (
          <button
            key={a.num}
            type="button"
            onClick={() => setOpenNum(open ? null : a.num)}
            className={`text-left rounded-lg border p-4 transition-all bg-stone-950/40 ${
              open
                ? "border-[#D4A853] bg-[#D4A853]/[0.05] shadow-[0_0_20px_rgba(212,168,83,0.15)]"
                : "border-stone-800 hover:border-stone-700"
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-xs px-1.5 py-0.5 rounded"
                style={{
                  color: open ? "#D4A853" : "#888",
                  background: open ? "rgba(212,168,83,0.1)" : "rgba(255,255,255,0.03)",
                }}
              >
                조항 {a.num}
              </span>
              <span className="text-xs text-stone-600">피처 {a.keyFeatures.length}개</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-stone-200">{a.title}</div>
            <div className="mt-1 text-xs text-stone-400 leading-relaxed">{a.oneLine}</div>
            {open && (
              <div className="mt-3 pt-3 border-t border-stone-800">
                <div className="text-xs text-stone-300 leading-relaxed">{a.body}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.keyFeatures.map((f) => (
                    <code
                      key={f}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-500 border border-stone-800"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
