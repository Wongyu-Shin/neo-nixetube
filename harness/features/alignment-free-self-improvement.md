---
name: alignment-free-self-improvement
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/alignment-free-self-improvement.sh
rippable_check: "Draft a cross-domain Goal (straddles harness/ and cad/). If CC-native planning flags the straddle unprompted, rip. Until then, operators can silently build aligned Goals."
sources:
  - "https://arxiv.org/abs/2603.19461"
  - "https://github.com/facebookresearch/Hyperagents"
---

# Alignment-free self-improvement

Zhang 2026's structural critique of DGM: prior self-improvers work
only when evaluation skill and self-modification skill *happen* to
align (both coding, in DGM's case). HyperAgents removes the assumption.

For this project — nixie-tube feasibility — the eval skills (CAD
fidelity, Paschen MAPE, manufacturing safety) barely overlap with
harness-improvement skills (bash, prompt eng, schema design). This
feature catalogues the resulting **negative constraint**: harness
Goals must not straddle `harness/` + project-content directories, and
the harness's own success metric (`SCORE`) must not coincide with any
project-content metric.

Pairs with `cross-domain-transfer-metric` (next) — this feature is
the *design discipline*, that one is the *measurement discipline*.
Neither subsumes the other.

See `harness/research/alignment-free-self-improvement.md` for the
three discipline rules, the `harness/SCOPE.md` implementation, and
the cross-domain straddle probe.

## Referenced by

- `harness-constitution`
