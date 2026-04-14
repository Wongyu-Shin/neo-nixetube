"use client";

export function FritSealingDiagram() {
  const svgW = 520;
  const svgH = 220;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">프릿 실링 원리: 저융점 유리로 450°C에서 기밀 접합</text>

      {/* LEFT: Before */}
      <text x={130} y={38} fill="#999" fontSize="8" fontWeight="bold" textAnchor="middle">소성 전</text>
      <rect x={50} y={50} width={160} height={14} rx={3} fill="#7B9EB825" stroke="#7B9EB870" strokeWidth={1} />
      <text x={130} y={60} fill="#7B9EB8" fontSize="6" textAnchor="middle">유리 디스크 (소다라임)</text>
      <rect x={50} y={66} width={160} height={10} rx={2} fill="#D4A85325" stroke="#D4A85370" strokeWidth={0.8} strokeDasharray="3 2" />
      {[65, 85, 105, 125, 145, 165, 185].map((dx, i) => <circle key={i} cx={dx} cy={71} r={1.5} fill="#D4A85360" />)}
      <text x={130} y={85} fill="#D4A853" fontSize="6" textAnchor="middle" opacity={0.8}>Bi₂O₃ 프릿 페이스트 (분말)</text>
      <rect x={50} y={90} width={160} height={80} rx={3} fill="#7B9EB818" stroke="#7B9EB860" strokeWidth={0.8} />
      <rect x={50} y={90} width={8} height={80} fill="#7B9EB822" />
      <rect x={202} y={90} width={8} height={80} fill="#7B9EB822" />
      <text x={130} y={135} fill="#7B9EB8" fontSize="7" textAnchor="middle" opacity={0.6}>유리관 본체</text>
      {[75, 105, 155, 185].map((dx, i) => (
        <g key={i}>
          <line x1={dx} y1={44} x2={dx} y2={66} stroke="#C17B5E" strokeWidth={2} />
          <line x1={dx} y1={76} x2={dx} y2={100} stroke="#C17B5E" strokeWidth={2} />
          <circle cx={dx} cy={71} r={2} fill="none" stroke="#C17B5E50" strokeWidth={0.5} strokeDasharray="1 1" />
        </g>
      ))}
      <text x={35} y={73} fill="#C17B5E" fontSize="5" textAnchor="end">듀멧</text>

      {/* Arrow */}
      <line x1={225} y1={110} x2={285} y2={110} stroke="#D4A853" strokeWidth={1.5} />
      <polygon points="283,107 290,110 283,113" fill="#D4A853" />
      <text x={258} y={100} fill="#D4A853" fontSize="9" fontWeight="bold" textAnchor="middle">450°C</text>
      <text x={258} y={125} fill="#666" fontSize="6" textAnchor="middle">미니가마</text>
      <text x={258} y={135} fill="#666" fontSize="5" textAnchor="middle">30분</text>

      {/* RIGHT: After */}
      <text x={390} y={38} fill="#999" fontSize="8" fontWeight="bold" textAnchor="middle">소성 후 (기밀)</text>
      <rect x={310} y={50} width={160} height={14} rx={3} fill="#7B9EB825" stroke="#7B9EB870" strokeWidth={1} />
      <rect x={310} y={66} width={160} height={10} rx={2} fill="#D4A85340" stroke="#D4A853" strokeWidth={1.2} />
      <text x={390} y={74} fill="#D4A853" fontSize="6" fontWeight="bold" textAnchor="middle">프릿 융착 완료</text>
      <rect x={310} y={90} width={160} height={80} rx={3} fill="#7B9EB818" stroke="#7B9EB860" strokeWidth={0.8} />
      <rect x={310} y={90} width={8} height={80} fill="#7B9EB822" />
      <rect x={462} y={90} width={8} height={80} fill="#7B9EB822" />
      {[335, 365, 415, 445].map((dx, i) => (
        <g key={i}>
          <line x1={dx} y1={44} x2={dx} y2={100} stroke="#C17B5E" strokeWidth={2} />
          <circle cx={dx} cy={71} r={3} fill="#D4A85350" stroke="#D4A85380" strokeWidth={0.5} />
        </g>
      ))}

      {/* Seal indicator */}
      <rect x={310} y={180} width={160} height={22} rx={4} fill="#6BA36818" stroke="#6BA36850" strokeWidth={0.8} />
      <text x={390} y={191} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle">기밀 달성</text>
      <text x={390} y={199} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>{"리크 < 10⁻⁸ Torr·L/s"}</text>

      <text x={svgW / 2} y={svgH - 5} fill="#555" fontSize="6" textAnchor="middle">
        핵심: 프릿이 듀멧 와이어를 감싸며 용융 → 토치(800°C) 없이 유리-금속 기밀 봉착
      </text>
    </svg>
  );
}

