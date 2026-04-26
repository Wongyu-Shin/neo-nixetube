"use client";

import { useState } from "react";

type Article = {
  num: string;
  title: string;
  oneLine: string;
  body: string;
  keyFeatures: string[];
};

const ARTICLES: Article[] = [
  {
    num: "I",
    title: "Axis Classification",
    oneLine: "Every feature declares axis1 (inner/outer) + axis2 (pre/in/post-loop).",
    body: "axis1 is the rippability boundary — outer features get absorbed by CC upstream and must be removed. axis2 is the HITL boundary (→ Article III).",
    keyFeatures: ["harness-constitution"],
  },
  {
    num: "II",
    title: "Rippability",
    oneLine: "Every feature carries a mechanical obsolescence test.",
    body: "rippable_check frontmatter + tc_script passes when the feature is still needed, fails when absorbed. applicability block declares CC semver + model list.",
    keyFeatures: ["harness-rip-test"],
  },
  {
    num: "III",
    title: "HITL Belongs Outside the Loop",
    oneLine: "In-loop AskUserQuestion is forbidden — two carve-outs only.",
    body: "(a) harness-graduated-confirm L2 for irreversible ops; (b) Ctrl-C emergency stop. Transcript linter flags violations post-hoc.",
    keyFeatures: ["plan-mode-discipline", "harness-graduated-confirm", "harness-pause-resume"],
  },
  {
    num: "IV",
    title: "Alignment-Free Separation",
    oneLine: "Scope lives in exactly one of {harness/, content/} — never both.",
    body: "Skills required to evaluate a Goal must differ from skills required to improve the harness. DGM-style aligned self-improvement fails when eval skill ≈ self-mod skill.",
    keyFeatures: ["alignment-free-self-improvement", "cross-domain-transfer-metric"],
  },
  {
    num: "V",
    title: "Explicit Clarification",
    oneLine: "7-dim Q/A record before any in-loop execution.",
    body: "spec-kit /speckit.clarify pattern. [ASSUMPTION] markers for implicit agent assumptions; unresolved D1 (scope straddle) fails composite-guard.",
    keyFeatures: ["harness-clarify-gate"],
  },
  {
    num: "VI",
    title: "No Contradiction",
    oneLine: "Every iteration runs composite-guard.sh (schema + crosscheck 11/11).",
    body: "Asymmetric cross-references, broken disambiguation, or triad shrink is reverted automatically.",
    keyFeatures: ["noise-aware-ratchet", "statistical-tc-runner", "llm-as-judge-audit"],
  },
  {
    num: "VII",
    title: "LLM-Wiki Persistence",
    oneLine: "Cross-loop knowledge lives in harness/wiki/ — keyword-triggered, half-life tracked.",
    body: "Only project-scoped, cross-loop, committable knowledge store. Ephemeral outputs → harness/build/ (gitignored); user-scoped memories stay in CC memory dir.",
    keyFeatures: ["harness-llm-wiki", "voyager-skill-library", "reflexion"],
  },
  {
    num: "VIII",
    title: "Git Is Memory",
    oneLine: "Commit before Verify. Discard via git revert, not git reset.",
    body: "Every iter commits experiment(<scope>): <desc> BEFORE Verify. Discarded candidates stay in history as lessons. Per-loop TSV row under autoresearch-harness-<slug>-results.tsv.",
    keyFeatures: ["cc-post-loop-slash", "sandboxed-open-ended-exploration"],
  },
  {
    num: "IX",
    title: "Amendment Procedure",
    oneLine: "Changing the Constitution requires its own scoped loop + [RATIFIED] marker.",
    body: "Loop whose Scope: is this file alone. spec.md states which Article + why. After merge, every feature's applicability is re-audited.",
    keyFeatures: ["harness-constitution"],
  },
];

export default function ConstitutionCards() {
  const [openNum, setOpenNum] = useState<string | null>("III");

  return (
    <div className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ARTICLES.map((a) => {
        const open = openNum === a.num;
        return (
          <button
            key={a.num}
            type="button"
            onClick={() => setOpenNum(open ? null : a.num)}
            className={`text-left rounded-lg border p-4 transition-all bg-stone-950/40 ${
              open
                ? "border-[#D4A853] bg-[#D4A853]/[0.05] shadow-[0_0_20px_rgba(212,168,83,0.15)]"
                : "border-stone-800 hover:border-stone-700"
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-xs px-1.5 py-0.5 rounded"
                style={{
                  color: open ? "#D4A853" : "#888",
                  background: open ? "rgba(212,168,83,0.1)" : "rgba(255,255,255,0.03)",
                }}
              >
                Article {a.num}
              </span>
              <span className="text-xs text-stone-600">{a.keyFeatures.length} feature{a.keyFeatures.length === 1 ? "" : "s"}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-stone-200">{a.title}</div>
            <div className="mt-1 text-xs text-stone-400 leading-relaxed">{a.oneLine}</div>
            {open && (
              <div className="mt-3 pt-3 border-t border-stone-800">
                <div className="text-xs text-stone-300 leading-relaxed">{a.body}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.keyFeatures.map((f) => (
                    <code
                      key={f}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-500 border border-stone-800"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
