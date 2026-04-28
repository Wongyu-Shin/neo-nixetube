"use client";

import { useState, useMemo } from "react";

type ArticleId =
  | "I"
  | "II"
  | "III"
  | "IV"
  | "V"
  | "VI"
  | "VII"
  | "VIII"
  | "IX";

type Domain = "classify" | "mechanism" | "boundary" | "process" | "memory";

interface Article {
  id: ArticleId;
  roman: string;
  title: string;
  oneLine: string;
  must: string[];
  domain: Domain;
  features: string[];
  pos: { x: number; y: number };
  color: string;
}

const CX = 400;
const CY = 400;
const R = 270;
const NODE_R = 58;

const ARTICLES: Article[] = [
  {
    id: "I",
    roman: "I",
    title: "축 분류",
    oneLine: "모든 피처는 axis1 (내부|외부) × axis2 (진입 전|내부|종료 후) 를 선언한다.",
    must: [
      "axis1 ∈ {내부, 외부} — 흡수 가능성 경계",
      "axis2 ∈ {진입 전, 내부, 종료 후} — HITL 경계",
      "일차 axis2는 정확히 하나, 이차 axis2는 프랙탈 링크로 허용",
    ],
    domain: "classify",
    features: ["harness-loop-scaffold", "adas-meta-agent-search"],
    pos: { x: CX, y: CY - R },
    color: "#B8A9C9",
  },
  {
    id: "II",
    roman: "II",
    title: "흡수 가능성",
    oneLine: "모든 피처는 tc_script + rippable_check + applicability를 가진다.",
    must: [
      "rippable_check 프론트매터 — 경험적 흡수 신호",
      "tc_script은 여전히 필요할 때 통과, 흡수되면 실패",
      "applicability 블록은 CC semver + 모델 목록을 선언",
    ],
    domain: "mechanism",
    features: ["harness-rip-test", "statistical-tc-runner"],
    pos: { x: CX + R * Math.sin(Math.PI / 4), y: CY - R * Math.cos(Math.PI / 4) },
    color: "#FF8C42",
  },
  {
    id: "III",
    roman: "III",
    title: "HITL은 루프 바깥에 산다",
    oneLine: "루프 내부 AskUserQuestion 금지. 진입 전 / 종료 후만 허용.",
    must: [
      "루프 진입 전 — 목표 설계, 명료화, 계획 승인 (능동 HITL 허용)",
      "루프 종료 후 — 결과 인계, 루브릭 감사 (능동 HITL 허용)",
      "루프 내부 — 금지, 단계적 확인과 Ctrl+C는 예외",
    ],
    domain: "boundary",
    features: ["harness-graduated-confirm", "cc-hook-guardrail", "plan-mode-discipline"],
    pos: { x: CX + R, y: CY },
    color: "#7B9EB8",
  },
  {
    id: "IV",
    roman: "IV",
    title: "정렬 무관 분리",
    oneLine: "평가 스킬 ≠ 하네스 수정 스킬. Scope는 정확히 한 도메인에만 산다.",
    must: [
      "하네스 도메인 = {harness/, scripts/harness/, .claude/}",
      "콘텐츠 도메인 = 그 외 모두 (cad/, sim/, reason/, …)",
      "한 루프의 Scope는 두 도메인을 가로지르지 못한다",
    ],
    domain: "boundary",
    features: [
      "alignment-free-self-improvement",
      "cross-domain-transfer-metric",
      "dgm-h-archive-parent-selection",
    ],
    pos: { x: CX + R * Math.sin(Math.PI / 4), y: CY + R * Math.cos(Math.PI / 4) },
    color: "#7B9EB8",
  },
  {
    id: "V",
    roman: "V",
    title: "명시적 명료화",
    oneLine: "루프 spec은 루프 내부 진입 전에 Clarifications 절을 반드시 가져야 한다.",
    must: [
      "모든 위저드 질문과 운영자의 답을 기록",
      "암묵적 가정은 [ASSUMPTION] 으로 표시",
      "harness-clarify-gate가 게이트를 강제",
    ],
    domain: "process",
    features: ["harness-clarify-gate"],
    pos: { x: CX, y: CY + R },
    color: "#6BA368",
  },
  {
    id: "VI",
    roman: "VI",
    title: "모순 금지",
    oneLine: "매 이터레이션은 composite-guard를 실행한다: 스키마 + crosscheck = 11/11.",
    must: [
      "harness/composite-guard.sh가 두 가드를 함께 강제",
      "비대칭 교차 참조 / 명확한 구분 깨짐 / 삼각 구조 축소 = 자동 리버트",
      "Verify 전에 가드 실행",
    ],
    domain: "mechanism",
    features: ["statistical-tc-runner", "llm-as-judge-audit"],
    pos: { x: CX - R * Math.sin(Math.PI / 4), y: CY + R * Math.cos(Math.PI / 4) },
    color: "#FF8C42",
  },
  {
    id: "VII",
    roman: "VII",
    title: "LLM 위키 영속",
    oneLine: "루프 횡단 지식은 harness/wiki/<slug>.md 에만 산다 — 그 외는 없음.",
    must: [
      "일시적 출력 → harness/build/ (gitignored)",
      "사용자 범위 메모리 → CC memory 디렉터리",
      "프로젝트 + 루프 횡단 + 커밋 가능 → 위키만",
    ],
    domain: "memory",
    features: ["harness-llm-wiki", "voyager-skill-library", "reflexion"],
    pos: { x: CX - R, y: CY },
    color: "#D4A853",
  },
  {
    id: "VIII",
    roman: "VIII",
    title: "Git이 곧 메모리",
    oneLine: "Verify 전에 커밋. 폐기는 git revert — reset --hard 절대 금지.",
    must: [
      "Verify 전에 experiment(<scope>): <desc> 커밋",
      "폐기는 git revert로 — 폐기된 후보를 히스토리에 보존",
      "루프별 TSV 행을 이터레이션마다 추가",
    ],
    domain: "memory",
    features: ["harness-loop-scaffold", "harness-progress-cadence"],
    pos: { x: CX - R * Math.sin(Math.PI / 4), y: CY - R * Math.cos(Math.PI / 4) },
    color: "#D4A853",
  },
  {
    id: "IX",
    roman: "IX",
    title: "개정 절차",
    oneLine: "이 헌법은 자신이 기술하는 절차를 통해서만 변경될 수 있다.",
    must: [
      "Scope: 가 이 파일 하나뿐인 루프",
      "spec.md가 어느 조항이 어떻게 왜 바뀌는지 명시",
      "Clarifications 절에 운영자의 [RATIFIED] 마커",
      "머지 후 모든 피처의 applicability 재감사",
    ],
    domain: "process",
    features: ["harness-constitution", "plan-mode-discipline"],
    pos: { x: CX, y: CY },
    color: "#6BA368",
  },
];

