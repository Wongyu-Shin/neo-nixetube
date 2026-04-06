"use client";

import { useState } from "react";

const PARTS = [
  {
    id: "glass",
    label: "유리 외피 (Glass Envelope)",
    detail: "소다라임 또는 보로실리케이트 유리. 진공/가스를 밀봉하고 전극을 보호. CTE 매칭이 봉착 성패를 결정.",
    color: "#D4A853",
  },
  {
    id: "anode",
    label: "양극 메쉬 (Anode Mesh)",
    detail: "니켈 미세 철망. 전체 음극 앞에 위치하여 균일한 전계 형성. 투명하게 숫자가 보임.",
    color: "#7B9EB8",
  },
  {
    id: "cathode",
    label: "음극 (Cathode Digits 0-9)",
    detail: "숫자 형상 니켈 판 10장이 적층. 선택된 음극에 전압 인가 시 글로우 발광. 닉시관의 핵심.",
    color: "#FF8C42",
  },
  {
    id: "gas",
    label: "네온 가스 (Ne 15 Torr)",
    detail: "585-640nm 파장의 따뜻한 오렌지 발광. 15 Torr ≈ 대기압의 1/50. 파셴 법칙으로 최적 압력 결정.",
    color: "#6BA368",
  },
  {
    id: "seal",
    label: "유리-금속 봉착 (Base Seal)",
    detail: "최대 병목. 전통: 800°C 토치. 프릿 경로: 450°C. 상온 경로: 부틸+폴리설파이드.",
    color: "#D4A853",
  },
  {
    id: "pins",
    label: "핀 (Dumet Wire)",
    detail: "듀멧 와이어(Cu-Ni-Fe). CTE 9.0×10⁻⁶/K로 소다라임 유리와 매칭. 전극 리드선을 외부로.",
    color: "#B8A9C9",
  },
];

