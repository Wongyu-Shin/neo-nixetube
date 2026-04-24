# Harness Pause / Resume — Mid-run Steering

**Inspiration sources:**
- OpenHands *Pause and Resume* + *Send Message While Running* +
  *Persistence / Resume Conversations*.
  https://docs.openhands.dev/sdk/guides/convo-pause-and-resume.md
- Claude Code session-resume convention (existing transcripts).
- Unix `SIGSTOP` / `SIGCONT` — process-level precedent the UX maps onto.

## Core idea

Currently the harness loop is binary: running or stopped. Stopping with
`Ctrl+C` is lossy — the in-flight iteration either commits and logs,
or aborts mid-edit. OpenHands introduces a graceful pause that:

1. **Finishes the current atomic step** (e.g., the current tool call)
   and stops at the next natural iteration boundary.
2. **Writes a resumable checkpoint** with the loop's run_id, next
   parent commit (per `dgm-h-archive-parent-selection`), open TODO
   items, and last Clarifications revision.
3. **Allows the operator to send guidance** via
   `/harness:resume <run_id> --hint "<text>"` which is injected as a
   Phase-1 Review input on resume.

UX surface:

```
# while running
^Z                             — SIGTSTP-style; agent writes checkpoint after current tool call
/harness:pause                 — slash command equivalent
/harness:send <run_id> "<msg>" — inject a hint without pausing (mid-flight)

# after pausing
/harness:status <run_id>       — show checkpoint state
/harness:resume <run_id>       — resume from checkpoint
/harness:resume <run_id> --hint "<text>"  — resume with new guidance
/harness:abandon <run_id>      — graceful terminate with post-loop report
```

The checkpoint lives at `loops/NNN/checkpoints/<timestamp>.json`;
every resume creates a new checkpoint so the operator can revert to
any point in the pause/resume history.

## Why this matters for this project's axes

The Constitution's Article III restricts in-loop HITL, but *operator-
initiated* pauses are a different category — the agent didn't request
HITL, the operator broke in. This feature formalises that asymmetry:
operator pauses are always allowed; agent-requested HITL remains
forbidden in-loop.

Composes with:

- `plan-mode-discipline` — on resume, if the `--hint` requires
  re-planning, the session re-enters Plan mode.
- `dgm-h-archive-parent-selection` — checkpoints carry the chosen
  parent commit so a resumed loop continues from the right branch.
- `gcli-agent-run-telemetry` — pause events are logged to telemetry
  (`{type: "pause", reason: "operator", run_id, ...}`).

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| in-loop (primary) | Pause finishes the current atomic step, writes checkpoint, halts; Resume reads checkpoint + optional hint, resumes at Phase 1 review. |
| pre-loop | A resumed loop re-runs Phase 1 review with the checkpoint and hint in context. |
| post-loop | A `/harness:abandon` produces the normal post-loop report, annotated "terminated at operator request at iter N". |

## Mapping to this project's axes

- **axis1:** `inner` — CC slash commands + file-based checkpoints.
  OpenHands has its own SDK for this; our MVP uses CC's native
  interruption semantics plus a checkpoint file convention.
- **axis2:** `in-loop` (primary).

## Rippable signal

Absorbed when CC ships first-class pause/resume with mid-flight
message injection at the session level — probed by:

1. Start a bounded autoresearch loop (`Iterations: 10`).
2. At iteration 3, use CC's native pause primitive (when it ships).
3. Confirm the loop resumes from iteration 4 on explicit operator
   command, not automatically.
4. Confirm a hint sent during pause appears as context in iteration 4.
5. If both pass on 3 consecutive Goals, rip the custom slash commands.

## Minimal viable implementation for neo-nixetube

1. `.claude/commands/harness/pause.md` — slash command that writes
   `loops/NNN/checkpoints/<ts>.json` after the current tool call and
   exits the session.
2. `.claude/commands/harness/resume.md` — slash command that reads the
   latest checkpoint + optional hint, re-enters the loop at Phase 1.
3. Checkpoint schema (versioned, matches `gcli-agent-run-telemetry`
   events where overlap exists).
4. The `harness-graduated-confirm` feature uses the same checkpoint
   primitive to pause before an irreversible operation.

## Contrast

- `cc-hook-guardrail` — deny-list, binary stop on destructive op. This
  feature is graceful pause initiated by the *operator*, not the
  harness.
- `harness-graduated-confirm` (next) — agent-initiated pause before
  irreversible action. This feature is operator-initiated pause at
  any iteration boundary.
- `plan-mode-discipline` — the HITL channel used when a paused loop
  needs replanning.
