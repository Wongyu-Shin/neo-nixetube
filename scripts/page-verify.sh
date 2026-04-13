#!/usr/bin/env bash
# scripts/page-verify.sh — GAN-style adversarial page quality evaluation.
#
# Pipeline (3 stages, headless `claude --print`):
#   1. Defender — justifies current page design
#   2. Red Team — 4 critics attack on 6 criteria
#   3. Judge   — scores 0-10 per criterion, outputs SUM
#
# Output: last stdout line = bare float (SUM, max 60). autoresearch parses it.
# Exit 0 on success, non-zero on pipeline error.
#
# Usage: bash scripts/page-verify.sh
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/web/app"

WORK=$(mktemp -d -t pageverify.XXXXXX)
trap "rm -rf '$WORK'" EXIT

# --- Bundle page artifacts ---
BUNDLE="$WORK/bundle.txt"
{
    echo "### PROJECT CONTEXT"
    echo "경로 2 상온 봉착 닉시관 — web 문서 페이지 품질 평가."
    echo "목표: 블루프린트 미학의 CAD 도면이 통합된 제조 튜토리얼 페이지."
    echo
    echo "### EVALUATION RUBRIC"
    echo "0 = 치명적 결함 (깨진 레이아웃, 읽을 수 없음)"
    echo "3 = 기능하나 거친 상태 (정렬 불량, 미학 부재)"
    echo "5 = 보통 수준 (작동하지만 특별함 없음)"
    echo "7 = 우수 (정돈된 구조, 일관된 미학)"
    echo "9 = 탁월 (전문 기술 문서 수준, 시각적 인상)"
    echo "10 = 이론상 만점"
    echo
    echo "### 6 CRITERIA"
    echo "C1 doc_structure      — 문서 구조 & 정보 흐름 (개요→상세 자연스러운 흐름)"
    echo "C2 cad_alignment      — CAD SVG 정렬, 반응형 스케일링, viewBox 설정"
    echo "C3 blueprint_aesthetic — 블루프린트 스타일 (그리드, 색상, 기술 도면 미학)"
    echo "C4 hero_diagrams      — 상단 조립도 + 분해도 표현의 완성도"
    echo "C5 process_viz        — 각 공정별 CAD 상태 시각화 (현재 조립 단계 표현)"
    echo "C6 visual_harmony     — hand-drawn 컴포넌트와 CAD SVG의 시각적 조화"
    echo
    echo "### PAGE MDX"
    echo "----- page.mdx -----"
    cat "$WEB_DIR/path-roomtemp/page.mdx"
    echo
    echo "### SVG FILES (metadata only)"
    if [ -d "$PROJECT_ROOT/web/public/cad" ]; then
        for svg in "$PROJECT_ROOT/web/public/cad"/*.svg; do
            [ -f "$svg" ] || continue
            fname=$(basename "$svg")
            size=$(wc -c < "$svg" | tr -d ' ')
            # Extract viewBox and dimensions
            vb=$(grep -o 'viewBox="[^"]*"' "$svg" 2>/dev/null | head -1 || echo "NO viewBox")
            w=$(grep -o 'width="[^"]*"' "$svg" 2>/dev/null | head -1 || echo "")
            h=$(grep -o 'height="[^"]*"' "$svg" 2>/dev/null | head -1 || echo "")
            stroke=$(grep -o 'strokeColor[^,)]*' "$svg" 2>/dev/null | head -1 || echo "")
            echo "  $fname: ${size}B, $w $h $vb"
        done
    fi
    echo
    echo "### KEY COMPONENTS USED"
    # List components imported in page.mdx
    grep -E "^import " "$WEB_DIR/path-roomtemp/page.mdx" 2>/dev/null || true
    echo
    # Include CadBlueprint component if exists
    if [ -f "$WEB_DIR/components/CadBlueprint.tsx" ]; then
        echo "----- CadBlueprint.tsx -----"
        cat "$WEB_DIR/components/CadBlueprint.tsx"
    fi
} > "$BUNDLE"

BUNDLE_CONTENT=$(cat "$BUNDLE")

# --- Stage 1: Defender ---
DEFENDER_OUT="$WORK/defender.txt"
claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions <<PROMPT > "$DEFENDER_OUT" 2>/dev/null || true
You are the DEFENDER. Below is a Next.js MDX page for a Nixie tube manufacturing
tutorial. Justify the design choices for each of the 6 criteria in 150 words max
per criterion. Be concrete — cite specific CSS classes, component choices, or SVG
properties. Do not evaluate, only defend.

$BUNDLE_CONTENT
PROMPT

# --- Stage 2: Red Team (4 critics in parallel) ---
RED_DIR="$WORK/red"
mkdir -p "$RED_DIR"

red_team() {
    local persona="$1" criteria="$2" outfile="$3"
    claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions > "$outfile" 2>/dev/null <<PROMPT || true
You are a RED TEAM critic — $persona. Attack the page on: $criteria.
For each criterion:
  1. Name the single most damaging flaw.
  2. Classify: CRITICAL (0-3), MINOR (3-5), COSMETIC (5-7), NONE (7+).
  3. Cite exact code/class/property that proves it.
Be ruthless. If design is good, say so — do not invent flaws.

$BUNDLE_CONTENT
PROMPT
}

red_team "a Nixie tube collector who has read every vintage datasheet" \
    "C1 doc_structure, C5 process_viz" \
    "$RED_DIR/critic1.txt" &
PID1=$!
red_team "a senior web frontend engineer obsessed with responsive design" \
    "C2 cad_alignment, C6 visual_harmony" \
    "$RED_DIR/critic2.txt" &
PID2=$!
red_team "an industrial designer who curates museum-quality technical illustrations" \
    "C3 blueprint_aesthetic, C4 hero_diagrams" \
    "$RED_DIR/critic3.txt" &
PID3=$!
red_team "a vacuum systems engineer who builds production Nixie tubes" \
    "C5 process_viz, C1 doc_structure" \
    "$RED_DIR/critic4.txt" &
PID4=$!

wait $PID1 $PID2 $PID3 $PID4 || true

DEFENDER_CONTENT=$(cat "$DEFENDER_OUT" 2>/dev/null || echo "(empty)")
CRITIC1=$(cat "$RED_DIR/critic1.txt" 2>/dev/null || echo "(empty)")
CRITIC2=$(cat "$RED_DIR/critic2.txt" 2>/dev/null || echo "(empty)")
CRITIC3=$(cat "$RED_DIR/critic3.txt" 2>/dev/null || echo "(empty)")
CRITIC4=$(cat "$RED_DIR/critic4.txt" 2>/dev/null || echo "(empty)")

# --- Anchor ---
PREV_SCORES_FILE="$PROJECT_ROOT/web/public/cad/prev_page_scores.txt"
PREV_SCORES_LINE=""
if [ -f "$PREV_SCORES_FILE" ]; then
    PREV_SCORES_LINE=$(cat "$PREV_SCORES_FILE")
fi

# --- Stage 3: Judge ---
JUDGE_OUT="$WORK/judge.txt"
claude --print --model claude-sonnet-4-6 --dangerously-skip-permissions > "$JUDGE_OUT" 2>/dev/null <<PROMPT || true
You are the JUDGE. Read the page bundle, DEFENDER, and FOUR RED TEAM attacks.
Score each criterion 0-10 using the rubric.

ANCHORING RULES:
- PREVIOUS SCORES below are the last iteration's verdict.
- DEFAULT: keep previous score. ONLY change if:
  (a) Defender shows a concrete fix → promote one rubric level.
  (b) New critical flaw found → demote.
- No taste-shifts or "I now notice" re-evaluations.

PREVIOUS SCORES:
${PREV_SCORES_LINE:-(none — first iteration, score absolutely)}

Output ONLY these 3 lines:
SCORES_JSON={"C1":X,"C2":X,"C3":X,"C4":X,"C5":X,"C6":X}
MIN=<min>
SUM=<sum>

### BUNDLE
$BUNDLE_CONTENT

### DEFENDER
$DEFENDER_CONTENT

### CRITIC 1 (Nixie collector)
$CRITIC1

### CRITIC 2 (Frontend engineer)
$CRITIC2

### CRITIC 3 (Industrial designer)
$CRITIC3

### CRITIC 4 (Vacuum engineer)
$CRITIC4
PROMPT

JUDGE_CONTENT=$(cat "$JUDGE_OUT" 2>/dev/null || echo "")

# Extract scores
SUM_VAL=$(echo "$JUDGE_CONTENT" | grep -oE 'SUM=[0-9]+(\.[0-9]+)?' | tail -1 | cut -d= -f2)
MIN_VAL=$(echo "$JUDGE_CONTENT" | grep -oE 'MIN=[0-9]+(\.[0-9]+)?' | tail -1 | cut -d= -f2)
SCORES_LINE=$(echo "$JUDGE_CONTENT" | grep -oE 'SCORES_JSON=\{[^}]*\}' | tail -1)

# Persist anchor
if [ -n "$SCORES_LINE" ]; then
    mkdir -p "$(dirname "$PREV_SCORES_FILE")"
    echo "$SCORES_LINE" > "$PREV_SCORES_FILE"
fi

if [ -z "$SUM_VAL" ]; then
    echo "VERIFY-FAIL: judge did not produce SUM= line" >&2
    echo "0.0"
    exit 0
fi

echo "MIN=$MIN_VAL"
echo "SUM=$SUM_VAL"
echo "$SCORES_LINE"
echo "$SUM_VAL"
