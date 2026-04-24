# Plan-Mode Discipline (CC Plan / ExitPlanMode Primitives)

**Primary source:** Anthropic, *Claude Code Plan Mode.*
https://docs.claude.com/en/docs/claude-code/plan-mode

**Related references:**
- Wang, L. et al. *Plan-and-Solve Prompting.* ACL 2023. arXiv:2305.04091 —
  the canonical "decompose then execute" pattern Plan mode formalises.
- Yao, S. et al. *ReAct: Synergizing Reasoning and Acting in Language
  Models.* ICLR 2023. arXiv:2210.03629 — interleaved thought/action
  pattern; Plan mode is the "thought" half made HITL-gated.
- HyperAgent (arXiv:2409.16299) — Planner role = this feature's function,
  but multi-agent; Plan-mode is the single-agent realisation.

## Core idea

Claude Code's Plan mode blocks all write tools (`Edit`, `Write`, `Bash`
side-effects) until the agent calls `ExitPlanMode` with a human-approved
plan. That is *the* inner-pre-loop HITL anchor for this project's axis-2
charter — the charter says pre-loop is the phase with *active* HITL, and
Plan mode is how Claude Code gates it without leaking HITL into the
in-loop phase.

Discipline rules that make this feature load-bearing (vs. just "use Plan
mode sometimes"):

1. **Every non-trivial autoresearch Goal starts in Plan mode.** The first
   `/autoresearch:plan` run produces the Scope/Metric/Direction/Verify
   block; ExitPlanMode requires the user to approve that block.
2. **The plan is the only place HITL is allowed in the session.** Once
   ExitPlanMode fires, the in-loop phase must not call `AskUserQuestion`.
   Drift into HITL mid-loop is a protocol violation and should be
   detectable post-hoc from the transcript.
3. **Plan artefacts are persisted.** The approved plan is written to
   `harness/build/plans/<ts>.json` so the post-loop reporter can cite
   it and the next loop can condition on it.

## Why this matters for axis design

The entire motivation for axis-2 — "move HITL outside the agent loop
whenever possible" — depends on having a *single* well-defined HITL
channel. Plan mode is that channel. Without formalising it, `AskUserQuestion`
leaks into the middle of loops and parallel sessions become impossible
to supervise.

This is also the cleanest `axis1=inner, axis2=pre-loop` example —
different from `swe-agent-aci` (which is about *tool surface* curation).
Both live inside CC settings/state but gate different things.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop (primary) | Plan mode hosts the one legitimate HITL channel. |
| in-loop | Forbidden — the discipline says no HITL mid-loop. A transcript linter can verify this post-hoc. |
| post-loop | Reporter reads the persisted plan JSON and compares declared Scope against actual files touched. |

## Mapping to this project's axes

- **axis1:** `inner` — Plan mode is a first-party CC primitive; no
  external scripts required for the gating behaviour. The *discipline*
  wrapping it (persistence, transcript linting) is also expressible via
  CC hooks and skills.
- **axis2:** `pre-loop` (primary).

## Rippable signal

This feature's rip test is unusual: Plan mode is already CC-native, so
the feature is about *discipline* rather than mechanism. The probe:

1. Run an autoresearch Goal without invoking Plan mode (no
   `/autoresearch:plan`).
2. Measure HITL leak rate: count `AskUserQuestion` calls during the
   in-loop phase across N=5 Goals.
3. If leak rate is 0 across all Goals — i.e., the agent *naturally*
   refrains from HITL mid-loop without the Plan-mode scaffold — the
   discipline is redundant and can be ripped.

Expected signal: current Opus leaks ~1 HITL/goal on average without
Plan-mode scaffolding; the scaffold drives this to 0. Rip threshold:
leak rate < 0.1/goal without scaffold.

## Minimal viable implementation for neo-nixetube

1. A convention, enforced at the session level: autoresearch Goals start
   with `/autoresearch:plan` (already scaffolded by this project's loop).
2. A Stop hook that reads the session transcript and fails the session
   if any `AskUserQuestion` fired after the first ExitPlanMode.
3. Persist the approved plan JSON to `harness/build/plans/<ts>.json` at
   ExitPlanMode time.

## Contrast

`hyperagent-planner-routing` achieves the same HITL-out-of-loop
invariant via *multi-agent role partitioning* (outer). Plan-mode
discipline achieves it via a *single-agent mode gate* (inner). Both
cover the same user charter but live on opposite sides of axis1;
keeping both in the catalog preserves the option to run either.
