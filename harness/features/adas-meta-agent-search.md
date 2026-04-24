---
name: adas-meta-agent-search
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7]
tc_script: harness/tests/adas-meta-agent-search.sh
rippable_check: "Claude Code ships an /agent-search or equivalent that conditions on prior agent definitions + scores and proposes improvements autonomously. Validate by running ADAS-style 3-Goal benchmark side-by-side; if CC-native matches or beats the outer orchestrator, rip."
sources:
  - "https://arxiv.org/abs/2408.08435"
  - "https://github.com/ShengranHu/ADAS"
---

# ADAS Meta Agent Search

The outer layer: each feature in this very catalog is a tiny ADAS step.
The Meta Agent (Claude, reading the full archive in Phase 1) proposes the
next feature spec; the catalog accumulates.

Two importable mechanisms pinned to this feature:

1. Archive-conditioned generation — already implicit in autoresearch's
   git-log + results-log review. This feature makes it explicit.
2. Novelty filter on proposed features — MinHash Jaccard against existing
   feature specs; reject near-duplicates before spending TC budget.

Reflexion on *editor* failures is feature `reflexion`. This feature
reserves reflexion at the *design* level — why did a previously-proposed
catalog entry get discarded? — which has a different rippable signal and
therefore its own TC.

See `harness/research/adas.md` for the Hu 2024 benchmark numbers and the
concrete `scripts/harness/{propose,novelty}` implementation sketch.

## Referenced by

- `dgm-h-archive-parent-selection`
- `meta-hyperagents-metacognitive`
