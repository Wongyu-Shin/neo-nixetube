#!/usr/bin/env bash
# scripts/harness/page-translate-verify.sh <slug> — GAN translation-quality verifier
# for harness MDX pages (English → Korean).
#
# Forked from scripts/harness/page-verify-harness.sh. Differences:
#   - 6 criteria reframed for translation quality:
#       T1 terminology_consistency — glossary mapping respected
#       T2 fidelity                — semantic preservation, no addition/omission
#       T3 idiomatic_korean        — natural prose, no literal-translation odor
#       T4 jsx_intact              — imports/JSX/code-fences untouched
#       T5 length_parity           — information density preserved
#       T6 glossary_consistency    — same English term → same Korean across pages
#   - Bundles harness/glossary-ko.md instead of CONSTITUTION/UX (those are
#     reference for charter alignment, not translation).
#   - Anchor file: loops/docs-loop-translate/prev-scores-<slug>.txt
#   - Judge output: loops/docs-loop-translate/gan-translate-<slug>.txt
#   - Ratchet MAX is enforced *outside* this script (in translation-verify.sh)
#     so this script reports the raw judge SUM; the orchestrator decides whether
#     to keep or discard.
#
# Usage: bash scripts/harness/page-translate-verify.sh <slug>
# Exits 0; final stdout line = SUM (max 60).

set -uo pipefail
SLUG="${1:?Usage: page-translate-verify.sh <slug>}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web/app"
LOOP_DIR="$ROOT/loops/docs-loop-translate"
mkdir -p "$LOOP_DIR"

case "$SLUG" in
    overview)     PAGE="$WEB/harness/page.mdx" ;;
    constitution) PAGE="$WEB/harness/constitution/page.mdx" ;;
    flow)         PAGE="$WEB/harness/flow/page.mdx" ;;
    wiki)         PAGE="$WEB/harness/wiki/page.mdx" ;;
    catalog)      PAGE="$WEB/harness/catalog/page.mdx" ;;
    *) echo "invalid slug $SLUG"; exit 2 ;;
esac
[ -f "$PAGE" ] || { echo "page missing: $PAGE"; exit 2; }

GLOSSARY="$ROOT/harness/glossary-ko.md"
[ -f "$GLOSSARY" ] || { echo "glossary missing: $GLOSSARY"; exit 2; }

# Frozen English source — the original page before translation began. This is
# the fidelity reference. Captured by translation-verify.sh on first run.
SOURCE_DIR="$LOOP_DIR/source-en"
SOURCE_PAGE="$SOURCE_DIR/$SLUG.mdx"
[ -f "$SOURCE_PAGE" ] || { echo "source-en page missing: $SOURCE_PAGE (run translation-verify.sh once to capture)"; exit 2; }

WORK=$(mktemp -d -t translateverify.XXXXXX)
trap "rm -rf '$WORK'" EXIT

BUNDLE="$WORK/bundle.txt"
{
    echo "### TASK"
    echo "Score the Korean translation of harness MDX page '$SLUG' against its frozen English source."
    echo "The page is interactive Next.js MDX; JSX, imports, className, code fences MUST remain untouched."
    echo "Prose (text outside JSX attributes and code) MUST be in Korean per the glossary."
    echo
    echo "### EVALUATION RUBRIC (0-10 per criterion)"
    echo "0 = critical defect (mistranslation that inverts meaning, or breaks JSX)"
    echo "3 = barely usable (frequent literal-translation, unidiomatic)"
    echo "5 = average (meaning preserved but stiff or inconsistent terminology)"
    echo "7 = strong (faithful, idiomatic Korean, glossary respected)"
    echo "9 = exceptional (publication-quality Korean technical doc)"
    echo "10 = theoretical max"
    echo
    echo "### 6 CRITERIA"
    echo "T1 terminology_consistency — every glossary term mapped per harness/glossary-ko.md"
    echo "T2 fidelity                — semantic preservation; no facts added, omitted, or distorted vs. source-en"
    echo "T3 idiomatic_korean        — natural '-한다체' prose; no machine-translation odor"
    echo "T4 jsx_intact              — every import line, JSX tag, attribute, code fence is byte-identical to source-en"
    echo "T5 length_parity           — information density preserved; no paragraph dropped or invented"
    echo "T6 glossary_consistency    — same English term → same Korean rendering throughout this page (and consistent with sibling pages)"
    echo
    echo "### GLOSSARY (authoritative mapping)"
    cat "$GLOSSARY"
    echo
    echo "### FROZEN ENGLISH SOURCE: $SLUG"
    echo "----- $SOURCE_PAGE -----"
    cat "$SOURCE_PAGE"
    echo
    echo "### CURRENT KOREAN TARGET: $SLUG"
    echo "----- $PAGE -----"
    cat "$PAGE"
    echo
    echo "### SIBLING PAGES (for cross-page glossary consistency check)"
    for sibling in overview constitution flow wiki catalog; do
        [ "$sibling" = "$SLUG" ] && continue
        sibling_path="$WEB/harness/page.mdx"
        [ "$sibling" != "overview" ] && sibling_path="$WEB/harness/$sibling/page.mdx"
        [ -f "$sibling_path" ] || continue
        echo "--- sibling: $sibling (first 60 lines) ---"
        head -60 "$sibling_path"
        echo
    done
} > "$BUNDLE"
BUNDLE_CONTENT=$(cat "$BUNDLE")

