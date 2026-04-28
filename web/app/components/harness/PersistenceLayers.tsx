"use client";

import { useState } from "react";

/**
 * Four-layer persistence picker — the "LLM-wiki question" from UX §7.
 * Shows scope, load trigger, lifetime, and which Article governs.
 */

type Layer = {
  id: string;
  name: string;
  location: string;
  scope: "레포 횡단" | "프로젝트" | "프로젝트 (요청 시)";
  trigger: string;
  lifetime: string;
  article: string;
  color: string;
};

const LAYERS: Layer[] = [
  {
    id: "user",
    name: "사용자 메모리",
    location: "~/.claude/.../memory/*.md",
    scope: "레포 횡단",
    trigger: "항상 로드됨",
    lifetime: "무기한",
    article: "—",
    color: "#B8A9C9",
  },
  {
    id: "claudemd",
    name: "CLAUDE.md",
    location: "레포 루트",
    scope: "프로젝트",
    trigger: "항상 로드됨",
    lifetime: "무기한, 모든 세션에 범람",
    article: "—",
    color: "#D4A853",
  },
  {
    id: "wiki",
    name: "하네스 위키",
    location: "harness/wiki/*.md",
    scope: "프로젝트",
    trigger: "키워드 트리거 (SessionStart)",
    lifetime: "last_verified + half_life_days, 노후 항목 플래그",
    article: "VII",
    color: "#6BA368",
  },
  {
    id: "research",
    name: "리서치 노트",
    location: "harness/research/*.md",
    scope: "프로젝트 (요청 시)",
    trigger: "명시적 읽기 전용",
    lifetime: "레포와 함께 버저닝",
    article: "—",
    color: "#7B9EB8",
  },
];

export default function PersistenceLayers() {
  const [active, setActive] = useState<string>("wiki");
  const layer = LAYERS.find((l) => l.id === active)!;

  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {LAYERS.map((l) => {
          const isActive = active === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActive(l.id)}
              className="text-left rounded-xl border p-4 transition-colors"
              style={{
                background: isActive ? l.color + "18" : "#120d08",
                borderColor: isActive ? l.color : "#2a2218",
              }}
            >
              <div
                className="text-[10px] uppercase tracking-widest mb-1"
                style={{ color: l.color }}
              >
                계층 · {l.scope}
              </div>
              <div className="text-sm font-semibold text-amber-200">{l.name}</div>
              <code className="block text-[10px] text-stone-500 mt-1 truncate">
                {l.location}
              </code>
            </button>
          );
        })}
      </div>
      <div
        className="rounded-xl border p-5 text-sm"
        style={{
          borderColor: layer.color + "55",
          background: layer.color + "0d",
        }}
      >
        <div
          className="uppercase tracking-widest text-[10px] mb-1"
          style={{ color: layer.color }}
        >
          {layer.name}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
          <div>
            <div className="text-stone-500 mb-1">로드 트리거</div>
            <div className="text-stone-200">{layer.trigger}</div>
          </div>
          <div>
            <div className="text-stone-500 mb-1">수명</div>
            <div className="text-stone-200">{layer.lifetime}</div>
          </div>
          <div>
            <div className="text-stone-500 mb-1">범위</div>
            <div className="text-stone-200">{layer.scope}</div>
          </div>
          <div>
            <div className="text-stone-500 mb-1">조항</div>
            <div className="text-stone-200">{layer.article}</div>
          </div>
        </div>
        {layer.id === "wiki" && (
          <p className="text-xs text-stone-400 mt-4 leading-relaxed">
            위키는 프로젝트 범위, 루프 횡단, 커밋 가능을 동시에 만족하는 유일한 지식
            저장소다. 항목은 SessionStart 시점에 표면화된다. 운영자의 첫 메시지와
            트랜스크립트 마지막 N줄을 각 항목의{" "}
            <code className="text-amber-200">triggers</code> 필드와 매칭해 상위 3개를{" "}
            <code className="text-amber-200">&lt;system-reminder&gt;</code> 로 띄운다.
          </p>
        )}
      </div>
      <figcaption className="text-xs text-stone-500 text-center mt-3">
        출처: <code className="text-amber-200">harness/UX.md</code> §7 · 피처:{" "}
        <code className="text-amber-200">harness-llm-wiki</code>.
      </figcaption>
    </figure>
  );
}
