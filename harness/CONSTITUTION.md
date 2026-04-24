# Harness Constitution

The durable, project-wide invariants that every harness loop (and every
feature entry in this catalog) must respect. Separated from per-loop
spec documents so that individual loops cannot redefine them.

Inspired by spec-kit's `.specify/memory/constitution.md` pattern
(github.com/github/spec-kit), but scoped to this project's
agent-harness charter rather than generic software engineering.

---

## Article I — Axis Classification

Every harness feature MUST declare:

1. **axis1 ∈ {inner, outer}** — inner lives inside Claude Code
   (`.claude/`, settings, hooks, skills, slash commands); outer lives
   outside (shell scripts, external orchestrators, CI, MCP servers).
2. **axis2 ∈ {pre-loop, in-loop, post-loop}** — the pipeline phase the
   feature gates. A feature MAY declare a primary phase and list
   secondary phases as fractal links, but exactly one primary.

Rationale: axis1 is the **rippability boundary** — when Claude Code
absorbs an outer feature upstream, the outer copy becomes dead weight
and must be removed. axis2 is the **HITL boundary** (Article III).

## Article II — Rippability

Every feature MUST carry:

- A `rippable_check` frontmatter field stating the empirical signal
  that tells the operator the feature has been absorbed upstream.
- A `tc_script` that runs on the current CC version + model, passes
  when the feature is still needed, fails when absorbed.
- An `applicability` block declaring CC semver range + model list.

Rippability is mandatory, not aspirational. A feature that cannot be
mechanically tested for obsolescence has no place in the catalog.

## Article III — HITL Belongs Outside the Loop

Human-in-the-loop input is restricted to:

- **Pre-loop** — goal design, scope declaration, clarification
  (Article V), plan approval. Active HITL allowed.
- **Post-loop** — result handback, rubric audit, graceful stop
  confirmation. Active HITL allowed.
- **In-loop** — forbidden, with two exceptions:
  (a) graduated confirmation for irreversible operations
  (`cc-hook-guardrail` deny + `harness-graduated-confirm` prompt);
  (b) emergency stop (`Ctrl+C`).

Any iteration that calls `AskUserQuestion` in-loop is a protocol
violation. The transcript linter flags this post-hoc.

## Article IV — Alignment-Free Separation

The skills required to evaluate a Goal MUST differ from the skills
required to improve the harness. Concretely:

- The harness domain is `{harness/, scripts/harness/, .claude/}`.
- The content domain is every other project directory
  (`cad/`, `sim/`, `reason/`, `predict/`, `scenario/`, `web/`,
  `tests/`).
- A single autoresearch Goal's `Scope:` MUST live in exactly one of
  these domains.

Rationale: see `harness/research/alignment-free-self-improvement.md`.
DGM-style aligned self-improvement only works when evaluation skill ≈
self-modification skill. That condition does not hold in this project.

## Article V — Explicit Clarification

Before any loop enters in-loop execution, the operator and the agent
MUST have produced a `Clarifications` section in the loop's spec
document. The section records:

- Every question the agent asked during the plan wizard.
- The operator's answer.
- Any implicit assumption the agent made that the operator did not
  explicitly confirm (flagged as `[ASSUMPTION]`).

Follows spec-kit's `/speckit.clarify` pattern. Implemented by
`harness-clarify-gate` (feature).

## Article VI — No Contradiction

Every iteration's Guard MUST run `harness/composite-guard.sh`, which
enforces both the schema (`guard.sh`) and cross-artifact consistency
(`crosscheck.sh=11/11`). A feature addition that introduces an
asymmetric cross-reference, breaks disambiguation, or shrinks the
triad is reverted automatically.

## Article VII — LLM-Wiki Persistence

Knowledge the agent discovers during a loop that would be useful to
future loops MUST be persisted as a keyword-triggered entry under
`harness/wiki/<slug>.md`. Ephemeral build outputs stay in
`harness/build/` (gitignored); user-scoped memories stay in the CC
memory directory. The wiki is the only project-scoped, cross-loop,
committable knowledge store.

Implemented by `harness-llm-wiki` (feature).

## Article VIII — Git Is Memory

Every iteration of every loop MUST:

- Commit the candidate change with `experiment(<scope>): <desc>`
  prefix BEFORE running Verify.
- On discard, use `git revert` (not `git reset --hard`) so the
  discarded candidate stays in history as a lesson.
- Write a row to the loop's results TSV (one TSV per loop, named
  `autoresearch-harness-<loop-slug>-results.tsv`, gitignored).

## Article IX — Amendment Procedure

Changes to this Constitution require:

1. A loop whose `Scope:` is this file alone.
2. A spec document (`loops/NNN-constitutional-amendment/spec.md`)
   stating which Article is being changed and why.
3. Explicit `[RATIFIED]` marker in the spec's Clarifications section
   from the project operator.
4. After merge, every existing feature's `applicability` field must
   be re-audited against the amended Articles.

This Article itself can only be changed via the procedure it
describes.
