#!/usr/bin/env bash
# harness/verify.sh — Harness Feature Completeness Score
#
# For each harness/features/*.md entry:
#   (1) guard.sh must report GUARD_OK
#   (2) its tc_script must exit 0
#   (3) sources[] must be non-empty
# Count of qualifying entries is emitted as SCORE=N on stdout.
#
# Exits 0 even when SCORE=0 (empty catalog is a valid baseline).
#
# Parallelism: tc_scripts are invoked concurrently (xargs -P) so that
# slow TCs (web fetches, statistical sampling) don't serialize the loop.

set -o pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FEATURES_DIR="$PROJECT_ROOT/harness/features"
BUILD_DIR="$PROJECT_ROOT/harness/build"
mkdir -p "$BUILD_DIR"

PARALLELISM="${HARNESS_PARALLELISM:-4}"

# Step 1: run guard — any schema violation disqualifies the whole iteration
# from *counting* those entries, but verify must still emit a SCORE line.
guard_log="$BUILD_DIR/guard.log"
bash "$PROJECT_ROOT/harness/guard.sh" >"$guard_log" 2>&1 || true

if [ ! -d "$FEATURES_DIR" ] || [ -z "$(ls -A "$FEATURES_DIR" 2>/dev/null)" ]; then
    echo "SCORE=0"
    echo "DETAIL total=0 schema_ok=0 tc_pass=0"
    exit 0
fi

# Collect entries that passed guard (bash 3.2 compatible — no mapfile).
ok_list="$BUILD_DIR/ok-entries.txt"
grep '^GUARD_OK ' "$guard_log" | awk '{print $2}' > "$ok_list" || true
ok_count=$(wc -l < "$ok_list" | tr -d ' ')

if [ "$ok_count" -eq 0 ]; then
    total=$(ls "$FEATURES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo "SCORE=0"
    echo "DETAIL total=$total schema_ok=0 tc_pass=0"
    exit 0
fi

run_tc() {
    local name="$1"
    local feature_file="$FEATURES_DIR/$name.md"
    local fm
    fm=$(awk '/^---$/{c++; next} c==1{print} c==2{exit}' "$feature_file")
    local tc
    tc=$(printf '%s\n' "$fm" | awk -F': *' '/^tc_script:/{print $2; exit}' | tr -d '"'\''' )
    local log="$BUILD_DIR/tc-${name}.log"
    if bash "$PROJECT_ROOT/$tc" >"$log" 2>&1; then
        echo "TC_PASS $name"
    else
        echo "TC_FAIL $name exit=$?"
    fi
}

export -f run_tc
export PROJECT_ROOT FEATURES_DIR BUILD_DIR

tc_log="$BUILD_DIR/tc.log"
xargs -n1 -P "$PARALLELISM" -I{} bash -c 'run_tc "$@"' _ {} \
    < "$ok_list" \
    > "$tc_log" 2>&1

tc_pass=$(grep -c '^TC_PASS ' "$tc_log" 2>/dev/null | tr -d ' ')
[ -z "$tc_pass" ] && tc_pass=0
total=$(ls "$FEATURES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
schema_ok="$ok_count"

echo "SCORE=$tc_pass"
echo "DETAIL total=$total schema_ok=$schema_ok tc_pass=$tc_pass"
exit 0
