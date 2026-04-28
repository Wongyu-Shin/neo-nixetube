"use client";

const ROWS: { cadence: string; example: string; color: string }[] = [
  {
    cadence: "이터레이션마다",
    example: "[iter 3/20] SCORE=87 (+2) keep: add response caching",
    color: "#7B9EB8",
  },
  {
    cadence: "마일스톤 (5회마다)",
    example: "▲ ratchet 82→87 · keeps 4 · discards 1 · plateau=no",
    color: "#D4A853",
  },
  {
    cadence: "상태 줄 (영구)",
    example: "harness:cad-path2 iter=12/30 score=92 guard=pass",
    color: "#6BA368",
  },
  {
    cadence: "종료 시 (최종)",
    example: "report.mdx written · wiki-refs.md: 3 entries proposed",
    color: "#B8A9C9",
  },
];

export default function LoopCadenceCard() {
  return (
    <div className="my-8 rounded-lg border border-stone-800 bg-stone-950/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-800 bg-stone-900/30 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-stone-200">진행 케이던스</span>
        <code className="text-[11px] text-stone-500">harness-progress-cadence</code>
        <span className="ml-auto text-[10px] text-stone-600">조항 III 준수 — AskUserQuestion 0건</span>
      </div>
      <div className="divide-y divide-stone-800">
        {ROWS.map((r) => (
          <div
            key={r.cadence}
            className="flex items-center gap-4 px-4 py-2.5 text-xs font-mono"
          >
            <span
              className="shrink-0 w-44 font-semibold"
              style={{ color: r.color }}
            >
              {r.cadence}
            </span>
            <code className="text-stone-300 leading-relaxed">{r.example}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
