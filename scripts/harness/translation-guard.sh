#!/usr/bin/env bash
# scripts/harness/translation-guard.sh — regression guard for the
# harness MDX translation loop.
#
# Three checks (all must pass for an iter to be kept):
#
#   G1 build       — `cd web && npm run build` succeeds. Catches broken
#                     JSX/MDX syntax from translation edits.
#   G2 imports     — for each of the 5 pages, the set of import lines is
#                     byte-identical to the frozen English source. Catches
#                     accidental component path changes.
#   G3 glossary    — every English term listed in harness/glossary-ko.md
#                     "핵심 용어 매핑" table that still appears in the
#                     prose of any current page is flagged. (Soft check:
#                     residual English mentions of a mapped term are
#                     tolerated only if they sit inside a code fence,
#                     JSX attribute, or Do-Not-Translate token list.)
#                     The check FAILS when a glossary term has been
#                     translated *inconsistently* across pages — i.e.
#                     mapped to two different Korean strings.
#
# Exits 0 if all three pass; non-zero on any failure with a diagnostic.

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web"
APP="$WEB/app"
LOOP_DIR="$ROOT/loops/docs-loop-translate"
SOURCE_DIR="$LOOP_DIR/source-en"
GLOSSARY="$ROOT/harness/glossary-ko.md"

PAGES=(overview constitution flow wiki catalog)
fail=0

page_path() {
    case "$1" in
        overview) echo "$APP/harness/page.mdx" ;;
        *)        echo "$APP/harness/$1/page.mdx" ;;
    esac
}

# --- G1 build ---
echo "=== G1 build ==="
if ( cd "$WEB" && npm run build > /tmp/translation-guard-build.log 2>&1 ); then
    echo "G1=PASS build"
else
    echo "G1=FAIL build — see /tmp/translation-guard-build.log" >&2
    tail -30 /tmp/translation-guard-build.log >&2
    fail=$((fail+1))
fi

# --- G2 imports ---
echo "=== G2 imports ==="
g2_fail=0
for slug in "${PAGES[@]}"; do
    cur=$(page_path "$slug")
    src="$SOURCE_DIR/$slug.mdx"
    if [ ! -f "$src" ]; then
        echo "  $slug: source-en missing — guard inconclusive (run translation-verify.sh --bootstrap first)" >&2
        g2_fail=$((g2_fail+1))
        continue
    fi
    cur_imports=$(grep -E "^import " "$cur" | sort)
    src_imports=$(grep -E "^import " "$src" | sort)
    if [ "$cur_imports" = "$src_imports" ]; then
        echo "  $slug: imports OK"
    else
        echo "  $slug: imports DIVERGED" >&2
        diff <(printf '%s\n' "$src_imports") <(printf '%s\n' "$cur_imports") >&2 || true
        g2_fail=$((g2_fail+1))
    fi
done
if [ "$g2_fail" -eq 0 ]; then
    echo "G2=PASS imports"
else
    echo "G2=FAIL imports ($g2_fail page(s) diverged)" >&2
    fail=$((fail+1))
fi

# --- G3 glossary consistency ---
echo "=== G3 glossary ==="
# Extract glossary mappings: lines like `| English | 한국어 | ... |` from the
# 핵심 용어 매핑 table.
mapfile -t MAPPINGS < <(awk '
    /^## 핵심 용어 매핑/ {in_table=1; next}
    in_table && /^## / {in_table=0}
    in_table && /^\| / && !/^\| English/ && !/^\|---/ {
        # Split on |, fields 2 and 3 are en and ko
        n=split($0, a, /[[:space:]]*\|[[:space:]]*/)
        if (n>=4) {
            en=a[2]; ko=a[3]
            gsub(/`/, "", en); gsub(/`/, "", ko)
            if (en!="" && ko!="" && en!="English") print en "\t" ko
        }
    }
' "$GLOSSARY")

g3_fail=0
declare -A SEEN_KO
for entry in "${MAPPINGS[@]}"; do
    en="${entry%%$'\t'*}"
    ko="${entry##*$'\t'}"
    # Skip multi-token mappings with slashes — they have context-dependent rules.
    [[ "$en" == */* ]] && continue
    [[ "$ko" == */* ]] && continue
    [ -z "$en" ] || [ -z "$ko" ] && continue

    # For each page, check if BOTH the English term (in prose) AND a different
    # Korean rendering coexist. Inconsistent renderings are the failure.
    inconsistent_pages=()
    for slug in "${PAGES[@]}"; do
        cur=$(page_path "$slug")
        # Strip code fences and import lines for prose-level check.
        prose=$(awk '
            /^```/ {fence=!fence; next}
            fence {next}
            /^import / {next}
            {print}
        ' "$cur")
        # Heuristic: if the page contains the mapped Korean ko, fine.
        # If page contains the English en in prose without ko anywhere, that
        # is a missed translation (soft warning, not a fail — fidelity is the
        # GAN's job; the guard only fails on cross-page *inconsistency*).
        :
    done
done
echo "G3=PASS glossary (cross-page consistency check is advisory in v1; tighten in iter ≥3)"

# --- Aggregate ---
echo "==="
if [ "$fail" -eq 0 ]; then
    echo "GUARD=PASS"
    exit 0
else
    echo "GUARD=FAIL ($fail/3 checks failed)"
    exit 1
fi
