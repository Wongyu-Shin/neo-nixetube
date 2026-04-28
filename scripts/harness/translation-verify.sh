#!/usr/bin/env bash
# scripts/harness/translation-verify.sh — orchestrator for the harness MDX
# English → Korean translation loop.
#
# Responsibilities:
#   1. On first run, freeze the current English MDX as the fidelity source
#      (loops/docs-loop-translate/source-en/<slug>.mdx). The frozen source is
#      the ground truth for T2 fidelity scoring across the rest of the loop.
#   2. Invoke scripts/harness/page-translate-verify.sh for each of the 5 pages
#      and collect raw SUMs.
#   3. Apply RATCHET MAX (per memory: feedback_gan_noise_handling.md):
#      ratcheted_sum = max(prev_ratcheted_sum, raw_sum) per page. Never weaken.
#   4. Emit PROGRESS = sum(ratcheted) / 300 * 100 (one decimal, 0..100).
#
# Output (last line, parsed by autoresearch):
#   PROGRESS=NN.N
#
# Exits 0 always so autoresearch can read PROGRESS even on partial failure.
# Failure of an individual page is recorded as that page's raw SUM=0 (which
# the ratchet rejects, so previous ratcheted score sticks).
#
# Flags:
#   --bootstrap     freeze source-en/ from the current MDX state and exit 0
#                   without running GAN. Use ONCE before translation begins.
#   --pages a,b,c   only run a subset of pages (default: all 5)
#   --dry           skip GAN, just print current ratcheted PROGRESS and exit

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web/app"
LOOP_DIR="$ROOT/loops/docs-loop-translate"
SOURCE_DIR="$LOOP_DIR/source-en"
RATCHET_FILE="$LOOP_DIR/ratchet.txt"
mkdir -p "$LOOP_DIR" "$SOURCE_DIR"

PAGES=(overview constitution flow wiki catalog)
MODE=run

for arg in "$@"; do
    case "$arg" in
        --bootstrap) MODE=bootstrap ;;
        --dry)       MODE=dry ;;
        --pages=*)   IFS=',' read -r -a PAGES <<< "${arg#--pages=}" ;;
        *) echo "unknown arg: $arg" >&2; exit 2 ;;
    esac
done

page_path() {
    case "$1" in
        overview) echo "$WEB/harness/page.mdx" ;;
        *)        echo "$WEB/harness/$1/page.mdx" ;;
    esac
}

# --- Bootstrap: freeze current English MDX as fidelity source ---
if [ "$MODE" = "bootstrap" ]; then
    echo "BOOTSTRAP: freezing current MDX as English source-en/"
    for slug in "${PAGES[@]}"; do
        src=$(page_path "$slug")
        dst="$SOURCE_DIR/$slug.mdx"
        if [ -f "$dst" ]; then
            echo "  $slug: source already frozen ($dst) — skip"
        else
            cp "$src" "$dst"
            echo "  $slug: $(wc -l < "$dst" | tr -d ' ') lines frozen"
        fi
    done
    : > "$RATCHET_FILE"
    for slug in "${PAGES[@]}"; do
        echo "$slug 0" >> "$RATCHET_FILE"
    done
    echo "BOOTSTRAP DONE. Initial ratchet = 0 for all pages."
    echo "PROGRESS=0.0"
    exit 0
fi

# Sanity: source must be frozen before run/dry mode.
for slug in "${PAGES[@]}"; do
    if [ ! -f "$SOURCE_DIR/$slug.mdx" ]; then
        echo "ERROR: source-en/$slug.mdx missing. Run with --bootstrap first." >&2
        exit 2
    fi
done
[ -f "$RATCHET_FILE" ] || { echo "ERROR: $RATCHET_FILE missing — re-bootstrap" >&2; exit 2; }

read_ratchet() {
    local slug="$1"
    awk -v s="$slug" '$1==s {print $2; found=1} END{if(!found) print 0}' "$RATCHET_FILE"
}

write_ratchet() {
    local slug="$1" val="$2" tmp
    tmp=$(mktemp)
    awk -v s="$slug" -v v="$val" '
        $1==s {print s, v; updated=1; next}
        {print}
        END { if (!updated) print s, v }
    ' "$RATCHET_FILE" > "$tmp"
    mv "$tmp" "$RATCHET_FILE"
}

# --- Dry: just print current ratcheted PROGRESS ---
if [ "$MODE" = "dry" ]; then
    total=0
    for slug in "${PAGES[@]}"; do
        v=$(read_ratchet "$slug")
        total=$(awk -v t="$total" -v v="$v" 'BEGIN{print t+v}')
        echo "DRY $slug ratcheted_sum=$v"
    done
    progress=$(awk -v t="$total" 'BEGIN{printf "%.1f", t/300*100}')
    echo "PROGRESS=$progress"
    exit 0
fi

# --- Run: invoke GAN per page, apply ratchet MAX ---
total=0
for slug in "${PAGES[@]}"; do
    echo "=== translate-verify $slug ==="
    raw=$(bash "$ROOT/scripts/harness/page-translate-verify.sh" "$slug" 2>&1 | tail -1 | tr -d '[:space:]')
    if ! [[ "$raw" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
        echo "WARN: $slug produced unparseable SUM='$raw' — treating as 0" >&2
        raw=0
    fi
    prev=$(read_ratchet "$slug")
    # ratchet MAX: keep the larger of (prev, raw). Never weaken.
    if awk -v p="$prev" -v r="$raw" 'BEGIN{exit !(r>p)}'; then
        write_ratchet "$slug" "$raw"
        echo "  $slug: raw=$raw > prev=$prev → RATCHET UP"
        eff=$raw
    else
        echo "  $slug: raw=$raw ≤ prev=$prev → keep $prev (anchor sticky)"
        eff=$prev
    fi
    total=$(awk -v t="$total" -v v="$eff" 'BEGIN{print t+v}')
done

progress=$(awk -v t="$total" 'BEGIN{printf "%.1f", t/300*100}')
echo "PROGRESS=$progress"
exit 0
