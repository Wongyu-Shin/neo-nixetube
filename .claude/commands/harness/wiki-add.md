---
description: Post-loop wiki contribution gate — propose harness/wiki/ entries from this loop, operator approves each.
allowed-tools: AskUserQuestion, Read, Write, Edit, Bash
---

# `/harness:wiki-add`

Wiki-add gate per `harness/features/harness-llm-wiki.md` (axis1=inner, axis2=post-loop).
Source: `harness/research/harness-llm-wiki.md` and `harness/wiki/SCHEMA.md`.

Article VII: `harness/wiki/` is the **only** project-scoped, loop-crossing, keyword-triggered, committable knowledge layer. Every loop ends with this gate; the operator decides what is worth lifting from per-loop ephemera into the curated wiki.

## What this command does

1. Locate the active loop directory: `ls -dt loops/[0-9]*/ | head -1`. Refuse if no numbered loop is found.

2. Read the loop's `spec.md`, `report.mdx` (post-loop summary), `results.tsv` (kept iterations), and `harness/build/reflexion/<loop-NNN>/*.md` if any. Surface candidate findings — knowledge that:
   - **Generalizes across loops** (would help a future loop touching different code)
   - **Is non-obvious from the diff alone** (commit messages compress this away)
   - **Is keyword-findable** (has 2–6 distinct trigger keywords)

3. Propose 0–N draft entries to the operator via `AskUserQuestion`. Each draft includes:
   - Proposed slug (kebab-case, must equal filename without `.md`)
   - Title
   - Trigger keywords (≥ 1, lower-case)
   - TL;DR (1–3 sentences)
   - Sources (loops/NNN/report.mdx + any external URLs)
   - half_life_days (default 90; shorter for fast-moving topics, longer for foundational)

4. For each proposed entry, present approve / edit / reject options. On approve: write `harness/wiki/<slug>.md` per the schema in `harness/wiki/SCHEMA.md`. On edit: ask the operator for revisions. On reject: skip silently.

5. **Append to `loops/NNN-<slug>/wiki-refs.md`**: every entry written this run goes under the `## Written` section with its trigger keywords + source iter.

6. **Validate**: run `bash harness/composite-guard.sh`. If it fails (frontmatter schema or crosscheck regression), surface the failure to the operator and offer to roll back the additions.

7. Commit accepted entries with `chore(wiki): add <slug-list> from loops/NNN-<slug>`.

## Constraints

- **Never silently auto-add** — every entry requires explicit operator approval. Article VII's value lies in curation; auto-additions defeat the purpose.
- **Never modify existing entries** here — modifying existing wiki content goes through a dedicated loop with `Scope: harness/wiki/<slug>.md`.
- **Per-iteration noise filter**: do not propose entries that merely re-state the loop's reflexion notes. Reflexion is per-loop, wiki is loop-crossing.
- If the operator declines all proposals, exit cleanly with a short note in the loop's `wiki-refs.md` (`No entries lifted this loop.`).
