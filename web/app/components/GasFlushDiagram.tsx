"use client";

import { useState, useEffect } from "react";

const PARTS = [
  { id: "tank", label: "네온 가스 실린더", detail: "소형 네온 실린더 또는 네온사인 업체에서 충전. 레귤레이터로 0.5 L/min 조절.", color: "#6BA368" },
  { id: "tube", label: "닉시관 (봉착 완료)", detail: "부틸+Torr Seal 복합 실링으로 봉착된 관. 내부에 전극 어셈블리. 하단 fill stem으로 가스 주입.", color: "#7B9EB8" },
  { id: "inlet", label: "입구 (fill stem)", detail: "하단 엔드캡의 1/16\" (1.59mm) Cu 캐필러리 튜브. 네온 가스가 이 관을 통해 유입.", color: "#D4A853" },
  { id: "outlet", label: "출구 (배출구)", detail: "봉착부의 가스 배출 경로. 플러싱 후 크림프+Torr Seal로 밀봉.", color: "#C17B5E" },
  { id: "sensor", label: "O₂ 센서", detail: "전기화학식 O₂ 센서 모듈. 배출구에 배치하여 잔존 산소 농도 실시간 모니터링. 목표: < 0.5%.", color: "#ef4444" },
  { id: "seal", label: "최종 밀봉", detail: "O₂ < 0.5% 확인 후 에폭시로 입구+출구 밀봉. 경화 후 가스 치환 완료.", color: "#B8A9C9" },
];

