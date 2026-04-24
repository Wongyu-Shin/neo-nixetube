#!/usr/bin/env bash
# TC for feature: meta-hyperagents-metacognitive
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/meta-hyperagents-metacognitive.md"

[ -f "$NOTE" ] || { echo "TC_FAIL meta-hyperagents-metacognitive: missing research note"; exit 1; }

# Must cite the real paper + repo.
grep -q "arxiv.org/abs/2603.19461" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing Zhang 2026 arxiv citation"; exit 1; }
grep -q "github.com/facebookresearch/Hyperagents" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing facebookresearch/Hyperagents repo citation"; exit 1; }

# The single most important phrase — metacognitive self-modification.
grep -qi "metacognitive self-modification" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing metacognitive self-modification term"; exit 1; }

# Must distinguish editable task agent vs editable meta agent vs
# editable-meta-of-meta. This is the feature's whole thesis.
grep -qi "editable.*meta.*agent\|meta agent.*itself.*editable\|meta-level.*editable" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing editable-meta-agent invariant"; exit 1; }

# Must contrast with ADAS (the fixed-meta baseline).
grep -qi "ADAS" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing ADAS contrast"; exit 1; }

# Must contrast with DGM (the coding-alignment predecessor).
grep -qi "DGM\|Darwin Gödel\|Darwin Godel" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing DGM predecessor discussion"; exit 1; }

# Must disambiguate from the unrelated FPT HyperAgent.
grep -qi "FPT\|Phan\|2409.16299\|fpt-hyperagent" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: missing FPT disambiguation"; exit 1; }

# Rippable probe must be quantitative (not "absorbed someday").
grep -qE "10%|within 2×|2x|Phase A|Phase B|self-editing skill" "$NOTE" \
    || { echo "TC_FAIL meta-hyperagents-metacognitive: rippable probe lacks quantitative threshold"; exit 1; }

echo "TC_PASS meta-hyperagents-metacognitive"
exit 0
