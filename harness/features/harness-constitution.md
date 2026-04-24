---
name: harness-constitution
axis1: inner
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/harness-constitution.sh
rippable_check: "Rename harness/CONSTITUTION.md to CONSTITUTION.md at repo root, start fresh CC session without custom skill, ask 'Does this project allow in-loop HITL?'. If the agent cites Article III unprompted, rip the skill wrapper."
sources:
  - "https://github.com/github/spec-kit"
  - "https://arxiv.org/abs/2212.08073"
---

# Harness constitution

Durable, project-wide invariants pinned at `harness/CONSTITUTION.md` —
9 Articles covering axis classification, rippability, HITL boundary,
alignment-free separation, explicit clarification, no-contradiction,
LLM-wiki persistence, git-as-memory, and the amendment procedure.

Separated from per-loop spec documents so no single loop can redefine
what the harness fundamentally is. The agent reads it at Phase 1 of
every loop before reading the per-loop spec; conflicts halt the loop.

Complementary to `plan-mode-discipline` (mechanism) and
`alignment-free-self-improvement` (implementation) — this feature is
the *document* that declares both as invariants with Article numbers
operators and agents can cite.

See `harness/research/harness-constitution.md` for the spec-kit
precedent, the 9-Article mapping, and the rename-to-root rippable
probe.
