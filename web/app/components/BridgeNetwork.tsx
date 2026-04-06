"use client";

import { useState } from "react";

const BOTTLENECKS = [
  { id: "seal", label: "유리-금속 실링", color: "#D4A853", y: 60 },
  { id: "electrode", label: "전극 제조", color: "#C17B5E", y: 140 },
  { id: "vacuum", label: "진공/가스", color: "#7B9EB8", y: 220 },
  { id: "pin", label: "핀 관통", color: "#B8A9C9", y: 300 },
];

const BRIDGES = [
  { id: "B1", label: "PDP 프릿 실링", bottleneck: "seal", round: 1, cost: "₩50-100K", innovation: 4, source: "PDP 산업", detail: "Bi₂O₃ 프릿으로 800°C→450°C 저감" },
  { id: "B2", label: "AAO 나노전극", bottleneck: "electrode", round: 1, cost: "₩115K", innovation: 5, source: "나노기술", detail: "양극산화 나노채널+Ni도금 → 전계집중" },
  { id: "B3", label: "마이크로격벽", bottleneck: "vacuum", round: 1, cost: "₩40K", innovation: 5, source: "MEMS", detail: "d↓→p↑ : 대기압 근접 동작 가능" },
  { id: "G1", label: "부틸+폴리설파이드", bottleneck: "seal", round: 2, cost: "₩25K", innovation: 5, source: "건축 IGU", detail: "상온 2중 실링, 토치/전기로 불필요" },
  { id: "G2", label: "졸-겔 SiO₂", bottleneck: "electrode", round: 2, cost: "₩25K", innovation: 4, source: "화학 공학", detail: "나노코팅으로 기밀 보강+스퍼터링 방호" },
  { id: "G3", label: "MAP 가스 플러싱", bottleneck: "vacuum", round: 2, cost: "₩80K", innovation: 4, source: "식품 산업", detail: "진공 없이 가스 조성 제어" },
  { id: "G4", label: "PIB 장기 실링", bottleneck: "seal", round: 2, cost: "₩15K", innovation: 3, source: "태양전지", detail: "수명 100일→1000일+ 연장" },
  { id: "G5", label: "MIL-spec 커넥터", bottleneck: "pin", round: 2, cost: "₩20-50K", innovation: 3, source: "우주/항공", detail: "기밀 피드스루를 산업 부품으로 조달" },
];

