#!/usr/bin/env bash
# TC for feature: harness-loop-scaffold
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/harness-loop-scaffold.md"

[ -f "$NOTE" ] || { echo "TC_FAIL loop-scaffold: missing research note"; exit 1; }
grep -q "github.com/github/spec-kit" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing spec-kit citation"; exit 1; }
grep -q "github.com/google/agents-cli" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing google/agents-cli citation"; exit 1; }

# Must name the command surface.
grep -qi "/harness:new-loop" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing /harness:new-loop command"; exit 1; }

# Must spec the numbered directory layout.
grep -qi "loops/NNN\|NNN-<slug>\|numbered director" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing numbered directory layout"; exit 1; }

# Must enumerate the 5 per-loop artifacts.
for a in spec.md clarifications.md plan.md report.mdx wiki-refs.md; do
    grep -q "$a" "$NOTE" \
        || { echo "TC_FAIL loop-scaffold: missing artifact $a"; exit 1; }
done

# Must be inner, pre-loop primary.
grep -qi "inner" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing inner anchor"; exit 1; }
grep -qi "pre-loop \(primary\)" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing pre-loop primary mapping"; exit 1; }

# Must contrast with harness-clarify-gate and cc-post-loop-slash.
grep -q "harness-clarify-gate" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing harness-clarify-gate contrast"; exit 1; }
grep -q "cc-post-loop-slash" "$NOTE" \
    || { echo "TC_FAIL loop-scaffold: missing cc-post-loop-slash contrast"; exit 1; }

echo "TC_PASS harness-loop-scaffold"
exit 0
