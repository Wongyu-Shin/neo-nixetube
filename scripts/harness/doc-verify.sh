#!/usr/bin/env bash
# scripts/harness/doc-verify.sh — Per-page 5-threshold quality gate.
#
# For each of 5 harness docs pages, checks:
#   (a) page SUM ≥ 48/60              — from latest row of loops/docs-<slug>/results.tsv
#   (b) unique component count ≥ 15   — counted from the MDX file
#   (c) gold-tier interactive vizqty ≥ 3 — counted as components importing from a list
#                                           of "rich" component files (≥400 line tsx with
#                                           ≥1 useState and ≥30 SVG primitives)
#   (d) chrome render                 — loops/docs-<slug>/chrome-render-pass flag file
#   (e) e2e pass                      — loops/docs-<slug>/e2e-pass flag file
#
# Emits DOCS_READY=N on stdout (0..5). Higher is better.
# Exits 0 always (the metric number carries success info).
#
# Per-page threshold file at loops/docs-<slug>/thresholds.txt records each of
# the 5 gates (PASS / FAIL) so doc-progress.sh can display them.

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web"
LOOPS="$ROOT/loops"

PAGES=(overview constitution flow wiki catalog)
# Map slug -> MDX path
mdx_path() {
    case "$1" in
        overview)     echo "$WEB/app/harness/page.mdx" ;;
        constitution) echo "$WEB/app/harness/constitution/page.mdx" ;;
        flow)         echo "$WEB/app/harness/flow/page.mdx" ;;
        wiki)         echo "$WEB/app/harness/wiki/page.mdx" ;;
        catalog)      echo "$WEB/app/harness/catalog/page.mdx" ;;
    esac
}

SUM_THRESHOLD=48
COMP_THRESHOLD=15
VIZ_THRESHOLD=3

# A component is "gold-tier" if its source file satisfies:
#   - lines >= 400
#   - contains at least one useState or useReducer
#   - contains >= 30 SVG primitives (path|circle|rect|line|g|defs|gradient)
is_gold_tier() {
    local tsx="$1"
    [ -f "$tsx" ] || return 1
    local lines; lines=$(wc -l < "$tsx" | tr -d ' ')
    [ "$lines" -ge 400 ] || return 1
    grep -qE 'useState|useReducer' "$tsx" || return 1
    local prim; prim=$(grep -cE '<(path|circle|rect|line|g|defs|linearGradient|radialGradient|filter|polygon|polyline|ellipse|text) ' "$tsx")
    [ "$prim" -ge 30 ] || return 1
    return 0
}

total_ready=0
for slug in "${PAGES[@]}"; do
    page="$(mdx_path "$slug")"
    results="$LOOPS/docs-$slug/results.tsv"
    thresh_file="$LOOPS/docs-$slug/thresholds.txt"
    mkdir -p "$LOOPS/docs-$slug"
    : > "$thresh_file"

    # (a) SUM
    sum_pass=0
    sum_val="—"
    if [ -f "$results" ]; then
        sum_val=$(awk -F'\t' 'NF>=3 && $3 !~ /^#/ && $3 != "metric" {v=$3} END{print v+0}' "$results")
        if awk "BEGIN{exit !(${sum_val:-0} >= $SUM_THRESHOLD)}"; then sum_pass=1; fi
    fi
    echo "SUM=$sum_val pass=$sum_pass threshold=$SUM_THRESHOLD" >> "$thresh_file"

    # (b) unique component count
    comp_pass=0
    comp_val=0
    if [ -f "$page" ]; then
        comp_val=$(grep -oE '<[A-Z][A-Za-z0-9]+' "$page" | sort -u | wc -l | tr -d ' ')
        [ "$comp_val" -ge "$COMP_THRESHOLD" ] && comp_pass=1
    fi
    echo "COMP=$comp_val pass=$comp_pass threshold=$COMP_THRESHOLD" >> "$thresh_file"

    # (c) gold-tier viz
    viz_pass=0
    viz_val=0
    if [ -f "$page" ]; then
        # Look for imports that reference TSX components — bash 3.2 compat.
        comp_list=$(grep -oE "from '[^']*components/[A-Z][A-Za-z0-9]+'" "$page" 2>/dev/null | sed -E "s#.*components/([A-Za-z0-9]+).*#\1#" | sort -u)
        while IFS= read -r c; do
            [ -z "$c" ] && continue
            tsx="$WEB/app/components/$c.tsx"
            [ -f "$WEB/app/components/harness/$c.tsx" ] && tsx="$WEB/app/components/harness/$c.tsx"
            if is_gold_tier "$tsx"; then
                viz_val=$((viz_val + 1))
            fi
        done <<< "$comp_list"
        [ "$viz_val" -ge "$VIZ_THRESHOLD" ] && viz_pass=1
    fi
    echo "VIZ=$viz_val pass=$viz_pass threshold=$VIZ_THRESHOLD" >> "$thresh_file"

    # (d) chrome render
    chrome_pass=0
    [ -f "$LOOPS/docs-$slug/chrome-render-pass" ] && chrome_pass=1
    echo "CHROME=$chrome_pass" >> "$thresh_file"

    # (e) e2e
    e2e_pass=0
    [ -f "$LOOPS/docs-$slug/e2e-pass" ] && e2e_pass=1
    echo "E2E=$e2e_pass" >> "$thresh_file"

    # Page is ready iff all 5 gates pass.
    all_pass=$((sum_pass + comp_pass + viz_pass + chrome_pass + e2e_pass))
    if [ "$all_pass" -eq 5 ]; then
        total_ready=$((total_ready + 1))
        echo "READY=1" >> "$thresh_file"
    else
        echo "READY=0 gates_pass=$all_pass/5" >> "$thresh_file"
    fi
done

echo "DOCS_READY=$total_ready"
echo "DETAIL pages=5 ready=$total_ready thresholds_at=$LOOPS/docs-<slug>/thresholds.txt"
exit 0
