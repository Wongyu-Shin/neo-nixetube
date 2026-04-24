---
name: fpt-hyperagent-multirole
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/fpt-hyperagent-multirole.sh
rippable_check: "Claude Code SDK grows a first-class HITL-routing primitive where subagents are forbidden from calling AskUserQuestion; probe by invoking AskUserQuestion from within a spawned Agent and checking for a structured 'HITL-not-allowed' error."
sources:
  - "https://arxiv.org/abs/2409.16299"
  - "https://github.com/FSoft-AI4Code/HyperAgent"
---

# FPT HyperAgent multi-role HITL routing

**Not the same system as Meta HyperAgents** (Zhang 2026, tracked under
`meta-hyperagents-metacognitive`). This is the FPT Software AI Center
paper on generalist SWE agents — a four-role decomposition
(Planner / Navigator / Editor / Executor) where only the Planner is
allowed to talk to the human.

Directly realises this project's axis-2 charter: **HITL belongs outside
the agent loop**. The four-role partitioning enforces it by construction
— Navigator, Editor and Executor run to completion without paging out;
failures route back to the Planner, never to the user.

Implementation is an outer orchestrator because Claude Code's current
`Agent` tool does not block `AskUserQuestion` inside subagents. The TC
currently validates the research-note contract; the live-probe version
(spawn subagent, attempt HITL, assert failure) is deferred until we
wire the outer orchestrator in `scripts/hyper/`.

Complements `swe-agent-aci` (single-agent ACI tuning), `plan-mode-
discipline` (single-agent HITL gate), and `voyager-skill-library`
(cross-goal knowledge reuse). All three converge on the same user
charter via different axis-1/axis-2 combinations.

## Referenced by

- `plan-mode-discipline`
