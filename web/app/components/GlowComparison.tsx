"use client";

import { useState } from "react";

const CONDITIONS = [
  { label: "전통 (15T, 1.5mm)", dc: 291, glow: 204, ratio: 0.33, intensity: 1, color: "#999", tag: "기준선" },
  { label: "1mm @ 100 Torr", dc: 67, glow: 47, ratio: 0.11, intensity: 40, color: "#D4A853", tag: "밝음" },
  { label: "500μm @ 200 Torr", dc: 45, glow: 32, ratio: 0.15, intensity: 180, color: "#6BA368", tag: "매우 밝음" },
  { label: "1mm @ 300 Torr", dc: 37, glow: 26, ratio: 0.06, intensity: 440, color: "#7B9EB8", tag: "너무 얇음" },
  { label: "500μm @ 500 Torr", dc: 30, glow: 21, ratio: 0.10, intensity: 1300, color: "#B8A9C9", tag: "극밝은 얇은선" },
];

export default function GlowComparison() {
  const [selected, setSelected] = useState(0);

  const maxDc = 300;
  const maxIntensity = 1300;

  return (
    <figure className="my-8">
      <div className="text-sm text-stone-400 text-center mb-3">Bridge 3 글로우 가시성 비교</div>

      <div className="max-w-xl mx-auto space-y-2">
        {CONDITIONS.map((cond, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-full rounded-lg border px-4 py-3 text-left transition-all duration-200"
              style={{
                borderColor: isSelected ? cond.color + "50" : "rgba(255,255,255,0.06)",
                backgroundColor: isSelected ? cond.color + "0a" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: isSelected ? cond.color : "#ccc" }}>
                  {cond.label}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: cond.color + "15",
                    color: cond.color,
                    border: `1px solid ${cond.color}30`,
                  }}
                >
                  {cond.tag}
                </span>
              </div>
              {isSelected && (
                <div className="space-y-2 mt-2">
                  {/* Dark Space bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 w-16 text-right">암부</span>
                    <div className="flex-1 h-3 bg-white/[0.03] rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${(cond.dc / maxDc) * 100}%`,
                          backgroundColor: "#FF450040",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 w-14 text-right">{cond.dc}μm</span>
                  </div>
                  {/* Glow bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 w-16 text-right">글로우</span>
                    <div className="flex-1 h-3 bg-white/[0.03] rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${(cond.glow / maxDc) * 100}%`,
                          backgroundColor: "#FF8C4060",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 w-14 text-right">{cond.glow}μm</span>
                  </div>
                  {/* Intensity bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 w-16 text-right">밝기</span>
                    <div className="flex-1 h-3 bg-white/[0.03] rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (Math.log10(cond.intensity + 1) / Math.log10(maxIntensity + 1)) * 100)}%`,
                          backgroundColor: cond.color + "60",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono w-14 text-right" style={{ color: cond.color }}>
                      {cond.intensity}x
                    </span>
                  </div>
                  {/* Ratio */}
                  <div className="text-xs text-stone-400 mt-1">
                    글로우/갭 비: <span style={{ color: cond.ratio >= 0.15 ? "#6BA368" : cond.ratio >= 0.10 ? "#D4A853" : "#ef4444" }}>
                      {(cond.ratio * 100).toFixed(0)}%
                    </span>
                    {cond.ratio >= 0.15 ? " — 숫자 형상 가시" : cond.ratio >= 0.10 ? " — 윤곽선 수준" : " — 너무 얇음"}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <figcaption className="text-center text-stone-500 text-xs mt-3">
        각 조건을 클릭하여 암부/글로우/밝기 비교. 최적: 100-200 Torr, 500μm-1mm 갭.
      </figcaption>
    </figure>
  );
}
