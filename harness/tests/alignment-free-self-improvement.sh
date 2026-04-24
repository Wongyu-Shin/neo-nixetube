#!/usr/bin/env bash
# TC for feature: alignment-free-self-improvement
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/alignment-free-self-improvement.md"

[ -f "$NOTE" ] || { echo "TC_FAIL alignment-free: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2603.19461" "$NOTE" \
    || { echo "TC_FAIL alignment-free: missing Zhang 2026 citation"; exit 1; }

# Must name DGM as the predecessor it critiques.
grep -qi "DGM\|Darwin Gödel\|Darwin Godel" "$NOTE" \
    || { echo "TC_FAIL alignment-free: missing DGM critique"; exit 1; }

# Must spell out the alignment concept — the feature's whole subject.
grep -qi "alignment between.*evaluation\|evaluation.*skill.*self-modification\|alignment.*skill" "$NOTE" \
    || { echo "TC_FAIL alignment-free: missing alignment-between-evaluation-and-self-modification concept"; exit 1; }

# Must tie to THIS project's concrete domains (CAD, Paschen, harness, etc.).
grep -qi "cad\|paschen\|sim\|nixie\|harness" "$NOTE" \
    || { echo "TC_FAIL alignment-free: missing project-specific anchor"; exit 1; }

# Must enumerate the three discipline rules.
discipline_hits=0
grep -qi "separate the evaluation artefact" "$NOTE" && discipline_hits=$((discipline_hits+1))
grep -qi "cross-domain transfer" "$NOTE" && discipline_hits=$((discipline_hits+1))
grep -qi "harness.*success metric.*not.*project\|not.*project.*success metric" "$NOTE" && discipline_hits=$((discipline_hits+1))
[ "$discipline_hits" -ge 2 ] \
    || { echo "TC_FAIL alignment-free: need ≥2 discipline rules, got $discipline_hits"; exit 1; }

# Must be pre-loop primary.
grep -qi "pre-loop" "$NOTE" \
    || { echo "TC_FAIL alignment-free: missing pre-loop mapping"; exit 1; }

# Must establish a concrete rippable probe.
grep -qi "straddle\|cross-domain Goal\|scope.*domain" "$NOTE" \
    || { echo "TC_FAIL alignment-free: rippable probe not operational"; exit 1; }

echo "TC_PASS alignment-free-self-improvement"
exit 0
