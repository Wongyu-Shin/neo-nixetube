---
name: meta-hyperagents-metacognitive
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7]
tc_script: harness/tests/meta-hyperagents-metacognitive.sh
rippable_check: "Two-phase probe. Phase A: CC exposes a first-class self-editing skill primitive. Phase B: behavioural parity — run HyperAgents' Polyglot+paper-review+robotics benchmark with external orchestrator vs. CC-native self-editing; if metric delta ≤10% AND wall-clock ≤2×, rip."
sources:
  - "https://arxiv.org/abs/2603.19461"
  - "https://github.com/facebookresearch/Hyperagents"
  - "https://arxiv.org/abs/2408.08435"
---

# Meta HyperAgents — metacognitive self-modification

The core departure of Zhang et al. 2026 from every prior harness in
this catalog: the meta agent (which modifies the task agent) is itself
part of the editable program, so the mechanism that *generates* future
improvements can also be improved. DGM removed fixed meta agents for
coding; HyperAgents removes them for any computable task.

What this obligates of the harness: mid-loop the agent must be able to
edit not just `harness/features/*.md` but also the generator script
(`scripts/harness/propose.sh` et al.) that wrote those entries. Claude
Code has no native "skill edits its own SKILL.md" primitive, so this
feature is firmly `axis1=outer` today and rippable only after CC ships
that primitive plus behavioural parity on a transfer benchmark.

Supersedes `adas-meta-agent-search` conceptually but kept as a separate
catalog entry because the rippable signals differ (ADAS rips when CC
gets archive-conditioned proposal; this feature rips only after CC also
gets self-editing skills).

Not to be confused with `fpt-hyperagent-multirole` (Phan 2024, unrelated
architecture, name prefix is the only overlap).

See `harness/research/meta-hyperagents-metacognitive.md` for the
system-vs-system comparison table, the quoted abstract, and the two-
phase rippable probe.
