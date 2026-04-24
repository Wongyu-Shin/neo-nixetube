#!/usr/bin/env bash
# TC for feature: adas-meta-agent-search
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/adas-meta-agent-search.md"

[ -f "$NOTE" ] || { echo "TC_FAIL adas: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2408.08435" "$NOTE" || { echo "TC_FAIL adas: missing primary citation"; exit 1; }
grep -qi "meta agent\|meta-agent\|meta agent search" "$NOTE" || { echo "TC_FAIL adas: missing meta-agent concept"; exit 1; }
grep -qi "archive\|novelty" "$NOTE" || { echo "TC_FAIL adas: missing archive/novelty discussion"; exit 1; }
grep -qi "pre-loop\|post-loop" "$NOTE" || { echo "TC_FAIL adas: missing phase mapping"; exit 1; }
grep -qi "rippable\|probe\|benchmark" "$NOTE" || { echo "TC_FAIL adas: missing rippable probe"; exit 1; }

echo "TC_PASS adas-meta-agent-search"
exit 0
