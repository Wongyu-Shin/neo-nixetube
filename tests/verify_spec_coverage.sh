#!/bin/bash
# Unified Spec-Implementation Coverage Verify Script
# Outputs: single number (0-100) = percentage of spec pairs covered by passing tests
# Covers: pytest (sim + cross-domain) + vitest (web TypeScript)
set -euo pipefail
cd "$(dirname "$0")/.."

TOTAL_PAIRS=58  # 40 Python (sim+cross) + 18 TypeScript (web)

# --- Python tests (sim/ + cross/) ---
PY_PASS=0
if compgen -G "tests/sim/test_*.py" > /dev/null 2>&1 || compgen -G "tests/cross/test_*.py" > /dev/null 2>&1; then
  PY_DIRS=""
  compgen -G "tests/sim/test_*.py" > /dev/null 2>&1 && PY_DIRS="$PY_DIRS ../tests/sim"
  compgen -G "tests/cross/test_*.py" > /dev/null 2>&1 && PY_DIRS="$PY_DIRS ../tests/cross"
  PY_RESULT=$(cd sim && python3 -m pytest $PY_DIRS -q --tb=no 2>&1 | tail -1)
  PY_PASS=$(echo "$PY_RESULT" | grep -oE '^[0-9]+' | head -1)
  PY_PASS=${PY_PASS:-0}
fi

# --- TypeScript tests (web/) ---
TS_PASS=0
if compgen -G "tests/web/*.test.ts" > /dev/null 2>&1; then
  TS_JSON=$(cd web && npx vitest run --reporter=json 2>/dev/null) || true
  TS_PASS=$(echo "$TS_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('numPassedTests', 0))
except:
    print(0)
" 2>/dev/null) || true
  TS_PASS=${TS_PASS:-0}
fi

TOTAL=$((PY_PASS + TS_PASS))
echo "scale=1; $TOTAL * 100 / $TOTAL_PAIRS" | bc
