#!/usr/bin/env bash
# scripts/harness/doc-progress.sh — ASCII dashboard for 5-page docs-loop.
#
# 4 sections, matching user spec:
#   (1) ITERATION PROGRESS — global iter 0..MAX progress bar with status marks
#   (2) PER-PAGE M7        — each page's current SUM with bar chart + floor
#   (3) ACTIVE tmux WORKERS — tmux list-windows view, running/idle per page
#   (4) STUCK heuristic    — detect 3+ consecutive discards and warn
#
# Output goes to stdout so a cron job fires the prompt that `cat`s this
# script's output into the Claude conversation.

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOOPS="$ROOT/loops"
PAGES=(overview constitution flow wiki catalog)
MAX_ITER="${DOCS_MAX_ITER:-20}"
TMUX_SESSION="${DOCS_TMUX_SESSION:-harness-docs-loop}"
FLOOR_THRESHOLD=48      # page SUM threshold = "floor" per user's dashboard

ts() { date +"%Y-%m-%d %H:%M" ; }

# Global iter — max of per-page iter count.
global_iter=0
for slug in "${PAGES[@]}"; do
    r="$LOOPS/docs-$slug/results.tsv"
    if [ -f "$r" ]; then
        it=$(awk -F'\t' 'NF>=1 && $1 !~ /^#/ && $1 != "iteration"' "$r" | tail -1 | cut -f1)
        it=${it:-0}
        [ "$it" -gt "$global_iter" ] && global_iter=$it
    fi
done

# Overall SUM floor (min across pages)
floor_page=""
floor_sum=0
for slug in "${PAGES[@]}"; do
    r="$LOOPS/docs-$slug/results.tsv"
    v=0
    if [ -f "$r" ]; then
        v=$(awk -F'\t' 'NF>=3 && $3 !~ /^#/ && $3 != "metric" && $3 != "-" && $3 != "—" {x=$3} END{print x+0}' "$r")
    fi
    if [ -z "$floor_page" ] || awk "BEGIN{exit !($v < $floor_sum)}"; then
        floor_sum=$v
        floor_page=$slug
    fi
done

# --- HEADER ---
echo "╔══════════════════════════════════════════════════════════════════════╗"
printf "║  DOCS-LOOP-V5 · iter%d mid-flight · %s+                 ║\n" "$global_iter" "$(ts)"
echo "╠══════════════════════════════════════════════════════════════════════╣"

# --- SECTION 1: ITERATION PROGRESS ---
echo "║ (1) ITERATION PROGRESS                                               ║"
echo "║                                                                      ║"

# Aggregate status per iter from all pages' TSVs. A given iter is:
#   - baseline if iter==0
#   - ✗ discard if ALL page logs for that iter are discard
#   - ░ partial if at least one page still iterating at that iter
#   - ■ keep  if at least one page kept that iter
for it in $(seq 0 "$MAX_ITER"); do
    mark="·"
    min_v=999
    max_v=0
    all_discard=1
    any_keep=0
    any_running=0
    count_done=0
    count_pages=5
    for slug in "${PAGES[@]}"; do
        r="$LOOPS/docs-$slug/results.tsv"
        if [ ! -f "$r" ]; then continue; fi
        row=$(awk -F'\t' -v IT="$it" '$1==IT' "$r" 2>/dev/null)
        if [ -z "$row" ]; then
            # still pending for this iter
            [ "$it" -le "$global_iter" ] && any_running=1
            all_discard=0
            continue
        fi
        count_done=$((count_done + 1))
        status=$(echo "$row" | cut -f6)
        val=$(echo "$row" | cut -f3)
        val_num=${val//—/0}; val_num=${val_num//-/0}
        case "$status" in
            baseline) mark="■" ; min_v=$val_num ;;
            keep*)    any_keep=1 ; all_discard=0 ;;
            discard*) : ;;
            *) all_discard=0 ;;
        esac
    done
    if [ "$it" -eq 0 ]; then
        printf "║  iter %2d ■ baseline            min=%s  floor=%s  gap=%s║\n" "$it" \
            "$(printf '%-5.2f' "$floor_sum")" \
            "$(printf '%-5.2f' "$FLOOR_THRESHOLD")" \
            "$(printf '%-6.2f' "$(awk "BEGIN{print $floor_sum - $FLOOR_THRESHOLD}")")"
    elif [ "$it" -le "$global_iter" ]; then
        if [ "$any_running" -eq 1 ]; then
            printf "║  iter %2d ░ %d/%d done, %d still running                             ║\n" "$it" "$count_done" "$count_pages" $((count_pages - count_done))
        elif [ "$any_keep" -eq 1 ]; then
            printf "║  iter %2d ■ kept                                                    ║\n" "$it"
        elif [ "$all_discard" -eq 1 ]; then
            printf "║  iter %2d ✗ discard-guard       gap=%s                       ║\n" "$it" "$(printf '%-6.2f' "$(awk "BEGIN{print $floor_sum - $FLOOR_THRESHOLD}")")"
        else
            printf "║  iter %2d · mixed                                                    ║\n" "$it"
        fi
    elif [ "$it" -le 4 ] || [ "$it" -ge $((MAX_ITER - 1)) ]; then
        # show a few placeholder rows plus ellipsis
        printf "║  iter %2d ·                                                          ║\n" "$it"
    elif [ "$it" -eq 5 ]; then
        echo "║  ...                                                                 ║"
    fi
