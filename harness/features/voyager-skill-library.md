---
name: voyager-skill-library
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/voyager-skill-library.sh
rippable_check: "Precision@5 of prior-skills surfaced in Phase-1 review transcripts, measured across 3 consecutive unseen Goals. If ≥0.8 without explicit retrieval wiring, rip."
sources:
  - "https://arxiv.org/abs/2305.16291"
  - "https://github.com/MineDojo/Voyager"
---

# Voyager skill library

Persist every `status=keep` autoresearch iteration as a retrievable skill
card under `harness/skills/`. At Phase-1 of future loops, top-k relevant
skills are injected into context, letting loops compound across Goals
instead of starting from baseline every time.

Pair with the `reflexion` feature: failures go to `reflexion/`, successes
go to `skills/`. The rippable signals differ (failure-recall vs. success-
recall), so the two are tracked as separate features.

See `harness/research/voyager.md` for the full curriculum + skill-store
protocol and the open question of cross-Goal skill transfer.

## Referenced by

- `dgm-h-archive-parent-selection`
- `fpt-hyperagent-multirole`
