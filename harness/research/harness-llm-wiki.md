# Harness LLM-Wiki — Keyword-Triggered Project-Scoped Knowledge

**Inspiration sources:**
- OpenHands *File-Based Agents* + *Keyword-Triggered Skills*:
  "specialized sub-agents as simple Markdown files with YAML
  frontmatter", "Keyword-Triggered Skills".
  https://docs.openhands.dev/overview/skills/keyword.md
  (repo: https://github.com/All-Hands-AI/OpenHands)
- Claude Code global memory (`~/.claude/.../memory/*.md`) — user-scoped,
  cross-repo, loaded at session start.
- `CLAUDE.md` repo-root convention — project-scoped, loaded every
  session but not keyword-triggered.
- Atlassian Confluence / Notion internal wikis — the long-established
  pattern of findable-by-keyword knowledge.

## Core idea

The operator's direct question was: **"LLM WIKI 등의 영속화는 어떤 과정으로
진행되지?"** — how does LLM-wiki persistence work?

Today the project has three knowledge layers:

| Layer | Location | Scope | Loading |
|---|---|---|---|
| **User memory** | `~/.claude/.../memory/*.md` | cross-repo, user-level | Always loaded |
| **CLAUDE.md** | repo root | project, always | Always loaded |
| **Research notes** | `harness/research/*.md` | project, per-feature | Explicit read only |

The missing layer is **project-scoped, keyword-triggered wiki**:
committable knowledge the agent surfaces *only* when the
conversation context contains specific trigger keywords. This avoids
flooding context with irrelevant docs but still makes institutional
knowledge discoverable.

Layout:

```
harness/wiki/
├── cad-path-2-room-temp.md       ← trigger: [nixie, cad, path-2, seal]
├── paschen-curve-fitting.md      ← trigger: [paschen, glow, simulation]
├── ratchet-anchor-discipline.md  ← trigger: [ratchet, anchor, noise]
├── hyperagents-vocabulary.md     ← trigger: [hyperagent, DGM, metacog]
├── autoresearch-loop-vocabulary.md ← trigger: [autoresearch, verify, guard]
```

Each entry's frontmatter:

```yaml
---
name: <slug>
triggers: [<keyword>, <keyword>, ...]
created: <YYYY-MM-DD>
last_verified: <YYYY-MM-DD>
half_life_days: 30        # after this, entry is flagged "restale-due"
sources:
  - <feature name or external URL>
---
```

Loading mechanic (SessionStart hook or /harness:review):

1. Read user's latest message + last N lines of transcript.
2. Tokenize + lowercase.
3. For each wiki entry: if ≥1 trigger token matches, surface the
   entry as a `<system-reminder>` block with a citation.
4. Cap surfaced entries to top 3 by match count.

Write mechanic (post-loop):

1. Post-loop reporter (`cc-post-loop-slash`) asks the agent "What
   should the wiki remember from this loop?"
2. Agent emits 0-N candidate entries with `triggers:` filled in.
3. Operator confirms/edits/rejects each via interactive pass.
4. Accepted entries are committed to `harness/wiki/<slug>.md`.

## Why this matters for this project's axes

Article VII mandates this layer. The Constitution says:

> "Knowledge the agent discovers during a loop that would be useful to
> future loops MUST be persisted as a keyword-triggered entry under
> `harness/wiki/<slug>.md`."

Without implementation, the mandate is aspirational. This feature is
the implementation. It closes the loop-to-loop learning gap that
`voyager-skill-library` describes at a *feature-catalog* level: the
wiki operates at an *institutional-knowledge* level.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop (primary) | SessionStart hook surfaces matching wiki entries based on the Goal text + initial messages. |
| in-loop | Wiki entries can be cited inline via `see wiki:<slug>` markers; the telemetry stream records which entries were actually referenced. |
| post-loop (secondary) | Reporter prompts agent to propose new wiki entries; operator approves; entries committed. |

## Mapping to this project's axes

- **axis1:** `outer` — the loader + writer are scripts. CC's existing
  memory and CLAUDE.md mechanisms do not support keyword-triggered
  surfacing.
- **axis2:** `pre-loop` (primary) + `post-loop` (secondary) — it's a
  bidirectional mechanism by construction.

## Rippable signal

Absorbed when CC ships a project-scoped, keyword-triggered memory
primitive alongside the existing `~/.claude/memory/` user layer.
Probe:

1. Migrate one wiki entry (e.g., `cad-path-2-room-temp.md`) into CC's
   native primitive.
2. Start a fresh session; send a message containing two trigger
   keywords.
3. Check the session's surfaced-context for the entry's content.
4. If CC surfaces it unprompted with cite-able source, rip.

## Minimal viable implementation for neo-nixetube

1. `harness/wiki/SCHEMA.md` — one-page schema doc (matches the
   frontmatter above).
2. `scripts/harness/wiki_match.sh <message>` — tokenizes the message,
   matches against all wiki entries' `triggers`, returns top-3
   matches as formatted citations.
3. `.claude/skills/wiki-surface/SKILL.md` — invoked at SessionStart,
   pipes the message through `wiki_match.sh`, injects results as
   `<system-reminder>`.
4. `.claude/commands/harness/wiki-add.md` — post-loop command that
   walks the operator through candidate entries.
5. `half_life_days` expiration: a scheduled cron (via `/schedule`
   skill) reflags entries older than `last_verified + half_life_days`
   as `needs_re-verify`; they still surface, but with a staleness
   warning.

## Contrast

- `voyager-skill-library` — feature-catalog reuse (harness features
  themselves as installable packs). This feature is
  institutional-knowledge reuse (project-specific facts the agent
  discovered).
- `harness-constitution` — permanent invariants. Wiki entries are
  revisable, re-verifiable knowledge.
- `cc-post-loop-slash` — generates per-loop reports. This feature's
  write-mechanic piggybacks on that feature's post-loop pass.
- `gcli-agent-run-telemetry` — records which wiki entries were cited
  during a loop, closing the usage-audit loop.
