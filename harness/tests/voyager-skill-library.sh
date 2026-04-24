#!/usr/bin/env bash
# TC for feature: voyager-skill-library
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/voyager-skill-library.md"

[ -f "$NOTE" ] || { echo "TC_FAIL voyager: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2305.16291" "$NOTE" || { echo "TC_FAIL voyager: missing primary citation"; exit 1; }
grep -qi "skill library" "$NOTE" || { echo "TC_FAIL voyager: missing skill-library discussion"; exit 1; }
grep -qi "Precision@5\|statistically\|p>" "$NOTE" || { echo "TC_FAIL voyager: rippable signal lacks a measurable"; exit 1; }
grep -q "pre-loop" "$NOTE" || { echo "TC_FAIL voyager: missing pre-loop mapping"; exit 1; }
grep -q "in-loop" "$NOTE" || { echo "TC_FAIL voyager: missing in-loop mapping"; exit 1; }

echo "TC_PASS voyager-skill-library"
exit 0
