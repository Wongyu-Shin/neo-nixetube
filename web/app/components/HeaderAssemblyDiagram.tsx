"use client";

import { useState } from "react";

type Part = {
  id: string;
  label: string;
  detail: string;
  color: string;
};

const PARTS: Part[] = [
  { id: "dome", label: "유리 돔", detail: "소다라임 유리 OD 25-30mm. 전극 어셈블리를 감싸는 외피. 상단에 가스 플러싱용 배기관.", color: "#7B9EB8" },
  { id: "anode", label: "양극 메쉬", detail: "니켈 메쉬. 최전면 배치. 숫자 전극 앞에서 균일한 전계 형성.", color: "#D4A853" },
  { id: "cathode", label: "음극 (숫자 전극)", detail: "전해 니켈 포일에서 레이저/에칭으로 제작한 숫자 '8'. 0.5-1mm 간격으로 적층.", color: "#ef8f44" },
  { id: "spacer", label: "마이카 스페이서", detail: "운모(마이카) 시트로 전극 간 절연 + 간격 유지. 크로스토크 방전 방지.", color: "#B8A9C9" },
  { id: "header", label: "TO-8 기밀 헤더", detail: "12핀 커스텀 Kovar/glass-bead 압축 헤더. 유리-금속 봉착 해결. Body OD 12.7mm.", color: "#6BA368" },
  { id: "pin", label: "핀 (피드스루)", detail: "금도금 코바르 핀. 유리-금속 기밀 봉착 완료 상태로 납품. 각 숫자 전극에 1:1 연결.", color: "#C17B5E" },
];

