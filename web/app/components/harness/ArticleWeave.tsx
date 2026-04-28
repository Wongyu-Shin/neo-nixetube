"use client";

import { useState } from "react";

/*
 * ArticleWeave — 9 Articles × 10 phases grid.
 * Cell filled if the Article governs that phase. Hover for the "what
 * specifically does this Article do at this phase?" bullet.
 */

type Cell = { phase: number; article: number; note: string };

const PHASE_LABELS = [
  "0·스캐폴드",
  "1·명료화",
  "2·계획",
  "3·리뷰",
  "4·수정",
  "5·검증",
  "6·결정",
  "7·로그",
  "8·반복",
  "9·리포트",
];

const ARTICLE_NAMES = [
  "I · 축 선언",
  "II · 흡수 가능성",
  "III · HITL 정책",
  "IV · 에이전트 프로그램",
  "V · 명료화 게이트",
  "VI · 검증 + 래칫",
  "VII · 영속",
  "VIII · 커밋 히스토리",
  "IX · 개정",
];

const CELLS: Cell[] = [
  // 조항 I — 축 선언
  { phase: 1, article: 1, note: "모든 피처는 clarif에서 axis1/axis2를 선언한다" },
  { phase: 2, article: 1, note: "계획 위저드가 카탈로그에 대해 축을 교차 확인한다" },
  { phase: 9, article: 1, note: "report.mdx § 축 커버리지 델타" },
  // 조항 II — 흡수 가능성
  { phase: 1, article: 2, note: "명료화가 rip-check 트립이 임박한 외부 피처를 표시한다" },
  { phase: 5, article: 2, note: "harness-rip-test가 한 줄짜리 기계적 검사를 출하한다" },
  { phase: 9, article: 2, note: "리포트가 루프 도중 폐기된 피처를 기록한다" },
  // 조항 III — HITL
  { phase: 2, article: 3, note: "ExitPlanMode = 루프 내부로 진입하는 유일한 HITL 게이트" },
  { phase: 3, article: 3, note: "리뷰는 운영자에게 침묵; AskUserQuestion 없음" },
  { phase: 4, article: 3, note: "L0/L1/L2 등급; L2는 일시 정지 가능 (예외 1)" },
  { phase: 5, article: 3, note: "검증은 무인 실행; 프롬프트 없음" },
  { phase: 6, article: 3, note: "결정은 결정적; 운영자 판단 없음" },
  { phase: 7, article: 3, note: "상태 줄/텔레메트리는 가시성이지 HITL이 아님" },
  { phase: 8, article: 3, note: "Ctrl+C (예외 2); abandon 명령 허용" },
  // 조항 IV — 에이전트 프로그램
  { phase: 2, article: 4, note: "계획 위저드가 수정 전략 선택 (adas/dgm)" },
  { phase: 3, article: 4, note: "reflexion 트레이스 읽기 → 부모 선택 조정" },
  { phase: 6, article: 4, note: "dgm-h 아카이브에서 부모 선택" },
  { phase: 9, article: 4, note: "선택적 교차 도메인 전이 감사" },
  // 조항 V — 명료화 게이트
  { phase: 1, article: 5, note: "7차원 Q/A; D1의 [ASSUMPTION] 은 가드를 실패시킨다" },
  { phase: 2, article: 5, note: "계획이 clarif을 입력으로 소비한다" },
  // 조항 VI — 검증 + 래칫
  { phase: 2, article: 6, note: "계획이 verify를 드라이런해 baseline을 측정한다" },
  { phase: 5, article: 6, note: "statistical-tc-runner가 N회 이상 시행" },
  { phase: 6, article: 6, note: "노이즈 인지 MAX 래칫; σ 허용" },
  { phase: 8, article: 6, note: "플래토 감지 (patience AND slope)" },
  { phase: 9, article: 6, note: "선택적 llm-as-judge-audit으로 루브릭 채점" },
  // 조항 VII — 영속
  { phase: 0, article: 7, note: "스캐폴드가 직전 루프의 위키 항목을 읽는다" },
  { phase: 3, article: 7, note: "위키가 <system-reminder> 로 키워드 표면화" },
  { phase: 7, article: 7, note: "reflexion 항목이 harness/reflexion/ 에 추가된다" },
  { phase: 9, article: 7, note: "/harness:wiki-add가 새 항목을 제안한다" },
  // 조항 VIII — 커밋 히스토리
  { phase: 0, article: 8, note: "loops/NNN-<slug>/ 가 스캐폴드 시 커밋된다" },
  { phase: 4, article: 8, note: "모든 후보가 verify 전에 커밋된다" },
  { phase: 6, article: 8, note: "폐기는 git reset이 아니라 git revert로" },
  { phase: 7, article: 8, note: "텔레메트리 + 이터레이션 행은 커밋 가능한 산출물" },
  { phase: 9, article: 8, note: "report.mdx가 인계 산출물" },
  // 조항 IX — 개정
  { phase: 1, article: 9, note: "clarif은 제안된 개정을 인용할 수 있지만 재정의는 못 한다" },
  { phase: 9, article: 9, note: "리포트가 개정을 제안할 수 있다 — 비준은 별도 루프" },
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
          aria-label="9개 조항을 10개 루프 단계에 걸쳐 짠 위빙"
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
            진입 전
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
            루프 내부
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
            종료 후
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
                  × 단계 {PHASE_LABELS[hoverCell.phase]}
                </span>
              </div>
              <div className="mt-2 text-stone-300 text-[13px]">{hoverCell.note}</div>
            </div>
          ) : hover ? (
            <div className="text-stone-600 italic text-[13px]">
              {ARTICLE_NAMES[hover.article - 1]} 는 단계 {PHASE_LABELS[hover.phase]} 를
              관장하지 않는다 — 빈 셀은 누락이 아니라 신호다.
            </div>
          ) : (
            <div className="text-stone-500 italic text-[13px]">
              어느 셀이든 호버한다. 채워진 셀 = 그 조항이 그 단계를 관장. 빈 열은 드물다
              (단계 0은 조항 VII + VIII만 건드린다). 조항 III가 가장 수평적이다 —
              HITL 정책은 거의 모든 단계에서 강제된다.
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
