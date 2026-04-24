---
name: harness-pause-resume
axis1: inner
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/harness-pause-resume.sh
rippable_check: "Bounded loop (Iterations: 10); pause CC-natively at iter 3; confirm resume + hint injection at iter 4 on 3 consecutive Goals. If matches external, rip."
sources:
  - "https://docs.openhands.dev/sdk/guides/convo-pause-and-resume.md"
  - "https://github.com/All-Hands-AI/OpenHands"
---

# `/harness:pause` / `/harness:resume` / `/harness:send`

OpenHands-inspired graceful pause-resume UX. Operator breaks into a
running loop at any iteration boundary, writes a resumable checkpoint,
optionally injects guidance via `--hint`. Distinct category from
agent-requested HITL (Article III forbids that; operator-initiated
pause is always allowed).

Slash-command surface: `/harness:pause`, `/harness:resume <run_id>
[--hint]`, `/harness:send <run_id> "<msg>"` (mid-flight without pause),
`/harness:status <run_id>`, `/harness:abandon <run_id>` (graceful
terminate with post-loop report).

Composes with `dgm-h-archive-parent-selection` (checkpoints carry
parent commit), `plan-mode-discipline` (resume with hint may re-enter
Plan mode), and `gcli-agent-run-telemetry` (pause events in telemetry
stream).

See `harness/research/harness-pause-resume.md` for the full command
surface, checkpoint schema, and the operator-vs-agent HITL asymmetry
argument.

## Referenced by

- `harness-graduated-confirm`
- `harness-progress-cadence`
