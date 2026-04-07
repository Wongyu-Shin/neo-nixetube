"use client";

import { useState } from "react";

const PARTS = [
  {
    id: "glass",
    label: "유리 외피 (Glass Envelope)",
    detail:
      "소다라임 또는 보로실리케이트 유리. 진공/가스를 밀봉하고 전극을 보호. CTE 매칭이 봉착 성패를 결정.",
    color: "#D4A853",
  },
  {
    id: "anode",
    label: "양극 메쉬 (Anode Mesh)",
    detail:
      "니켈 미세 철망. 전체 음극 앞에 위치하여 균일한 전계 형성. 투명하게 숫자가 보임.",
    color: "#7B9EB8",
  },
  {
    id: "cathode",
    label: "음극 (Cathode Digits 0-9)",
    detail:
      "숫자 형상 니켈 판 10장이 적층. 선택된 음극에 전압 인가 시 글로우 발광. 닉시관의 핵심.",
    color: "#FF8C42",
  },
  {
    id: "gas",
    label: "네온 가스 (Ne 15 Torr)",
    detail:
      "585-640nm 파장의 따뜻한 오렌지 발광. 15 Torr ≈ 대기압의 1/50. 파셴 법칙으로 최적 압력 결정.",
    color: "#6BA368",
  },
  {
    id: "seal",
    label: "유리-금속 봉착 (Base Seal)",
    detail:
      "최대 병목. 전통: 800°C 토치. 프릿 경로: 450°C. 상온 경로: 부틸+폴리설파이드.",
    color: "#D4A853",
  },
  {
    id: "pins",
    label: "핀 (Dumet Wire)",
    detail:
      "듀멧 와이어(Cu-Ni-Fe). CTE 9.0×10⁻⁶/K로 소다라임 유리와 매칭. 전극 리드선을 외부로.",
    color: "#B8A9C9",
  },
];

/* Reusable tube outline path */
const TUBE_OUTER =
  "M 212,515 L 212,495 C 212,484 184,474 182,455 L 178,158 C 178,88 224,56 270,56 C 316,56 362,88 362,158 L 358,455 C 356,474 328,484 328,495 L 328,515 Z";
