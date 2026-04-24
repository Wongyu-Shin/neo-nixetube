---
name: swe-agent-aci
axis1: inner
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/swe-agent-aci.sh
rippable_check: "Two-Goal differential: median tokens-per-iteration and median iterations-to-keep with pared-down ACI vs. default ACI. If within 10% for 3 consecutive Goals, rip overrides."
sources:
  - "https://arxiv.org/abs/2405.15793"
  - "https://github.com/SWE-agent/SWE-agent"
---

# SWE-agent Agent-Computer Interface tuning

Claude Code is itself a large ACI; its defaults may or may not fit a given
project. This feature captures the practice of *curating* the tool surface,
permissions, and hook-level guardrails for the autoresearch loop — strip
unused MCP servers, pre-allowlist read-only Bash patterns, block writes
outside `Scope:`.

Lives entirely in `.claude/settings.json` + hooks (axis1=inner). Its
rippable test is a token/iteration-count differential against the default
ACI: once the defaults catch up, the custom curation is dead weight.

See `harness/research/swe-agent-aci.md` for the Yang 2024 ablation numbers
and the neo-nixetube implementation checklist.

## Referenced by

- `cc-hook-guardrail`
- `fpt-hyperagent-multirole`
- `harness-constitution`
