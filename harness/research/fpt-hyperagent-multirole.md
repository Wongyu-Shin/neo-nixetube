# FPT HyperAgent — Generalist Multi-Agent Software Engineering System

**Citation:** Phan, H.N., Nguyen, P.X., Nguyen, N.T.H., Bui, N.D.Q.
*HyperAgent: Generalist Software Engineering Agents to Solve Coding Tasks at Scale.*
2024. FPT Software AI Center.
arXiv:2409.16299.

**Primary source:** https://arxiv.org/abs/2409.16299
**Reference code:** https://github.com/FSoft-AI4Code/HyperAgent

> **Attribution correction (2026-04-24):** This entry was originally filed
> under the name "hyperagent-planner-routing" with a note claiming Meta
> association. That was wrong. This paper is the **FPT Software AI Center
> HyperAgent** — a multi-role SWE benchmark agent — and has no authorship
> overlap with Meta/FAIR. The distinct system by Zhang et al. (2026)
> published by FAIR/Meta at github.com/facebookresearch/Hyperagents is
> a separate work tracked under `meta-hyperagents-metacognitive` and its
> siblings. The two systems share only a name prefix; their mechanisms
> and goals are entirely different.

## Core architecture

Four specialised sub-agents driven by a top-level Planner:

| Role | Responsibility | HITL boundary |
|---|---|---|
| **Planner** | Decomposes the Goal, assigns sub-tasks, consumes results. Only agent that talks to the human. | HITL is channelled here and nowhere else. |
| **Navigator** | Explores the codebase (search, read, dependency graph). Read-only. | No HITL. |
| **Editor** | Applies patches within a declared scope. Write-capable but scoped. | No HITL — on failure, returns to Planner. |
| **Executor** | Runs tests/benchmarks/sandboxed commands. | No HITL. |

Reported wins: SWE-bench-Lite 31.4% (competitive with SWE-agent at much
lower token cost), RepoQA passable on repos up to 10M LoC.

## Why this matters for axis design

HyperAgent is the canonical example of *HITL-out-of-loop by construction*:
the Planner is the **only** agent allowed to request human input, and by
convention it does so only at pre-loop (goal decomposition) and post-loop
(final review). The Navigator/Editor/Executor triad runs to completion
without paging a human, which is exactly the property this project wants
to preserve.

## Harness-relevant decomposition

| Phase | HyperAgent mechanism |
|---|---|
| pre-loop | Planner role: goal decomposition, scope declaration. |
| in-loop | Navigator + Editor + Executor triad; Planner is invoked as a router, not a prompter. |
| post-loop | Planner summarises Executor logs into a human-readable report. |

## Mapping to this project's axes

- **axis1:** `outer` — Claude Code does not ship a multi-agent Planner/Worker
  router. The closest primitives are `Agent` sub-agents and the `Plan` mode,
  but they don't enforce the "Planner-only talks to human" invariant.
  Implementation would be an outer orchestrator that shells into Claude
  Code for each role.
- **axis2:** spans all three phases; the *contract* (Planner-only HITL) is
  what the feature catalogues, not one specific phase.

## Rippable signal

Absorbed when Claude Code's `Agent` tool gains first-class HITL-routing:
i.e., sub-agents are forbidden from calling `AskUserQuestion` and only the
parent agent may. Measurable: grep the upstream SDK / Claude Code changelog
for "HITL routing" or test that `AskUserQuestion` from within a subagent
returns a structured "HITL-not-allowed" error.

## Minimal viable implementation for neo-nixetube

1. Bash wrapper `scripts/hyper/planner.sh <goal>` — spawns a `Plan`-mode
   Claude session that emits `harness/build/plan/<ts>.json` with subtasks.
2. For each subtask: spawn a `bypassPermissions`-disabled Claude session
   with scope clamped to the planner-declared files.
3. Aggregator `scripts/hyper/report.sh` — composes a post-loop MDX report.
4. All three scripts forbid `AskUserQuestion`; any need for HITL routes
   back to the planner.

## Contrast

SWE-agent-ACI optimises what a *single* agent sees. HyperAgent partitions
roles across *multiple* agents so no single one has both HITL access and
write permission. The two features are complementary.