done
echo "║                                                                      ║"

# Progress summary
committed=$(git -C "$ROOT" log --oneline --grep='^experiment(docs)' 2>/dev/null | wc -l | tr -d ' ')
discarded=$(grep -h 'discard' "$LOOPS"/docs-*/results.tsv 2>/dev/null | wc -l | tr -d ' ')
printf "║  committed iters: %d/%d        %d/%d completed iters discarded          ║\n" "$committed" "$MAX_ITER" "$discarded" "$discarded"

# Bar: ■=kept ✗=discard ░=running ·=pending
bar=""
for it in $(seq 0 "$MAX_ITER"); do
    if [ "$it" -eq 0 ]; then bar="${bar}■"; continue; fi
    if [ "$it" -gt "$global_iter" ]; then bar="${bar}·"; continue; fi
    # Aggregate: any keep=■, all discard=✗, running=░
    any_keep=0; all_disc=1; running=0
    for slug in "${PAGES[@]}"; do
        r="$LOOPS/docs-$slug/results.tsv"; [ -f "$r" ] || continue
        row=$(awk -F'\t' -v IT="$it" '$1==IT' "$r" 2>/dev/null)
        [ -z "$row" ] && { running=1; all_disc=0; continue; }
        s=$(echo "$row" | cut -f6)
        [[ "$s" == keep* ]] && any_keep=1 && all_disc=0
        [[ "$s" != keep* && "$s" != discard* ]] && all_disc=0
    done
    if [ "$any_keep" -eq 1 ]; then bar="${bar}■"
    elif [ "$running" -eq 1 ]; then bar="${bar}░"
    elif [ "$all_disc" -eq 1 ]; then bar="${bar}✗"
    else bar="${bar}·"; fi
done
printf "║  progress: [%s] %s/%d                             ║\n" "$bar" "$global_iter.5" "$((MAX_ITER + 1))"
echo "╠══════════════════════════════════════════════════════════════════════╣"

# --- SECTION 2: PER-PAGE M7 ---
printf "║ (2) PER-PAGE SUM — floor = %s @ %s ▼ (threshold %s)          ║\n" "$floor_page" "$(printf '%.2f' "$floor_sum")" "$FLOOR_THRESHOLD"
printf "║  (scale 0 ─────────────── %s ─── 60)                              ║\n" "$FLOOR_THRESHOLD"
echo "║                                                                      ║"

# Render a 30-char wide bar for each page, scaled to 60 (max SUM).
render_bar() {
    local val="$1"
    local width=30
    local fill=$(awk "BEGIN{print int($val / 60.0 * $width)}")
    [ "$fill" -lt 0 ] && fill=0
    [ "$fill" -gt "$width" ] && fill="$width"
    # Position of floor marker within the 30-char scale
    local floor_pos=$(awk "BEGIN{print int($FLOOR_THRESHOLD / 60.0 * $width)}")
    local out=""
    for i in $(seq 0 $((width - 1))); do
        if [ "$i" -eq "$floor_pos" ]; then
            if [ "$i" -lt "$fill" ]; then out="${out}█"; else out="${out}▼"; fi
        elif [ "$i" -lt "$fill" ]; then
            out="${out}█"
        else
            out="${out}░"
        fi
    done
    echo "$out"
}

