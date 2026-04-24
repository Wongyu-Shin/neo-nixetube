# Claude Code PreToolUse Hook Guardrail

**Primary source:** Anthropic, *Claude Code Hooks Documentation.*
https://docs.claude.com/en/docs/claude-code/hooks

**Related references:**
- OpenHands, *Security Analyzer & Action Confirmation.* https://github.com/All-Hands-AI/OpenHands
- Cursor, *Agent Mode Safety Rails* (product changelog, 2024).
- Anthropic, *Responsible Scaling Policy* (agent sandboxing chapter).

## Core idea

Claude Code exposes `PreToolUse` / `PostToolUse` / `Stop` / `UserPromptSubmit`
/ `SessionStart` hooks in `settings.json`. A hook is a shell command the
harness invokes with a JSON stdin describing the pending tool call; a
non-zero exit aborts the call before the model side-effects anything.

This is the *inner, in-loop* safety mechanism: it runs while the agent
loop is executing and blocks without ever paging HITL.

Canonical uses surveyed across public configs and OSS prior art:

1. **Destructive-op denial list** — deny `rm -rf /`, `git push --force-with-lease origin main`, `chmod 777`, `sudo`, arbitrary `curl | sh`.
2. **Scope enforcement** — block `Edit`/`Write` on paths outside the declared `Scope:`.
3. **Secret-file denial** — block any tool call targeting `.env`, `id_rsa*`, credentials, `aws/credentials`.
4. **Cost cap** — block `Bash` commands whose expected wall-time exceeds N seconds (identified by regex).

## Why this matters for axis design

The user's axis-2 charter explicitly flags "비상정지" (emergency stop) for
destructive operations during in-loop execution as a primary concern.
`PreToolUse` hooks are the *only* CC primitive that can stop a tool call
before it fires, so they carry this weight. They are also the cleanest
example of an `axis1=inner` feature — zero external infrastructure.

## Harness-relevant decomposition

| Phase | Hook event |
|---|---|
| pre-loop | `SessionStart` hook verifies repo state, ensures clean tree. |
| in-loop (primary) | `PreToolUse` on `Bash`, `Edit`, `Write`, `MultiEdit` — denies matching patterns. |
| post-loop | `Stop` hook triggers `/autoresearch:ship` or `gh pr create` autonomously. |

## Mapping to this project's axes

- **axis1:** `inner` — `settings.json` is inside Claude Code's
  configuration surface. The `update-config` skill operates exactly here.
- **axis2:** `in-loop` (primary) — the value is mid-iteration blocking.

## Rippable signal

Absorbed when Claude Code ships first-party safe defaults that already
deny the commands in this project's hook block list. Concrete probe:
remove the project's `deny` block from `.claude/settings.json` and run
the integration test `harness/tests/integration/destructive-ops.sh` which
attempts `rm -rf` inside a sandbox dir; if CC blocks it natively, rip.

Per-model differences matter: Opus-4.7 tends to be more conservative than
Haiku-4.5 in volunteering destructive commands, so the hook is more
load-bearing on smaller models. The `applicability.models` field records
this.

## Minimal viable implementation for neo-nixetube

1. `.claude/settings.json` `hooks.PreToolUse` with matcher `Bash`, command
   runs `scripts/hooks/deny-destructive.sh` which greps the tool input
   against `harness/hooks/deny-patterns.txt` and exits 1 on match.
2. A second matcher for `Write|Edit|MultiEdit` runs
   `scripts/hooks/scope-check.sh` which rejects paths not inside the
   project-local `Scope:` declared in an env var the autoresearch loop
   exports.
3. Pattern list is versioned — each entry links to the incident or paper
   that justifies its inclusion.

## Contrast

`swe-agent-aci` is about *what tools the model sees*. This feature is
about *which tool calls are denied at runtime*. Two different rippable
signals, so two separate catalog entries.
