---
name: gcli-agent-run-telemetry
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/gcli-agent-run-telemetry.sh
rippable_check: "Same Goal run twice — once with external telemetry hook, once with only CC native emission. Run eval-compare on telemetry-derived metrics (median tool latency, cache-hit rate, p95 verify time). If native answers match within 10%, rip."
sources:
  - "https://github.com/google/agents-cli"
  - "https://opentelemetry.io/docs/specs/semconv/ai/"
---

# Agent-run telemetry (in-loop structured trace)

google/agents-cli treats observability as a first-class skill domain
alongside scaffold/eval/deploy/publish. Applied to this project: every
autoresearch iteration emits structured JSONL events (iter_start,
tool_call, tool_return, verify_start, verify_end, keep_decision,
iter_end) with a versioned schema. Downstream tools
(`plateau-detection`, `noise-aware-ratchet`, `gcli-eval-compare-primitive`)
bind to the schema, not to prose transcripts.

Closes the "continuous structured output per event" gap that every
existing feature has left open. `cc-post-loop-slash` produces prose
once; `llm-as-judge-audit` produces one number once;
`cc-hook-guardrail` produces accept/deny decisions but no retained
record; `statistical-tc-runner` aggregates but drops raw samples.
This feature retains the raw event stream.

Implementation is a PostToolUse hook writing JSONL + a small query
wrapper. Claude Code emits transcripts but no schema-versioned
telemetry — so until that ships natively, this feature is the
substrate for the other observability-adjacent entries.

See `harness/research/gcli-agent-run-telemetry.md` for the event
schema, the 5-feature non-overlap table, and the OTel AI semantic
conventions link.

## Referenced by

- `harness-pause-resume`
