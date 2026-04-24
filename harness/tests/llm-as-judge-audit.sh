#!/usr/bin/env bash
# TC for feature: llm-as-judge-audit
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/llm-as-judge-audit.md"

[ -f "$NOTE" ] || { echo "TC_FAIL llm-as-judge: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2306.05685" "$NOTE" || { echo "TC_FAIL llm-as-judge: missing Zheng 2023 citation"; exit 1; }

# Known failure modes MUST be called out — otherwise the feature is unsafe
# to deploy as a ratchet anchor.
grep -qi "self-enhancement" "$NOTE" || { echo "TC_FAIL llm-as-judge: missing self-enhancement bias discussion"; exit 1; }
grep -qi "position\|verbosity" "$NOTE" || { echo "TC_FAIL llm-as-judge: missing position/verbosity bias discussion"; exit 1; }

# post-loop axis must be the primary phase.
grep -qi "post-loop" "$NOTE" || { echo "TC_FAIL llm-as-judge: missing post-loop mapping"; exit 1; }

# Rippable probe must specify a measurable threshold (position-swap variance,
# agreement rate).
grep -qE "variance|agreement|%" "$NOTE" || { echo "TC_FAIL llm-as-judge: rippable probe lacks numeric threshold"; exit 1; }

echo "TC_PASS llm-as-judge-audit"
exit 0
