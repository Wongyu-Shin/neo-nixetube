---
description: Run the 7-dimension coverage gate (Article V) and persist answers to loops/NNN-<slug>/clarifications.md.
allowed-tools: AskUserQuestion, Read, Edit, Bash
---

# `/harness:clarify`

Coverage gate per `harness/features/harness-clarify-gate.md` (axis1=inner, axis2=pre-loop).
Source: `harness/research/harness-clarify-gate.md`.

This command **must** run after `/harness:new-loop <slug>` and before `/autoresearch:plan`. It walks the operator through 7 fixed dimensions, records each answer (or `[ASSUMPTION]` marker) into the loop's `clarifications.md`, and refuses to mark the gate `[RATIFIED]` while any `[ASSUMPTION]` remains in **D1**.

## What this command does

1. **Locate the active loop**: Run `ls -dt loops/[0-9]*/ | head -1` to pick the most recent numbered loop directory. Confirm with the operator that this is the loop they want to clarify (refuse if there is no numbered loop yet — they must run `/harness:new-loop <slug>` first).

2. **Read the loop's `spec.md`** so you can ground each clarifying question in the operator's stated Goal/Scope/Metric.

3. **For each dimension D1–D7**, ask the operator using `AskUserQuestion` (one batched call covering 4 dimensions at a time is ideal — split into two batches: D1–D4 and D5–D7). Use the dimensions verbatim from `harness/research/harness-clarify-gate.md`:

   - **D1 Scope-domain** — "Is the scope under `harness/` (harness domain) or under content (`cad/`, `sim/`, `web/`, …)?" Article IV. A scope straddling both domains is invalid.
   - **D2 Metric-mechanicality** — "Can the metric be extracted by a single shell command that prints `<NAME>=<value>` and exits 0?" Article II.
   - **D3 Direction** — "Higher-is-better or lower-is-better?" Standard wizard.
   - **D4 HITL-exceptions** — "Does this loop need any in-loop HITL for irreversible ops? If yes, list them — they enter `harness-graduated-confirm` as L2 events." Article III.
   - **D5 Stop-conditions** — "Bounded (Iterations: N) or unbounded (target / plateau / Ctrl+C)?" autoresearch Phase 8.
   - **D6 Wiki-contribution** — "Which wiki slugs / keywords, if any, should this loop emit at post-loop?" Article VII.
   - **D7 Guard-composition** — "Beyond `bash harness/composite-guard.sh`, any Goal-specific guard command?" Article VI.

4. **Write each answer** into `loops/NNN-<slug>/clarifications.md`, replacing the placeholder ellipses. Use `Edit` to surgically substitute. If the operator declines to answer a dimension, write `[ASSUMPTION] <what you'll proceed to assume>`.

5. **Validate completeness**:
   - If **D1** still contains `[ASSUMPTION]`, refuse to mark the gate ratified. Print: "D1 must be resolved before any further pre-loop step. The composite-guard would otherwise fail Article IV."
   - For D2–D7, `[ASSUMPTION]` markers are recorded but do not block — they get re-visited at `/autoresearch:plan`.

6. **Append the `[RATIFIED]` marker** at the bottom of `clarifications.md` only if D1 is concretely resolved (no ASSUMPTION). Then commit with `chore(loop): /harness:clarify pass on loops/NNN-<slug>`.

7. **Print** the next-action reminder: `Run /autoresearch:plan to draft the plan; ExitPlanMode is the sole legitimate HITL gate into in-loop execution (Article III).`

## Constraints

- Each dimension is **a separate operator answer** — never invent answers, never auto-fill from spec.md alone (the spec might be incomplete; clarify is precisely the gate that surfaces those gaps).
- The order D1 → D7 is fixed and must not be re-ordered. D1 is the only blocking dimension.
- Do **NOT** modify `spec.md` — only `clarifications.md`.
- This is an Article V coverage pass, NOT a planning step. Do not propose iteration sequences here.

## Forbidden interactions

- Do not call `/autoresearch:plan` from inside this command.
- Do not commit `[ASSUMPTION]` markers as `[RATIFIED]`.
