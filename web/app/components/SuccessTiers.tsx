"use client";

import { useState } from "react";

const TIERS = [
  {
    tier: 1,
    label: "MVP",
    criterion: "자작 관에서 가스 글로우 방전 확인",
    meaning: "\"가스를 가둘 수 있다\"",
    color: "#C17B5E",
    icon: "💡",
    difficulty: 40,
    detail: "숫자 형상 여부 불문. 어떤 형태든 네온 글로우가 관 안에서 발생하면 봉착+가스충전 성공을 의미.",
  },
  {
    tier: 2,
    label: "PoC",
    criterion: "숫자 형상 발광 + 100시간 안정 점등",
    meaning: "\"닉시관을 만들 수 있다\"",
    color: "#D4A853",
    icon: "🔢",
    difficulty: 70,
    detail: "음극 숫자 형상이 구분되는 글로우 방전. 100시간 연속 점등 시 밝기 변화 <20%. PoC 성공 기준.",
  },
  {
    tier: 3,
    label: "혁신",
    criterion: "프릿/부틸 봉착 또는 AAO에서 측정 가능한 개선",
    meaning: "\"50년의 지식이 닉시관을 발전시켰다\"",
    color: "#6BA368",
    icon: "🚀",
    difficulty: 95,
    detail: "전통 제조법 대비 정량적 개선: 낮은 항복전압, 균일한 글로우, 또는 긴 수명. 프로젝트의 궁극적 목표.",
  },
];

export default function SuccessTiers() {
  const [selected, setSelected] = useState<number>(0);

  return (
    <figure className="my-8">
      <div className="max-w-xl mx-auto">
        <div className="flex gap-2 mb-4">
          {TIERS.map((tier, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex-1 rounded-lg border px-3 py-3 text-center transition-all duration-200"
              style={{
                borderColor: selected === i ? tier.color + "50" : "rgba(255,255,255,0.06)",
                backgroundColor: selected === i ? tier.color + "10" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="text-lg mb-1">{tier.icon}</div>
              <div
                className="text-xs font-bold"
                style={{ color: selected === i ? tier.color : "#888" }}
              >
                Tier {tier.tier}: {tier.label}
              </div>
            </button>
          ))}
        </div>

        {/* Selected tier detail */}
        <div
          className="rounded-xl border p-5 transition-all duration-200"
          style={{
            borderColor: TIERS[selected].color + "30",
            backgroundColor: TIERS[selected].color + "06",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold" style={{ color: TIERS[selected].color }}>
              {TIERS[selected].criterion}
            </span>
          </div>
          <p className="text-xs text-stone-400 mb-3">{TIERS[selected].detail}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500">달성 난이도:</span>
            <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${TIERS[selected].difficulty}%`,
                  backgroundColor: TIERS[selected].color,
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: TIERS[selected].color }}>
              {TIERS[selected].difficulty}%
            </span>
          </div>
          <div className="mt-3 text-sm italic" style={{ color: TIERS[selected].color + "aa" }}>
            {TIERS[selected].meaning}
          </div>
        </div>
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        3단계 성공 기준 — 탭을 클릭하여 각 단계의 기준과 의미 확인
      </figcaption>
    </figure>
  );
}
