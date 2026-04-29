---
slug: harness-tier1-implementation
title: "Harness Tier 1 implementation loop — IMPL_MISSING=15→0 across 15 features"
keywords:
  - implementation
  - tier-1
  - manifest
  - composite-guard
  - slash-command
  - hook
  - production-grade
  - dogfood
created: 2026-04-29
sources:
  - autoresearch-impl-results.tsv
  - harness/impl-manifest.yaml
  - harness/impl-verify.sh
  - .claude/
half_life_days: 365
---

## TL;DR

15 iters moved the harness from "documented spec only" to actually-working runtime: every Tier 1 feature now has its slash command, hook, script, or template manifest satisfied. composite-guard held 11/11 every iteration — the new code never weakened spec consistency. Manifest-driven binary metric (file existence + content regex per declared invariant) made anchor stickiness impossible.

## Why this pattern worked

`harness/impl-manifest.yaml` declares each feature's production-grade bar (paths + content regex invariants) up front. `harness/impl-verify.sh` walks the manifest as a Python YAML-ish parser and outputs `IMPL_MISSING=N`. Three properties followed:

1. **Binary metric, zero LLM noise** — each iter's effect is unambiguous.
2. **Atomic 1-iter ↔ 1-feature cadence falls out naturally** — the manifest's grouping is the unit of work.
3. **composite-guard validates at the *spec* level**, not the implementation — so a working impl that broke a research-note citation gets discarded immediately.

## What landed (15 features)

- `cc-hook-guardrail` → `.claude/settings.json` (deny patterns + PreToolUse + SessionStart wires)
- `harness-loop-scaffold` + `reflexion` → `loops/TEMPLATE/{spec,clarifications,plan,report.mdx,wiki-refs,reflexion}.md`
- `harness-loop-scaffold` (cmd) → `.claude/commands/harness/new-loop.md`
- `harness-clarify-gate` → `.claude/commands/harness/clarify.md` (D1–D7, [ASSUMPTION]/[RATIFIED] discipline)
- `plan-mode-discipline` → `.claude/commands/autoresearch/plan.md` (project wrapper, composite-guard default, ExitPlanMode = sole HITL gate)
- `harness-constitution` → `scripts/harness/load-constitution.sh` (banner + SHA + full modes)
- `harness-graduated-confirm` → `.claude/hooks/graduated-confirm.sh` (L0/L1/L2 classifier, per-Goal override)
- `harness-pause-resume` → `.claude/commands/harness/{pause,resume}.md` + `scripts/harness/pause-state.sh`
- `harness-llm-wiki` → `.claude/commands/harness/wiki-add.md` + `.claude/hooks/wiki-keyword-matcher.sh` + `harness/wiki/SCHEMA.md`
- `cc-post-loop-slash` → `.claude/commands/harness/report.md`
- `noise-aware-ratchet` → `scripts/ratchet.py` (`decide` / `measure` / `anchor`)
- `plateau-detection` → `scripts/plateau-detect.py` (patience AND slope)
- `harness-progress-cadence` → `scripts/harness/progress-cadence.sh` (tick / 5-iter milestone / status)
- `harness-rip-test` → `harness/rip-test.sh` (list / show / batch / check)
- `statistical-tc-runner` → `harness/statistical-tc-runner.sh` (Welch t-test A/B)

## How to apply (any "spec → impl" gap)

- For "definition complete, runtime empty" gaps, **manifest-driven binary metric is the first attempt to consider**. No noise, immediate visibility, atomicity falls out for free.
- Per iter: read `harness/features/<slug>.md` + `harness/research/<slug>.md` → write production-grade impl → `bash harness/impl-verify.sh` → `bash harness/composite-guard.sh` → keep/discard → commit. 15× rinse-repeat.
- composite-guard 11/11 at every iter is the safety net — new impl additions cannot break existing research-note ↔ feature consistency.

## Pending

- **Tier 2** (5 aux features: llm-as-judge-audit, gcli-eval-compare-primitive, alignment-free-self-improvement, cross-domain-transfer-metric, gcli-agent-run-telemetry) — same pattern, lower priority.
- **Tier 3** (8 theoretical markers: adas-meta-agent-search, meta-hyperagents-metacognitive, dgm-h-archive-parent-selection, fpt-hyperagent-multirole, sandboxed-open-ended-exploration, voyager-skill-library, swe-agent-aci, gcli-skill-pack-distribution) — most don't need a runtime, the spec/research note is the artifact.
- **Smoke / integration tests** — manifest checks file+regex existence; functional smoke (e.g. `/harness:new-loop` actually creates `loops/NNN-<slug>/`) belongs in a follow-up loop with `Scope: harness/tests/integration/**`.

## Cross-references

- `[[harness-mdx-qa-loop]]` — same manifest-driven binary-count pattern (8 checks).
- `[[harness-csv-legibility]]` — same Playwright-based dynamic metric pattern.
- `[[harness-component-translation-loop]]` — first proof that deterministic mechanical metrics avoid anchor stickiness.
