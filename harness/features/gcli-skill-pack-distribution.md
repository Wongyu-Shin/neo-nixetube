---
name: gcli-skill-pack-distribution
axis1: outer
axis2: pre-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/gcli-skill-pack-distribution.sh
rippable_check: "Publish a local feature (e.g. reflexion) as a pack via pnpm pack, install into a fresh sibling repo. If CC-native skill loader consumes the pack (honors SCHEMA.md + guard.sh + runs TC on demand), rip the external installer wrapper."
sources:
  - "https://github.com/google/agents-cli"
  - "https://docs.claude.com/en/docs/claude-code/skills"
---

# Skill-pack installable distribution

google/agents-cli's design choice: seven skill packs (workflow /
adk-code / scaffold / eval / deploy / publish / observability) are
*independently installable* via `npx skills add google/agents-cli`.
Any supported coding agent (Claude Code, Gemini CLI, Codex,
Antigravity) consumes them; the CLI itself ships as a pre-built
.whl with only skills + docs in the GitHub repo.

Applied to this project: each `harness/features/<name>` triad could
be an independently versioned npm/pnpm pack. "Rip" becomes `npm
uninstall`; "adopt a new pattern" becomes `npm install`. Every
loop report pins exact pack versions (lockfile snapshot).

Non-overlap with `voyager-skill-library` (*learned* skills, text
memories of successes) — this feature is about *authored* skills
(hand-designed harness features) with independent release cycles.
Non-overlap with `meta-hyperagents-metacognitive` /
`adas-meta-agent-search` (agents *generating* features mid-loop) —
this is the *delivery mechanism* for hand-authored features.

See `harness/research/gcli-skill-pack-distribution.md` for the
layout (`harness/packs/<feature>/package.json`, lockfile protocol,
semver derivation from `applicability.claude_code`).
