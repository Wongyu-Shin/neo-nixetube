#!/usr/bin/env bash
# Verify CAD ↔ MDX consistency for Path 2 Room Temp
# Returns: count of known inconsistencies (lower is better, target: 0)
# Exit 0 always (metric is the count, not exit code)

set -uo pipefail
cd "$(dirname "$0")/.."

MDX="web/app/path-roomtemp/page.mdx"
COMPONENTS_DIR="web/app/components"
BOM="cad/path-2-room-temp/bom.yaml"
PARAMS="cad/path-2-room-temp/parameters.py"
COUNT=0

# Helper: increment counter and print finding
inc() { COUNT=$((COUNT + 1)); echo "  [$COUNT] $1"; }

echo "=== CAD ↔ MDX Consistency Check ==="

# --- 1. Pin count: CAD says 12-pin, MDX should NOT say 14핀 ---
if grep -q '14핀' "$MDX" 2>/dev/null; then
  inc "MDX says '14핀' — CAD defines 12-pin (FT_PIN_COUNT=12)"
fi

# --- 2. Header body OD: CAD=12.7mm, MDX should NOT say 15.2mm ---
if grep -q '15\.2' "$MDX" 2>/dev/null; then
  inc "MDX references '15.2mm' — CAD defines FT_BODY_OD=12.7mm"
fi

# --- 3. Glass material: CAD=borosilicate, MDX should NOT say 소다라임 ---
if grep -q '소다라임' "$MDX" 2>/dev/null; then
  inc "MDX says '소다라임' — CAD specifies borosilicate (Pyrex)"
fi

# --- 4. Polysulfide removed: MDX should NOT reference 폴리설파이드 ---
if grep -q '폴리설파이드' "$MDX" 2>/dev/null; then
  inc "MDX references '폴리설파이드' — removed in CAD, replaced by Torr Seal outer"
fi

# --- 5. Fill stem: CAD=1/16" Cu capillary, MDX should NOT say OD 5mm 유리 배기관 ---
if grep -q 'OD 5mm' "$MDX" 2>/dev/null; then
  inc "MDX says 'OD 5mm' fill — CAD uses 1/16\" (1.59mm) Cu capillary"
fi

# --- 6. Generic epoxy vs Torr Seal: BOM should name Torr Seal, not just 에폭시 ---
# Check if BOM table in MDX has generic "에폭시" without "Torr Seal" mention nearby
if grep -q '2액형.*경화' "$MDX" 2>/dev/null && ! grep -q 'Torr Seal' "$MDX" 2>/dev/null; then
  inc "MDX BOM uses generic '에폭시' without mentioning Torr Seal"
fi

# --- 7. Envelope OD range: CAD=25.0mm fixed, MDX should NOT say 25-30mm ---
if grep -q '25-30mm' "$MDX" 2>/dev/null; then
  inc "MDX says 'OD 25-30mm' — CAD specifies ENVELOPE_OD=25.0mm exactly"
fi

# --- 8. bom.yaml internal cost consistency ---
if [ -f "$BOM" ]; then
  TOTAL_LINE=$(grep 'total_cost_krw_estimate' "$BOM" 2>/dev/null || true)
  if echo "$TOTAL_LINE" | grep -q '211500'; then
    # Check if notes conflict
    if grep -q '151,500' "$BOM" 2>/dev/null; then
      inc "bom.yaml: total_cost says 211500 but notes say 151,500 — internal conflict"
    fi
  fi
fi

# --- 9. MDX BOM missing critical items from bom.yaml ---
# Check for sight_glass mention
if ! grep -qi 'sight.glass\|관찰창.*16mm\|사파이어.*16' "$MDX" 2>/dev/null; then
  inc "MDX BOM missing sight glass (16mm window) — present in bom.yaml"
fi

# Check for fill_stem / Cu capillary mention in BOM table area
if ! grep -qi 'fill.stem\|캐필러리\|1/16.*구리\|Cu.*capillary' "$MDX" 2>/dev/null; then
  inc "MDX BOM missing fill stem (1/16\" Cu capillary) — present in bom.yaml"
fi

# Check for Torr Seal in BOM table (extract from ## BOM to next ## heading)
BOM_TABLE=$(sed -n '/## BOM/,/^## /p' "$MDX" 2>/dev/null || true)
if [ -n "$BOM_TABLE" ] && ! echo "$BOM_TABLE" | grep -qi 'Torr.Seal'; then
  inc "MDX BOM table missing Torr Seal entry — critical seal material in bom.yaml"
fi

# Check for butyl tape in BOM
if [ -n "$BOM_TABLE" ] && ! echo "$BOM_TABLE" | grep -qi 'butyl\|부틸'; then
  inc "MDX BOM table missing butyl tape entry"
fi

# --- 10. Step text references 14핀 (broader check in components) ---
COMP_14PIN=$(grep -rl '14핀\|14-pin\|14pin' "$COMPONENTS_DIR"/*.tsx 2>/dev/null | wc -l | tr -d ' ')
if [ "$COMP_14PIN" -gt 0 ]; then
  inc "Components reference '14핀/14-pin' ($COMP_14PIN files) — should be 12"
fi

# --- 11. GoNoGo/process text references polysulfide ---
if grep -q '폴리설파이드.*경화\|polysulfide' "$MDX" 2>/dev/null; then
  inc "MDX GoNoGo/process text references polysulfide curing — should be Torr Seal"
fi

# --- 12. Composite seal description accuracy ---
# CAD: butyl inner (4mm) + Torr Seal outer (3mm) = 7mm total
# MDX should describe this composite, not just polysulfide
if ! grep -q 'butyl.*Torr Seal\|부틸.*Torr Seal\|복합.*실\|composite.*seal' "$MDX" 2>/dev/null; then
  inc "MDX missing composite seal description (butyl inner + Torr Seal outer)"
fi

echo ""
echo "INCONSISTENCIES=$COUNT"
exit 0