export default function BridgeNetwork() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const active = selected || hovered;
  const activeBridge = BRIDGES.find((b) => b.id === active);
  const activeBottleneck = active ? BOTTLENECKS.find((bn) => {
    if (BRIDGES.find((b) => b.id === active)) return BRIDGES.find((b) => b.id === active)!.bottleneck === bn.id;
    return bn.id === active;
  }) : null;

  const bnX = 100;
  const brX = 460;
  const svgW = 580;
  const svgH = 360;

  return (
    <figure className="my-8">
      <div className="text-sm font-medium text-stone-400 mb-2 text-center">
        병목 ← 연결 → 브릿지 (호버/클릭으로 탐색)
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-2xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={svgW} height={svgH} fill="#0D0D0D" rx="8" />

        {/* Connection lines */}
        {BRIDGES.map((b) => {
          const bn = BOTTLENECKS.find((n) => n.id === b.bottleneck)!;
          const bIdx = BRIDGES.filter((br) => br.bottleneck === b.bottleneck).indexOf(b);
          const bTotal = BRIDGES.filter((br) => br.bottleneck === b.bottleneck).length;
          const byOffset = (bIdx - (bTotal - 1) / 2) * 36;
          const by = bn.y + byOffset;
          const isActive = active === b.id || active === bn.id;
          return (
            <line
              key={`line-${b.id}`}
              x1={bnX + 80}
              y1={bn.y}
              x2={brX - 6}
              y2={by}
              stroke={isActive ? bn.color : "#ffffff10"}
              strokeWidth={isActive ? 2 : 0.5}
              strokeDasharray={b.round === 2 ? "4 3" : undefined}
            />
          );
        })}

        {/* Bottleneck nodes */}
        {BOTTLENECKS.map((bn) => {
          const isActive = active === bn.id || (activeBridge && activeBridge.bottleneck === bn.id);
          return (
            <g
              key={bn.id}
              onMouseEnter={() => setHovered(bn.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={bnX - 75}
                y={bn.y - 16}
                width={155}
                height={32}
                rx={6}
                fill={isActive ? bn.color + "20" : "#1a1a1a"}
                stroke={bn.color}
                strokeWidth={isActive ? 1.5 : 0.5}
                opacity={isActive ? 1 : 0.6}
              />
              <text
                x={bnX}
                y={bn.y + 4}
                fill={isActive ? bn.color : "#999"}
                fontSize="11"
                fontWeight={isActive ? "bold" : "normal"}
                textAnchor="middle"
              >
                {bn.label}
              </text>
            </g>
          );
        })}

        {/* Bridge nodes */}
        {BRIDGES.map((b) => {
          const bn = BOTTLENECKS.find((n) => n.id === b.bottleneck)!;
          const bIdx = BRIDGES.filter((br) => br.bottleneck === b.bottleneck).indexOf(b);
          const bTotal = BRIDGES.filter((br) => br.bottleneck === b.bottleneck).length;
          const byOffset = (bIdx - (bTotal - 1) / 2) * 36;
          const by = bn.y + byOffset;
          const isActive = active === b.id;
          const stars = "★".repeat(b.innovation) + "☆".repeat(5 - b.innovation);

          return (
            <g
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === b.id ? null : b.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={brX}
                cy={by}
                r={isActive ? 18 : 14}
                fill={isActive ? bn.color + "30" : "#1a1a1a"}
                stroke={bn.color}
                strokeWidth={isActive ? 2 : 0.8}
                opacity={isActive ? 1 : 0.5}
              />
              <text
                x={brX}
                y={by + 4}
                fill={isActive ? "#fff" : "#aaa"}
                fontSize={isActive ? "9" : "8"}
                fontWeight="bold"
                textAnchor="middle"
              >
                {b.id}
              </text>
              {/* Label to the right */}
              <text
                x={brX + 24}
                y={by + 4}
                fill={isActive ? "#e8e8e8" : "#666"}
                fontSize="10"
              >
                {b.label}
              </text>
              {/* Innovation stars on hover */}
              {isActive && (
                <text
                  x={brX + 24}
                  y={by + 16}
                  fill={bn.color}
                  fontSize="8"
                >
                  {stars} {b.cost}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <line x1={20} y1={svgH - 20} x2={40} y2={svgH - 20} stroke="#666" strokeWidth={1} />
        <text x={44} y={svgH - 17} fill="#666" fontSize="8">Round 1</text>
        <line x1={100} y1={svgH - 20} x2={120} y2={svgH - 20} stroke="#666" strokeWidth={1} strokeDasharray="4 3" />
        <text x={124} y={svgH - 17} fill="#666" fontSize="8">Round 2</text>
      </svg>

      {/* Detail panel */}
      {activeBridge && (
        <div
          className="max-w-2xl mx-auto mt-3 rounded-lg border p-4 transition-all duration-200"
          style={{
            borderColor: BOTTLENECKS.find((bn) => bn.id === activeBridge.bottleneck)!.color + "40",
            backgroundColor: BOTTLENECKS.find((bn) => bn.id === activeBridge.bottleneck)!.color + "08",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-stone-200">{activeBridge.id}: {activeBridge.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-stone-400">
              {activeBridge.source}
            </span>
          </div>
          <p className="text-sm text-stone-400">{activeBridge.detail}</p>
          <div className="flex gap-4 mt-2 text-xs text-stone-500">
            <span>비용: <span className="text-amber-400">{activeBridge.cost}</span></span>
            <span>혁신성: <span className="text-amber-400">{"★".repeat(activeBridge.innovation)}</span></span>
            <span>라운드: {activeBridge.round}</span>
          </div>
        </div>
      )}

      <figcaption className="text-center text-stone-500 text-xs mt-3">
        4대 병목 → 8개 브릿지 기술 연결 맵. 노드를 호버/클릭하여 상세 정보 확인.
      </figcaption>
    </figure>
  );
}