export function ButylSealDiagram() {
  const svgW = 420;
  const svgH = 220;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">부틸+폴리설파이드 상온 2중 실링 단면</text>

      {/* Glass dome */}
      <path d="M 110 180 L 110 60 Q 110 25 210 25 Q 310 25 310 60 L 310 180"
        fill="#7B9EB818" stroke="#7B9EB8" strokeWidth={1.5} />
      <text x={210} y={50} fill="#7B9EB8" fontSize="7" textAnchor="middle">유리 돔 (소다라임)</text>

      {/* Electrode inside */}
      <text x={210} y={115} fill="#ef8f4440" fontSize="28" fontWeight="bold" textAnchor="middle">8</text>
      <text x={210} y={135} fill="#ef8f44" fontSize="6" textAnchor="middle" opacity={0.5}>음극 (Ni)</text>

      {/* Neon */}
      <text x={160} y={80} fill="#6BA36840" fontSize="7" textAnchor="middle">Ne</text>
      <text x={260} y={90} fill="#6BA36840" fontSize="6" textAnchor="middle">Ne</text>

      {/* Butyl layer (1st seal) */}
      <rect x={105} y={178} width={210} height={8} rx={2} fill="#6BA36845" stroke="#6BA368" strokeWidth={1.2} />
      <text x={330} y={185} fill="#6BA368" fontSize="6" fontWeight="bold">1차: 부틸</text>
      <text x={330} y={193} fill="#6BA368" fontSize="5" opacity={0.7}>가스 차단</text>

      {/* Polysulfide layer (2nd seal) */}
      <rect x={102} y={188} width={216} height={6} rx={1.5} fill="#D4A85335" stroke="#D4A853" strokeWidth={0.8} />
      <text x={330} y={205} fill="#D4A853" fontSize="6" fontWeight="bold">2차: 폴리설파이드</text>
      <text x={330} y={213} fill="#D4A853" fontSize="5" opacity={0.7}>구조 강도</text>

      {/* TO-8 Header */}
      <rect x={100} y={196} width={220} height={16} rx={3} fill="#B8A9C920" stroke="#B8A9C970" strokeWidth={1} />
      <text x={210} y={207} fill="#B8A9C9" fontSize="6" fontWeight="bold" textAnchor="middle">커스텀 기밀 헤더 (12핀)</text>

      {/* Pins */}
      {[135, 155, 175, 195, 215, 235, 255, 275].map((px, i) => (
        <line key={i} x1={px} y1={150} x2={px} y2={212} stroke="#B8A9C960" strokeWidth={1} />
      ))}

      {/* Exhaust tube */}
      <rect x={204} y={15} width={12} height={14} rx={2} fill="#7B9EB825" stroke="#7B9EB870" strokeWidth={0.8} />
      <text x={210} y={12} fill="#7B9EB8" fontSize="5" textAnchor="middle">배기관</text>

      {/* Temperature */}
      <text x={50} y={185} fill="#6BA368" fontSize="6" textAnchor="middle">상온</text>
      <text x={50} y={195} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.6}>~200°C</text>
    </svg>
  );
}

