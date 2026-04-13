#!/usr/bin/env bash
# scripts/cad-guard.sh — fast safety net run every autoresearch iteration BEFORE
# the expensive GAN verify. Must exit 0 for changes to be kept.
#
# Checks:
#   1. All CadQuery .py modules import without error
#   2. assembly.py executes and writes build/assembly.step
#   3. bom.yaml parses and contains required top-level keys
#   4. No part has zero or negative volume (crude collision/geometry check)
#   5. Parameters file passes basic sanity (positive, ID < OD)
#
# Usage: bash scripts/cad-guard.sh cad/path-2-room-temp
set -euo pipefail

SCOPE="${1:-cad/path-2-room-temp}"
cd "$(dirname "$0")/.."

if [ ! -d "$SCOPE" ]; then
    echo "GUARD-FAIL: scope directory not found: $SCOPE" >&2
    exit 1
fi

cd "$SCOPE"
# Preserve anchor files across guard runs (verify writes them, guard must
# not wipe them). Use sibling tmp save+restore for safety.
ANCHOR_BACKUP=""
CRITICS_BACKUP=""
if [ -f build/prev_scores.txt ]; then
    ANCHOR_BACKUP=$(mktemp)
    cp build/prev_scores.txt "$ANCHOR_BACKUP"
fi
if [ -f build/prev_critics_summary.txt ]; then
    CRITICS_BACKUP=$(mktemp)
    cp build/prev_critics_summary.txt "$CRITICS_BACKUP"
fi
rm -rf build
mkdir -p build
if [ -n "$ANCHOR_BACKUP" ] && [ -f "$ANCHOR_BACKUP" ]; then
    cp "$ANCHOR_BACKUP" build/prev_scores.txt
    rm -f "$ANCHOR_BACKUP"
fi
if [ -n "$CRITICS_BACKUP" ] && [ -f "$CRITICS_BACKUP" ]; then
    cp "$CRITICS_BACKUP" build/prev_critics_summary.txt
    rm -f "$CRITICS_BACKUP"
fi

# 1 + 2: render assembly
python3 assembly.py > build/render.log 2>&1 || {
    echo "GUARD-FAIL: assembly render failed" >&2
    tail -20 build/render.log >&2
    exit 1
}

if [ ! -s build/assembly.step ]; then
    echo "GUARD-FAIL: assembly.step not produced or empty" >&2
    exit 1
fi

# 3 + 4 + 5: sanity via python
python3 - <<'PY'
import sys
import yaml
from pathlib import Path

errors = []

# BOM parse
try:
    with open("bom.yaml") as f:
        bom = yaml.safe_load(f)
    for key in ("assembly", "items"):
        if key not in bom:
            errors.append(f"bom.yaml missing key: {key}")
    if "items" in bom and not bom["items"]:
        errors.append("bom.yaml items is empty")
except Exception as e:
    errors.append(f"bom.yaml parse failed: {e}")

# Parameters sanity
try:
    sys.path.insert(0, ".")
    import parameters as P
    if P.ENVELOPE_ID >= P.ENVELOPE_OD:
        errors.append("ENVELOPE_ID must be less than ENVELOPE_OD")
    if P.ENVELOPE_ID <= 0 or P.ENVELOPE_OD <= 0 or P.ENVELOPE_LENGTH <= 0:
        errors.append("envelope dimensions must be positive")
    if P.CATH_COUNT < 1 or P.CATH_PITCH <= 0:
        errors.append("cathode stack parameters invalid")
    if P.FT_PIN_COUNT < 1 or P.FT_PIN_DIAMETER <= 0:
        errors.append("feedthrough parameters invalid")
    if P.ANODE_OD >= P.ENVELOPE_ID:
        errors.append("ANODE_OD must leave clearance inside envelope ID")
except Exception as e:
    errors.append(f"parameters.py import failed: {e}")

# Volume sanity via CadQuery
try:
    import cadquery as cq
    from envelope import make_envelope
    from end_cap import make_end_cap
    from anode_mesh import make_anode_mesh
    for name, maker in [
        ("envelope", make_envelope),
        ("end_cap", make_end_cap),
        ("anode_mesh", make_anode_mesh),
    ]:
        part = maker()
        vol = part.val().Volume()
        if vol <= 0:
            errors.append(f"{name} has non-positive volume: {vol}")
except Exception as e:
    errors.append(f"volume check failed: {e}")

if errors:
    for e in errors:
        print(f"GUARD-FAIL: {e}", file=sys.stderr)
    sys.exit(1)

print("GUARD-OK")
PY

echo "GUARD-OK"
