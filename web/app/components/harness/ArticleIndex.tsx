"use client";

import { useState } from "react";

/**
 * Interactive 9-Article grid. Each card surfaces which loop phase
 * the Article binds and which page sections/components cite it.
 * Source of truth: harness/CONSTITUTION.md.
 */

type Art = {
  n: string;
  title: string;
  phase: "pre" | "in" | "post" | "all";
  summary: string;
  bindsTo: string;
};

const ARTICLES: Art[] = [
  {
    n: "I",
    title: "Axis Classification",
    phase: "pre",
    summary: "axis1 ∈ {inner, outer}; axis2 ∈ {pre, in, post}. Exactly one primary phase per feature.",
    bindsTo: "spec.md — feature frontmatter",
  },
  {
    n: "II",
    title: "Rippability",
    phase: "all",
    summary: "Every feature carries rippable_check + tc_script + applicability. No aspirational rippability.",
    bindsTo: "features/*.md frontmatter; harness-rip-test",
  },
  {
    n: "III",
    title: "HITL Belongs Outside the Loop",
    phase: "in",
    summary: "In-loop HITL forbidden except L2 graduated-confirm + emergency Ctrl+C.",
    bindsTo: "HarnessFlowDiagram, IterationPhaseRing, HITLBoundaryChart",
  },
  {
    n: "IV",
    title: "Alignment-Free Separation",
    phase: "pre",
    summary: "Eval-skill ≠ self-mod-skill. Scope lives in exactly one of {harness, content}.",
    bindsTo: "D1 clarify dimension; ClarifyDimensionsRadar",
  },
  {
    n: "V",
    title: "Explicit Clarification",
    phase: "pre",
    summary: "Clarifications section mandatory before in-loop. Assumptions flagged [ASSUMPTION].",
    bindsTo: "/harness:clarify; harness-clarify-gate",
  },
  {
    n: "VI",
    title: "No Contradiction",
    phase: "in",
    summary: "Every iteration runs composite-guard = guard.sh + crosscheck.sh = 11/11.",
    bindsTo: "Phase 6 Decide; composite-guard.sh",
  },
  {
    n: "VII",
    title: "LLM-Wiki Persistence",
    phase: "post",
    summary: "Project-scoped cross-loop knowledge → harness/wiki/<slug>.md only. Nothing else qualifies.",
    bindsTo: "PersistenceLayers, WikiLineageFlow, /harness:wiki-add",
  },
  {
    n: "VIII",
    title: "Git Is Memory",
    phase: "in",
    summary: "Commit before verify. git revert on discard. One TSV per loop (gitignored).",
    bindsTo: "Phase 4 Commit; harness-loop-scaffold",
  },
  {
    n: "IX",
    title: "Amendment Procedure",
    phase: "all",
    summary: "Amending this Constitution requires its own loop, [RATIFIED] marker, and re-audit.",
    bindsTo: "loops/NNN-constitutional-amendment/",
  },
];

const PHASE_COLOR: Record<Art["phase"], string> = {
  pre: "#6BA368",
  in: "#D4A853",
  post: "#8B7BB8",
  all: "#6b7280",
};

const PHASE_LABEL: Record<Art["phase"], string> = {
  pre: "pre-loop",
  in: "in-loop",
  post: "post-loop",
  all: "all phases",
};

export default function ArticleIndex() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="my-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ARTICLES.map((a) => {
        const isHover = hover === a.n;
        return (
          <button
            key={a.n}
            onMouseEnter={() => setHover(a.n)}
            onMouseLeave={() => setHover(null)}
            className={
              "group relative flex flex-col gap-1.5 rounded-md border p-3 text-left transition-all " +
              (isHover
                ? "scale-[1.02] border-neutral-500 shadow-md dark:border-neutral-400"
                : "border-neutral-300 dark:border-neutral-700")
            }
            style={{
              background: isHover
                ? PHASE_COLOR[a.phase] + "15"
                : undefined,
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Article {a.n}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                style={{
                  background: PHASE_COLOR[a.phase] + "22",
                  color: PHASE_COLOR[a.phase],
                }}
              >
                {PHASE_LABEL[a.phase]}
              </span>
            </div>
            <div className="text-[12.5px] font-semibold text-neutral-800 dark:text-neutral-200">
              {a.title}
            </div>
            <div
              className={
                "text-[11px] leading-snug text-neutral-600 dark:text-neutral-400 " +
                (isHover ? "" : "line-clamp-2")
              }
            >
              {a.summary}
            </div>
            {isHover && (
              <div className="mt-1 border-t border-neutral-300/50 pt-1.5 text-[10.5px] text-neutral-500 dark:border-neutral-700/50">
                <span className="font-mono">binds:</span> {a.bindsTo}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
