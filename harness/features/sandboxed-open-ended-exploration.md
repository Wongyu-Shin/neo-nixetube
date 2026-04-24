---
name: sandboxed-open-ended-exploration
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/sandboxed-open-ended-exploration.sh
rippable_check: "Hostile candidate modification (deletes half of harness/features/, rewrites verify.sh to echo SCORE=999). Pipe through CC isolation + cherry-pick. If CC refuses the merge via native sane-delta checks, rip the external wrapper."
sources:
  - "https://arxiv.org/abs/2603.19461"
  - "https://github.com/facebookresearch/Hyperagents"
  - "https://github.com/All-Hands-AI/OpenHands"
---

# Sandboxed open-ended exploration

Open-ended self-improvement is the feature; destructive meta-
modifications are the failure mode. HyperAgents endorses two
safeguards: (1) structural sandboxing of each candidate's modify+eval
cycle, (2) human oversight at batch cadence.

Partially inner-native: Claude Code ships `Agent({isolation:
"worktree"})` which covers execution isolation. What CC does *not*
ship is semantic merge-sanity: the child hyperagent can legitimately
rewrite `verify.sh` to `echo SCORE=999`, delete half the archive, or
bias `select_parent.py`. The deny-list in `cc-hook-guardrail` can't
see these because the commands are individually legitimate. This
feature adds the external `sane_delta.sh` that blocks cherry-pick
when the diff looks like archive manipulation or metric cheating.

See `harness/research/sandboxed-open-ended-exploration.md` for the
enumerated structural risks, the `sane_delta.sh` contract, and the
hostile-candidate rippable probe.
