#!/usr/bin/env bash
# scripts/harness/tmux-launch.sh — create tmux session harness-docs-loop
# with 5 windows, one per page. Each window runs `page-loop.sh <slug>`.
#
# Does NOT auto-start the page-loop body; it starts the script but the
# script itself is paused on the first `claude -p` call which will prompt
# for permissions on first use. Operator can inspect each window before
# the claude launches actually consume tokens.
#
# Usage:
#   bash scripts/harness/tmux-launch.sh           — create session only
#   bash scripts/harness/tmux-launch.sh --attach  — create and tmux attach
#   DOCS_DRY_RUN=1 bash ...                      — echo commands, don't run claude
#
# Kill session:
#   tmux kill-session -t harness-docs-loop

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SESSION="${DOCS_TMUX_SESSION:-harness-docs-loop}"
PAGES=(overview constitution flow wiki catalog)

if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "Session '$SESSION' already exists — kill it first:"
    echo "  tmux kill-session -t $SESSION"
    exit 1
fi

# Create detached session with orchestrator window.
tmux new-session -d -s "$SESSION" -n "orchestrator" -c "$ROOT"
tmux send-keys -t "$SESSION:orchestrator" \
    "echo '=== harness-docs-loop orchestrator ==='; echo 'Windows: w-overview w-constitution w-flow w-wiki w-catalog'; echo 'Attach with: tmux attach -t $SESSION'" Enter

# Create one window per page.
for slug in "${PAGES[@]}"; do
    wt="$ROOT/../neo-nixetube-docs-$slug"
    if [ ! -d "$wt" ]; then
        echo "[!] worktree missing for $slug — run setup-worktrees.sh first"
        tmux kill-session -t "$SESSION" 2>/dev/null
        exit 1
    fi
    tmux new-window -t "$SESSION" -n "w-$slug" -c "$wt"
    if [ "${DOCS_DRY_RUN:-0}" = "1" ]; then
        tmux send-keys -t "$SESSION:w-$slug" \
            "echo 'DRY_RUN: would run: bash $ROOT/scripts/harness/page-loop.sh $slug'" Enter
    else
        tmux send-keys -t "$SESSION:w-$slug" \
            "bash $ROOT/scripts/harness/page-loop.sh $slug 2>&1 | tee $ROOT/loops/docs-$slug/tmux.out.log" Enter
    fi
done

echo "[+] tmux session '$SESSION' created with 6 windows (1 orchestrator + 5 pages)."
tmux list-windows -t "$SESSION"

if [ "${1:-}" = "--attach" ]; then
    tmux attach -t "$SESSION"
fi
