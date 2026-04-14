"use client";

import { useState } from "react";

const ITEMS = [
  {
    bottleneck: "유리-금속 실링",
    traditional: "토치 800°C",
    icon: "🔥",
    solutions: [
      { label: "프릿 실링", temp: "450°C", color: "#D4A853", source: "PDP", detail: "Bi₂O₃ 저융점 유리 프릿 → 전기로 450°C 소성. 기존 대비 온도 44% 절감." },
      { label: "부틸 봉착", temp: "상온", color: "#6BA368", source: "IGU", detail: "건축 복층유리의 부틸+폴리설파이드 2중 실링. 토치/전기로 불필요." },
    ],
  },
  {
    bottleneck: "전극 제조",
    traditional: "수작업 커팅",
    icon: "⚡",
    solutions: [
      { label: "AAO 나노구조", temp: "DIY", color: "#D4A853", source: "Nano", detail: "양극산화 나노채널+Ni도금 → 나노팁 어레이로 전계집중. 글로우 균일성 향상." },
      { label: "졸-겔 코팅", temp: "200°C", color: "#6BA368", source: "Chem", detail: "TEOS 졸-겔 SiO₂ 나노코팅 → 스퍼터링 방호 + 기밀 보강." },
    ],
  },
  {
    bottleneck: "진공/가스",
    traditional: "10⁻⁵ Torr 펌프",
    icon: "💨",
    solutions: [
      { label: "마이크로 격벽", temp: "고압", color: "#D4A853", source: "MEMS", detail: "파셴 법칙 활용: 갭 500μm→압력 200Torr 가능. 발광 강도 180x." },
      { label: "MAP 플러싱", temp: "상온", color: "#6BA368", source: "Food", detail: "식품 MAP 기술로 네온 관류 플러싱. 진공 펌프 완전 제거." },
    ],
  },
  {
    bottleneck: "핀 관통",
    traditional: "유리-금속 수작업",
    icon: "📌",
    solutions: [
      { label: "TO-8 헤더", temp: "구매", color: "#D4A853", source: "Semi", detail: "커스텀 12핀 Kovar/glass-bead 기밀 헤더. Schott/NTK/eBay surplus ₩15-85K." },
      { label: "MIL-spec", temp: "구매", color: "#6BA368", source: "Space", detail: "우주/항공 기밀 커넥터. D-sub, circular 등 다양한 형태 조달 가능." },
    ],
  },
];

export default function BottleneckFlow() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ITEMS.map((item, i) => (
          <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="text-xs text-stone-500 mb-1">Bottleneck #{i + 1}</div>
            <div className="font-semibold text-stone-200 mb-2">{item.bottleneck}</div>
            <div className="text-xs text-stone-500 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-400/60" />
              <span className="line-through">{item.traditional}</span>
            </div>
            <div className="space-y-2">
              {item.solutions.map((sol, j) => {
                const key = `${i}-${j}`;
                const isExpanded = expanded === key;
                return (
                  <div key={j}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : key)}
                      className="flex items-center gap-2 w-full text-left group"
                    >
                      <span className="text-lg">→</span>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all"
                        style={{
                          backgroundColor: isExpanded ? `${sol.color}18` : `${sol.color}0a`,
                          borderColor: isExpanded ? `${sol.color}40` : `${sol.color}25`,
                          color: sol.color,
                        }}
                      >
                        {sol.label}
                        <span className="opacity-60">({sol.temp})</span>
                      </span>
                      <span className="text-[10px] text-stone-600">{sol.source}</span>
                      <span
                        className="ml-auto text-xs transition-transform duration-200"
                        style={{ color: sol.color, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}
                      >
                        ▶
                      </span>
                    </button>
                    {isExpanded && (
                      <div
                        className="ml-8 mt-1 text-xs rounded-md px-3 py-2 border"
                        style={{
                          color: "#ccc",
                          backgroundColor: `${sol.color}08`,
                          borderColor: `${sol.color}15`,
                        }}
                      >
                        {sol.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-stone-500 text-sm mt-3">
        4대 병목과 각 2개의 현대 해법 — 클릭하여 상세 설명 확인. 경로 1 (gold) / 경로 2 (green)
      </figcaption>
    </figure>
  );
}
