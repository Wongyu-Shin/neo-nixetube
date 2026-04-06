"use client";

import { useState } from "react";

const MODES = [
  {
    failure: "점등 안 됨",
    cause: "가스 순도 부족 (잔류 공기)",
    fix: "플러싱 횟수 증가 + 게터 추가",
    severity: "high",
    icon: "💡",
  },
  {
    failure: "수일 후 어두워짐",
    cause: "부틸 봉착부 네온 투과",
    fix: "졸-겔 SiO₂ 오버코팅 추가",
    severity: "medium",
    icon: "🔅",
  },
  {
    failure: "이상한 색상 (보라/분홍)",
    cause: "공기 유입 (N₂/O₂ 혼입)",
    fix: "봉착부 리크 탐색 → 재봉착",
    severity: "medium",
    icon: "🟣",
  },
  {
    failure: "전극 형상 안 보임",
    cause: "고압 글로우 특성 (양광주 지배)",
    fix: "전류 조절 또는 압력 변경",
    severity: "low",
    icon: "👁️",
  },
];

const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#D4A853",
  low: "#7B9EB8",
};

const SEVERITY_LABELS = {
  high: "위험",
  medium: "주의",
  low: "경미",
};

export default function FailureModes() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <figure className="my-8">
      <div className="max-w-xl mx-auto space-y-2">
        {MODES.map((mode, i) => {
          const isExpanded = expanded === i;
          const color = SEVERITY_COLORS[mode.severity as keyof typeof SEVERITY_COLORS];

          return (
            <button
              key={i}
              onClick={() => setExpanded(isExpanded ? null : i)}
              className="w-full rounded-lg border px-4 py-3 text-left transition-all duration-200"
              style={{
                borderColor: isExpanded ? color + "40" : "rgba(255,255,255,0.06)",
                backgroundColor: isExpanded ? color + "08" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{mode.icon}</span>
                <span className="text-sm flex-1" style={{ color: isExpanded ? "#e8e8e8" : "#ccc" }}>
                  {mode.failure}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: color + "15",
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {SEVERITY_LABELS[mode.severity as keyof typeof SEVERITY_LABELS]}
                </span>
              </div>
              {isExpanded && (
                <div className="mt-3 ml-9 space-y-2">
                  <div className="text-xs">
                    <span className="text-stone-500">원인: </span>
                    <span className="text-stone-300">{mode.cause}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-stone-500">대응: </span>
                    <span style={{ color }}>{mode.fix}</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        각 실패 모드를 클릭하여 원인과 대응 방법 확인. 심각도별 색상 구분.
      </figcaption>
    </figure>
  );
}
