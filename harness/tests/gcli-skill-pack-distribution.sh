#!/usr/bin/env bash
# TC for feature: gcli-skill-pack-distribution
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/gcli-skill-pack-distribution.md"

[ -f "$NOTE" ] || { echo "TC_FAIL gcli-skill-pack: missing research note"; exit 1; }
grep -q "github.com/google/agents-cli" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing google/agents-cli citation"; exit 1; }

# Must spell out the "independently installable" distinction.
grep -qi "independently installable\|installable.*pack\|npx skills add" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing installable-pack distinction"; exit 1; }

# Must name the versioning / lockfile mechanic.
grep -qi "semver\|lockfile\|version pinning" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing versioning mechanism"; exit 1; }

# Must be pre-loop primary.
grep -qi "pre-loop" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing pre-loop mapping"; exit 1; }

# Must disambiguate from voyager-skill-library (biggest overlap risk).
grep -qi "voyager-skill-library\|learned.*skill\|authored.*skill" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing voyager-skill-library non-overlap claim"; exit 1; }

# Must disambiguate from meta-hyperagents-metacognitive (other overlap risk).
grep -qi "meta-hyperagents\|adas-meta-agent" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: missing meta-agent non-overlap claim"; exit 1; }

# Rippable probe must be concrete (pnpm pack + sibling repo install).
grep -qi "pnpm pack\|npx.*install\|fresh.*repo\|sibling" "$NOTE" \
    || { echo "TC_FAIL gcli-skill-pack: rippable probe not operational"; exit 1; }

echo "TC_PASS gcli-skill-pack-distribution"
exit 0
