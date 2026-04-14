"use client";

import { useState } from "react";

/**
 * Interactive step-by-step process flow for manufacturing paths.
 * Click a step to expand details.
 */

interface Step {
  num: number;
  title: string;
  duration: string;
  detail: string;
  color: string;
}

export function FritProcessFlow() {
  const steps: Step[] = [
    { num: 1, title: "프릿 페이스트 조합", duration: "1h", detail: "Bi₂O₃:B₂O₃:ZnO = 70:20:10 + 터피네올 바인더. 유리 막자사발에서 30분 혼합.", color: "#D4A853" },
    { num: 2, title: "유리 디스크에 도포", duration: "30min", detail: "주사기로 접합면에 프릿 페이스트 도포. 듀멧 와이어 4-6개 방사형 배치.", color: "#D4A853" },
    { num: 3, title: "바인더 번아웃", duration: "30min", detail: "전기로 350°C, 개방 상태. 유기 바인더 열분해 → CO₂/H₂O 자연 배출.", color: "#C17B5E" },
    { num: 4, title: "프릿 융착", duration: "30min", detail: "전기로 450°C. 프릿 유리가 용융 → 재고화하며 유리-유리 + 유리-금속 동시 실링.", color: "#C17B5E" },
    { num: 5, title: "진공 배기 + 베이킹", duration: "3h", detail: "로터리 펌프로 10⁻³ Torr. 히트건 200°C 베이킹으로 잔류 수분 제거.", color: "#7B9EB8" },
    { num: 6, title: "네온 충전 + 팁오프", duration: "1h", detail: "피라니 게이지로 15-20 Torr 네온 충전. 마이크로 토치로 배기관 밀봉.", color: "#6BA368" },
  ];
  return <ProcessFlowBase steps={steps} title="경로 1: 프릿 실링 공정 흐름" />;
}

export function RoomTempProcessFlow() {
  const steps: Step[] = [
    { num: 1, title: "전극 제작", duration: "2h", detail: "니켈 포일에 숫자 패턴 → 레이저 커터/에칭. 디버링 + IPA 세척.", color: "#6BA368" },
    { num: 2, title: "기밀 헤더에 장착", duration: "1h", detail: "커스텀 12핀 헤더에 전극 리드선 납땜. 양극 메쉬 연결.", color: "#6BA368" },
    { num: 3, title: "유리 돔 부틸 봉착", duration: "30min", detail: "핫멜트 부틸 테이프로 유리 돔-헤더 접합. 히트건으로 연화 → 밀착.", color: "#6BA368" },
    { num: 4, title: "Torr Seal 2차 실링", duration: "24h경화", detail: "부틸 봉착부 외부에 Torr Seal UHV 에폭시 도포. 가스 차단 확보. 24시간 경화.", color: "#6BA368" },
    { num: 5, title: "네온 플러싱", duration: "5min", detail: "한쪽에서 네온 유입, 반대쪽에서 배출. O₂ 센서로 <0.5% 확인. 3회 사이클.", color: "#7B9EB8" },
    { num: 6, title: "밀봉 + 점등", duration: "10min", detail: "에폭시로 배기관 밀봉. 300-500V 인가 → 네온 글로우 확인!", color: "#D4A853" },
  ];
  return <ProcessFlowBase steps={steps} title="경로 2: 상온 봉착 공정 흐름" />;
}

function ProcessFlowBase({ steps, title }: { steps: Step[]; title: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <figure className="my-8">
      <div className="text-sm font-semibold text-stone-300 mb-4">{title}</div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/[0.06]" />

        {steps.map((step, i) => {
          const isExpanded = expanded === i;
          return (
            <div
              key={i}
              className="relative pl-12 pb-4 cursor-pointer group"
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              {/* Step circle */}
              <div
                className="absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all"
                style={{
                  borderColor: step.color,
                  backgroundColor: isExpanded ? `${step.color}30` : "transparent",
                  color: step.color,
                }}
              >
                {step.num}
              </div>

              {/* Content */}
              <div
                className="rounded-lg border px-4 py-2.5 transition-all"
                style={{
                  borderColor: isExpanded ? `${step.color}40` : "rgba(255,255,255,0.06)",
                  backgroundColor: isExpanded ? `${step.color}08` : "transparent",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-200 group-hover:text-stone-100">
                    {step.title}
                  </span>
                  <span className="text-xs text-stone-500">{step.duration}</span>
                </div>
                {isExpanded && (
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-2">
        각 단계를 클릭하면 상세 설명이 표시됩니다
      </figcaption>
    </figure>
  );
}
