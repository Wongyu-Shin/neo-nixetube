---
name: cc-hook-guardrail
axis1: inner
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/cc-hook-guardrail.sh
rippable_check: "Remove the project's PreToolUse deny block from .claude/settings.json and run harness/tests/integration/destructive-ops.sh in a sandbox. If CC blocks destructive commands (rm -rf, git push --force, chmod 777, sudo) natively across Opus/Sonnet/Haiku, rip."
sources:
  - "https://docs.claude.com/en/docs/claude-code/hooks"
  - "https://github.com/All-Hands-AI/OpenHands"
---

# Claude Code hook-based in-loop guardrail

The only CC primitive that can abort a tool call *before* it fires. Lives
entirely in `.claude/settings.json` (axis1 = inner) and runs during agent
iterations (axis2 = in-loop). Fills the "emergency stop on destructive
ops" slot explicitly called out in the project's axis-2 charter.

Per-model load differs — Haiku volunteers destructive commands more
often than Opus, so the hook is more valuable on smaller models. The
live integration TC (`harness/tests/integration/destructive-ops.sh`) is
the rippable probe: once CC natively blocks the list for all three
models, the override is dead weight.

Complements `swe-agent-aci` (shapes what tools the model sees) —
this feature shapes what tool *calls* are refused at runtime.

See `harness/research/cc-hook-guardrail.md` for the full use-case survey
and the `scripts/hooks/` implementation sketch.

## Referenced by

- `sandboxed-open-ended-exploration`
- `gcli-agent-run-telemetry`
- `harness-pause-resume`
