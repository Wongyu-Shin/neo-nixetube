---
name: harness-llm-wiki
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/harness-llm-wiki.sh
rippable_check: "Migrate one wiki entry into a CC-native project-scoped keyword-triggered memory primitive. If a fresh session automatically surfaces the entry when the user message contains triggers, rip."
sources:
  - "https://docs.openhands.dev/overview/skills/keyword.md"
  - "https://github.com/All-Hands-AI/OpenHands"
---

# Harness LLM-Wiki (keyword-triggered project knowledge)

Implements Article VII: keyword-triggered, project-scoped,
committable knowledge. Fills the gap between user-memory (cross-repo,
always loaded) and CLAUDE.md (project, always loaded) and research
notes (project, explicit read only).

Layout: `harness/wiki/<slug>.md` with YAML frontmatter `{triggers,
created, last_verified, half_life_days, sources}`. A SessionStart
hook matches the user's initial message tokens against entry
triggers and surfaces top-3 matches as `<system-reminder>` blocks.
Post-loop, the reporter prompts the agent to propose new entries;
operator approves.

OpenHands-inspired (keyword-triggered skills + file-based agents),
but scoped to institutional knowledge rather than specialized
sub-agent delegation. Non-overlap with `voyager-skill-library`
(harness-feature pack distribution) — this feature stores *facts*,
Voyager stores *authored skills*.

Integrates with `cc-post-loop-slash` (write-mechanic trigger),
`gcli-agent-run-telemetry` (citation usage audit), and
`harness-constitution` (Article VII mandate).

See `harness/research/harness-llm-wiki.md` for the schema, the
half-life / re-verification protocol, and the migration-to-CC-native
rippable probe.
