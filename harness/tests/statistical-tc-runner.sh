#!/usr/bin/env bash
# TC for feature: statistical-tc-runner
#
# Meta-TC: validates that the research note for the runner itself
# specifies the four axis-1 requirements the user named inline:
#   (a) reproducible TC
#   (b) applicability range (CC version + model)
#   (c) parallel execution
#   (d) statistical decision rule
#   (e) auto-trigger on version/model change
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/statistical-tc-runner.md"

[ -f "$NOTE" ] || { echo "TC_FAIL statistical-tc-runner: missing research note"; exit 1; }

grep -qi "welch\|t-test\|confidence interval\|p <\|p-value\|p_value" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing statistical test citation"; exit 1; }

grep -qi "parallel\|concurrent\|pool" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing parallel-execution requirement"; exit 1; }

grep -qi "pre-registered\|decision rule\|aggregation" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing pre-registered decision rule"; exit 1; }

grep -qi "auto-trigger\|SessionStart\|version change\|version/model change\|on_version_change" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing auto-trigger requirement"; exit 1; }

grep -qi "applicability" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing applicability discussion"; exit 1; }

# Must cite at least one real reference.
grep -qE "doi\.org|arxiv\.org|mlperf" "$NOTE" \
    || { echo "TC_FAIL statistical-tc-runner: missing citation URL"; exit 1; }

echo "TC_PASS statistical-tc-runner"
exit 0
