---
description: Scaffold a new autoresearch loop directory under loops/NNN-<slug>/ from loops/TEMPLATE.
argument-hint: <slug>
allowed-tools: Bash, Read, Write, Edit
---

# `/harness:new-loop <slug>`

Scaffold loop NNN — feature `harness-loop-scaffold` (axis1=inner, axis2=pre-loop).
Source of truth: `harness/features/harness-loop-scaffold.md`.

The argument provided is **`$ARGUMENTS`** (a single kebab-case slug, e.g. `cad-mass-balance`).

## What this command does

1. Read `loops/` to find the next zero-padded NNN. Use `ls -d loops/[0-9]*/ 2>/dev/null | sed 's|loops/||' | sed 's|-.*||' | sort -n | tail -1` to find the current max; increment by 1; pad to 3 digits. If no numbered loops exist yet, NNN=001.
2. Validate `$ARGUMENTS` is a non-empty kebab-case identifier (`^[a-z][a-z0-9-]*$`). Refuse with a clear error if it contains spaces, uppercase, or `/`.
3. Copy every file under `loops/TEMPLATE/` into a new directory `loops/NNN-<slug>/`. Use `cp -r loops/TEMPLATE loops/<NNN>-<slug>`.
4. Replace `<slug>` placeholders inside the copied files with the actual slug, and `NNN` placeholders with the actual number. Use `sed -i ''` (macOS) or `sed -i` (linux). Replace these tokens in:
   - `spec.md`
   - `clarifications.md`
   - `plan.md`
   - `report.mdx`
   - `wiki-refs.md`
   - `reflexion.md`
5. Stage and commit the scaffold with message `chore(loop): scaffold loops/NNN-<slug>` (per Article VIII — git is memory; the scaffold itself is a loop boundary marker).
6. Print a compact summary: the path of the new directory, the next operator action (`open spec.md, fill Goal/Scope/Metric, then run /harness:clarify`), and the reminder that `/autoresearch:plan` is the only legitimate HITL gate into in-loop execution (Article III).

## Constraints

- Do **NOT** invoke `/harness:clarify` or `/autoresearch:plan` automatically — the operator opens those once the spec.md skeleton is filled. Pre-loop HITL is permitted (Article III) but each command is a separate operator action.
- Do **NOT** modify `loops/TEMPLATE/` — it is the canonical scaffold and must stay generic.
- Do **NOT** create the loop without committing — the directory's existence is itself the loop boundary marker per Article VIII.
- If the operator passes an empty argument, refuse with: "Provide a kebab-case slug. Example: `/harness:new-loop cad-mass-balance`".

## Exit conditions

After the commit completes, the command's job is done. Do not start the loop, do not enter plan mode. The operator then proceeds at their own cadence:

```
/harness:new-loop <slug>   ← this command
   ↓ operator fills spec.md
/harness:clarify           ← Article V coverage gate
   ↓ operator runs
/autoresearch:plan         ← only legitimate HITL gate into in-loop (Article III)
```
