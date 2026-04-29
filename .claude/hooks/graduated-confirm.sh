#!/usr/bin/env bash
# .claude/hooks/graduated-confirm.sh — PreToolUse classifier for Bash.
#
# Implements harness/features/harness-graduated-confirm.md (axis1=inner,
# axis2=in-loop). Classifies each pending Bash call into L0/L1/L2:
#
#   L0 reversible     — silent. Reads, greps, git log, edits inside scope.
#   L1 notable        — soft confirm: warn on stderr, exit 0 (allow).
#                        Examples: rm on Scope files, git reset --soft,
#                        npm install, package management.
#   L2 irreversible   — block: write L2 event log, exit 2 with reason.
#                        Examples: git push --force, git reset --hard
#                        outside the loop's commits, rm outside scope,
#                        chmod 777, external POST that bills.
#
# Hook contract (Claude Code):
#   stdin  = JSON with at least {"tool_name": "Bash", "tool_input": {"command": "..."}}
#   exit 0 = allow
#   exit 2 = block (stderr shown to operator)
#   other  = warning (allowed but flagged)
#
# Per-Goal overrides: if loops/NNN-<slug>/spec.md (most recent loop) has
# a `## Tier overrides` section listing patterns, those patterns are
# downgraded to L1 even if they match L2. (e.g., a deliberate history-
# rewrite loop downgrades `git push --force`.)
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="$ROOT/harness/build/graduated-confirm"
mkdir -p "$LOG_DIR"

# Read stdin JSON. Use jq if available; else python.
PY=/opt/homebrew/Caskroom/miniforge/base/bin/python
[ -x "$PY" ] || PY=$(command -v python3)

input=$(cat)
cmd=$("$PY" -c "import json,sys; d=json.loads(sys.stdin.read() or '{}'); print(d.get('tool_input',{}).get('command',''))" <<<"$input" 2>/dev/null || echo "")

# If no Bash command (different tool) — silently allow.
[ -z "$cmd" ] && exit 0

# Per-Goal overrides — downgrade patterns from L2 to L1.
override_file=$(ls -dt "$ROOT"/loops/[0-9]*/spec.md 2>/dev/null | head -1)
declare -a downgrades=()
if [ -n "$override_file" ] && [ -f "$override_file" ]; then
    while IFS= read -r line; do downgrades+=("$line"); done < <(awk '/^## Tier overrides/{flag=1;next}/^## /{flag=0}flag && /^- /{sub(/^- /,"");print}' "$override_file")
fi

is_overridden() {
    local pat="$1"
    for d in ${downgrades[@]+"${downgrades[@]}"}; do
        if [[ "$pat" == *"$d"* || "$cmd" =~ $d ]]; then return 0; fi
    done
    return 1
}

# L2 irreversible patterns (exact regex against $cmd)
L2_PATTERNS=(
    'git push.*--force'
    'git push.*-f([^a-z]|$)'
    'git reset --hard origin'
    'git reset --hard HEAD~[0-9]+'
    '\brm -rf? [^.]*[^/]*[^.]'        # rm -rf outside obvious dot-paths
    'sudo rm'
    'chmod 777'
    'git filter-branch'
    'git push.*--mirror'
    'curl.*POST.*api\.'                # external API POSTs (heuristic)
    'aws s3 rm'
    'docker system prune.*-a'
)

L1_PATTERNS=(
    '^rm [^/].*'                       # rm of relative file
    'git reset --soft'
    'git reset --mixed'
    'npm install'
    'pip install'
    'brew install'
    'mv .* /'                          # mv into absolute root
)

classify() {
    for p in "${L2_PATTERNS[@]}"; do
        if [[ "$cmd" =~ $p ]]; then
            if is_overridden "$p"; then echo "L1"; return; fi
            echo "L2"; return
        fi
    done
    for p in "${L1_PATTERNS[@]}"; do
        if [[ "$cmd" =~ $p ]]; then echo "L1"; return; fi
    done
    echo "L0"
}

tier=$(classify)
ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo -e "$ts\t$tier\t$cmd" >> "$LOG_DIR/events.tsv"

case "$tier" in
    L0)
        # Silent — allow.
        exit 0
        ;;
    L1)
        echo "[graduated-confirm] L1 notable: $cmd" >&2
        echo "[graduated-confirm] Allowed (reversible-but-notable). Logged to $LOG_DIR/events.tsv" >&2
        exit 0
        ;;
    L2)
        echo "[graduated-confirm] L2 IRREVERSIBLE blocked: $cmd" >&2
        echo "" >&2
        echo "This action is classified L2 per harness/features/harness-graduated-confirm.md" >&2
        echo "(Article III in-loop HITL exception). To proceed:" >&2
        echo "  1. Pause the loop (/harness:pause), or" >&2
        echo "  2. Add the matching pattern under '## Tier overrides' in the active" >&2
        echo "     loop's spec.md to downgrade it to L1 for this Goal." >&2
        echo "" >&2
        echo "Logged to $LOG_DIR/events.tsv" >&2
        exit 2
        ;;
esac
