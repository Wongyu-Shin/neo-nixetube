---
name: cc-post-loop-slash
axis1: inner
axis2: post-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/cc-post-loop-slash.sh
rippable_check: "Run CC-native /ultrareview on the same loop state N=5; median structural similarity ≥0.9 AND citation coverage ≥95%. If met, rip the custom reporter."
sources:
  - "https://docs.claude.com/en/docs/claude-code/slash-commands"
  - "https://arxiv.org/abs/2408.06292"
---

# Claude Code post-loop slash-command reporter

A custom `/harness-report` slash command that, at loop termination,
generates a template-bound MDX report citing every kept commit and every
discarded experiment. Fires only post-loop — in-loop iterations never
invoke it, preventing the reporter from drifting into the decision path.

Sits at the only legal HITL boundary per the project's axis-2 charter.
Lives entirely inside `.claude/commands/` (axis1 = inner) — zero external
infrastructure.

Pairs with `llm-as-judge-audit` (post-loop, outer): the judge grades the
*artifact*, this reporter narrates the *process*. Two outputs, two
rippable signals.

See `harness/research/cc-post-loop-slash.md` for the template contract,
the artifact-citation invariant, and the probe against CC-native
`/ultrareview`.

## Referenced by

- `gcli-agent-run-telemetry`
- `harness-loop-scaffold`
- `harness-llm-wiki`
