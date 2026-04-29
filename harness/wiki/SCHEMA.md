# Harness Wiki Schema

> Schema for entries under `harness/wiki/<slug>.md`. Source feature:
> `harness/features/harness-llm-wiki.md` (axis1=inner, axis2=post-loop).
> Per Article VII, this is the **only** project-scoped, loop-crossing,
> keyword-triggered, committable knowledge layer.

## Layered context

| Layer | Location | Scope | Loading |
|---|---|---|---|
| User memory | `~/.claude/projects/.../memory/*.md` | cross-repo, user | always |
| `CLAUDE.md` | repo root | project | always |
| `harness/wiki/*.md` | here | project | **keyword-triggered** at SessionStart |
| Research notes | `harness/research/*.md` | project, per-feature | explicit read only |

## Required frontmatter

Every `harness/wiki/<slug>.md` MUST start with a YAML block declaring:

```yaml
---
slug: cad-path-2-room-temp           # kebab-case, must equal filename without .md
title: "CAD Path 2 — Room-Temp seal" # human label
keywords:                            # ≥ 1, lower-case, kebab-case OK
  - nixie
  - cad
  - path-2
  - seal
created: 2026-04-29                  # ISO date when first added
sources:                             # ≥ 1, repo-relative or http(s) URL
  - loops/047-cad-path2/report.mdx
  - https://en.wikipedia.org/wiki/Paschen%27s_law
half_life_days: 90                   # how often this should be re-validated
---
```

## Body conventions

- ≤ 1500 words (entries longer than this should be split — finding-by-keyword breaks down for long docs).
- Lead with a **TL;DR paragraph** (1–3 sentences) so the agent can decide cheaply whether to read more.
- Cite `loops/NNN-<slug>/` paths whenever a finding originated in a specific loop. Article VIII — git is memory; the wiki is the curated index.
- Use `[[other-slug]]` references between wiki entries (the keyword matcher follows them transitively only on operator-explicit ask).

## Lifecycle

1. **Add**: `/harness:wiki-add` proposes entries at the post-loop phase. Operator approves/edits/rejects each. Accepted entries land here with the schema above.
2. **Surface**: SessionStart hook `.claude/hooks/wiki-keyword-matcher.sh` scans the conversation context (or the active loop's `spec.md` + `clarifications.md`) and surfaces entries whose `keywords:` overlap. Outputs the entry's TL;DR + a path the agent can read in full.
3. **Half-life**: Entries past `created + half_life_days` enter the **revalidation queue** (Article II). The next loop touching one of the entry's keywords must either confirm it still holds (`tc_script`-style check) or move it to `harness/wiki/_archive/<slug>.md` with a superseded-by header.
4. **Bidirectional refs**: every loop's `loops/NNN-<slug>/wiki-refs.md` records both reads (entries surfaced into Phase 1) and writes (entries this loop produced).

## What does NOT belong here

- Ephemeral debugging notes (those go to `harness/build/reflexion/<loop-NNN>/*.md`).
- User-level cross-repo wisdom (those go to user memory).
- Specifications and feature definitions (those go to `harness/features/*.md` + `harness/research/*.md`).
- Per-iteration logs (those go to `loops/NNN-<slug>/results.tsv`).

## Validation

`harness/composite-guard.sh` runs `crosscheck.sh` which extends here:
every wiki entry must (1) parse as valid YAML frontmatter against this
schema, (2) have ≥ 1 keyword, (3) have a non-empty `sources:` list.
Violations fail composite-guard.
