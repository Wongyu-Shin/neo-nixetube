# Harness Constitution — Durable Project-wide Invariants

**Primary source:** `harness/CONSTITUTION.md` (this repo).

**Inspiration:**
- GitHub spec-kit, `/speckit.constitution` command + `.specify/memory/constitution.md`.
  https://github.com/github/spec-kit
- US constitutional law metaphor — higher-law-lower-law hierarchy where
  per-loop spec docs cannot override articles.
- Anthropic Constitutional AI (arXiv:2212.08073) — different mechanism
  (RLAIF), same design pattern (durable principles).

## Core idea

Separate **durable project-wide invariants** from **per-loop spec
documents** so that:

1. A single loop cannot redefine what the harness fundamentally is.
2. The operator sees the invariants in one canonical place.
3. The agent loads them into context automatically at Phase 1 review.

spec-kit's constitution is a free-form markdown file edited at project
init; this feature pins the *content* (Articles I–IX) as well as the
pattern, because the harness has explicit charter requirements
(axis classification, rippability, HITL boundary, alignment-free,
no-contradiction, LLM-wiki, git-as-memory, amendment procedure).

## Why this matters for this project's axes

Article I names the axis1/axis2 schema. Article II makes rippability
non-optional. Article III pins the HITL boundary. Article IV pins the
alignment-free separation. Articles V–VIII pin the workflow mechanics
already present in the catalog. Article IX defines how the
constitution itself can be changed.

Without the constitution, these invariants existed but were spread
across research notes (reader had to reconstruct them); now they are
a single load-bearing file any agent at Phase 1 can read once.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop (primary) | At Phase 1 review, the agent reads `harness/CONSTITUTION.md` before reading the per-loop spec. Conflicts between spec and constitution are reported to the operator and halt the loop. |
| in-loop | The agent MAY re-read the constitution when deciding borderline cases (is this an in-loop HITL leak? consult Article III). |
| post-loop | The reporter cites Article numbers when explaining keep/discard decisions whose rationale comes from an invariant. |

## Mapping to this project's axes

- **axis1:** `inner` — the file lives in `harness/` which is part of
  the project's CC-discoverable context. A Stop hook or SessionStart
  hook can surface it automatically. No external infrastructure.
- **axis2:** `pre-loop` (primary) with in-loop consultation.

## Rippable signal

Absorbed when Claude Code ships a first-class project-constitution
primitive — e.g., a `CONSTITUTION.md` at repo root that CC auto-loads
into every session's system prompt with numbered-article citations in
Agent tool output. Probe:

1. Rename `harness/CONSTITUTION.md` to `CONSTITUTION.md` at repo root.
2. Start a new CC session without any custom skill.
3. Ask the agent "Does this project allow in-loop HITL?"
4. If the agent cites Article III without being pointed to the file,
   rip the custom skill wrapper — CC is doing the loading natively.

## Minimal viable implementation for neo-nixetube

1. `harness/CONSTITUTION.md` — the 9-Article document itself.
2. `.claude/skills/harness-constitution/SKILL.md` — a tiny skill that
   reads the file and injects a summary into Phase 1 of every
   autoresearch loop.
3. Amendment procedure is git-native: Article IX requires a dedicated
   loop, spec doc, and `[RATIFIED]` marker, all trackable via git log.

## Contrast

- `plan-mode-discipline` — Plan mode is the *mechanism* for HITL-gated
  pre-loop. This feature is the *document* that declares the mechanism
  as an invariant.
- `swe-agent-aci` — settings curation. Constitution declares *why* the
  curation exists; ACI declares *what* the curation is.
- `alignment-free-self-improvement` — Article IV's implementation-side.
  The feature enforces the rule; the constitution declares it.
