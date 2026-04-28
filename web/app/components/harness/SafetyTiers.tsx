"use client";

import { useState } from "react";

type Tier = {
  id: string;
  level: "L0" | "L1" | "L2";
  label: string;
  color: string;
  behavior: string;
  examples: string[];
  carveOut: boolean;
};

const TIERS: Tier[] = [
  {
    id: "l0",
    level: "L0",
    label: "읽기 / 범위 내 편집",
    color: "#6BA368",
    behavior: "침묵. 운영자 신호 없음.",
    examples: ["Read", "Grep / Glob", "Edit files in Scope", "Run Verify"],
    carveOut: false,
  },
  {
    id: "l1",
    level: "L1",
    label: "가역적 변경",
    color: "#D4A853",
    behavior: "상태 줄에 알림 + 30초 자동 승인 창. 일시 정지 없음.",
    examples: ["rm inside Scope", "package install", "git commit (non-force)", "Write new file"],
    carveOut: false,
  },
  {
    id: "l2",
    level: "L2",
    label: "비가역 / 범위 밖",
    color: "#C17B5E",
    behavior: "루프 일시 정지, 체크포인트 기록, 운영자의 명시적 키 입력 필요. report.mdx에 로깅.",
    examples: ["git push --force", "rm outside Scope", "sudo", "release publish", "DELETE on prod"],
    carveOut: true,
  },
];

export default function SafetyTiers() {
  const [active, setActive] = useState<string>("l2");

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIERS.map((t) => {
          const open = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onMouseEnter={() => setActive(t.id)}
              onClick={() => setActive(t.id)}
              className={`text-left rounded-lg border p-4 transition-all bg-stone-950/40 ${
                open ? "border-stone-500 shadow-[0_0_24px_rgba(255,255,255,0.05)]" : "border-stone-800"
              }`}
              style={open ? { borderColor: t.color } : undefined}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono text-xl font-bold"
                  style={{ color: t.color }}
                >
                  {t.level}
                </span>
                <span className="text-sm text-stone-300">{t.label}</span>
                {t.carveOut && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-[#C17B5E]/50 text-[#C17B5E]">
                    조항 III 예외
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-stone-400 leading-relaxed min-h-[48px]">
                {t.behavior}
              </div>
              <div className="mt-3 pt-3 border-t border-stone-800">
                <div className="text-[10px] uppercase tracking-wide text-stone-600 mb-1">예시</div>
                <div className="flex flex-wrap gap-1">
                  {t.examples.map((e) => (
                    <code
                      key={e}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800"
                    >
                      {e}
                    </code>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-stone-500 text-center mt-3 italic">
        구현 피처: <code className="text-stone-400">harness-graduated-confirm</code> +{" "}
        <code className="text-stone-400">cc-hook-guardrail</code>. L2만이 루프 내부 HITL 예외에 해당한다 (조항 III).
      </div>
    </div>
  );
}
