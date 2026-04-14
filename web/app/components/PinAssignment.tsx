"use client";

import { useState } from "react";

type PinDef = {
  id: number;
  label: string;
  assignment: string;
  wire: string;
  color: string;
};

const PINS: PinDef[] = [
  { id: 0, label: "숫자 음극 0", assignment: "숫자 음극", wire: "숫자 '0' 전극 리드선 → 핀 0 납땜", color: "#ef8f44" },
  { id: 1, label: "숫자 음극 1", assignment: "숫자 음극", wire: "숫자 '1' 전극 리드선 → 핀 1 납땜", color: "#ef8f44" },
  { id: 2, label: "숫자 음극 2", assignment: "숫자 음극", wire: "숫자 '2' 전극 리드선 → 핀 2 납땜", color: "#ef8f44" },
  { id: 3, label: "숫자 음극 3", assignment: "숫자 음극", wire: "숫자 '3' 전극 리드선 → 핀 3 납땜", color: "#ef8f44" },
  { id: 4, label: "숫자 음극 4", assignment: "숫자 음극", wire: "숫자 '4' 전극 리드선 → 핀 4 납땜", color: "#ef8f44" },
  { id: 5, label: "숫자 음극 5", assignment: "숫자 음극", wire: "숫자 '5' 전극 리드선 → 핀 5 납땜", color: "#ef8f44" },
  { id: 6, label: "숫자 음극 6", assignment: "숫자 음극", wire: "숫자 '6' 전극 리드선 → 핀 6 납땜", color: "#ef8f44" },
  { id: 7, label: "숫자 음극 7", assignment: "숫자 음극", wire: "숫자 '7' 전극 리드선 → 핀 7 납땜", color: "#ef8f44" },
  { id: 8, label: "숫자 음극 8", assignment: "숫자 음극", wire: "숫자 '8' 전극 리드선 → 핀 8 납땜", color: "#ef8f44" },
  { id: 9, label: "숫자 음극 9", assignment: "숫자 음극", wire: "숫자 '9' 전극 리드선 → 핀 9 납땜", color: "#ef8f44" },
  { id: 10, label: "양극 메쉬", assignment: "양극", wire: "니켈 메쉬 양극 리드선 → 핀 10 납땜 (공통 +)", color: "#D4A853" },
  { id: 11, label: "도트 (옵션)", assignment: "도트", wire: "소수점 전극 리드선 → 핀 11 납땜 (옵션)", color: "#B8A9C9" },
  { id: 12, label: "예비 핀", assignment: "예비", wire: "미접속 — 향후 확장 또는 접지용 예약", color: "#666666" },
  { id: 13, label: "예비 핀", assignment: "예비", wire: "미접속 — 향후 확장 또는 접지용 예약", color: "#666666" },
];

