#!/usr/bin/env bash
# TC for feature: cc-hook-guardrail
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/cc-hook-guardrail.md"

[ -f "$NOTE" ] || { echo "TC_FAIL cc-hook-guardrail: missing research note"; exit 1; }
grep -q "docs.claude.com.*hooks" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing official hooks doc citation"; exit 1; }
grep -qi "PreToolUse" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing PreToolUse event"; exit 1; }
grep -qi "destructive\|deny" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing destructive-op discussion"; exit 1; }
grep -qi "in-loop" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing in-loop mapping"; exit 1; }
grep -qi "inner" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing inner-harness anchor"; exit 1; }
grep -qi "rippable\|integration test\|sandbox" "$NOTE" || { echo "TC_FAIL cc-hook-guardrail: missing rippable probe"; exit 1; }

echo "TC_PASS cc-hook-guardrail"
exit 0
