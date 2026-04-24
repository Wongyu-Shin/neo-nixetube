#!/usr/bin/env bash
# TC for feature: fpt-hyperagent-multirole
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/fpt-hyperagent-multirole.md"

[ -f "$NOTE" ] || { echo "TC_FAIL fpt-hyperagent: missing research note"; exit 1; }
grep -q "arxiv.org/abs/2409.16299" "$NOTE" || { echo "TC_FAIL fpt-hyperagent: missing primary citation"; exit 1; }

# Must explicitly disambiguate from Meta HyperAgents (Zhang 2026) so this
# mistake doesn't happen again.
grep -qi "not the same\|separate work\|Zhang\|2603.19461\|facebookresearch" "$NOTE" \
    || { echo "TC_FAIL fpt-hyperagent: missing disambiguation from Meta HyperAgents"; exit 1; }

# The feature's whole point: Planner is the only agent allowed to talk to
# the human. The note MUST spell that out.
grep -qi "planner.*only.*human\|only.*planner.*human\|only agent.*human" "$NOTE" \
    || { echo "TC_FAIL fpt-hyperagent: missing HITL-routing invariant"; exit 1; }

grep -qi "Navigator" "$NOTE" && grep -qi "Editor" "$NOTE" && grep -qi "Executor" "$NOTE" \
    || { echo "TC_FAIL fpt-hyperagent: missing role quartet"; exit 1; }

grep -qi "AskUserQuestion\|HITL-not-allowed\|changelog" "$NOTE" \
    || { echo "TC_FAIL fpt-hyperagent: rippable signal lacks a concrete probe"; exit 1; }

echo "TC_PASS fpt-hyperagent-multirole"
exit 0