for slug in "${PAGES[@]}"; do
    r="$LOOPS/docs-$slug/results.tsv"
    val=0
    fail_count=0
    if [ -f "$r" ]; then
        val=$(awk -F'\t' 'NF>=3 && $3 !~ /^#/ && $3 != "metric" && $3 != "-" && $3 != "—" {x=$3} END{print x+0}' "$r")
        fail_count=$(awk -F'\t' '/discard/' "$r" 2>/dev/null | wc -l | tr -d ' ')
    fi
    bar=$(render_bar "$val")
    label=$(printf '%-18s' "$slug")
    val_fmt=$(printf '%-6.2f' "$val")
    fail_tag=""
    if [ "$fail_count" -gt 0 ]; then
        fail_tag="  ✗x${fail_count}"
    fi
    printf "║  %s  %s  %s%s║\n" "$label" "$val_fmt" "$bar" "$(printf '%-6s' "$fail_tag")"
done
echo "║                                                                      ║"

# Worst page and gap
worst_gap=$(awk "BEGIN{print $floor_sum - $FLOOR_THRESHOLD}")
printf "║  worst = %s (%.2f)   gap = %-6.2f   target = %d                  ║\n" "$floor_page" "$floor_sum" "$worst_gap" "$FLOOR_THRESHOLD"
echo "╠══════════════════════════════════════════════════════════════════════╣"

# --- SECTION 3: ACTIVE tmux WORKERS ---
printf "║ (3) ACTIVE tmux WORKERS (iter%d, session: %s)                  ║\n" "$global_iter" "$TMUX_SESSION"
echo "║                                                                      ║"
if tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    while IFS= read -r line; do
        w=$(echo "$line" | awk '{print $1}' | tr -d ':')
        idx=$(echo "$line" | awk '{print $2}')
        status=$(echo "$line" | awk '{print $3}')
        panes=$(tmux list-panes -t "${TMUX_SESSION}:${w}" 2>/dev/null | wc -l | tr -d ' ')
        pane_note=""
        [ "$panes" -gt 1 ] && pane_note=" ($panes panes)"
        printf "║   ⟳ w-%-18s  @%2s  running%s║\n" "$w" "$idx" "$(printf '%-30s' "$pane_note")"
    done < <(tmux list-windows -t "$TMUX_SESSION" -F "#{window_name} #{window_index} #{window_activity_flag}" 2>/dev/null)
else
    echo "║   (tmux session '$TMUX_SESSION' not running)                             ║"
fi
echo "║                                                                      ║"
done_this_iter=0
for slug in "${PAGES[@]}"; do
    r="$LOOPS/docs-$slug/results.tsv"
    [ -f "$r" ] || continue
    awk -F'\t' -v IT="$global_iter" '$1==IT' "$r" | grep -q . && done_this_iter=$((done_this_iter + 1))
done
HEAD_SHORT=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo "—")
printf "║   iter%d .done count: %d/%d    HEAD=%s                               ║\n" "$global_iter" "$done_this_iter" "5" "$HEAD_SHORT"
echo "╠══════════════════════════════════════════════════════════════════════╣"

# --- SECTION 4: STUCK heuristic ---
stuck_lines=""
for slug in "${PAGES[@]}"; do
    r="$LOOPS/docs-$slug/results.tsv"
    [ -f "$r" ] || continue
    last3=$(tail -3 "$r" | awk -F'\t' '{print $6}' | sort -u | tr '\n' ',' | sed 's/,$//')
    case "$last3" in
        discard|discard-guard)
            stuck_lines="${stuck_lines}${slug} "
            ;;
    esac
done
if [ -n "$stuck_lines" ]; then
    est=$((($MAX_ITER - $global_iter) * 8))
    echo "║ STUCK  Pages stuck (3+ consecutive discards): ${stuck_lines}"
    echo "║        Estimated remaining wasted cycles: ~$((MAX_ITER - global_iter)) × ≈8 min = ≈${est} min  ║"
    echo "║        before max_iterations cap. Reporting only per HITL rule.      ║"
else
    echo "║ STATE  No page is stuck (no 3+ consecutive discards). Progressing.   ║"
fi
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
NEXT_TS=$(date -v +10M +"%H:%M" 2>/dev/null || date -d "+10 min" +"%H:%M" 2>/dev/null || echo "next cron")
echo "다음 보고는 10분 후 ($NEXT_TS)."
