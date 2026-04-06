"use client";

import { useState } from "react";

const DATA = [
  {
    label: "Traditional",
    cost: 2500000,
    color: "#ef4444",
    weeks: "24-48w",
    equipment: "Torch + Furnace + Vacuum",
    detail: "전통 유리 세공: 토치(800°C) 봉착 + 고진공 펌프 + 수작업 전극. 숙련 기술자 필요.",
    savings: null,
  },
  {
    label: "Path 1: Frit",
    cost: 1200000,
    color: "#D4A853",
    weeks: "12w",
    equipment: "Furnace + Vacuum",
    detail: "PDP 프릿(450°C) + AAO 나노전극. 전기로와 로터리 펌프 필요하나 토치 불필요.",
    savings: "52%",
  },
  {
    label: "Path 2: Room-Temp",
    cost: 185000,
    color: "#6BA368",
    weeks: "4w",
    equipment: "None",
    detail: "부틸+MAP 가스 플러싱. 진공 펌프, 전기로, 토치 모두 불필요. 부엌 테이블 제작 가능.",
    savings: "93%",
  },
];

export default function CostComparison() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxCost = Math.max(...DATA.map((d) => d.cost));

  return (
    <figure className="my-8">
      <div className="space-y-4">
        {DATA.map((item, i) => {
          const isActive = hovered === i;
          return (
            <div
              key={i}
              className="space-y-1 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive ? item.color : `${item.color}aa` }}
                >
                  {item.label}
                  {item.savings && (
                    <span className="ml-2 text-xs opacity-60">(-{item.savings})</span>
                  )}
                </span>
                <span className="text-sm text-stone-400">
                  ₩{(item.cost / 10000).toFixed(0)}만 · {item.weeks}
                </span>
              </div>
              <div className="h-8 rounded-lg bg-white/[0.04] overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                  style={{
                    width: `${(item.cost / maxCost) * 100}%`,
                    backgroundColor: `${item.color}${isActive ? "30" : "18"}`,
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <span className="text-xs text-stone-400 whitespace-nowrap">{item.equipment}</span>
                </div>
              </div>
              {isActive && (
                <div
                  className="text-xs rounded-md px-3 py-2 border mt-1"
                  style={{
                    color: "#ccc",
                    backgroundColor: `${item.color}08`,
                    borderColor: `${item.color}20`,
                  }}
                >
                  {item.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <figcaption className="text-center text-stone-500 text-sm mt-3">
        비용 비교 — 각 경로를 호버하여 상세 확인. 상온 경로는 전통 방식의 7%.
      </figcaption>
    </figure>
  );
}