export function MicroBarrierDiagram() {
  const svgW = 480;
  const svgH = 200;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">마이크로 격벽: p·d 트레이드오프로 진공 불필요</text>

      {/* Left: Traditional */}
      <text x={120} y={38} fill="#999" fontSize="8" fontWeight="bold" textAnchor="middle">전통 닉시관</text>
      <rect x={60} y={50} width={20} height={100} rx={2} fill="#ef8f4430" stroke="#ef8f44" strokeWidth={1} />
      <rect x={160} y={50} width={20} height={100} rx={2} fill="#ef8f4430" stroke="#ef8f44" strokeWidth={1} />
      <text x={60} y={165} fill="#ef8f44" fontSize="6" textAnchor="middle">음극</text>
      <text x={170} y={165} fill="#ef8f44" fontSize="6" textAnchor="middle">양극</text>
      <text x={120} y={80} fill="#888" fontSize="9" textAnchor="middle">d = 1.5mm</text>
      <text x={120} y={95} fill="#888" fontSize="7" textAnchor="middle">p = 15 Torr</text>
      <text x={120} y={112} fill="#D4A853" fontSize="8" fontWeight="bold" textAnchor="middle">Vb = 180V</text>
      <text x={120} y={128} fill="#666" fontSize="6" textAnchor="middle">진공 펌프 필요</text>
      {/* Glow region */}
      <rect x={82} y={55} width={76} height={90} rx={2} fill="#D4A85312" />
      <text x={120} y={145} fill="#D4A853" fontSize="5" textAnchor="middle" opacity={0.5}>글로우 (전체)</text>

      {/* Arrow */}
      <line x1={200} y1={100} x2={270} y2={100} stroke="#7B9EB8" strokeWidth={1.5} />
      <polygon points="268,97 275,100 268,103" fill="#7B9EB8" />
      <text x={235} y={90} fill="#7B9EB8" fontSize="8" fontWeight="bold" textAnchor="middle">p·d ≈ 일정</text>
      <text x={235} y={115} fill="#666" fontSize="6" textAnchor="middle">d↓ → p↑</text>

      {/* Right: Micro-barrier */}
      <text x={370} y={38} fill="#999" fontSize="8" fontWeight="bold" textAnchor="middle">마이크로 격벽</text>
      <rect x={345} y={50} width={15} height={100} rx={2} fill="#7B9EB840" stroke="#7B9EB8" strokeWidth={1.2} />
      <rect x={395} y={50} width={15} height={100} rx={2} fill="#7B9EB840" stroke="#7B9EB8" strokeWidth={1.2} />
      <text x={370} y={80} fill="#7B9EB8" fontSize="9" fontWeight="bold" textAnchor="middle">d = 0.5mm</text>
      <text x={370} y={95} fill="#7B9EB8" fontSize="7" textAnchor="middle">p = 200 Torr</text>
      <text x={370} y={112} fill="#6BA368" fontSize="8" fontWeight="bold" textAnchor="middle">Vb = 350V</text>
      <text x={370} y={128} fill="#6BA368" fontSize="6" fontWeight="bold" textAnchor="middle">진공 불필요!</text>
      {/* Thin bright glow */}
      <rect x={362} y={55} width={30} height={90} rx={1} fill="#7B9EB818" />
      <text x={370} y={145} fill="#7B9EB8" fontSize="5" textAnchor="middle" opacity={0.6}>얇지만 180x 밝음</text>

      <text x={svgW / 2} y={svgH - 8} fill="#555" fontSize="6" textAnchor="middle">
        파셴 법칙: 항복 전압은 p와 d의 곱에 의존. 갭을 줄이면 대기압에 가까운 조건에서도 방전 가능.
      </text>
    </svg>
  );
}

export function MAPFlushDiagram() {
  const svgW = 480;
  const svgH = 180;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">MAP 가스 플러싱: 진공 펌프 없이 가스 치환</text>

      {/* Tank */}
      <rect x={20} y={40} width={40} height={70} rx={8} fill="#6BA36825" stroke="#6BA368" strokeWidth={1} />
      <text x={40} y={75} fill="#6BA368" fontSize="9" fontWeight="bold" textAnchor="middle">Ne</text>
      <text x={40} y={88} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>가스</text>
      <rect x={32} y={33} width={16} height={10} rx={3} fill="#6BA36815" stroke="#6BA36860" strokeWidth={0.6} />

      {/* Flow line */}
      <path d="M 60 70 L 120 70 L 150 50" fill="none" stroke="#6BA36870" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={90} y={62} fill="#6BA368" fontSize="5" opacity={0.7}>0.5 L/min</text>

      {/* Tube */}
      <path d="M 140 130 L 140 55 Q 140 35 200 35 Q 260 35 260 55 L 260 130"
        fill="#7B9EB818" stroke="#7B9EB8" strokeWidth={1.2} />
      <rect x={135} y={130} width={130} height={10} rx={2} fill="#6BA36815" stroke="#6BA36850" strokeWidth={0.6} />
      <text x={200} y={90} fill="#ef8f4440" fontSize="18" fontWeight="bold" textAnchor="middle">8</text>

      {/* Outlet */}
      <line x1={260} y1={125} x2={300} y2={125} stroke="#ef444470" strokeWidth={1.5} />
      <polygon points="298,123 304,125 298,127" fill="#ef444470" />
      <text x={280} y={118} fill="#ef4444" fontSize="5" opacity={0.7}>공기 out</text>

      {/* O2 sensor */}
      <rect x={310} y={112} width={60} height={28} rx={4} fill="#ef444418" stroke="#ef444460" strokeWidth={0.8} />
      <text x={340} y={126} fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">O₂ 센서</text>
      <text x={340} y={136} fill="#6BA368" fontSize="8" fontWeight="bold" textAnchor="middle">0.3%</text>

      {/* 3-step process */}
      <text x={400} y={50} fill="#6BA368" fontSize="7" fontWeight="bold">1. 플러싱</text>
      <text x={400} y={62} fill="#666" fontSize="5">Ne 유입 3-5분</text>
      <text x={400} y={82} fill="#ef4444" fontSize="7" fontWeight="bold">2. 확인</text>
      <text x={400} y={94} fill="#666" fontSize="5">{"O₂ < 0.5%"}</text>
      <text x={400} y={114} fill="#B8A9C9" fontSize="7" fontWeight="bold">3. 밀봉</text>
      <text x={400} y={126} fill="#666" fontSize="5">에폭시 경화</text>

      <text x={svgW / 2} y={svgH - 5} fill="#555" fontSize="6" textAnchor="middle">
        식품 산업의 MAP(Modified Atmosphere Packaging) 원리를 닉시관에 적용. 진공 펌프 제거.
      </text>
    </svg>
  );
}

