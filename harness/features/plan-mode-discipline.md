---
name: plan-mode-discipline
axis1: inner
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/plan-mode-discipline.sh
rippable_check: "Run N=5 Goals without /autoresearch:plan scaffolding; measure AskUserQuestion leak rate during in-loop phase. If <0.1 per goal, discipline is redundant and can be ripped."
sources:
  - "https://docs.claude.com/en/docs/claude-code/plan-mode"
  - "https://arxiv.org/abs/2305.04091"
  - "https://arxiv.org/abs/2210.03629"
---

# Plan-mode discipline

The inner, single-agent realisation of axis-2's "HITL outside the loop"
invariant. Claude Code's Plan mode already blocks writes until an
approved plan exits — this feature obligates that mode as the *only*
legal HITL channel for autoresearch Goals, plus a Stop-hook transcript
linter that flags any in-loop `AskUserQuestion` as a protocol
violation.

Complementary to `hyperagent-planner-routing` (outer, multi-agent):
both cover the same user-charter invariant, but via opposite axis-1
implementations. Keeping both catalogued preserves the option to run
either on a per-Goal basis.

See `harness/research/plan-mode-discipline.md` for the three discipline
rules, the leak-rate probe, and the transcript-linter contract.
