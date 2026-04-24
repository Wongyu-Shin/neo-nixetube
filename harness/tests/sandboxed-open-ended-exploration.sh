#!/usr/bin/env bash
# TC for feature: sandboxed-open-ended-exploration
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/sandboxed-open-ended-exploration.md"

[ -f "$NOTE" ] || { echo "TC_FAIL sandboxed: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2603.19461" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing Zhang 2026 citation"; exit 1; }

# Must name BOTH safeguards the paper endorses.
grep -qi "structural sandbox\|sandboxing" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing structural sandboxing requirement"; exit 1; }
grep -qi "human oversight" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing human oversight requirement"; exit 1; }

# Must cite the CC-native primitive that covers part of this.
grep -qi "worktree" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing git worktree isolation reference"; exit 1; }

# Must enumerate at least two concrete structural risks the deny-list misses.
grep -qi "always returns.*SCORE\|echo.*SCORE\|cheating the ratchet\|verify.sh.*rewrite" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing verify-cheating risk"; exit 1; }
grep -qi "select_parent\|collapses exploration\|archive.*delete\|shrink" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing archive-manipulation risk"; exit 1; }

# Must contrast with cc-hook-guardrail (why this is a separate entry).
grep -qi "cc-hook-guardrail\|deny-list\|command-pattern" "$NOTE" \
    || { echo "TC_FAIL sandboxed: missing cc-hook-guardrail contrast"; exit 1; }

# Rippable probe must be a concrete hostile-candidate test.
grep -qi "hostile\|deliberate.*modification\|deletes half\|SCORE=999" "$NOTE" \
    || { echo "TC_FAIL sandboxed: rippable probe not a concrete hostile test"; exit 1; }

echo "TC_PASS sandboxed-open-ended-exploration"
exit 0