export function MgOCoatingDiagram() {
  const svgW = 420;
  const svgH = 180;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">MgO 졸-겔 코팅: 방전 전압 저감 + 스퍼터링 방호</text>

      {/* Electrode cross-section */}
      <rect x={60} y={50} width={150} height={50} rx={3} fill="#ef8f4425" stroke="#ef8f44" strokeWidth={1.2} />
      <text x={135} y={80} fill="#ef8f44" fontSize="8" textAnchor="middle">Ni 전극 (숫자 형상)</text>

      {/* MgO coating layer */}
      <rect x={55} y={42} width={160} height={10} rx={2} fill="#6BA36840" stroke="#6BA368" strokeWidth={1.2} />
      <text x={135} y={50} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle">MgO 코팅층</text>

      {/* Arrows: ions hitting */}
      {[80, 110, 140, 170].map((ax, i) => (
        <g key={i}>
          <line x1={ax} y1={20} x2={ax} y2={40} stroke="#D4A85360" strokeWidth={1} />
          <polygon points={`${ax - 2},37 ${ax},43 ${ax + 2},37`} fill="#D4A85360" />
        </g>
      ))}
      <text x={135} y={18} fill="#D4A853" fontSize="5" textAnchor="middle" opacity={0.7}>Ne⁺ 이온 충돌</text>

      {/* Secondary electron emission */}
      {[90, 120, 150].map((ax, i) => (
        <g key={i}>
          <line x1={ax} y1={42} x2={ax - 8} y2={25} stroke="#7B9EB8" strokeWidth={0.8} strokeDasharray="2 2" />
          <circle cx={ax - 9} cy={23} r={2} fill="#7B9EB8" opacity={0.6} />
        </g>
      ))}
      <text x={65} y={28} fill="#7B9EB8" fontSize="5">e⁻ 방출 (γ≈0.5)</text>

      {/* Right side: effects */}
      <rect x={250} y={40} width={150} height={28} rx={4} fill="#6BA36815" stroke="#6BA36840" strokeWidth={0.5} />
      <text x={325} y={53} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle">방전 전압 저감</text>
      <text x={325} y={63} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>높은 γ → 적은 이온으로 방전 유지</text>

      <rect x={250} y={75} width={150} height={28} rx={4} fill="#D4A85315" stroke="#D4A85340" strokeWidth={0.5} />
      <text x={325} y={88} fill="#D4A853" fontSize="7" fontWeight="bold" textAnchor="middle">스퍼터링 방호</text>
      <text x={325} y={98} fill="#D4A853" fontSize="5" textAnchor="middle" opacity={0.7}>MgO의 높은 결합 에너지 → 이온에 강함</text>

      <rect x={250} y={110} width={150} height={28} rx={4} fill="#7B9EB815" stroke="#7B9EB840" strokeWidth={0.5} />
      <text x={325} y={123} fill="#7B9EB8" fontSize="7" fontWeight="bold" textAnchor="middle">+ Penning 시너지</text>
      <text x={325} y={133} fill="#7B9EB8" fontSize="5" textAnchor="middle" opacity={0.7}>Ne+Ar 결합 시 30-50% 전압 저감</text>

      {/* Process */}
      <text x={135} y={120} fill="#888" fontSize="6" textAnchor="middle">졸-겔 딥코팅 → 미니가마 400°C</text>
      <text x={135} y={132} fill="#888" fontSize="5" textAnchor="middle">마그네슘 아세테이트 + 에탄올</text>

      <text x={svgW / 2} y={svgH - 5} fill="#555" fontSize="6" textAnchor="middle">
        PDP에서 20년 검증. MgO γ≈0.5 → 방전 시작에 필요한 이온 수가 절반으로 감소.
      </text>
    </svg>
  );
}

