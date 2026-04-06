"use client";

import { useState } from "react";

const MATERIALS = [
  { name: "유리", perm: 1e-15, poc: true, comm: true, color: "#7B9EB8", note: "완벽한 기밀. 전통 닉시관 기준." },
  { name: "PIB", perm: 1e-11, poc: true, comm: "warn", color: "#6BA368", note: "태양전지 산업 검증. 수명 1000일+. Bridge G4." },
  { name: "부틸(IIR)", perm: 1e-10, poc: true, comm: false, color: "#6BA368", note: "모든 고무 중 최저 투과. PoC 100일 충분. 상온 경로 핵심." },
  { name: "폴리설파이드", perm: 1e-10, poc: true, comm: false, color: "#D4A853", note: "2차 실링 구조 강도. 부틸과 함께 2중 실링." },
  { name: "+ 졸겔", perm: 1e-12, poc: true, comm: "warn", color: "#C17B5E", note: "부틸/폴리설파이드 위에 졸-겔 SiO₂ 오버코팅 → 10-100x 감소." },
  { name: "에폭시", perm: 1e-9, poc: "warn", comm: false, color: "#ef4444", note: "투과율 높음. 보조 밀봉에만 제한적 사용." },
  { name: "PDMS", perm: 1e-7, poc: false, comm: false, color: "#ef4444", note: "투과율 너무 높아 사용 불가. 참고용." },
];

export default function PermeabilityChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxLog = 7; // 10^-7
  const minLog = 15; // 10^-15
  const range = minLog - maxLog; // 8

  const getWidth = (perm: number) => {
    const logVal = -Math.log10(perm); // e.g., 1e-10 → 10
    return ((logVal - maxLog) / range) * 100;
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true) return "✓";
    if (status === "warn") return "⚠";
    return "✗";
  };

  const getStatusColor = (status: boolean | string) => {
    if (status === true) return "#6BA368";
    if (status === "warn") return "#D4A853";
    return "#ef4444";
  };

  return (
    <figure className="my-8">
      <div className="text-sm text-stone-400 text-center mb-3">네온 투과율 비교 (낮을수록 우수)</div>
      <div className="max-w-xl mx-auto space-y-2">
        {MATERIALS.map((mat, i) => {
          const isActive = hovered === i;
          return (
            <div
              key={mat.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20 text-right shrink-0"
                  style={{ color: isActive ? mat.color : "#888" }}
                >
                  {mat.name}
                </span>
                <div className="flex-1 h-5 bg-white/[0.03] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${getWidth(mat.perm)}%`,
                      backgroundColor: mat.color + (isActive ? "60" : "30"),
                    }}
                  />
                </div>
                <span
                  className="text-[10px] w-12 font-mono"
                  style={{ color: isActive ? mat.color : "#555" }}
                >
                  10⁻{-Math.log10(mat.perm).toFixed(0)}
                </span>
                <span className="w-4 text-center text-xs" style={{ color: getStatusColor(mat.poc) }}>
                  {getStatusIcon(mat.poc)}
                </span>
                <span className="w-4 text-center text-xs" style={{ color: getStatusColor(mat.comm) }}>
                  {getStatusIcon(mat.comm)}
                </span>
              </div>
              {isActive && (
                <div className="ml-24 mt-0.5 mb-1 text-xs text-stone-400">
                  {mat.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-[10px] text-stone-500">
        <span>← 낮은 투과율 (우수)</span>
        <span>|</span>
        <span className="text-[#6BA368]">✓</span> <span>적합</span>
        <span className="text-[#D4A853]">⚠</span> <span>조건부</span>
        <span className="text-[#ef4444]">✗</span> <span>부적합</span>
        <span>|</span>
        <span>앞=PoC 뒤=상용</span>
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-2">
        재료를 호버하여 상세 정보 확인. 로그 스케일: 유리(10⁻¹⁵) ~ PDMS(10⁻⁷).
      </figcaption>
    </figure>
  );
}
