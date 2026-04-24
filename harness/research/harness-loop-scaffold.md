# Harness Loop Scaffold — `/harness:new-loop <slug>`

**Inspiration sources:**
- GitHub spec-kit `/speckit.specify` + `specs/NNN-feature-name/` layout.
  https://github.com/github/spec-kit
- Google agents-cli `scaffold` / `scaffold enhance` / `scaffold upgrade`
  separation of creation lifecycle. https://github.com/google/agents-cli
- Rails generators / Django startapp — the long-established pattern of
  template-driven directory creation.

## Core idea

Today, the user starts a loop by typing `/autoresearch:plan` with a
huge prose blob as argument. The loop's artifacts then land in
scattered places (`reports/harness/YYYY-MM-DD-*.mdx`,
`autoresearch-harness-*-results.tsv`, assorted commits). Borrowing
spec-kit's pattern: one command creates a numbered directory holding
every artifact that loop will produce.

```
/harness:new-loop <slug>
```

creates:

```
loops/NNN-<slug>/
├── spec.md          ← Goal, Scope, Metric, Direction, Guard (filled by wizard)
├── clarifications.md ← recorded Q/A from clarify gate (Article V)
├── plan.md          ← operator-approved plan (via Plan mode)
├── results.tsv      ← per-iteration log (symlinked to autoresearch runner output)
├── report.mdx       ← post-loop narrative (Article VIII / feature cc-post-loop-slash)
└── wiki-refs.md     ← which wiki entries this loop touched / created
```

NNN is a zero-padded sequential integer; the slug is a kebab-case
identifier operator chooses. Multiple concurrent loops can coexist
under separate NNN directories.

## Why this matters for this project's axes

Prior ad-hoc layout violated Article VIII ("Git Is Memory") in
practice — per-loop results TSVs lived at the repo root alongside
each other, which made it hard to see "what was this loop trying to
achieve, and what happened" in a single glance. The numbered
directory makes each loop a self-contained unit.

Complementary to `harness-constitution` (what the loop must respect)
and `harness-clarify-gate` (what a loop's `clarifications.md` gets
written by). This feature is the container for both.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop (primary) | `/harness:new-loop <slug>` expands templates into `loops/NNN-<slug>/` and opens `spec.md` for the operator + wizard to fill in. |
| in-loop | The autoresearch runner writes `results.tsv` to the loop's directory, not the repo root. |
| post-loop | The reporter (`cc-post-loop-slash`) writes `report.mdx` into the same directory, alongside `wiki-refs.md`. |

## Mapping to this project's axes

- **axis1:** `inner` — implemented as a CC custom slash command at
  `.claude/commands/harness/new-loop.md` that runs a template-expansion
  script. No external infrastructure.
- **axis2:** `pre-loop` (primary).

## Rippable signal

Absorbed when Claude Code ships a first-class "experiment directory"
primitive — e.g., `/claude:new-experiment <slug>` that creates a
numbered dir with standard artifacts from a project-local template.
Probe: check `/help` for the command and verify template rendering
matches the custom scaffold's output.

## Minimal viable implementation for neo-nixetube

1. `loops/TEMPLATE/` — reference directory with `spec.md`,
   `clarifications.md`, `plan.md`, `report.mdx`, `wiki-refs.md` skeletons.
2. `.claude/commands/harness/new-loop.md` — slash command that copies
   `TEMPLATE/` to `loops/<NNN>-<slug>/`, auto-increments NNN from
   existing dirs, and opens `spec.md` for editing.
3. Each template file carries Handlebars-style `{{slug}}`, `{{date}}`,
   `{{operator}}` placeholders that the command substitutes at scaffold
   time.

## Template: spec.md (reference contract)

```markdown
# Loop NNN — <slug>

**Created:** <YYYY-MM-DD>
**Operator:** <git user.name>

## Goal

<one paragraph — what does success look like, and why does it matter now?>

## Scope

<glob pattern. MUST live in exactly one domain per Article IV.>

## Metric

<mechanical measure, extractable by command. Declare direction.>

## Verify

```bash
<command that outputs METRIC=N>
```

## Guard

```bash
<command that must always exit 0, or "none">
```

## Baseline

<measured by dry-run before first iteration>

## Article references

- Respects Article III (HITL): <brief statement>
- Respects Article IV (alignment): <domain declaration>
```

## Contrast

- `harness-clarify-gate` — next feature — writes to the loop's
  `clarifications.md`. This feature is the container.
- `cc-post-loop-slash` — writes to the loop's `report.mdx`. Same
  container.
- `plan-mode-discipline` — owns the `plan.md` file's editing gate
  via ExitPlanMode.
