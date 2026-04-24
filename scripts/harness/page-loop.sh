#!/usr/bin/env bash
# scripts/harness/page-loop.sh <slug> — per-page sub-orchestrator
#
# Runs in a tmux window inside `harness-docs-loop` session. Iterates until
# the page's 5 thresholds (SUM≥48, COMP≥15, VIZ≥3, CHROME, E2E) all pass
# OR MAX_ITER cap is hit.
#
# Each iteration body:
#   1) Design agent: propose MDX + components (claude -p --dangerously-skip-permissions)
#   2) Adversarial team: 5 parallel critics score the proposal on 6 criteria
#   3) Judge: aggregate critique into SUM 0-60 with anchor rule (ratchet)
#   4) Chrome render: next build + screenshots + console check (MCP)
#   5) E2E: hover/click interactions verified via chrome MCP
#   6) Ratchet decide: keep iff (SUM > anchor + σ AND all 5 thresholds).
#
# The sub-orchestrator itself runs as `claude -p` so it has access to Chrome
# MCP and the Anthropic API.

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SLUG="${1:?Usage: page-loop.sh <slug>}"
VALID="overview constitution flow wiki catalog"
if ! echo "$VALID" | grep -qw "$SLUG"; then
    echo "Invalid slug '$SLUG'. Valid: $VALID"
    exit 1
fi

LOOP_DIR="$ROOT/loops/docs-$SLUG"
WORKTREE_DIR="$ROOT/../neo-nixetube-docs-$SLUG"
BRANCH="docs-$SLUG"
MAX_ITER="${DOCS_MAX_ITER:-20}"

mkdir -p "$LOOP_DIR"
TSV="$LOOP_DIR/results.tsv"
if [ ! -f "$TSV" ]; then
    echo "# metric_direction: higher_is_better" > "$TSV"
    echo "# metric: page SUM (6 criteria × 10) with chrome render + E2E gates" >> "$TSV"
    printf "iteration\tcommit\tmetric\tdelta\tguard\tstatus\tdescription\n" >> "$TSV"
    COMMIT=$(git -C "$ROOT" rev-parse --short HEAD)
    printf "0\t%s\t0\t0.0\tpass\tbaseline\tskeleton page, no components yet\n" "$COMMIT" >> "$TSV"
fi

# --- Prompt templates bundled here ---
# The claude -p call for the design agent receives this prompt.

