#!/usr/bin/env bash
# scripts/resume-quality-verify.sh
# Meta-verify: evaluates whether LOOP_STATE.md enables a cold-start agent
# to resume the CAD autoresearch loop at the same quality level.
#
# Pipeline (2-stage GAN):
#   1. Cold-Start Simulation — spawn a fresh agent with ONLY the resume
#      bundle (LOOP_STATE.md + key files), ask it to plan iter 21.
#   2. Evaluator Judge — score the plan on 7 criteria (0 or 1 each).
#
# Output: last line = score (0-7, higher is better, target 7/7).
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="$PROJECT_ROOT/cad/path-2-room-temp"
WORK=$(mktemp -d -t resumeverify.XXXXXX)
trap "rm -rf '$WORK'" EXIT

# --- Bundle the cold-start context ---
BUNDLE="$WORK/bundle.txt"
{
    echo "=== LOOP_STATE.md ==="
    cat "$SCOPE/LOOP_STATE.md"
    echo
    echo "=== build/prev_scores.txt ==="
    cat "$SCOPE/build/prev_scores.txt" 2>/dev/null || echo "(not found)"
    echo
    echo "=== autoresearch-cad-path2-results.tsv (last 10 lines) ==="
    tail -10 "$PROJECT_ROOT/autoresearch-cad-path2-results.tsv" 2>/dev/null || echo "(not found)"
    echo
    echo "=== git log --oneline -15 ==="
    cd "$PROJECT_ROOT" && git log --oneline -15
    echo
    echo "=== File listing: cad/path-2-room-temp/ ==="
    ls "$SCOPE"/*.py "$SCOPE"/*.yaml "$SCOPE"/*.md 2>/dev/null
} > "$BUNDLE"

BUNDLE_CONTENT=$(cat "$BUNDLE")

# --- Stage 1: Cold-Start Simulation ---
PLAN_OUT="$WORK/plan.txt"
claude --print --model claude-opus-4-6 --dangerously-skip-permissions > "$PLAN_OUT" 2>/dev/null <<PROMPT || true
You are a NEW Claude Code session — you have ZERO prior context about this
project. You are about to resume an autoresearch CAD improvement loop that
a previous session ran for 20 iterations. Your ONLY information is what's
in the bundle below.

Read the bundle carefully, then produce a DETAILED plan for iteration 21.
Your plan must include:
1. What is the current state (SUM, MIN, per-criterion scores)?
2. Which criterion do you target and WHY?
3. What specific code changes will you make (file + line-level)?
4. What anti-patterns will you avoid (cite from LOOP_STATE)?
5. How will you handle the anchor mechanism after this iteration?
6. What CadQuery quirks should you watch out for?
7. What is your strategy for breaking the 3→5 plateau?

Be concrete and specific. Cite file names, parameter values, and commit hashes.

=== COLD-START BUNDLE ===
$BUNDLE_CONTENT
PROMPT

PLAN_CONTENT=$(cat "$PLAN_OUT" 2>/dev/null || echo "(empty)")

# --- Stage 2: Evaluator Judge ---
EVAL_OUT="$WORK/eval.txt"
claude --print --model claude-opus-4-6 --dangerously-skip-permissions > "$EVAL_OUT" 2>/dev/null <<PROMPT || true
You are an EVALUATOR. A cold-start agent was given ONLY a resume bundle
(LOOP_STATE.md + logs + git history) and asked to plan iteration 21 of a
CAD autoresearch loop. Score the plan on these 7 criteria (1 point each):

CRITERIA:
C1_STATE: Does the plan correctly identify current SUM=31, MIN=3, and the
          per-criterion score distribution {C4:5, C7:5, rest:3}?
C2_TARGET: Does the plan choose a sensible target criterion and justify WHY
           (e.g., "C8 has only MINOR issues" or "C1 has a fixable Z-target")?
C3_ANTIPATTERN: Does the plan explicitly avoid at least ONE known anti-pattern
                from LOOP_STATE (e.g., single-line fixes, no rect() centering)?
C4_ANCHOR: Does the plan mention the anchor mechanism and how to handle it
           (e.g., re-seed after discard, recalibration option)?
C5_CADQUERY: Does the plan reference at least ONE CadQuery quirk from the
             LOOP_STATE table (rect centering, mirror, Color, etc.)?
C6_STRATEGY: Does the plan reference a 3→5 breakthrough strategy from
             LOOP_STATE section 16 (recalibration, differential, hybrid, etc.)?
C7_CONCRETE: Is the plan concrete enough to execute? (specific files, specific
             parameter changes, not vague "improve quality")

For each criterion, output 1 (pass) or 0 (fail) with a one-line justification.
Then output:
SCORE=<sum of 7 criteria>

### COLD-START PLAN TO EVALUATE:
$PLAN_CONTENT

### REFERENCE BUNDLE (what the agent had access to):
$BUNDLE_CONTENT
PROMPT

EVAL_CONTENT=$(cat "$EVAL_OUT" 2>/dev/null || echo "")

# --- Log ---
mkdir -p "$SCOPE/build"
{
    echo "# Resume Quality Verify — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo
    echo "## Cold-Start Plan"
    echo "$PLAN_CONTENT"
    echo
    echo "## Evaluator Verdict"
    echo "$EVAL_CONTENT"
} > "$SCOPE/build/resume_quality.md"

# --- Extract score ---
SCORE=$(echo "$EVAL_CONTENT" | grep -oE 'SCORE=[0-9]+' | tail -1 | cut -d= -f2)

if [ -z "$SCORE" ]; then
    echo "VERIFY-FAIL: evaluator did not produce SCORE= line" >&2
    echo "0"
    exit 0
fi

echo "SCORE=$SCORE"
echo "$SCORE"