// Dependency arcs — observable cross-references within CONSTITUTION.md
const ARCS: Array<{ from: ArticleId; to: ArticleId; kind: "cites" | "governs" | "enforces" }> = [
  { from: "V", to: "VI", kind: "enforces" },
  { from: "VI", to: "VIII", kind: "enforces" },
  { from: "VII", to: "VIII", kind: "cites" },
  { from: "III", to: "V", kind: "cites" },
  { from: "I", to: "III", kind: "cites" },
  { from: "I", to: "II", kind: "cites" },
  { from: "II", to: "VI", kind: "enforces" },
  { from: "IV", to: "I", kind: "cites" },
  { from: "IX", to: "I", kind: "governs" },
  { from: "IX", to: "II", kind: "governs" },
  { from: "IX", to: "III", kind: "governs" },
  { from: "IX", to: "IV", kind: "governs" },
  { from: "IX", to: "V", kind: "governs" },
  { from: "IX", to: "VI", kind: "governs" },
  { from: "IX", to: "VII", kind: "governs" },
  { from: "IX", to: "VIII", kind: "governs" },
];

const DOMAIN_LABEL: Record<Domain, string> = {
  classify: "분류",
  mechanism: "메커니즘",
  boundary: "경계",
  process: "절차",
  memory: "메모리",
};

