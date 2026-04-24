---
name: llm-as-judge-audit
axis1: outer
axis2: post-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/llm-as-judge-audit.sh
rippable_check: "Run CC-native audit vs. external judge on fixed fixture pair with position swap, N=20. If position-swap variance ≤5% AND agreement with external judge ≥85%, rip."
sources:
  - "https://arxiv.org/abs/2306.05685"
  - "https://arxiv.org/abs/2305.14387"
  - "https://arxiv.org/abs/2212.08073"
---

# LLM-as-judge post-loop audit

Run a rubric-scored audit against the final loop artifact using a
*different* model from the one that drove the loop, to break self-
enhancement bias (Zheng 2023: ~10% self-favouritism).

Critical to deploy with bias controls — this project has already seen
±10-point noise on LLM-as-judge scoring in the path-2 CAD loop (see
`project_cad_loop_state.md`). Mitigations specified in the research note:
different model family for judge, randomised position, capped token
count, explicit rubric checklist, and ratchet-MAX rather than raw score.

Post-loop primary. A separate `llm-as-judge-ratchet` (in-loop) feature
may reuse the same judge prompt but is tracked independently because its
rippable signal (ratchet monotonicity over N iterations) differs.