export function PenningDiagram() {
  const svgW = 420;
  const svgH = 160;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">Penning 혼합가스: Ne + 0.5-2% Ar → 전압 저감</text>

      {/* Ne atom (excited) */}
      <circle cx={80} cy={70} r={25} fill="#6BA36815" stroke="#6BA368" strokeWidth={1.2} />
      <text x={80} y={65} fill="#6BA368" fontSize="10" fontWeight="bold" textAnchor="middle">Ne*</text>
      <text x={80} y={78} fill="#6BA368" fontSize="5" textAnchor="middle">준안정</text>
      <text x={80} y={88} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>16.62 eV</text>

      {/* Arrow: energy transfer */}
      <line x1={108} y1={70} x2={168} y2={70} stroke="#D4A853" strokeWidth={1.5} />
      <polygon points="166,67 173,70 166,73" fill="#D4A853" />
      <text x={140} y={62} fill="#D4A853" fontSize="6" fontWeight="bold" textAnchor="middle">에너지 전달</text>

      {/* Ar atom (ionized) */}
      <circle cx={200} cy={70} r={20} fill="#7B9EB815" stroke="#7B9EB8" strokeWidth={1.2} />
      <text x={200} y={65} fill="#7B9EB8" fontSize="9" fontWeight="bold" textAnchor="middle">Ar</text>
      <text x={200} y={78} fill="#7B9EB8" fontSize="5" textAnchor="middle" opacity={0.7}>15.76 eV</text>

      {/* Result */}
      <line x1={223} y1={70} x2={263} y2={70} stroke="#888" strokeWidth={1} />
      <polygon points="261,68 267,70 261,72" fill="#888" />

      <circle cx={290} cy={55} r={12} fill="#7B9EB815" stroke="#7B9EB8" strokeWidth={0.8} />
      <text x={290} y={58} fill="#7B9EB8" fontSize="6" fontWeight="bold" textAnchor="middle">Ar⁺</text>

      <circle cx={290} cy={85} r={8} fill="#ef8f4420" stroke="#ef8f44" strokeWidth={0.8} />
      <text x={290} y={88} fill="#ef8f44" fontSize="5" fontWeight="bold" textAnchor="middle">e⁻</text>

      <text x={290} y={110} fill="#888" fontSize="5" textAnchor="middle">추가 이온+전자</text>

      {/* Right: result */}
      <rect x={320} y={40} width={85} height={65} rx={5} fill="#6BA36810" stroke="#6BA36840" strokeWidth={0.8} />
      <text x={362} y={58} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle">효과</text>
      <text x={362} y={72} fill="#6BA368" fontSize="6" textAnchor="middle">Vb 10-30% ↓</text>
      <text x={362} y={85} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>추가 비용 ₩0</text>
      <text x={362} y={97} fill="#D4A853" fontSize="5" textAnchor="middle" opacity={0.7}>+MgO → 30-50% ↓</text>

      <text x={svgW / 2} y={svgH - 5} fill="#555" fontSize="6" textAnchor="middle">
        Ne* (준안정 16.62 eV) → Ar 이온화 (15.76 eV): 추가 이온화 경로로 방전 개시 용이. 120V 네온 램프 표준.
      </text>
    </svg>
  );
}