export default function NixieDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  const activePart = PARTS.find((p) => p.id === hovered);

  const getOpacity = (partId: string) => {
    if (!hovered) return 1;
    return hovered === partId ? 1 : 0.25;
  };

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 400 320"
        className="w-full max-w-md mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="400" height="320" fill="#0D0D0D" rx="8" />

        {/* Glass envelope */}
        <g
          onMouseEnter={() => setHovered("glass")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("glass")}
        >
          <ellipse cx="200" cy="140" rx="100" ry="130" fill="none" stroke="#D4A853" strokeWidth={hovered === "glass" ? 3 : 2} strokeDasharray="4 2" opacity="0.5" />
          <ellipse cx="200" cy="140" rx="96" ry="126" fill="#D4A85308" stroke="none" />
          <text x="310" y="80" fill="#D4A853" fontSize="10" opacity="0.7">Glass</text>
          <text x="310" y="92" fill="#D4A853" fontSize="10" opacity="0.7">Envelope</text>
          <line x1="300" y1="85" x2="270" y2="100" stroke="#D4A853" strokeWidth="0.5" opacity="0.5" />
        </g>

        {/* Anode mesh */}
        <g
          onMouseEnter={() => setHovered("anode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("anode")}
        >
          <rect x="155" y="50" width="90" height="120" fill="none" stroke="#7B9EB8" strokeWidth={hovered === "anode" ? 2.5 : 1.5} rx="4" opacity="0.6" />
          {[60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((y) => (
            <line key={`h${y}`} x1="157" y1={y} x2="243" y2={y} stroke="#7B9EB8" strokeWidth="0.3" opacity="0.3" />
          ))}
          {[165, 175, 185, 195, 205, 215, 225, 235].map((x) => (
            <line key={`v${x}`} x1={x} y1="52" x2={x} y2="168" stroke="#7B9EB8" strokeWidth="0.3" opacity="0.3" />
          ))}
          <text x="155" y="185" fill="#7B9EB8" fontSize="9" textAnchor="middle">Anode Mesh</text>
        </g>

        {/* Cathode digits */}
        <g
          onMouseEnter={() => setHovered("cathode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("cathode")}
        >
          <text x="200" y="125" fill="#FF8C42" fontSize="48" fontWeight="bold" textAnchor="middle" fontFamily="monospace" opacity="0.9">8</text>
          <text x="196" y="121" fill="#FF6B35" fontSize="48" fontWeight="bold" textAnchor="middle" fontFamily="monospace" opacity="0.4">3</text>
          <text x="192" y="117" fill="#FF4500" fontSize="48" fontWeight="bold" textAnchor="middle" fontFamily="monospace" opacity="0.2">7</text>
          <ellipse cx="200" cy="110" rx="30" ry="35" fill="#FF8C42" opacity={hovered === "cathode" ? 0.15 : 0.08} />
          <ellipse cx="200" cy="110" rx="22" ry="28" fill="#FF8C42" opacity={hovered === "cathode" ? 0.2 : 0.12}>
            {hovered === "cathode" && (
              <animate attributeName="opacity" values="0.15;0.25;0.15" dur="1s" repeatCount="indefinite" />
            )}
          </ellipse>
          <text x="80" y="100" fill="#FF8C42" fontSize="10" textAnchor="end">Cathode</text>
          <text x="80" y="112" fill="#FF8C42" fontSize="10" textAnchor="end">Digits (0-9)</text>
          <line x1="85" y1="105" x2="165" y2="110" stroke="#FF8C42" strokeWidth="0.5" opacity="0.5" />
        </g>

        {/* Fill gas */}
        <g
          onMouseEnter={() => setHovered("gas")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("gas")}
        >
          <text x="200" y="205" fill="#6BA368" fontSize="10" textAnchor="middle" opacity="0.8">Ne 15 Torr</text>
          <text x="200" y="217" fill="#6BA368" fontSize="8" textAnchor="middle" opacity="0.5">(neon fill gas)</text>
        </g>

        {/* Base seal */}
        <g
          onMouseEnter={() => setHovered("seal")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("seal")}
        >
          <rect x="140" y="225" width="120" height="10" fill="#D4A853" opacity={hovered === "seal" ? 0.3 : 0.15} rx="2" />
          <rect x="140" y="225" width="120" height="10" fill="none" stroke="#D4A853" strokeWidth={hovered === "seal" ? 2 : 1} opacity="0.5" rx="2" />
          <text x="270" y="233" fill="#D4A853" fontSize="8" opacity="0.6">Glass-Metal Seal</text>
        </g>

        {/* Pins */}
        <g
          onMouseEnter={() => setHovered("pins")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          opacity={getOpacity("pins")}
        >
          {[160, 175, 190, 200, 210, 225, 240].map((x, i) => (
            <g key={`pin${i}`}>
              <line x1={x} y1="230" x2={x} y2="290" stroke="#B8A9C9" strokeWidth={hovered === "pins" ? 2.5 : 1.5} />
              <circle cx={x} cy="290" r="3" fill="#B8A9C9" opacity={hovered === "pins" ? 0.9 : 0.6} />
            </g>
          ))}
          <text x="200" y="310" fill="#B8A9C9" fontSize="9" textAnchor="middle">Pins (Dumet wire)</text>
        </g>

        {/* Title */}
        <text x="200" y="25" fill="#e8e8e8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">
          Nixie Tube Cross-Section
        </text>
      </svg>

      {/* Info panel */}
      {activePart ? (
        <div
          className="max-w-md mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{
            borderColor: activePart.color + "40",
            backgroundColor: activePart.color + "08",
          }}
        >
          <div className="text-sm font-medium" style={{ color: activePart.color }}>
            {activePart.label}
          </div>
          <p className="text-xs text-stone-400 mt-1">{activePart.detail}</p>
        </div>
      ) : (
        <figcaption className="text-center text-stone-500 text-sm mt-2">
          닉시관 단면도 — 각 부분을 호버하여 상세 정보 확인
        </figcaption>
      )}
    </figure>
  );
}
