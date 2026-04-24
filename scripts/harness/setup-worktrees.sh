#!/usr/bin/env bash
# scripts/harness/setup-worktrees.sh — create 5 git worktrees, one per page.
#
# Each worktree is a separate working copy pinned to its own branch so the 5
# page-loop sub-orchestrators cannot step on each other. Worktrees live as
# sibling directories to the main repo to keep path relative arithmetic
# simple.
#
# Idempotent — re-running reports existing worktrees without re-creating.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PARENT="$(cd "$ROOT/.." && pwd)"
PAGES=(overview constitution flow wiki catalog)

for slug in "${PAGES[@]}"; do
    wt="$PARENT/neo-nixetube-docs-$slug"
    branch="docs-$slug"
    if [ -d "$wt" ]; then
        echo "[=] worktree exists: $wt"
        continue
    fi
    # Create a branch from current HEAD (avoid touching main's HEAD).
    if git -C "$ROOT" show-ref --verify --quiet "refs/heads/$branch"; then
        git -C "$ROOT" worktree add "$wt" "$branch" && \
            echo "[+] attached worktree to existing branch: $branch → $wt"
    else
        git -C "$ROOT" worktree add -b "$branch" "$wt" HEAD && \
            echo "[+] created branch + worktree: $branch → $wt"
    fi
done

echo ""
echo "=== git worktree list ==="
git -C "$ROOT" worktree list
