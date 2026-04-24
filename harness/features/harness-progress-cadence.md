---
name: harness-progress-cadence
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/harness-progress-cadence.sh
rippable_check: "Run 15-iter bounded loop on CC-native autoresearch. If per-iter concise + 2 milestone summaries + 1 final summary + statusline-per-iter all appear without external formatter, rip."
sources:
  - "https://github.com/uditgoenka/autoresearch"
---

# Harness progress cadence (3-level in-run UX)

Three-tier cadence for in-run status: per-iteration concise line (1
line per iter), milestone block every 5 iters (ratchet + last 3
descs + plateau signal), final summary at termination. Plus a live
statusline showing `iter=N/M score=X guard=...`.

Fills the presentation gap between raw telemetry
(`gcli-agent-run-telemetry`) and post-loop narrative
(`cc-post-loop-slash`). Enables healthy interrupt UX by giving the
operator a clean boundary (milestone summary) at which to consider
pause/steer/abandon via `harness-pause-resume`.

Implementation reads the loop's TSV + telemetry JSONL, emits
formatted blocks; the statusline reads the latest iter row. No new
state — only presentation.

See `harness/research/harness-progress-cadence.md` for the cadence
schema, statusline template, and non-overlap table.