export default function HeaderAssemblyDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const activePart = PARTS.find((p) => p.id === hovered);

  const svgW = 420;
  const svgH = 320;

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-lg mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />

        <text x={svgW / 2} y={20} fill="#e8e8e8" fontSize="11" fontWeight="bold" textAnchor="middle">
          TO-8 헤더 + 전극 어셈블리 단면도
        </text>

        {/* === Glass dome === */}
        <g
          onMouseEnter={() => setHovered("dome")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <path
            d={`M 130 240 L 130 80 Q 130 40 210 40 Q 290 40 290 80 L 290 240`}
            fill={hovered === "dome" ? "#7B9EB840" : "#7B9EB828"}
            stroke={hovered === "dome" ? "#7B9EB8" : "#7B9EB8"}
            strokeWidth={hovered === "dome" ? 2.5 : 1.5}
          />
          {/* Glass label */}
          <text x={115} y={140} fill="#7B9EB8" fontSize="8" textAnchor="end" opacity={0.8}>유리 돔</text>
          <line x1={118} y1={138} x2={130} y2={138} stroke="#7B9EB855" strokeWidth={0.5} />

          {/* Exhaust tube on top */}
          <rect x={203} y={28} width={14} height={18} rx={2}
            fill="#7B9EB830" stroke="#7B9EB878" strokeWidth={0.8} />
          <text x={210} y={25} fill="#7B9EB8" fontSize="6" textAnchor="middle" opacity={0.8}>배기관</text>
        </g>

        {/* === Neon gas fill === */}
        <text x={210} y={65} fill="#6BA36878" fontSize="8" textAnchor="middle">Ne</text>
        <text x={170} y={100} fill="#6BA36845" fontSize="6" textAnchor="middle">Ne</text>
        <text x={250} y={110} fill="#6BA36845" fontSize="6" textAnchor="middle">Ne</text>

        {/* === Anode mesh === */}
        <g
          onMouseEnter={() => setHovered("anode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={160} y={80} width={100} height={4} rx={1}
            fill={hovered === "anode" ? "#D4A85355" : "#D4A85335"}
            stroke={hovered === "anode" ? "#D4A853" : "#D4A85378"}
            strokeWidth={hovered === "anode" ? 1.5 : 0.8}
          />
          {/* Mesh pattern */}
          {[170, 180, 190, 200, 210, 220, 230, 240, 250].map((mx, i) => (
            <line key={i} x1={mx} y1={80} x2={mx} y2={84} stroke="#D4A85345" strokeWidth={0.5} />
          ))}
          <text x={300} y={85} fill="#D4A853" fontSize="7" opacity={0.8}>양극 메쉬 (+)</text>
          <line x1={260} y1={82} x2={298} y2={82} stroke="#D4A85355" strokeWidth={0.5} />
        </g>

        {/* === Cathode stack (number electrodes) === */}
        <g
          onMouseEnter={() => setHovered("cathode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          {[0, 1, 2, 3, 4].map((idx) => {
            const ey = 100 + idx * 18;
            const opacity = 1 - idx * 0.15;
            return (
              <g key={idx}>
                <rect x={165} y={ey} width={90} height={12} rx={1}
                  fill={hovered === "cathode" ? `rgba(239,143,68,${0.15 * opacity})` : `rgba(239,143,68,${0.08 * opacity})`}
                  stroke={hovered === "cathode" ? "#ef8f44" : "#ef8f4478"}
                  strokeWidth={hovered === "cathode" ? 1.2 : 0.6}
                />
                {/* Number on electrode */}
                <text x={210} y={ey + 10} fill="#ef8f44" fontSize="8" fontWeight="bold" textAnchor="middle" opacity={opacity * 0.7}>
                  {[8, 0, 6, 9, 2][idx]}
                </text>
              </g>
            );
          })}
          <text x={300} y={145} fill="#ef8f44" fontSize="7" opacity={0.8}>음극 숫자 (-)</text>
          <line x1={255} y1={142} x2={298} y2={142} stroke="#ef8f4455" strokeWidth={0.5} />
          {/* Gap annotation */}
          <text x={155} y={115} fill="#ef8f44" fontSize="5" textAnchor="end" opacity={0.7}>0.5-1mm</text>
        </g>

        {/* === Mica spacers === */}
        <g
          onMouseEnter={() => setHovered("spacer")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          {[0, 1, 2, 3].map((idx) => {
            const sy = 112 + idx * 18;
            return (
              <rect key={idx} x={165} y={sy} width={90} height={6} rx={0.5}
                fill={hovered === "spacer" ? "#B8A9C935" : "#B8A9C918"}
                stroke={hovered === "spacer" ? "#B8A9C9" : "#B8A9C945"}
                strokeWidth={0.5}
                strokeDasharray={hovered === "spacer" ? "none" : "2 2"}
              />
            );
          })}
          <text x={300} y={168} fill="#B8A9C9" fontSize="7" opacity={0.8}>마이카 스페이서</text>
        </g>

        {/* === TO-8 Header === */}
        <g
          onMouseEnter={() => setHovered("header")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={120} y={240} width={180} height={20} rx={3}
            fill={hovered === "header" ? "#6BA36840" : "#6BA36825"}
            stroke={hovered === "header" ? "#6BA368" : "#6BA36878"}
            strokeWidth={hovered === "header" ? 2 : 1}
          />
          {/* Header rim */}
          <rect x={110} y={236} width={200} height={6} rx={2}
            fill={hovered === "header" ? "#6BA36818" : "#6BA36818"}
            stroke={hovered === "header" ? "#6BA36880" : "#6BA36855"}
            strokeWidth={0.8}
          />
          <text x={210} y={254} fill="#6BA368" fontSize="8" fontWeight="bold" textAnchor="middle" opacity={0.8}>
            TO-8 기밀 헤더
          </text>
          <text x={115} y={254} fill="#6BA368" fontSize="6" textAnchor="end" opacity={0.8}>12핀</text>
        </g>

        {/* === Pins === */}
        <g
          onMouseEnter={() => setHovered("pin")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          {[155, 170, 185, 200, 210, 225, 240, 255].map((px, i) => (
            <g key={i}>
              {/* Pin through header */}
              <line x1={px} y1={195} x2={px} y2={260} stroke={hovered === "pin" ? "#C17B5E" : "#C17B5E78"} strokeWidth={1.2} />
              {/* Pin below header */}
              <line x1={px} y1={260} x2={px} y2={290} stroke={hovered === "pin" ? "#C17B5E" : "#C17B5E65"} strokeWidth={1} />
              <circle cx={px} cy={292} r={1.5} fill={hovered === "pin" ? "#C17B5E" : "#C17B5E78"} />
            </g>
          ))}
          <text x={210} y={305} fill="#C17B5E" fontSize="7" textAnchor="middle" opacity={0.9}>외부 연결 핀</text>
        </g>

        {/* Butyl seal zone indicator */}
        <rect x={120} y={228} width={180} height={14} rx={2}
          fill="none" stroke="#D4A85345" strokeWidth={0.5} strokeDasharray="3 2" />
        <text x={118} y={238} fill="#D4A853" fontSize="5" textAnchor="end" opacity={0.6}>부틸 실링 영역</text>

        {/* Dimension line */}
        <line x1={130} y1={30} x2={130} y2={295} stroke="#ffffff22" strokeWidth={0.5} strokeDasharray="2 4" />
        <text x={127} y={165} fill="#ffffff35" fontSize="6" textAnchor="end" transform="rotate(-90, 127, 165)">~40mm</text>
      </svg>

      {/* Info panel */}
      {activePart ? (
        <div
          className="max-w-lg mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{ borderColor: activePart.color + "55", backgroundColor: activePart.color + "18" }}
        >
          <div className="text-sm font-medium" style={{ color: activePart.color }}>{activePart.label}</div>
          <p className="text-xs text-stone-400 mt-1">{activePart.detail}</p>
        </div>
      ) : (
        <figcaption className="text-center text-stone-500 text-xs mt-2">
          각 부품을 호버하여 역할과 사양 확인. TO-8 헤더가 유리-금속 봉착 문제를 기성품으로 해결.
        </figcaption>
      )}
    </figure>
  );
}