export function MicrowaveKilnBridgeDiagram() {
  const svgW = 480;
  const svgH = 180;
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width={svgW} height={svgH} fill="#111116" rx="8" stroke="#ffffff10" strokeWidth="0.5" />
      <text x={svgW / 2} y={18} fill="#e8e8e8" fontSize="10" fontWeight="bold" textAnchor="middle">Arduino 에코시스템: 하나의 MCU가 가마+게이지+로깅을 동시에</text>

      {/* Microwave box */}
      <rect x={20} y={35} width={130} height={90} rx={6} fill="#C17B5E12" stroke="#C17B5E60" strokeWidth={1} />
      <rect x={30} y={42} width={80} height={60} rx={3} fill="#ffffff06" stroke="#ffffff12" strokeWidth={0.5} />
      {/* Kiln inside */}
      <path d="M 48 95 L 48 55 Q 48 48 70 48 Q 92 48 92 55 L 92 95"
        fill="#ef8f4418" stroke="#ef8f4460" strokeWidth={0.8} />
      <text x={70} y={72} fill="#ef8f44" fontSize="5" fontWeight="bold" textAnchor="middle">SiC</text>
      <text x={70} y={82} fill="#ef8f44" fontSize="4" textAnchor="middle" opacity={0.6}>미니가마</text>
      <text x={85} y={135} fill="#C17B5E" fontSize="6" textAnchor="middle">전자레인지 ₩0~30K</text>

      {/* Arduino */}
      <rect x={190} y={40} width={100} height={50} rx={4} fill="#B8A9C918" stroke="#B8A9C970" strokeWidth={1} />
      <text x={240} y={60} fill="#B8A9C9" fontSize="8" fontWeight="bold" textAnchor="middle">Arduino Nano</text>
      <text x={240} y={72} fill="#B8A9C9" fontSize="5" textAnchor="middle" opacity={0.7}>₩5K · 4가지 역할</text>
      <text x={240} y={82} fill="#888" fontSize="4" textAnchor="middle">ATmega328P 16MHz</text>

      {/* Connections */}
      <line x1={150} y1={70} x2={190} y2={55} stroke="#C17B5E50" strokeWidth={1} />
      <text x={170} y={55} fill="#C17B5E" fontSize="4" textAnchor="middle">SSR ₩8K</text>

      <line x1={150} y1={55} x2={190} y2={45} stroke="#6BA36850" strokeWidth={1} strokeDasharray="3 2" />
      <text x={170} y={42} fill="#6BA368" fontSize="4" textAnchor="middle">열전대</text>

      {/* 4 roles */}
      <rect x={310} y={30} width={150} height={22} rx={3} fill="#C17B5E12" stroke="#C17B5E40" strokeWidth={0.5} />
      <text x={385} y={44} fill="#C17B5E" fontSize="6" textAnchor="middle">① PID 가마 제어 (₩21K)</text>

      <rect x={310} y={56} width={150} height={22} rx={3} fill="#7B9EB812" stroke="#7B9EB840" strokeWidth={0.5} />
      <text x={385} y={70} fill="#7B9EB8" fontSize="6" textAnchor="middle">② DIY 피라니 (₩8.5K)</text>

      <rect x={310} y={82} width={150} height={22} rx={3} fill="#D4A85312" stroke="#D4A85340" strokeWidth={0.5} />
      <text x={385} y={96} fill="#D4A853" fontSize="6" textAnchor="middle">③ 데이터 로깅 (₩5K)</text>

      <rect x={310} y={108} width={150} height={22} rx={3} fill="#B8A9C912" stroke="#B8A9C940" strokeWidth={0.5} />
      <text x={385} y={122} fill="#B8A9C9" fontSize="6" textAnchor="middle">④ HV 안전 모니터 (₩3K)</text>

      {/* Lines from Arduino to roles */}
      <line x1={290} y1={55} x2={310} y2={41} stroke="#B8A9C940" strokeWidth={0.5} />
      <line x1={290} y1={60} x2={310} y2={67} stroke="#B8A9C940" strokeWidth={0.5} />
      <line x1={290} y1={65} x2={310} y2={93} stroke="#B8A9C940" strokeWidth={0.5} />
      <line x1={290} y1={70} x2={310} y2={119} stroke="#B8A9C940" strokeWidth={0.5} />

      {/* Cost summary */}
      <rect x={310} y={138} width={150} height={25} rx={4} fill="#6BA36815" stroke="#6BA36850" strokeWidth={0.8} />
      <text x={385} y={150} fill="#6BA368" fontSize="7" fontWeight="bold" textAnchor="middle">총 ₩42.5K</text>
      <text x={385} y={160} fill="#6BA368" fontSize="5" textAnchor="middle" opacity={0.7}>상용 장비 ₩200-400K → 90% 절감</text>

      <text x={svgW / 2} y={svgH - 3} fill="#555" fontSize="5" textAnchor="middle">
        SWE의 핵심 역량(코드)으로 하드웨어(장비)를 대체. ~50줄 Arduino PID 코드.
      </text>
    </svg>
  );
}