const ARC_STROKE: Record<typeof ARCS[number]["kind"], string> = {
  cites: "#7B9EB8",
  enforces: "#FF8C42",
  governs: "#6BA368",
};

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const nx = -dy;
  const ny = dx;
  const len = Math.hypot(nx, ny) || 1;
  const cx = mx + (nx / len) * bend * Math.hypot(dx, dy);
  const cy = my + (ny / len) * bend * Math.hypot(dx, dy);
  return `M ${a.x},${a.y} Q ${cx},${cy} ${b.x},${b.y}`;
}

export default function ConstitutionArticlesMap() {
  const [hoveredId, setHoveredId] = useState<ArticleId | null>(null);
  const [pinnedId, setPinnedId] = useState<ArticleId | null>(null);

  const activeId = hoveredId ?? pinnedId;
  const active = useMemo(
    () => ARTICLES.find((a) => a.id === activeId) ?? null,
    [activeId],
  );

  const relatedIds = useMemo(() => {
    if (!activeId) return new Set<ArticleId>();
    const s = new Set<ArticleId>();
    for (const arc of ARCS) {
      if (arc.from === activeId) s.add(arc.to);
      if (arc.to === activeId) s.add(arc.from);
    }
    return s;
  }, [activeId]);

  const getNodeOpacity = (id: ArticleId) => {
    if (!activeId) return 1;
    if (id === activeId) return 1;
    if (relatedIds.has(id)) return 0.85;
    return 0.25;
  };

  const getArcOpacity = (from: ArticleId, to: ArticleId) => {
    if (!activeId) return 0.35;
    if (from === activeId || to === activeId) return 0.9;
    return 0.08;
  };

  return (
    <figure className="my-10">
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        {/* ═════════════════ SVG map ═════════════════ */}
        <div className="rounded-2xl bg-[#0e0a06] border border-[#D4A853]/15 p-2">
          <svg
            viewBox="0 0 800 820"
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="하네스 헌법 — 9개 조항 인터랙티브 지도"
            role="img"
          >
            <defs>
              <radialGradient id="cmap-bg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1a130a" />
                <stop offset="100%" stopColor="#0a0705" />
              </radialGradient>
              <radialGradient id="cmap-ix-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFDCB8" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#FF8C42" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="cmap-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4A853" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#7B9EB8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6BA368" stopOpacity="0.25" />
              </linearGradient>
              <filter id="cmap-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="cmap-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="0" dy="2" result="o" />
                <feMerge>
                  <feMergeNode in="o" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker
                id="cmap-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#D4A853" opacity="0.7" />
              </marker>
            </defs>

            {/* Background */}
            <rect width="800" height="820" fill="url(#cmap-bg)" rx="16" />

            {/* Outer title strip */}
            <text
              x="400"
              y="34"
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fontSize="13"
              fill="#D4A853"
              opacity="0.6"
              letterSpacing="4"
            >
              HARNESS / CONSTITUTION.md — 9 ARTICLES
            </text>

            {/* Guide ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="url(#cmap-ring)"
              strokeWidth="1.2"
              strokeDasharray="2 6"
              opacity="0.7"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R + 36}
              fill="none"
              stroke="#D4A853"
              strokeWidth="0.4"
              opacity="0.2"
            />

            {/* Central IX glow */}
            <circle cx={CX} cy={CY} r="150" fill="url(#cmap-ix-core)" />

            {/* ═══ Dependency arcs ═══ */}
            <g strokeWidth="1.4" fill="none">
              {ARCS.map((arc, idx) => {
                const from = ARTICLES.find((a) => a.id === arc.from)!;
                const to = ARTICLES.find((a) => a.id === arc.to)!;
                const bend = arc.kind === "governs" ? 0.02 : 0.22;
                return (
                  <path
                    key={`arc-${idx}`}
                    d={arcPath(from.pos, to.pos, bend)}
                    stroke={ARC_STROKE[arc.kind]}
                    strokeDasharray={arc.kind === "governs" ? "3 4" : "none"}
                    opacity={getArcOpacity(arc.from, arc.to)}
                    style={{ transition: "opacity 0.25s" }}
                  />
                );
              })}
            </g>

            {/* ═══ Article nodes ═══ */}
            {ARTICLES.map((art) => {
              const isActive = art.id === activeId;
              const isCenter = art.id === "IX";
              const r = isCenter ? 82 : NODE_R;
              return (
                <g
                  key={art.id}
                  onMouseEnter={() => setHoveredId(art.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() =>
                    setPinnedId((prev) => (prev === art.id ? null : art.id))
                  }
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.25s",
                  }}
                  opacity={getNodeOpacity(art.id)}
                >
                  {/* Outer halo on active */}
                  {isActive && (
                    <circle
                      cx={art.pos.x}
                      cy={art.pos.y}
                      r={r + 10}
                      fill="none"
                      stroke={art.color}
                      strokeWidth="1.5"
                      opacity="0.55"
                      filter="url(#cmap-glow)"
                    />
                  )}
                  {/* Pinned ring */}
                  {pinnedId === art.id && (
                    <circle
                      cx={art.pos.x}
                      cy={art.pos.y}
                      r={r + 16}
                      fill="none"
                      stroke={art.color}
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      opacity="0.8"
                    />
                  )}
                  {/* Body */}
                  <circle
                    cx={art.pos.x}
                    cy={art.pos.y}
                    r={r}
                    fill="#15100a"
                    stroke={art.color}
                    strokeWidth={isActive ? 2.5 : 1.4}
                    filter="url(#cmap-shadow)"
                  />
                  {/* Inner accent */}
                  <circle
                    cx={art.pos.x}
                    cy={art.pos.y}
                    r={r - 6}
                    fill="none"
                    stroke={art.color}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                  {/* Roman numeral */}
                  <text
                    x={art.pos.x}
                    y={art.pos.y - (isCenter ? 12 : 6)}
                    textAnchor="middle"
                    fontFamily="ui-serif, Georgia, serif"
                    fontSize={isCenter ? 40 : 28}
                    fontWeight="600"
                    fill={art.color}
                    opacity="0.95"
                  >
                    {art.roman}
                  </text>
                  {/* Title snippet */}
                  <text
                    x={art.pos.x}
                    y={art.pos.y + (isCenter ? 18 : 16)}
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fontSize={isCenter ? 11 : 9}
                    fontWeight="500"
                    fill="#e8dbc2"
                    opacity="0.82"
                  >
                    {art.title.split(" ").slice(0, isCenter ? 2 : 2).join(" ")}
                  </text>
                  {!isCenter && art.title.split(" ").length > 2 && (
                    <text
                      x={art.pos.x}
                      y={art.pos.y + 28}
                      textAnchor="middle"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fontSize="9"
                      fill="#e8dbc2"
                      opacity="0.62"
                    >
                      {art.title.split(" ").slice(2).join(" ")}
                    </text>
                  )}
                  {/* Domain pill */}
                  {!isCenter && (
                    <text
                      x={art.pos.x}
                      y={art.pos.y + 44}
                      textAnchor="middle"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fontSize="7"
                      fill={art.color}
                      opacity="0.6"
                      letterSpacing="1"
                    >
                      {DOMAIN_LABEL[art.domain].toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ═══ Legend ═══ */}
            <g transform="translate(24, 740)" fontFamily="ui-monospace, monospace" fontSize="10">
              <text fill="#D4A853" opacity="0.7" y="0" letterSpacing="2">
                ARCS
              </text>
              <g transform="translate(0, 14)">
                <line x1="0" y1="6" x2="30" y2="6" stroke="#6BA368" strokeWidth="1.4" strokeDasharray="3 4" />
                <text x="40" y="9" fill="#e8dbc2" opacity="0.75">governs (IX → *)</text>
              </g>
              <g transform="translate(0, 30)">
                <line x1="0" y1="6" x2="30" y2="6" stroke="#FF8C42" strokeWidth="1.4" />
                <text x="40" y="9" fill="#e8dbc2" opacity="0.75">enforces</text>
              </g>
              <g transform="translate(0, 46)">
                <line x1="0" y1="6" x2="30" y2="6" stroke="#7B9EB8" strokeWidth="1.4" />
                <text x="40" y="9" fill="#e8dbc2" opacity="0.75">cites</text>
              </g>
            </g>

            <g
              transform="translate(620, 740)"
              fontFamily="ui-monospace, monospace"
              fontSize="10"
            >
              <text fill="#D4A853" opacity="0.7" y="0" letterSpacing="2">
                LEGEND
              </text>
              <text x="0" y="16" fill="#e8dbc2" opacity="0.6">
                hover: highlight
              </text>
              <text x="0" y="32" fill="#e8dbc2" opacity="0.6">
                click: pin / unpin
              </text>
              <text x="0" y="48" fill="#e8dbc2" opacity="0.6">
                center: IX governs all
              </text>
            </g>
          </svg>
        </div>

        {/* ═════════════════ Detail panel ═════════════════ */}
        <aside
          className="rounded-2xl border p-5 text-sm leading-relaxed min-h-[420px]"
          style={{
            borderColor: active ? `${active.color}40` : "#D4A85320",
            background: active
              ? `linear-gradient(180deg, ${active.color}08, transparent 60%)`
              : "linear-gradient(180deg, #D4A85305, transparent)",
          }}
        >
          {active ? (
            <>
              <div className="flex items-baseline gap-3">
                <span
                  className="font-serif text-4xl font-semibold"
                  style={{ color: active.color }}
                >
                  {active.roman}
                </span>
                <div>
                  <h3 className="text-stone-100 text-base font-medium m-0">
                    조항 {active.roman} — {active.title}
                  </h3>
                  <div className="text-xs font-mono tracking-wider opacity-60 mt-1" style={{ color: active.color }}>
                    {DOMAIN_LABEL[active.domain].toUpperCase()}
                  </div>
                </div>
              </div>

              <p className="text-stone-300 mt-4 mb-3 italic opacity-90">
                {active.oneLine}
              </p>

              <div className="text-xs text-stone-400 font-mono mb-2 opacity-70">
                필수 조항
              </div>
              <ul className="mt-0 mb-4 space-y-1.5 list-none pl-0">
                {active.must.map((m, i) => (
                  <li
                    key={i}
                    className="text-stone-300 text-[13px] pl-4 relative before:content-['▸'] before:absolute before:left-0"
                    style={{ ["--tw-before-color" as string]: active.color }}
                  >
                    {m}
                  </li>
                ))}
              </ul>

              <div className="text-xs text-stone-400 font-mono mb-2 opacity-70">
                카탈로그 피처
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.features.map((f) => (
                  <code
                    key={f}
                    className="text-[11px] px-2 py-0.5 rounded-md border"
                    style={{
                      borderColor: `${active.color}50`,
                      background: `${active.color}10`,
                      color: active.color,
                    }}
                  >
                    {f}
                  </code>
                ))}
              </div>

              {relatedIds.size > 0 && (
                <>
                  <div className="text-xs text-stone-400 font-mono mb-2 mt-5 opacity-70">
                    연결된 조항
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...relatedIds].map((rid) => {
                      const ra = ARTICLES.find((a) => a.id === rid)!;
                      return (
                        <button
                          key={rid}
                          onClick={() => setPinnedId(rid)}
                          className="text-[11px] px-2 py-0.5 rounded-md border bg-transparent hover:bg-white/5 transition"
                          style={{
                            borderColor: `${ra.color}60`,
                            color: ra.color,
                          }}
                        >
                          조항 {ra.roman} · {ra.title}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-stone-400 text-sm">
              <div className="text-xs font-mono tracking-wider opacity-60 mb-3 text-[#D4A853]">
                인터랙티브 리더
              </div>
              <p className="m-0 mb-3">
                조항 노드 위에 마우스를 올리면 한 줄 요약, 필수 조항, 그것을 구현하는
                카탈로그 피처가 보인다.
              </p>
              <p className="m-0 mb-3">
                노드를 클릭하면 고정된다 — 연결된 조항이 클릭 가능해진다.
                조항 IX는 개정 절차를 통해 나머지 8개를 <em>관장</em>하기 때문에
                중앙에 자리한다.
              </p>
              <p className="m-0 text-xs opacity-60">
                권위 있는 출처: <code className="text-[#D4A853]">harness/CONSTITUTION.md</code>
              </p>
            </div>
          )}
        </aside>
      </div>
      <figcaption className="text-xs text-stone-500 text-center mt-3">
        9개 조항의 인터랙티브 지도 — 호는 <code>harness/CONSTITUTION.md</code> 안에서 관측 가능한 교차 참조를 보여준다.
      </figcaption>
    </figure>
  );
}
