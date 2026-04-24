#!/usr/bin/env bash
# TC for feature: harness-constitution
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/harness-constitution.md"
CONST="$ROOT/harness/CONSTITUTION.md"

[ -f "$NOTE" ] || { echo "TC_FAIL harness-constitution: missing research note"; exit 1; }
[ -f "$CONST" ] || { echo "TC_FAIL harness-constitution: missing CONSTITUTION.md"; exit 1; }

# Must cite spec-kit as the pattern source.
grep -q "github.com/github/spec-kit" "$NOTE" \
    || { echo "TC_FAIL harness-constitution: missing spec-kit citation"; exit 1; }

# Constitution must contain at least the 9 named Articles.
for art in "Article I" "Article II" "Article III" "Article IV" "Article V" "Article VI" "Article VII" "Article VIII" "Article IX"; do
    grep -q "^## $art" "$CONST" \
        || { echo "TC_FAIL harness-constitution: missing $art"; exit 1; }
done

# Core invariants must be named in the constitution.
grep -qi "axis1\|axis-1" "$CONST" \
    || { echo "TC_FAIL harness-constitution: missing axis1 invariant"; exit 1; }
grep -qi "rippab" "$CONST" \
    || { echo "TC_FAIL harness-constitution: missing rippability invariant"; exit 1; }
grep -qi "HITL" "$CONST" \
    || { echo "TC_FAIL harness-constitution: missing HITL invariant"; exit 1; }
grep -qi "alignment" "$CONST" \
    || { echo "TC_FAIL harness-constitution: missing alignment-free invariant"; exit 1; }
grep -qi "composite-guard\|crosscheck" "$CONST" \
    || { echo "TC_FAIL harness-constitution: missing no-contradiction invariant"; exit 1; }

# Amendment procedure must be self-referential (Article IX can only be
# changed via the procedure it describes).
grep -qi "procedure it describes\|self-refer\|itself can only" "$CONST" \
    || { echo "TC_FAIL harness-constitution: Article IX missing self-reference"; exit 1; }

echo "TC_PASS harness-constitution"
exit 0
