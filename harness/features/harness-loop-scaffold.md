---
name: harness-loop-scaffold
axis1: inner
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/harness-loop-scaffold.sh
rippable_check: "Check /help for a CC-native /new-experiment (or equivalent) primitive that creates a numbered directory with standard artifacts from a project-local template. If present and template rendering matches, rip."
sources:
  - "https://github.com/github/spec-kit"
  - "https://github.com/google/agents-cli"
---

# `/harness:new-loop <slug>` scaffold

Replaces the current ad-hoc layout (scattered `reports/harness/*.mdx`,
repo-root `autoresearch-harness-*-results.tsv`) with a single
numbered directory per loop:

```
loops/NNN-<slug>/
├── spec.md, clarifications.md, plan.md
├── results.tsv, report.mdx, wiki-refs.md
```

Invoked via `/harness:new-loop <slug>` — a CC custom slash command
that auto-increments NNN and expands `loops/TEMPLATE/` placeholders.
spec-kit's `specs/NNN-feature-name/` inspired the layout; google/agents-cli
`scaffold`/`enhance`/`upgrade` inspired the lifecycle separation
(though at MVP only the creation path is implemented).

Container for artifacts owned by other features: `clarifications.md`
written by `harness-clarify-gate`, `plan.md` gated by
`plan-mode-discipline`, `report.mdx` by `cc-post-loop-slash`.

See `harness/research/harness-loop-scaffold.md` for the template
contract and the `.claude/commands/harness/new-loop.md` sketch.
