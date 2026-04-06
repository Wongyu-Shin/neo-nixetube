"use client";

import { useState } from "react";

const ITEMS = [
  { label: "타당성 분석 (8 페르소나 적대적 검증)", done: true, detail: "8가지 전문가 관점에서 적대적 검증. 치명적 결함 발견되지 않음.", phase: "분석" },
  { label: "시나리오 탐색 (50개, 3 CRITICAL 안전 시나리오)", done: true, detail: "50개 실패/성공 시나리오 생성. 3개 안전 시나리오(가스 누출, 감전, 내파) 심층 분석.", phase: "분석" },
  { label: "연결되지 않은 지식 탐색 (2라운드, 8개 브릿지)", done: true, detail: "인접 분야 3개 + 원거리 분야 5개 = 총 8개 브릿지 기술 발견.", phase: "탐색" },
  { label: "파셴 곡선 시뮬레이터 (MAPE 1.79%)", done: true, detail: "7 iteration autoresearch로 147%→1.79% 개선. Ne/Ar/He 41 데이터포인트.", phase: "시뮬" },
  { label: "글로우 방전 모델 (MAPE 1.77%)", done: true, detail: "고압 비유사(non-similarity) 보정 포함. 마이크로격벽 가시성 분석.", phase: "시뮬" },
  { label: "물리 실험 — 프릿 실링 검증", done: false, detail: "Bi₂O₃ 프릿 450°C 소성 → hold test. Week 2-3 예정.", phase: "실험" },
  { label: "물리 실험 — 상온 봉착 검증", done: false, detail: "부틸+폴리설파이드 봉착 기밀 테스트. Week 2 예정.", phase: "실험" },
  { label: "PoC: 자작 관에서 첫 글로우 방전", done: false, detail: "Tier 1 성공 기준. 가스를 가두고 방전 확인. Week 4-6 목표.", phase: "실험" },
];

export default function ProjectStatus() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const doneCount = ITEMS.filter((i) => i.done).length;
  const progress = (doneCount / ITEMS.length) * 100;

  return (
    <figure className="my-8">
      {/* Progress bar */}
      <div className="max-w-xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-stone-500">프로젝트 진행률</span>
          <span className="text-xs font-mono text-amber-400">{doneCount}/{ITEMS.length} ({progress.toFixed(0)}%)</span>
        </div>
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-1.5">
        {ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-all duration-200"
            style={{
              borderColor: expanded === i
                ? (item.done ? "#6BA36840" : "#D4A85340")
                : "rgba(255,255,255,0.06)",
              backgroundColor: expanded === i
                ? (item.done ? "#6BA36808" : "#D4A85308")
                : "rgba(255,255,255,0.02)",
            }}
          >
            <span
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0"
              style={{
                borderColor: item.done ? "#6BA368" : "#555",
                backgroundColor: item.done ? "#6BA36820" : "transparent",
                color: item.done ? "#6BA368" : "transparent",
              }}
            >
              ✓
            </span>
            <div className="flex-1 min-w-0">
              <span
                className="text-sm block"
                style={{ color: item.done ? "#999" : "#e8e8e8" }}
              >
                {item.label}
              </span>
              {expanded === i && (
                <span className="text-xs text-stone-400 mt-1 block">{item.detail}</span>
              )}
            </div>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
              style={{
                backgroundColor: item.done ? "#6BA36810" : "#D4A85310",
                color: item.done ? "#6BA368" : "#D4A853",
                border: `1px solid ${item.done ? "#6BA36825" : "#D4A85325"}`,
              }}
            >
              {item.phase}
            </span>
          </button>
        ))}
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        각 항목을 클릭하여 상세 진행 상황 확인. 현재 디지털 분석 완료, 물리 실험 단계 진입 전.
      </figcaption>
    </figure>
  );
}
