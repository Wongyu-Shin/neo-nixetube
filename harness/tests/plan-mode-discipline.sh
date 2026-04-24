#!/usr/bin/env bash
# TC for feature: plan-mode-discipline
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/plan-mode-discipline.md"

[ -f "$NOTE" ] || { echo "TC_FAIL plan-mode-discipline: missing research note"; exit 1; }
grep -q "docs.claude.com.*plan-mode" "$NOTE" \
    || { echo "TC_FAIL plan-mode-discipline: missing Plan Mode doc URL"; exit 1; }
grep -qi "ExitPlanMode" "$NOTE" || { echo "TC_FAIL plan-mode-discipline: missing ExitPlanMode primitive"; exit 1; }
grep -qi "AskUserQuestion" "$NOTE" || { echo "TC_FAIL plan-mode-discipline: missing AskUserQuestion leak concept"; exit 1; }
grep -qi "pre-loop" "$NOTE" || { echo "TC_FAIL plan-mode-discipline: missing pre-loop mapping"; exit 1; }
grep -qi "inner" "$NOTE" || { echo "TC_FAIL plan-mode-discipline: missing inner-harness anchor"; exit 1; }

# Must establish contrast with hyperagent-planner-routing to justify
# existence as a separate catalog entry.
grep -qi "hyperagent\|planner-routing\|multi-agent" "$NOTE" \
    || { echo "TC_FAIL plan-mode-discipline: missing contrast with hyperagent"; exit 1; }

# Rippable probe must define a measurable leak rate threshold.
grep -qE "leak rate|HITL leak|N=5|0\.1/goal|0/goal" "$NOTE" \
    || { echo "TC_FAIL plan-mode-discipline: rippable probe lacks leak-rate threshold"; exit 1; }

echo "TC_PASS plan-mode-discipline"
exit 0
