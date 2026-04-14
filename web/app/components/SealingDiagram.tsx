"use client";

import { useState } from "react";

const LAYERS = [
  {
    id: "glass",
    label: "유리 돔",
    y: 20,
    h: 60,
    color: "#7B9EB8",
    detail: "소다라임 유리 OD 25-30mm. 전극이 내부에 위치. 상단에 가스 플러싱용 배기관.",
  },
  {
    id: "butyl",
    label: "부틸 고무 (1차 실링)",
    y: 80,
    h: 24,
    color: "#6BA368",
    detail: "모든 고무 중 가스 투과율 최저. 네온 투과율 ~10⁻¹⁰ CGS. 200°C 히트건으로 연화 후 밀착.",
  },
  {
    id: "torrseal",
    label: "Torr Seal (외층 가스 차단)",
    y: 104,
    h: 20,
    color: "#D4A853",
    detail: "UHV급 에폭시(Varian 9530001). 투과도 ~1×10⁻¹⁵. 부틸 외부 노출면 3mm 비드. 24시간 경화.",
  },
  {
    id: "header",
    label: "TO-8 기밀 헤더",
    y: 124,
    h: 30,
    color: "#B8A9C9",
    detail: "12핀 커스텀 Kovar/glass-bead 압축 헤더. 유리-금속 봉착 문제를 해결. Body OD 12.7mm.",
  },
  {
    id: "solgel",
    label: "졸-겔 SiO₂ 오버코팅 (선택)",
    y: 80,
    h: 44,
    color: "#C17B5E",
    detail: "부틸+Torr Seal 위에 TEOS 졸-겔 SiO₂ 오버코팅(선택) → 광학적 클래리티 향상. 기밀에는 불필요(Torr Seal이 충분).",
  },
];

export default function SealingDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  const active = LAYERS.find((l) => l.id === hovered);
  const svgW = 400;
  const svgH = 200;

  return (
    <figure className="my-8">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width={svgW} height={svgH} fill="#0D0D0D" rx="8" />

        {/* Title */}
        <text x={svgW / 2} y="16" fill="#e8e8e8" fontSize="11" fontWeight="bold" textAnchor="middle">
          상온 봉착 단면 구조
        </text>

        {/* Center cross-section x=100..300 */}
        {LAYERS.filter((l) => l.id !== "solgel").map((layer) => {
          const isActive = hovered === layer.id;
          return (
            <g
              key={layer.id}
              onMouseEnter={() => setHovered(layer.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={120}
                y={layer.y}
                width={160}
                height={layer.h}
                fill={layer.color + (isActive ? "30" : "15")}
                stroke={layer.color}
                strokeWidth={isActive ? 2 : 0.8}
                rx={layer.id === "glass" ? 8 : 2}
              />
              {/* Label inside */}
              <text
                x={200}
                y={layer.y + layer.h / 2 + 4}
                fill={isActive ? layer.color : "#999"}
                fontSize="9"
                textAnchor="middle"
                fontWeight={isActive ? "bold" : "normal"}
              >
                {layer.label}
              </text>
            </g>
          );
        })}

        {/* Sol-gel overlay indicator (dashed border on right side) */}
        <g
          onMouseEnter={() => setHovered("solgel")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect
            x={285}
            y={80}
            width={70}
            height={44}
            fill={hovered === "solgel" ? "#C17B5E15" : "none"}
            stroke="#C17B5E"
            strokeWidth={hovered === "solgel" ? 1.5 : 0.8}
            strokeDasharray="3 2"
            rx={3}
          />
          <text x={320} y={98} fill="#C17B5E" fontSize="7" textAnchor="middle">졸-겔</text>
          <text x={320} y={108} fill="#C17B5E" fontSize="7" textAnchor="middle">오버코팅</text>
          <text x={320} y={118} fill="#C17B5E" fontSize="6" textAnchor="middle" opacity="0.6">(선택)</text>
          <line x1={280} y1={102} x2={285} y2={102} stroke="#C17B5E" strokeWidth="0.5" strokeDasharray="2 2" />
        </g>

        {/* Neon gas fill inside glass dome */}
        <text x={200} y={58} fill="#6BA368" fontSize="8" textAnchor="middle" opacity="0.6">Ne gas</text>

        {/* Pin lines through header */}
        {[160, 180, 200, 220, 240].map((x, i) => (
          <line key={i} x1={x} y1={130} x2={x} y2={175} stroke="#B8A9C980" strokeWidth="1" />
        ))}

        {/* Dimension arrows */}
        <text x={100} y={104} fill="#6BA368" fontSize="7" textAnchor="end">1차</text>
        <text x={100} y={118} fill="#D4A853" fontSize="7" textAnchor="end">2차</text>

        {/* Temperature labels */}
        <text x={svgW / 2} y={svgH - 5} fill="#666" fontSize="8" textAnchor="middle">
          전체 공정 온도: 상온~200°C (히트건) — 토치/전기로 불필요
        </text>
      </svg>

      {/* Info panel */}
      {active ? (
        <div
          className="max-w-md mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{ borderColor: active.color + "40", backgroundColor: active.color + "08" }}
        >
          <div className="text-sm font-medium" style={{ color: active.color }}>{active.label}</div>
          <p className="text-xs text-stone-400 mt-1">{active.detail}</p>
        </div>
      ) : (
        <figcaption className="text-center text-stone-500 text-xs mt-2">
          각 층을 호버하여 재료와 역할 확인 — 부틸 내층(CTE 흡수 + 가스차단) + Torr Seal 외층(가스 차단) 복합 실링
        </figcaption>
      )}
    </figure>
  );
}