const TUBE_INNER =
  "M 215,512 L 215,494 C 215,484 187,475 185,457 L 181,160 C 181,92 226,60 270,60 C 314,60 359,92 359,160 L 355,457 C 353,475 325,484 325,494 L 325,512 Z";

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
        viewBox="0 0 540 700"
        className="w-full max-w-md mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Gradients ────────────────────────────── */}

          {/* Background: subtle warm centre from neon light */}
          <radialGradient id="nd-bg" cx="50%" cy="38%" r="50%">
            <stop offset="0%" stopColor="#1e1610" />
            <stop offset="100%" stopColor="#111111" />
          </radialGradient>

          {/* Glass body – horizontal Fresnel: bright edges, clear centre */}
          <linearGradient id="nd-glass-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="18%" stopColor="#c8dde8" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="82%" stopColor="#c8dde8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
          </linearGradient>

          {/* Left edge Fresnel */}
          <linearGradient id="nd-fresnel-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Right edge Fresnel */}
          <linearGradient id="nd-fresnel-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Specular highlight streak */}
          <linearGradient id="nd-highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Internal ambient neon glow */}
          <radialGradient id="nd-ambient" cx="50%" cy="42%" r="45%">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.25" />
            <stop offset="55%" stopColor="#FF6820" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>

          {/* Neon core – bright orange radial */}
          <radialGradient id="nd-neon-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFDCB8" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#FF8C42" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#FF5500" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </radialGradient>

          {/* Metal pin sheen */}
          <linearGradient id="nd-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#656565" />
            <stop offset="28%" stopColor="#b0b0b0" />
            <stop offset="50%" stopColor="#dcdcdc" />
            <stop offset="72%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#656565" />
          </linearGradient>

          {/* Seal base – dark ceramic */}
          <linearGradient id="nd-seal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a3a28" />
            <stop offset="50%" stopColor="#362818" />
            <stop offset="100%" stopColor="#28180a" />
          </linearGradient>

          {/* Seal ring – brass */}
          <linearGradient id="nd-brass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a7a58" />
            <stop offset="30%" stopColor="#c8b888" />
            <stop offset="50%" stopColor="#d8c898" />
            <stop offset="70%" stopColor="#c8b888" />
            <stop offset="100%" stopColor="#8a7a58" />
          </linearGradient>

          {/* Wire nickel */}
          <linearGradient id="nd-nickel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#807868" />
            <stop offset="50%" stopColor="#a8a090" />
            <stop offset="100%" stopColor="#807868" />
          </linearGradient>

          {/* ── Filters ──────────────────────────────── */}

          {/* Multi-layer neon glow */}
          <filter id="nd-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b3" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="b4" />
            <feMerge>
              <feMergeNode in="b4" />
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft inner glow (small) */}
          <filter id="nd-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wide ambient blur */}
          <filter id="nd-ambient-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
          </filter>

          {/* Glass highlight softness */}
          <filter id="nd-glass-soft">
            <feGaussianBlur stdDeviation="2" />
          </filter>

          {/* Depth shadow */}
          <filter id="nd-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="s" />
            <feOffset dx="1" dy="1" result="os" />
            <feMerge>
              <feMergeNode in="os" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Patterns ─────────────────────────────── */}

          {/* Fine anode wire mesh */}
          <pattern
            id="nd-mesh"
            x="0"
            y="0"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="3.5" x2="7" y2="3.5" stroke="#7B9EB8" strokeWidth="0.35" opacity="0.45" />
            <line x1="3.5" y1="0" x2="3.5" y2="7" stroke="#7B9EB8" strokeWidth="0.35" opacity="0.45" />
            {/* Cross-wire highlights at intersections */}
            <circle cx="3.5" cy="3.5" r="0.4" fill="#9BB8CC" opacity="0.3" />
          </pattern>

          {/* ── Clip paths ───────────────────────────── */}
          <clipPath id="nd-tube-clip">
            <path d={TUBE_INNER} />
          </clipPath>
        </defs>

        {/* ══════════ Background ══════════ */}
        <rect width="540" height="700" fill="url(#nd-bg)" rx="10" />

        {/* Ambient neon light casting inside tube (behind everything) */}
        <ellipse
          cx="270"
          cy="260"
          rx="80"
          ry="120"
          fill="#FF8C42"
          opacity="0.12"
          clipPath="url(#nd-tube-clip)"
        />
        <ellipse
          cx="270"
          cy="260"
          rx="50"
          ry="80"
          fill="#FF9955"
          opacity="0.08"
          clipPath="url(#nd-tube-clip)"
        />

        {/* ══════════ Glass Envelope ══════════ */}
        <g
          onMouseEnter={() => setHovered("glass")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("glass")}
        >
          {/* Outer wall */}
          <path
            d={TUBE_OUTER}
            fill="url(#nd-glass-body)"
            stroke="#D4A853"
            strokeWidth="2"
            opacity="0.85"
          />
          {/* Inner wall (double-wall glass effect) */}
          <path
            d={TUBE_INNER}
            fill="none"
            stroke="#D4A853"
            strokeWidth="0.5"
            opacity="0.35"
          />
          {/* Tube interior ambient tint */}
          <path d={TUBE_INNER} fill="url(#nd-ambient)" />

          {/* Left Fresnel edge reflection */}
          <rect
            x="178"
            y="110"
            width="18"
            height="330"
            fill="url(#nd-fresnel-l)"
            rx="6"
            opacity="0.8"
            clipPath="url(#nd-tube-clip)"
          />
          {/* Right Fresnel edge reflection */}
          <rect
            x="345"
            y="130"
            width="14"
            height="300"
            fill="url(#nd-fresnel-r)"
            rx="6"
            opacity="0.65"
            clipPath="url(#nd-tube-clip)"
          />

          {/* Primary specular highlight – left-top */}
          <ellipse
            cx="198"
            cy="190"
            rx="6"
            ry="75"
            fill="url(#nd-highlight)"
            opacity="0.7"
            filter="url(#nd-glass-soft)"
          />
          {/* Secondary dim highlight */}
          <ellipse
            cx="194"
            cy="320"
            rx="4"
            ry="45"
            fill="#ffffff"
            opacity="0.07"
            filter="url(#nd-glass-soft)"
          />
          {/* Dome highlight */}
          <ellipse
            cx="255"
            cy="68"
            rx="30"
            ry="6"
            fill="#ffffff"
            opacity="0.12"
            filter="url(#nd-glass-soft)"
          />

          {/* ── Annotation ── */}
          <circle cx="365" cy="130" r="1.5" fill="#D4A853" opacity="0.6" />
          <line x1="365" y1="130" x2="400" y2="98" stroke="#D4A853" strokeWidth="0.5" opacity="0.6" />
          <line x1="400" y1="98" x2="460" y2="98" stroke="#D4A853" strokeWidth="0.5" opacity="0.6" />
          <text x="463" y="95" fill="#D4A853" fontSize="10" opacity="0.8">
            Glass Envelope
          </text>
        </g>

        {/* ══════════ Anode Mesh ══════════ */}
        <g
          onMouseEnter={() => setHovered("anode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("anode")}
        >
          {/* Mesh body – pattern fill */}
          <rect
            x="192"
            y="115"
            width="156"
            height="295"
            fill="url(#nd-mesh)"
            stroke="#7B9EB8"
            strokeWidth={hovered === "anode" ? 1.8 : 1}
            rx="3"
            opacity="0.65"
          />
          {/* Shadow duplicate for depth */}
          <rect
            x="193"
            y="116"
            width="156"
            height="295"
            fill="none"
            stroke="#4a6878"
            strokeWidth="0.4"
            rx="3"
            opacity="0.3"
          />
          {/* Top frame bar */}
          <rect x="192" y="113" width="156" height="4" fill="#7B9EB8" opacity="0.25" rx="1" />
          {/* Bottom frame bar */}
          <rect x="192" y="408" width="156" height="4" fill="#7B9EB8" opacity="0.25" rx="1" />
          {/* Side frame bars */}
          <rect x="190" y="115" width="3" height="295" fill="#7B9EB8" opacity="0.18" rx="1" />
          <rect x="347" y="115" width="3" height="295" fill="#7B9EB8" opacity="0.18" rx="1" />

          {/* ── Annotation ── */}
          <circle cx="192" cy="420" r="1.5" fill="#7B9EB8" opacity="0.6" />
          <line x1="192" y1="420" x2="140" y2="445" stroke="#7B9EB8" strokeWidth="0.5" opacity="0.6" />
          <line x1="140" y1="445" x2="55" y2="445" stroke="#7B9EB8" strokeWidth="0.5" opacity="0.6" />
          <text x="52" y="443" fill="#7B9EB8" fontSize="10" textAnchor="end" opacity="0.8">
            Anode Mesh
          </text>
        </g>

        {/* ══════════ Cathode Digits ══════════ */}
        <g
          onMouseEnter={() => setHovered("cathode")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("cathode")}
        >
          {/* Wide ambient glow from active digit */}
          <ellipse
            cx="270"
            cy="265"
            rx="60"
            ry="75"
            fill="#FF8C42"
            opacity={hovered === "cathode" ? 0.25 : 0.15}
            filter="url(#nd-ambient-blur)"
            clipPath="url(#nd-tube-clip)"
          />

          {/* ── Digit "7" — back layer ── */}
          <g transform="translate(270,268)" opacity="0.25">
            <path
              d="M -14,-30 L 13,-30 L 13,-27 L -1,30"
              fill="none"
              stroke="url(#nd-nickel)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="-1" y1="30" x2="-1" y2="52" stroke="#908878" strokeWidth="0.8" opacity="0.5" />
          </g>

          {/* ── Digit "3" — middle layer ── */}
          <g transform="translate(270,265)" opacity="0.35">
            <path
              d="M -11,-29 L 5,-29 C 17,-29 17,-5 2,-3 C 17,-1 17,27 5,29 L -11,29"
              fill="none"
              stroke="url(#nd-nickel)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="-11" y1="29" x2="-11" y2="52" stroke="#908878" strokeWidth="0.8" opacity="0.5" />
          </g>

          {/* ── Ceramic spacers ── */}
          {[-10, -5, 0, 5, 10].map((dy) => (
            <rect
              key={`sp${dy}`}
              x="238"
              y={262 + dy * 2.5}
              width="2.5"
              height="1.5"
              fill="#d0c4b4"
              opacity="0.25"
              rx="0.5"
            />
          ))}

          {/* ── Digit "8" — front layer, ACTIVE & GLOWING ── */}
          <g transform="translate(270,262)">
            {/* Glow layer 5 — widest soft ambient (no filter, just big fill) */}
            <ellipse cx="0" cy="0" rx="55" ry="65" fill="#FF6820" opacity="0.08">
              <animate
                attributeName="opacity"
                values="0.06;0.1;0.07;0.09;0.06"
                dur="4s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Glow layer 4 — medium ambient */}
            <ellipse cx="0" cy="0" rx="38" ry="45" fill="#FF8C42" opacity="0.15" />

            {/* Glow layer 3 — tight glow around digit */}
            <ellipse cx="0" cy="0" rx="25" ry="35" fill="#FF9955" opacity="0.2" />

            {/* Glow layer 2 — outer thick stroke (no filter) */}
            <path
              d="M 0,-28 C -15,-28 -15,-4 0,-2 C 15,-4 15,-28 0,-28 Z M 0,-2 C -17,0 -17,26 0,28 C 17,26 17,0 0,-2 Z"
              fill="none"
              stroke="#FF7B30"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Glow layer 1 — mid stroke */}
            <path
              d="M 0,-28 C -15,-28 -15,-4 0,-2 C 15,-4 15,-28 0,-28 Z M 0,-2 C -17,0 -17,26 0,28 C 17,26 17,0 0,-2 Z"
              fill="none"
              stroke="#FF9955"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Core wire — bright */}
            <path
              d="M 0,-28 C -15,-28 -15,-4 0,-2 C 15,-4 15,-28 0,-28 Z M 0,-2 C -17,0 -17,26 0,28 C 17,26 17,0 0,-2 Z"
              fill="none"
              stroke="#FFB878"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Hot centre */}
            <path
              d="M 0,-28 C -15,-28 -15,-4 0,-2 C 15,-4 15,-28 0,-28 Z M 0,-2 C -17,0 -17,26 0,28 C 17,26 17,0 0,-2 Z"
              fill="none"
              stroke="#FFE8D0"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Support stem wire */}
            <line
              x1="0"
              y1="28"
              x2="0"
              y2="52"
              stroke="#FFB070"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </g>

          {/* ── Annotation ── */}
          <circle cx="230" cy="235" r="1.5" fill="#FF8C42" opacity="0.6" />
          <line x1="230" y1="235" x2="115" y2="205" stroke="#FF8C42" strokeWidth="0.5" opacity="0.6" />
          <line x1="115" y1="205" x2="45" y2="205" stroke="#FF8C42" strokeWidth="0.5" opacity="0.6" />
          <text x="42" y="200" fill="#FF8C42" fontSize="10" textAnchor="end" opacity="0.8">
            Cathode
          </text>
          <text x="42" y="212" fill="#FF8C42" fontSize="10" textAnchor="end" opacity="0.8">
            Digits (0–9)
          </text>
        </g>

        {/* ══════════ Fill Gas ══════════ */}
        <g
          onMouseEnter={() => setHovered("gas")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("gas")}
        >
          {/* Invisible hover target spanning tube interior */}
          <rect
            x="195"
            y="420"
            width="150"
            height="50"
            fill="transparent"
          />
          {/* Scattered gas indicator dots */}
          {[
            [215, 370],
            [290, 155],
            [200, 210],
            [310, 330],
            [225, 430],
            [280, 180],
            [240, 360],
            [300, 260],
            [205, 290],
            [330, 200],
            [255, 140],
            [185, 380],
          ].map(([x, y], i) => (
            <circle
              key={`g${i}`}
              cx={x}
              cy={y}
              r="0.8"
              fill="#6BA368"
              opacity="0.35"
            />
          ))}
          {/* Label */}
          <text
            x="270"
            y="448"
            fill="#6BA368"
            fontSize="11"
            textAnchor="middle"
            opacity="0.8"
            fontFamily="'Space Mono', monospace"
          >
            Ne 15 Torr
          </text>
          <text
            x="270"
            y="461"
            fill="#6BA368"
            fontSize="8"
            textAnchor="middle"
            opacity="0.5"
          >
            (neon fill gas)
          </text>
        </g>

        {/* ══════════ Base Seal ══════════ */}
        <g
          onMouseEnter={() => setHovered("seal")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("seal")}
        >
          {/* Main seal body */}
          <rect
            x="205"
            y="510"
            width="130"
            height="18"
            fill="url(#nd-seal)"
            stroke="#D4A853"
            strokeWidth={hovered === "seal" ? 1.2 : 0.6}
            opacity="0.85"
            rx="2"
          />
          {/* Top brass ring */}
          <rect
            x="203"
            y="508"
            width="134"
            height="4"
            fill="url(#nd-brass)"
            opacity="0.65"
            rx="1"
          />
          {/* Bottom brass ring */}
          <rect
            x="203"
            y="526"
            width="134"
            height="3"
            fill="url(#nd-brass)"
            opacity="0.55"
            rx="1"
          />
          {/* Surface detail line */}
          <line
            x1="210"
            y1="519"
            x2="330"
            y2="519"
            stroke="#D4A853"
            strokeWidth="0.3"
            opacity="0.15"
          />

          {/* ── Annotation ── */}
          <circle cx="340" cy="520" r="1.5" fill="#D4A853" opacity="0.6" />
          <line x1="340" y1="520" x2="395" y2="520" stroke="#D4A853" strokeWidth="0.5" opacity="0.6" />
          <line x1="395" y1="520" x2="460" y2="520" stroke="#D4A853" strokeWidth="0.5" opacity="0.6" />
          <text x="463" y="516" fill="#D4A853" fontSize="9" opacity="0.8">
            Glass-Metal
          </text>
          <text x="463" y="528" fill="#D4A853" fontSize="9" opacity="0.8">
            Seal
          </text>
        </g>

        {/* ══════════ Pins ══════════ */}
        <g
          onMouseEnter={() => setHovered("pins")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", transition: "opacity 0.3s" }}
          opacity={getOpacity("pins")}
        >
          {[218, 232, 248, 270, 292, 308, 322].map((x, i) => {
            /* Internal lead wire fans out from pin to digit area */
            const fanX =
              i < 3
                ? x - (3 - i) * 5
                : i > 3
                  ? x + (i - 3) * 5
                  : x;
            return (
              <g key={`p${i}`}>
                {/* Internal lead (through seal into tube) */}
                <line
                  x1={x}
                  y1="528"
                  x2={fanX}
                  y2="420"
                  stroke="#908880"
                  strokeWidth="0.6"
                  opacity="0.35"
                />
                {/* External pin wire */}
                <line
                  x1={x}
                  y1="528"
                  x2={x}
                  y2="632"
                  stroke="url(#nd-metal)"
                  strokeWidth={hovered === "pins" ? 2.8 : 2}
                  strokeLinecap="round"
                />
                {/* Pin highlight streak */}
                <line
                  x1={x}
                  y1="534"
                  x2={x}
                  y2="626"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                  opacity="0.2"
                />
                {/* Tip ball */}
                <circle
                  cx={x}
                  cy="635"
                  r={hovered === "pins" ? 3.2 : 2.4}
                  fill="url(#nd-metal)"
                  stroke="#777"
                  strokeWidth="0.3"
                />
                {/* Tip highlight */}
                <circle
                  cx={x - 0.5}
                  cy={634}
                  r="0.7"
                  fill="#ffffff"
                  opacity="0.2"
                />
              </g>
            );
          })}

          {/* ── Annotation ── */}
          <text
            x="270"
            y="665"
            fill="#B8A9C9"
            fontSize="10"
            textAnchor="middle"
            opacity="0.8"
          >
            Pins (Dumet wire)
          </text>
        </g>

        {/* ══════════ Title ══════════ */}
        <text
          x="270"
          y="30"
          fill="#e8e8e8"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          opacity="0.85"
        >
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
          <div
            className="text-sm font-medium"
            style={{ color: activePart.color }}
          >
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
