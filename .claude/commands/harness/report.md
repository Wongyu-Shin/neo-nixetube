---
description: Render the post-loop report.mdx with TL;DR, axis delta, experiments, L2 events, wiki contributions, next steps.
allowed-tools: Read, Edit, Write, Bash
---

# `/harness:report`

Post-loop report per `harness/features/cc-post-loop-slash.md` (axis1=inner, axis2=post-loop).
Source: `harness/research/cc-post-loop-slash.md`.

This command is the post-loop counterpart to `/harness:new-loop` — it renders the loop's narrative output. Article VIII: git is memory, but the report is the curated index over the commit series.

## What this command does

1. Locate the active loop directory (`ls -dt loops/[0-9]*/ | head -1`). Refuse if none, or if the directory has no `results.tsv` (loop never ran).

2. Read the loop's full state:
   - `spec.md` — Goal, Scope, Metric, Verify, Guard
   - `plan.md` — baseline, ExitPlanMode timestamp
   - `clarifications.md` — D1–D7 answers
   - `results.tsv` — every iteration row (kept / discarded / crashed)
   - `harness/build/graduated-confirm/events.tsv` filtered to L2 — every blocking confirm during this loop
   - `loops/NNN/checkpoints/*.json` — pause/resume history
   - `harness/build/reflexion/<loop-NNN>/*.md` if any — discarded-iter lessons

3. Compute the **axis coverage delta**: how many features under each (axis1, axis2) cell were modified by kept iterations. Cross-reference each kept commit's diff against `harness/features/*.md` axis declarations.

4. Render `loops/NNN-<slug>/report.mdx` filling the template:
   - **TL;DR**: 2–3 sentences. Goal, final metric, headline insight.
   - **Axis coverage delta**: 6-row table (inner|outer × pre|in|post).
   - **Experiments**: every row of `results.tsv` with commit hash, metric, guard, status, description.
   - **L2 confirm events**: every L2 event from graduated-confirm log, with operator decision (proceeded / blocked / overridden).
   - **Wiki contributions**: cross-link to `wiki-refs.md` Written section.
   - **Reflexion summary**: 3-line synthesis of the longest reflexion themes.
   - **Next steps**: one follow-up loop slug or `none`.

5. Run `bash harness/composite-guard.sh` after writing — the report MUST NOT introduce schema or crosscheck regressions (e.g., a stale feature reference).

6. Commit with message `chore(loop): /harness:report on loops/NNN-<slug> — final-metric=<value>`.

7. Print the report path and remind the operator to run `/harness:wiki-add` next if any wiki contributions are warranted.

## Constraints

- Do **not** delete or modify `results.tsv` — the report reads it. Article VIII: the TSV is gitignored but reconstructable from the commit series.
- Do **not** auto-promote any reflexion entry into the wiki — that is `/harness:wiki-add`'s job (Article VII curation discipline).
- Do **not** re-run `Verify` — the metric value at the last kept iter is the final metric. Re-running can introduce noise that disagrees with the kept value.
- The report is **read-only after writing** for downstream loops; later edits go through a dedicated loop with `Scope: loops/NNN-<slug>/report.mdx`.
