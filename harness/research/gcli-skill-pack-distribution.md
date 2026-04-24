# Skill-Pack Installable Distribution — google/agents-cli

**Primary source:** Google, *google/agents-cli.* Apache-2.0.
https://github.com/google/agents-cli

**Related references:**
- Anthropic, *Claude Code Skills.*
  https://docs.claude.com/en/docs/claude-code/skills
- `npx` / `pnpx` installation conventions — Node.js ecosystem baseline
  for one-shot tool execution.
- Python wheel distribution — the mechanism google/agents-cli itself
  uses for its CLI payload (source code is not in the GitHub repo;
  only skills and docs are; the CLI ships as a pre-built `.whl`).

## Core idea — quoted from README

> "The CLI and skills that turn any coding assistant into an expert
> at creating, evaluating, and deploying AI agents on Google Cloud."

And the distribution mechanism:

> "npx skills add google/agents-cli"

The noteworthy design choice: **skills are independently installable
knowledge modules**, not built-in parts of a monolithic agent. The
project distributes seven skill packs (workflow / adk-code / scaffold /
eval / deploy / publish / observability) that any supported coding
agent (Claude Code, Gemini CLI, Codex, Antigravity) can consume.

This project's `harness/features/` + `harness/research/` + `harness/tests/`
is currently a single monolithic catalog. The google/agents-cli design
suggests that each feature could be a standalone, npm/pnpm-installable
pack: versioned independently, installable into any compatible host
repo, with its own SCHEMA-compliant frontmatter.

## Why this matters for this project's axes

The user-charter invariant "rippable features" assumes that features
can be added and removed cleanly. Currently "remove" means "git rm the
three files and regenerate". Skill-pack distribution would make
"remove" mean "npm uninstall", and "add" mean "npm install" — much
closer to the `scaffold upgrade` pattern where adding a capability is
one command.

Concretely, this affects:

1. **Catalog composition.** Today, every feature ships in this repo.
   With pack distribution, the repo contains only the project's
   *chosen* features; the upstream pack repos hold the canonical
   versions.
2. **Version pinning.** Each feature pack gets a semver. Upgrade a
   single feature without touching others.
3. **Rip workflow.** `npm uninstall harness-reflexion@*` replaces
   "git rm harness/{features,research,tests}/reflexion.*".

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop (primary) | Before a Goal runs, ensure the required packs are installed (like `npm install` before `npm run`). |
| in-loop | Reference packs via their installed paths; pack updates mid-loop are forbidden (drift). |
| post-loop | Lockfile snapshot — every loop report records the exact pack versions used. |

## Mapping to this project's axes

- **axis1:** `outer` — package management is external tooling (npm/pnpm/
  pip). Claude Code has no native package-manager awareness.
- **axis2:** `pre-loop` (primary) with a post-loop lockfile snapshot.

## Rippable signal

Absorbed when Claude Code ships a first-class pack registry +
installation primitive where `.claude/skills/` can transparently
consume versioned third-party packs with semver pinning. Probe:

1. Publish one of this project's features (e.g., `reflexion`) as a
   pack to a local `pnpm pack`.
2. `npx` install it into a fresh sibling repo.
3. If Claude Code natively discovers and honors the pack's SCHEMA.md
   + guard.sh at SessionStart (running its TC on demand), rip the
   external installer wrapper.

## Minimal viable implementation for neo-nixetube

1. `harness/packs/<feature>/package.json` — one package per feature,
   with `files: ["feature.md", "research.md", "test.sh"]`.
2. `scripts/harness/pack.sh <feature>` — bundles the triad into a
   tarball with frontmatter-derived metadata (version from
   applicability.claude_code range, maintainer from Git blame).
3. `harness/packs-lock.json` — project-local lockfile recording the
   exact versions of every installed pack.
4. Upstream: publish to a private npm registry or as GitHub Packages.

## Non-overlap with existing entries

- `voyager-skill-library` — persistence of *learned* skills (text
  memories of successful iterations). This feature catalogues
  *authored* skills (hand-designed harness features) with independent
  release cycles. Different data, different rippable signal.
- `adas-meta-agent-search` / `meta-hyperagents-metacognitive` — about
  agents that *generate* new features mid-loop. Skill-pack distribution
  is about *delivering* hand-authored features. Orthogonal.
- `swe-agent-aci` — ACI curation via CC settings. Packs are the
  *delivery mechanism* for such settings, not the settings themselves.