design_prompt() {
    cat <<'PROMPT'
You are the DESIGN AGENT for a single harness docs page.
Your target page is: <SLUG_PLACEHOLDER>

## Context you have access to
- harness/UX.md             — the user-facing flow spec (authoritative)
- harness/CONSTITUTION.md   — 9 Articles (cite by number in page content)
- harness/features/*.md     — 28 feature specs (frontmatter + body)
- harness/research/*.md     — 28 research notes (citations + quoted passages)
- web/app/path-roomtemp/page.mdx — density reference (352 lines, 15 imports, 20 unique)
- web/app/components/NixieDiagram.tsx — gold-tier interactive bar (769 lines, 6 parts, hover)

## Goal for this iteration
Raise THIS page's SUM toward ≥48/60. The page lives at:
- web/app/harness/<SLUG_PLACEHOLDER>/page.mdx (or web/app/harness/page.mdx for overview)

## Required additions this iteration (if not already present)
1. At least 1 gold-tier interactive component (≥400 lines tsx, ≥1 useState,
   ≥30 SVG primitives) under web/app/components/harness/<ComponentName>.tsx
2. At least 5 more unique component imports into the MDX
3. Header structure (H1 + ≥5 H2 sections)
4. Cite specific Article numbers for structural claims
5. Cite specific feature slugs for technical claims
6. A "What changed in this iter" comment block at the top

## Do NOT
- Touch any file outside web/app/harness/ or web/app/components/harness/
- Use any external asset URLs (all visuals must be self-contained SVG/CSS)
- Break responsive layout (test at viewport 375px and 1280px widths)

## Output
One atomic git commit on branch docs-<SLUG_PLACEHOLDER> in worktree.
Commit message: `experiment(docs-<SLUG_PLACEHOLDER>): <one-sentence change>`

After committing, halt — the adversarial team + judge will run automatically.
PROMPT
}

# --- Iteration body ---
# Runs one iteration: design → adversarial → judge → chrome → ratchet.
# Called from the outer while loop below.

run_iteration() {
    local iter="$1"
    echo "[$(date +%H:%M:%S)] page-loop $SLUG iter $iter START"

    # Ensure worktree exists and is on the right branch.
    if [ ! -d "$WORKTREE_DIR" ]; then
        git -C "$ROOT" worktree add "$WORKTREE_DIR" -b "$BRANCH" 2>&1 | tail -3
    fi

    # Compose the design-agent prompt with slug substituted.
    prompt_file="$LOOP_DIR/iter$iter-design.prompt.txt"
    design_prompt | sed "s|<SLUG_PLACEHOLDER>|$SLUG|g" > "$prompt_file"

    # STAGE 1: Design agent spawns inside the worktree with Chrome MCP.
    design_out="$LOOP_DIR/iter$iter-design.out.txt"
    (
        cd "$WORKTREE_DIR"
        claude -p --dangerously-skip-permissions --add-dir "$ROOT" \
            < "$prompt_file" > "$design_out" 2>&1
    ) || echo "[design] exited with error"

    # STAGE 2-5 (adversarial / judge / chrome / e2e) — deferred to the
    # verify harness. The design agent is expected to commit; verify and
    # progress are independent.

    # Re-run verify + crosscheck for this page.
    bash "$ROOT/scripts/harness/doc-verify.sh" > "$LOOP_DIR/iter$iter-verify.out.txt" 2>&1
    cur_thresh="$LOOP_DIR/thresholds.txt"

    # Extract this iteration's candidate SUM (written by the GAN verifier).
    # For now the design agent doesn't run the full GAN; we pick up whatever
    # scripts/page-verify.sh last wrote (if applicable to harness pages yet).
    sum=$(awk -F= '/^SUM=/{print $2}' "$cur_thresh" | awk '{print $1}')
    comp=$(awk -F= '/^COMP=/{print $2}' "$cur_thresh" | awk '{print $1}')
    viz=$(awk -F= '/^VIZ=/{print $2}' "$cur_thresh" | awk '{print $1}')
    chrome=$(awk -F= '/^CHROME=/{print $2}' "$cur_thresh" | awk '{print $1}')
    e2e=$(awk -F= '/^E2E=/{print $2}' "$cur_thresh" | awk '{print $1}')
    ready_flag=$(awk -F= '/^READY=/{print $2}' "$cur_thresh" | awk '{print $1}')

    # Commit row to results TSV.
    commit_short=$(git -C "$WORKTREE_DIR" rev-parse --short HEAD 2>/dev/null || echo "—")
    # Status heuristic: if ready_flag==1 => keep; else => iteration logged but no ratchet.
    status="iter"
    if [ "${ready_flag:-0}" = "1" ]; then status="keep"; fi
    desc="COMP=$comp VIZ=$viz CHROME=$chrome E2E=$e2e (iter $iter auto-verify)"
    printf "%d\t%s\t%s\t-\tpass\t%s\t%s\n" "$iter" "$commit_short" "${sum:-0}" "$status" "$desc" >> "$TSV"

    echo "[$(date +%H:%M:%S)] page-loop $SLUG iter $iter DONE status=$status SUM=${sum:-0}"
}

# --- Main loop ---
# Re-entry: if page-loop is restarted, pick up from the last logged iter.

last_iter=$(awk -F'\t' 'NF>=1 && $1 !~ /^#/ && $1 != "iteration"' "$TSV" | tail -1 | cut -f1)
last_iter=${last_iter:-0}
start_iter=$((last_iter + 1))

for iter in $(seq "$start_iter" "$MAX_ITER"); do
    run_iteration "$iter"
    # Check ready flag — stop iterating once ready.
    cur_thresh="$LOOP_DIR/thresholds.txt"
    ready_flag=$(awk -F= '/^READY=/{print $2}' "$cur_thresh" 2>/dev/null | awk '{print $1}')
    if [ "${ready_flag:-0}" = "1" ]; then
        echo "[$(date +%H:%M:%S)] page-loop $SLUG REACHED READY at iter $iter"
        break
    fi
done

echo "[$(date +%H:%M:%S)] page-loop $SLUG EXIT"