export default function GasFlushDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [flowPhase, setFlowPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFlowPhase((p) => (p + 1) % 60), 80);
    return () => clearInterval(timer);
  }, []);

  const activePart = PARTS.find((p) => p.id === hovered);
  const svgW = 500;
  const svgH = 280;

  // Animated neon particle positions
  const particles = Array.from({ length: 8 }, (_, i) => {
    const phase = ((flowPhase + i * 7) % 60) / 60;
    return { x: 160 + phase * 80, y: 60 + Math.sin(phase * Math.PI * 2) * 8, opacity: phase < 0.9 ? 0.6 : 0 };
  });

  // Air particles going out
  const airParticles = Array.from({ length: 5 }, (_, i) => {
    const phase = ((flowPhase + i * 11) % 60) / 60;
    return { x: 270 + phase * 60, y: 220 + Math.sin(phase * Math.PI) * 5, opacity: phase < 0.9 ? 0.4 : 0 };
  });

  return (
    <figure className="my-8">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-xl mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />

        <text x={svgW / 2} y={20} fill="#e8e8e8" fontSize="11" fontWeight="bold" textAnchor="middle">
          MAP 가스 플러싱 공정 (네온 치환)
        </text>

        {/* === Neon Tank === */}
        <g
          onMouseEnter={() => setHovered("tank")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={30} y={50} width={50} height={100} rx={10}
            fill={hovered === "tank" ? "#6BA36835" : "#6BA36822"}
            stroke={hovered === "tank" ? "#6BA368" : "#6BA36878"}
            strokeWidth={hovered === "tank" ? 2 : 1}
          />
          <rect x={45} y={42} width={20} height={12} rx={3}
            fill="#6BA36830" stroke="#6BA36865" strokeWidth={0.8} />
          <text x={55} y={95} fill="#6BA368" fontSize="9" fontWeight="bold" textAnchor="middle">Ne</text>
          <text x={55} y={110} fill="#6BA368" fontSize="6" textAnchor="middle" opacity={0.8}>가스</text>
          {/* Regulator */}
          <rect x={80} y={52} width={30} height={16} rx={3}
            fill="#6BA36822" stroke="#6BA36855" strokeWidth={0.6} />
          <text x={95} y={63} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.8}>REG</text>
        </g>

        {/* === Flow line from tank to inlet === */}
        <path d="M 110 60 L 160 60 L 200 45" fill="none" stroke="#6BA36865" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={135} y={53} fill="#6BA368" fontSize="6" opacity={0.7}>0.5 L/min</text>

        {/* Animated neon particles */}
        {particles.map((p, i) => (
          <circle key={`ne-${i}`} cx={p.x} cy={p.y} r={2.5}
            fill="#6BA368" opacity={p.opacity} />
        ))}

        {/* === Nixie Tube (center) === */}
        <g
          onMouseEnter={() => setHovered("tube")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <path
            d="M 175 200 L 175 80 Q 175 40 230 40 Q 285 40 285 80 L 285 200"
            fill={hovered === "tube" ? "#7B9EB838" : "#7B9EB820"}
            stroke={hovered === "tube" ? "#7B9EB8" : "#7B9EB8"}
            strokeWidth={hovered === "tube" ? 2 : 1.3}
          />
          {/* Base/header */}
          <rect x={170} y={200} width={120} height={12} rx={2}
            fill="#6BA36822" stroke="#6BA36855" strokeWidth={0.8} />

          {/* Electrode inside (simplified) */}
          <text x={230} y={135} fill="#ef8f4468" fontSize="24" fontWeight="bold" textAnchor="middle">8</text>

          {/* Interior label */}
          {!hovered && (
            <>
              <text x={230} y={100} fill="#6BA36860" fontSize="7" textAnchor="middle">Ne 유입</text>
              <text x={230} y={170} fill="#C17B5E60" fontSize="7" textAnchor="middle">공기 배출</text>
            </>
          )}
        </g>

        {/* === Inlet === */}
        <g
          onMouseEnter={() => setHovered("inlet")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={222} y={28} width={16} height={16} rx={2}
            fill={hovered === "inlet" ? "#D4A85335" : "#D4A85322"}
            stroke={hovered === "inlet" ? "#D4A853" : "#D4A85365"}
            strokeWidth={hovered === "inlet" ? 1.5 : 0.8}
          />
          {/* Arrow down */}
          <polygon points="226,38 234,38 230,44" fill={hovered === "inlet" ? "#D4A853" : "#D4A85378"} />
          <text x={250} y={36} fill="#D4A853" fontSize="7" opacity={0.9}>입구</text>
        </g>

        {/* === Outlet === */}
        <g
          onMouseEnter={() => setHovered("outlet")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={290} y={195} width={16} height={16} rx={2}
            fill={hovered === "outlet" ? "#C17B5E35" : "#C17B5E22"}
            stroke={hovered === "outlet" ? "#C17B5E" : "#C17B5E65"}
            strokeWidth={hovered === "outlet" ? 1.5 : 0.8}
          />
          {/* Arrow right */}
          <polygon points="302,199 302,207 308,203" fill={hovered === "outlet" ? "#C17B5E" : "#C17B5E78"} />
          <text x={312} y={207} fill="#C17B5E" fontSize="7" opacity={0.9}>출구</text>
        </g>

        {/* Animated air particles going out */}
        {airParticles.map((p, i) => (
          <circle key={`air-${i}`} cx={p.x} cy={p.y} r={2}
            fill="#C17B5E" opacity={p.opacity} />
        ))}

        {/* === O₂ Sensor === */}
        <g
          onMouseEnter={() => setHovered("sensor")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          <rect x={340} y={185} width={80} height={36} rx={4}
            fill={hovered === "sensor" ? "#ef444435" : "#ef444422"}
            stroke={hovered === "sensor" ? "#ef4444" : "#ef444465"}
            strokeWidth={hovered === "sensor" ? 1.5 : 0.8}
          />
          <text x={380} y={200} fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">O₂ 센서</text>
          {/* Reading */}
          <text x={380} y={214} fill="#6BA368" fontSize="10" fontWeight="bold" textAnchor="middle">
            {(Math.max(0.1, 21 - flowPhase * 0.4)).toFixed(1)}%
          </text>
          {/* Connection line */}
          <line x1={308} y1={203} x2={340} y2={203} stroke="#ef444455" strokeWidth={1} strokeDasharray="3 2" />
        </g>

        {/* === Process stages at bottom === */}
        <g>
          <text x={80} y={245} fill="#6BA368" fontSize="8" fontWeight="bold" textAnchor="middle">1. 플러싱</text>
          <text x={80} y={256} fill="#666" fontSize="6" textAnchor="middle">Ne 유입 3-5분</text>

          <line x1={130} y1={248} x2={165} y2={248} stroke="#555" strokeWidth={0.5} />
          <polygon points="163,246 167,248 163,250" fill="#555" />

          <text x={230} y={245} fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">2. 확인</text>
          <text x={230} y={256} fill="#666" fontSize="6" textAnchor="middle">{"O₂ < 0.5%"}</text>

          <line x1={280} y1={248} x2={315} y2={248} stroke="#555" strokeWidth={0.5} />
          <polygon points="313,246 317,248 313,250" fill="#555" />

          <text x={390} y={245} fill="#B8A9C9" fontSize="8" fontWeight="bold" textAnchor="middle">3. 밀봉</text>
          <text x={390} y={256} fill="#666" fontSize="6" textAnchor="middle">에폭시 경화</text>
        </g>

        <text x={svgW / 2} y={svgH - 6} fill="#666" fontSize="7" textAnchor="middle">
          MAP(Modified Atmosphere Packaging) 원리: 식품 산업에서 검증된 가스 치환 기법을 닉시관에 적용
        </text>
      </svg>

      {/* Info panel */}
      {activePart ? (
        <div
          className="max-w-xl mx-auto mt-2 rounded-lg border p-3 transition-all duration-200"
          style={{ borderColor: activePart.color + "55", backgroundColor: activePart.color + "18" }}
        >
          <div className="text-sm font-medium" style={{ color: activePart.color }}>{activePart.label}</div>
          <p className="text-xs text-stone-400 mt-1">{activePart.detail}</p>
        </div>
      ) : (
        <figcaption className="text-center text-stone-500 text-xs mt-2">
          각 요소를 호버하여 상세 확인. 진공 펌프 대신 네온 가스 플러싱으로 공기를 치환하는 혁신적 접근.
        </figcaption>
      )}
    </figure>
  );
}