export default function PinAssignment() {
  const [hovered, setHovered] = useState<number | null>(null);
  const activePin = hovered !== null ? PINS[hovered] : null;

  const svgW = 480;
  const svgH = 320;

  // Top view geometry
  const topCx = 140;
  const topCy = 160;
  const headerR = 60;
  const pinCircleR = 46;
  const pinR = 5;

  // Side view geometry
  const sideX = 290;
  const sideW = 170;
  const sideY = 50;
  const sideH = 230;

  // Pin positions in circular layout (14 pins equally spaced, starting from top)
  const pinPositions = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
    return {
      x: topCx + Math.cos(angle) * pinCircleR,
      y: topCy + Math.sin(angle) * pinCircleR,
      labelX: topCx + Math.cos(angle) * (pinCircleR + 16),
      labelY: topCy + Math.sin(angle) * (pinCircleR + 16),
      angle,
    };
  });

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-2xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="pin-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
          </filter>
          <linearGradient id="glass-seal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B9EB8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#7B9EB8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7B9EB8" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />

        {/* ========== TITLE ========== */}
        <text x={svgW / 2} y={22} fill="#e8e8e8" fontSize="11" fontWeight="bold" textAnchor="middle">
          커스텀 12핀 헤더 핀 배치도 — 전극을 기밀 헤더에 장착
        </text>

        {/* ========== TOP VIEW ========== */}
        <text x={topCx} y={42} fill="#999" fontSize="9" textAnchor="middle">
          상면도 (Top View)
        </text>

        {/* Header body circle */}
        <circle
          cx={topCx} cy={topCy} r={headerR}
          fill="#6BA36815" stroke="#6BA368" strokeWidth="1.5"
        />
        {/* Inner ring for glass seal area */}
        <circle
          cx={topCx} cy={topCy} r={pinCircleR + 8}
          fill="none" stroke="#7B9EB835" strokeWidth="6"
        />

        {/* Alignment notch at top */}
        <path
          d={`M ${topCx - 6} ${topCy - headerR} L ${topCx} ${topCy - headerR + 5} L ${topCx + 6} ${topCy - headerR}`}
          fill="#6BA36840" stroke="#6BA368" strokeWidth="1"
        />
        <text x={topCx} y={topCy - headerR - 5} fill="#6BA368" fontSize="6" textAnchor="middle" opacity="0.7">
          기준 노치
        </text>

        {/* Diameter annotation */}
        <line x1={topCx - headerR} y1={topCy + headerR + 14} x2={topCx + headerR} y2={topCy + headerR + 14} stroke="#ffffff30" strokeWidth="0.5" />
        <line x1={topCx - headerR} y1={topCy + headerR + 10} x2={topCx - headerR} y2={topCy + headerR + 18} stroke="#ffffff30" strokeWidth="0.5" />
        <line x1={topCx + headerR} y1={topCy + headerR + 10} x2={topCx + headerR} y2={topCy + headerR + 18} stroke="#ffffff30" strokeWidth="0.5" />
        <text x={topCx} y={topCy + headerR + 25} fill="#ffffff45" fontSize="7" textAnchor="middle">
          ∅15.2 mm
        </text>

        {/* Center label */}
        <text x={topCx} y={topCy - 4} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle" opacity="0.8">
          TO-8
        </text>
        <text x={topCx} y={topCy + 6} fill="#6BA368" fontSize="6" textAnchor="middle" opacity="0.6">
          14-Pin
        </text>

        {/* Pins in circular layout */}
        {pinPositions.map((pos, i) => {
          const pin = PINS[i];
          const isHovered = hovered === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Glow effect when hovered */}
              {isHovered && (
                <circle cx={pos.x} cy={pos.y} r={pinR + 3}
                  fill={pin.color} opacity="0.4" filter="url(#pin-glow)"
                />
              )}
              {/* Pin circle */}
              <circle
                cx={pos.x} cy={pos.y} r={pinR}
                fill={isHovered ? pin.color + "60" : pin.color + "30"}
                stroke={isHovered ? pin.color : pin.color + "90"}
                strokeWidth={isHovered ? 2 : 1}
              />
              {/* Pin number inside */}
              <text
                x={pos.x} y={pos.y + 3}
                fill={isHovered ? "#fff" : pin.color}
                fontSize="7" fontWeight="bold" textAnchor="middle"
              >
                {i}
              </text>
              {/* Pin number label outside (only show on hover or for key pins) */}
              {(isHovered || i === 10 || i === 11) && (
                <text
                  x={pos.labelX} y={pos.labelY + 3}
                  fill={pin.color}
                  fontSize="6" textAnchor="middle" opacity={isHovered ? 1 : 0.6}
                >
                  {i === 10 ? "A+" : i === 11 ? "DOT" : `#${i}`}
                </text>
              )}
            </g>
          );
        })}

        {/* ========== SIDE VIEW (Cross-section) ========== */}
        <text x={sideX + sideW / 2} y={42} fill="#999" fontSize="9" textAnchor="middle">
          단면도 (Side View)
        </text>

        {/* Header body */}
        <rect
          x={sideX} y={sideY + 80} width={sideW} height={30} rx="3"
          fill="#6BA36825" stroke="#6BA368" strokeWidth="1.2"
        />
        {/* Header rim / flange */}
        <rect
          x={sideX - 8} y={sideY + 76} width={sideW + 16} height={8} rx="2"
          fill="#6BA36818" stroke="#6BA36878" strokeWidth="0.8"
        />
        <text x={sideX + sideW / 2} y={sideY + 100} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle" opacity="0.8">
          TO-8 헤더 바디
        </text>

        {/* Glass-metal seal zone */}
        <rect
          x={sideX + 10} y={sideY + 82} width={sideW - 20} height={26} rx="2"
          fill="url(#glass-seal-grad)" stroke="#7B9EB855" strokeWidth="0.8"
        />
        <text x={sideX + sideW - 12} y={sideY + 98} fill="#7B9EB8" fontSize="6" textAnchor="end" opacity="0.8">
          유리-금속 봉착
        </text>

        {/* Pins passing through header (side view shows 7 visible pins) */}
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
          const px = sideX + 20 + idx * 20;
          const pin = PINS[idx < 5 ? idx : idx + 5]; // show mix of pin types
          const pinIdx = idx < 5 ? idx : idx + 5;
          const isHovered = hovered === pinIdx;
          const c = pin.color;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHovered(pinIdx)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Wire/lead above header (inside tube) */}
              <line
                x1={px} y1={sideY + 30} x2={px} y2={sideY + 82}
                stroke={isHovered ? c : c + "55"} strokeWidth={isHovered ? 1.5 : 0.8}
                strokeDasharray={idx >= 5 ? "3 2" : "none"}
              />
              {/* Wire label on top */}
              <text x={px} y={sideY + 26} fill={c} fontSize="5" textAnchor="middle" opacity={isHovered ? 1 : 0.5}>
                {pinIdx}
              </text>

              {/* Pin through glass seal */}
              <line
                x1={px} y1={sideY + 82} x2={px} y2={sideY + 110}
                stroke={isHovered ? c : c + "78"} strokeWidth={isHovered ? 2 : 1.2}
              />
              {/* Glass bead around pin */}
              <ellipse
                cx={px} cy={sideY + 95} rx={4} ry={10}
                fill={isHovered ? "#7B9EB830" : "#7B9EB818"}
                stroke={isHovered ? "#7B9EB878" : "#7B9EB840"}
                strokeWidth="0.5"
              />

              {/* Pin below header (external) */}
              <line
                x1={px} y1={sideY + 110} x2={px} y2={sideY + 150}
                stroke={isHovered ? c : c + "55"} strokeWidth={isHovered ? 1.5 : 1}
              />
              {/* Pin end ball */}
              <circle
                cx={px} cy={sideY + 152} r={2}
                fill={isHovered ? c : c + "55"}
              />
            </g>
          );
        })}

        {/* Annotations on side view */}
        {/* Upper zone label: internal wiring */}
        <text x={sideX + sideW + 5} y={sideY + 55} fill="#888" fontSize="6" opacity="0.8">
          내부 리드선
        </text>
        <line x1={sideX + sideW - 2} y1={sideY + 53} x2={sideX + sideW + 3} y2={sideY + 53} stroke="#ffffff20" strokeWidth="0.5" />

        {/* Lower zone label: external pins */}
        <text x={sideX + sideW + 5} y={sideY + 135} fill="#888" fontSize="6" opacity="0.8">
          외부 핀
        </text>
        <line x1={sideX + sideW - 2} y1={sideY + 133} x2={sideX + sideW + 3} y2={sideY + 133} stroke="#ffffff20" strokeWidth="0.5" />

        {/* Dome outline (top part of side view) */}
        <path
          d={`M ${sideX + 5} ${sideY + 76} L ${sideX + 5} ${sideY + 20} Q ${sideX + 5} ${sideY} ${sideX + sideW / 2} ${sideY} Q ${sideX + sideW - 5} ${sideY} ${sideX + sideW - 5} ${sideY + 20} L ${sideX + sideW - 5} ${sideY + 76}`}
          fill="none" stroke="#7B9EB835" strokeWidth="1" strokeDasharray="4 3"
        />
        <text x={sideX + sideW / 2} y={sideY + 12} fill="#7B9EB8" fontSize="6" textAnchor="middle" opacity="0.5">
          유리 돔
        </text>

        {/* ========== LEGEND ========== */}
        {[
          { label: "숫자 음극 (0-9)", color: "#ef8f44" },
          { label: "양극 메쉬 (10)", color: "#D4A853" },
          { label: "도트 (11)", color: "#B8A9C9" },
          { label: "예비 (12-13)", color: "#666" },
        ].map((item, i) => {
          const lx = sideX + 10;
          const ly = sideY + 170 + i * 14;
          return (
            <g key={i}>
              <circle cx={lx} cy={ly} r={3} fill={item.color + "50"} stroke={item.color} strokeWidth="0.8" />
              <text x={lx + 8} y={ly + 3} fill={item.color} fontSize="7" opacity="0.9">
                {item.label}
              </text>
            </g>
          );
        })}

        {/* ========== INSULATION ANNOTATION ========== */}
        <rect
          x={20} y={svgH - 30} width={svgW - 40} height={18} rx="4"
          fill="#ef8f4410" stroke="#ef8f4430" strokeWidth="0.5"
        />
        <text x={svgW / 2} y={svgH - 17} fill="#ef8f44" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.9">
          핀 간 절연 확인: 모든 쌍 &gt; 1 M&#x2126;
        </text>
      </svg>

      {/* Info panel */}
      {activePin ? (
        <div
          className="max-w-2xl mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{ borderColor: activePin.color + "55", backgroundColor: activePin.color + "18" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: activePin.color + "40", color: activePin.color }}
            >
              {activePin.id}
            </span>
            <span className="text-sm font-medium" style={{ color: activePin.color }}>
              Pin {activePin.id} — {activePin.label}
            </span>
          </div>
          <div className="mt-1 flex gap-4">
            <div>
              <span className="text-xs text-stone-500">배정: </span>
              <span className="text-xs" style={{ color: activePin.color }}>{activePin.assignment}</span>
            </div>
            <div>
              <span className="text-xs text-stone-500">결선: </span>
              <span className="text-xs text-stone-400">{activePin.wire}</span>
            </div>
          </div>
        </div>
      ) : (
        <figcaption className="text-center text-stone-500 text-xs mt-2">
          핀을 호버하여 배정 및 결선 정보 확인. 12핀 커스텀 기밀 헤더 — 각 숫자 전극 1:1 연결.
        </figcaption>
      )}
    </figure>
  );
}
