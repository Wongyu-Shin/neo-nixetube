"use client";

import { useState } from "react";

const CONSTANTS = [
  { name: "네온 원자 반경", value: "38 pm", numeric: 38, unit: "pm", color: "#6BA368", relevance: "가장 작은 비활성 기체 → 봉착 재료의 가스 투과율 결정에 핵심. 작은 원자 = 더 쉽게 투과." },
  { name: "네온 주 발광 파장", value: "585-640 nm", numeric: 612, unit: "nm", color: "#FF8C42", relevance: "닉시관의 '따뜻한 오렌지' 색상의 원인. 이 파장이 닉시관의 미학적 정체성." },
  { name: "대기압", value: "760 Torr", numeric: 760, unit: "Torr", color: "#7B9EB8", relevance: "진공/압력의 기준점. 닉시관은 15 Torr(전통)~200 Torr(마이크로격벽)에서 동작." },
  { name: "파셴 최소 (Ne)", value: "pd ≈ 1.5 Torr·cm", numeric: 91, unit: "V (Vb)", color: "#D4A853", relevance: "최소 항복 전압 ~91V 발생 조건. 시뮬레이터로 산출. 모든 bridge 조건 최적화의 기준." },
];

export default function PhysicsConstants() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <figure className="my-8">
      <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
        {CONSTANTS.map((c, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : i)}
              className="rounded-lg border p-4 text-left transition-all duration-200"
              style={{
                borderColor: isSelected ? c.color + "50" : "rgba(255,255,255,0.06)",
                backgroundColor: isSelected ? c.color + "0a" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="text-xs text-stone-500 mb-1">{c.name}</div>
              <div className="text-lg font-bold font-mono" style={{ color: c.color }}>
                {c.value}
              </div>
              {isSelected && (
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">{c.relevance}</p>
              )}
            </button>
          );
        })}
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        각 상수를 클릭하여 프로젝트에서의 의미 확인
      </figcaption>
    </figure>
  );
}
