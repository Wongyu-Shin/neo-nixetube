#!/usr/bin/env bash
# TC for feature: harness-pause-resume
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/harness-pause-resume.md"

[ -f "$NOTE" ] || { echo "TC_FAIL pause-resume: missing research note"; exit 1; }
grep -q "docs.openhands.dev" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing OpenHands citation"; exit 1; }

# Must name the slash command surface.
for cmd in "/harness:pause" "/harness:resume" "/harness:status" "/harness:send"; do
    grep -qF "$cmd" "$NOTE" \
        || { echo "TC_FAIL pause-resume: missing command $cmd"; exit 1; }
done

# Must establish checkpoint file + resumable pattern.
grep -qi "checkpoint" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing checkpoint concept"; exit 1; }

# Must be in-loop primary.
grep -qFi "in-loop (primary)" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing in-loop (primary) mapping"; exit 1; }

# Must distinguish operator-initiated vs agent-requested HITL.
grep -qi "operator.*initiated\|operator pause\|didn't request HITL" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing operator-vs-agent HITL distinction"; exit 1; }

# Must cite Article III (HITL rule) — establishing the asymmetry is load-bearing.
grep -qi "Article III" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing Article III reference"; exit 1; }

# Must contrast with harness-graduated-confirm (next feature) and plan-mode-discipline.
grep -q "harness-graduated-confirm" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing harness-graduated-confirm contrast"; exit 1; }
grep -q "plan-mode-discipline" "$NOTE" \
    || { echo "TC_FAIL pause-resume: missing plan-mode-discipline contrast"; exit 1; }

# Rippable probe must be concrete.
grep -qi "bounded autoresearch\|iteration 3\|3 consecutive Goals" "$NOTE" \
    || { echo "TC_FAIL pause-resume: rippable probe lacks concrete protocol"; exit 1; }

echo "TC_PASS harness-pause-resume"
exit 0
