type Art =
  | "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX";

const TITLES: Record<Art, string> = {
  I: "축 분류",
  II: "흡수 가능성",
  III: "HITL은 루프 바깥에 산다",
  IV: "정렬 무관 분리",
  V: "명시적 명료화",
  VI: "모순 금지",
  VII: "LLM 위키 영속",
  VIII: "Git이 곧 메모리",
  IX: "개정 절차",
};

export default function ArticleBadge({ n, children }: { n: Art; children?: React.ReactNode }) {
  const title = TITLES[n];
  return (
    <span
      title={`조항 ${n} — ${title}`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#D4A853]/40 bg-[#D4A853]/[0.06] text-[#D4A853] font-mono text-[11px] align-middle"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        className="opacity-75"
        aria-hidden
      >
        <rect x="1" y="1" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <line x1="3" y1="3.5" x2="7" y2="3.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="3" y1="5.5" x2="7" y2="5.5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="3" y1="7.5" x2="5.5" y2="7.5" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <span>
        조항&nbsp;{n}
        {children ? <span className="text-stone-400"> · {children}</span> : null}
      </span>
    </span>
  );
}