# --- Stage 1: Defender ---
DEFENDER_OUT="$WORK/defender.txt"
claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions <<PROMPT > "$DEFENDER_OUT" 2>/dev/null || echo "(defender claude -p failed)" > "$DEFENDER_OUT"
You are the DEFENDER for the Korean translation of harness page '$SLUG'.
For each of the 6 criteria (T1..T6), justify the translation in 80 words max,
citing concrete Korean phrases that demonstrate fidelity, idiomatic flow, and
glossary discipline. Do not score.

$BUNDLE_CONTENT
PROMPT

# --- Stage 2: 4 critics in parallel ---
RED_DIR="$WORK/red"
mkdir -p "$RED_DIR"
red_team() {
    local persona="$1" criteria="$2" outfile="$3"
    claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions > "$outfile" 2>/dev/null <<PROMPT || echo "(red team $persona claude -p failed)" > "$outfile"
You are a RED TEAM critic — $persona. Attack the Korean translation of page '$SLUG' on: $criteria.
For each criterion: (1) name the single most damaging mistranslation or unnatural rendering;
(2) classify CRITICAL (0-3) / MINOR (3-5) / COSMETIC (5-7) / NONE (7+);
(3) cite the exact Korean phrase + the corresponding English sentence from source-en.
Be ruthless about literal translation, dropped nuance, JSX corruption, and glossary drift.

$BUNDLE_CONTENT
PROMPT
}

red_team "a senior Korean technical translator who edits ML papers" \
    "T2 fidelity, T3 idiomatic_korean" "$RED_DIR/c1.txt" &
P1=$!
red_team "a Korean software engineer reading the doc to learn the harness" \
    "T1 terminology_consistency, T6 glossary_consistency" "$RED_DIR/c2.txt" &
P2=$!
red_team "a frontend engineer auditing JSX/MDX for byte-level integrity" \
    "T4 jsx_intact, T5 length_parity" "$RED_DIR/c3.txt" &
P3=$!
red_team "a bilingual editor checking source/target alignment paragraph-by-paragraph" \
    "T2 fidelity, T5 length_parity" "$RED_DIR/c4.txt" &
P4=$!

wait $P1 $P2 $P3 $P4 2>/dev/null || true

DEFENDER_CONTENT=$(cat "$DEFENDER_OUT" 2>/dev/null)
CRITIC1=$(cat "$RED_DIR/c1.txt" 2>/dev/null)
CRITIC2=$(cat "$RED_DIR/c2.txt" 2>/dev/null)
CRITIC3=$(cat "$RED_DIR/c3.txt" 2>/dev/null)
CRITIC4=$(cat "$RED_DIR/c4.txt" 2>/dev/null)

PREV_SCORES_FILE="$LOOP_DIR/prev-scores-$SLUG.txt"
PREV_LINE=""
[ -f "$PREV_SCORES_FILE" ] && PREV_LINE=$(cat "$PREV_SCORES_FILE")

# --- Stage 3: Judge ---
JUDGE_OUT="$LOOP_DIR/gan-translate-$SLUG.txt"
claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions > "$JUDGE_OUT" 2>/dev/null <<PROMPT || echo "(judge claude -p failed)" > "$JUDGE_OUT"
You are the JUDGE for the Korean translation of harness page '$SLUG'.
Score each criterion 0-10 per the rubric.

ANCHOR RULES (per project memory: LLM judges have ±10 noise; never weaken anchor):
- PREVIOUS SCORES (last iter): $PREV_LINE
- DEFAULT: keep previous score for each criterion. Only change if:
  (a) defender shows a concrete fix to a previously-flagged flaw → promote one rubric level on that criterion
  (b) red team finds a NEW critical flaw not present in the previous iter → demote one level
- No taste shifts. No across-the-board re-scoring. Stickiness is a feature.

Output exactly 3 lines, no extra prose:
SCORES_JSON={"T1":N,"T2":N,"T3":N,"T4":N,"T5":N,"T6":N}
MIN=<min>
SUM=<sum>

### BUNDLE
$BUNDLE_CONTENT

### DEFENDER
$DEFENDER_CONTENT

### CRITIC 1
$CRITIC1

### CRITIC 2
$CRITIC2

### CRITIC 3
$CRITIC3

### CRITIC 4
$CRITIC4
PROMPT

JUDGE_CONTENT=$(cat "$JUDGE_OUT" 2>/dev/null)
SUM_VAL=$(echo "$JUDGE_CONTENT" | grep -oE 'SUM=[0-9]+(\.[0-9]+)?' | tail -1 | cut -d= -f2)
SCORES_LINE=$(echo "$JUDGE_CONTENT" | grep -oE 'SCORES_JSON=\{[^}]*\}' | tail -1)

# Note: this script writes prev-scores unconditionally (raw judge output).
# The orchestrator (translation-verify.sh) is responsible for ratchet MAX.
[ -n "$SCORES_LINE" ] && echo "$SCORES_LINE" > "$PREV_SCORES_FILE"

if [ -z "$SUM_VAL" ]; then
    echo "VERIFY-FAIL: judge produced no SUM line for $SLUG" >&2
    echo "SUM=0" >> "$JUDGE_OUT"
    SUM_VAL=0
fi

echo "SUM=$SUM_VAL"
echo "$SUM_VAL"
exit 0
