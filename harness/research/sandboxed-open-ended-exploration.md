# Sandboxed Open-Ended Exploration

**Primary citation:** Zhang, J. et al. *HyperAgents.* 2026.
arXiv:2603.19461, §6 "Safety considerations" + the paper's explicit
note in §1: *"All experiments were conducted with safety precautions
(e.g., sandboxing, human oversight)."*
**Primary source:** https://arxiv.org/abs/2603.19461
**Reference code:** https://github.com/facebookresearch/Hyperagents

**Related references:**
- Anthropic, *Responsible Scaling Policy.* 2024.
- All Hands AI, *OpenHands Security Analyzer.*
  https://github.com/All-Hands-AI/OpenHands
- Claude Code `Agent({isolation: "worktree"})` — per-agent git worktree
  isolation primitive already shipped.

## Core requirement

Open-ended self-improvement — the mechanism that makes HyperAgents
valuable — also makes it hazardous: a child hyperagent may generate
modifications to its *own meta mechanism* that are destructive
(deletes archive, loops on `rm`, writes outside the scope). Two
necessary guards:

1. **Structural sandboxing.** Each candidate's modification + evaluation
   runs in a disposable environment (container, VM, or at minimum a
   fresh git worktree). Destructive modifications are contained to the
   sandbox and cannot reach the parent archive.
2. **Human oversight.** A human reviews produced candidates on a
   cadence (not every iteration), with authority to terminate, prune,
   or quarantine the archive.

HyperAgents treats (1) as technically necessary and (2) as the *only*
HITL boundary the paper endorses. Quoting §1:

> "All experiments were conducted with safety precautions (e.g.,
> sandboxing, human oversight). We discuss what safety entails in
> this setting and the broader implications of self-improving
> systems."

## Why this matters for this project's axes

`cc-hook-guardrail` already denies a specific command list at
`PreToolUse`. That covers the "no `rm -rf /`" case but does **not**
cover:

- A benign-looking `bash scripts/harness/clean.sh` that internally
  deletes the archive.
- An edit to `verify.sh` that always returns `SCORE=999` (cheating
  the ratchet).
- A modification to `select_parent.py` that biases toward one commit
  and collapses exploration.

These are all structural risks the deny-list can't catch because the
individual commands are legitimate. The only defence is **running the
candidate in a throwaway worktree and comparing its final archive
state + scores to the parent's**, then merging only if the delta looks
sane by guard.sh + an auxiliary sanity script.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| in-loop (primary) | Each iteration's modification runs in a git worktree created at the chosen parent commit; evaluation runs there; on success the worktree is *merged* back via cherry-pick, not merged via `git push` of the worktree itself. |
| pre-loop | Declare what constitutes a "sane" delta (e.g., no entries vanish from `harness/features/`, no verify.sh rewrites that remove TC execution, no results-TSV row deletions). |
| post-loop | Worktree teardown + lineage audit. |

## Mapping to this project's axes

- **axis1:** `outer` — orchestration of worktrees + cherry-pick is
  script-level. CC ships `Agent({isolation: "worktree"})` which is the
  *inner* half; wrapping it with a "sane-delta" checker is the outer
  half this feature captures.
- **axis2:** `in-loop` (primary).

## Rippable signal

Partly already absorbed: CC's `Agent({isolation: "worktree"})`
covers (a). Rippable test for the external wrapper:

1. Craft a deliberately-hostile child modification (deletes half of
   `harness/features/`, rewrites `verify.sh` to echo `SCORE=999`).
2. Pipe through CC-native Agent isolation + cherry-pick.
3. If CC refuses the merge (detects archive-shrink or verify-rewrite)
   via native safeguards, rip.
4. Current expectation: CC isolates execution but does not check merge
   sanity — so the external `sane_delta.sh` is still load-bearing.

## Minimal viable implementation for neo-nixetube

1. `scripts/harness/isolated_iteration.sh <parent_commit>` — creates a
   git worktree, spawns Claude inside it with the current hyperagent
   state, runs verify, captures the diff.
2. `scripts/harness/sane_delta.sh <parent> <child>` — rejects diffs
   that:
   - delete files under `harness/features/` or `harness/research/`
   - reduce the row count of `autoresearch-harness-results.tsv`
     (except the schema comment rows)
   - modify `harness/verify.sh` to remove the TC execution block
   - modify `harness/guard.sh` to weaken schema checks
3. Merge step: `git cherry-pick` only if `sane_delta.sh` exits 0.
4. Human oversight cadence: configurable, default "every 20 iterations
   batch a PR review to a human reviewer".

## Contrast

- `cc-hook-guardrail` — command-pattern denies at the `PreToolUse`
  boundary. Can't see semantic-level harm (legitimate commands chained
  destructively).
- `harness-rip-test` — measures whether a feature is redundant; this
  feature measures whether a candidate is *safe to merge*.
- `plan-mode-discipline` — upstream HITL channel at pre-loop; this
  feature is the downstream HITL channel at the post-iteration cherry-
  pick point.
