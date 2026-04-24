#!/usr/bin/env bash
# TC for feature: harness-progress-cadence
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/harness-progress-cadence.md"

[ -f "$NOTE" ] || { echo "TC_FAIL progress-cadence: missing research note"; exit 1; }
grep -q "github.com/uditgoenka/autoresearch" "$NOTE" \
    || { echo "TC_FAIL progress-cadence: missing autoresearch citation"; exit 1; }

# Must enumerate the three cadence levels.
for level in "Per-iteration" "Milestone" "Final"; do
    grep -q "$level" "$NOTE" \
        || { echo "TC_FAIL progress-cadence: missing level $level"; exit 1; }
done

# Must reference the statusline primitive.
grep -qi "statusline" "$NOTE" \
    || { echo "TC_FAIL progress-cadence: missing statusline reference"; exit 1; }

# Must be in-loop primary.
grep -qFi "in-loop (primary)" "$NOTE" \
    || { echo "TC_FAIL progress-cadence: missing in-loop (primary) mapping"; exit 1; }

# Must contrast with the 4 neighbor features (post-loop/telemetry/pause).
for f in cc-post-loop-slash llm-as-judge-audit gcli-agent-run-telemetry harness-pause-resume; do
    grep -q "$f" "$NOTE" \
        || { echo "TC_FAIL progress-cadence: missing contrast with $f"; exit 1; }
done

# Rippable probe must be concrete (15-iter bounded + 4 cadence artifacts).
grep -qi "15-iteration\|15.*iter" "$NOTE" \
    || { echo "TC_FAIL progress-cadence: rippable probe lacks concrete protocol"; exit 1; }

echo "TC_PASS harness-progress-cadence"
exit 0
