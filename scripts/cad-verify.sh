#!/usr/bin/env bash
# scripts/cad-verify.sh — GAN-style adversarial CAD evaluation.
#
# Pipeline (3 stages, all driven by headless `claude --print`):
#   1. Defender — Generator persona, justifies current design intent (1 call)
#   2. Red Team — N Critic personas run in parallel, attack on 9 criteria
#   3. Judge     — Adjudicator reads defender + red-team reports, assigns
#                  one 0-10 score per criterion using the user rubric
#                  (0/3/5/7/9/10), outputs JSON + MIN line.
#
# Output contract: stdout last line is a single float — autoresearch parses.
# Primary metric: SUM of 9 criterion scores (higher is better, max 90).
# Secondary: MIN criterion score (termination condition when MIN >= 9).
# Both are printed; autoresearch reads the LAST line (the SUM).
# Exit 0 on success, non-zero on pipeline error (then autoresearch reverts).
#
# Why SUM not MIN: with 9 criteria all starting at 0, MIN gives no gradient
# until every criterion clears 0 simultaneously. SUM gives continuous
# feedback — a single criterion rising 0→3 moves SUM by 3, visible to the
# optimizer. Loop terminates when the judge's MIN >= 9 (checked separately).
#
# Usage: bash scripts/cad-verify.sh cad/path-2-room-temp
set -euo pipefail

SCOPE="${1:-cad/path-2-room-temp}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE_ABS="$PROJECT_ROOT/$SCOPE"

if [ ! -d "$SCOPE_ABS" ]; then
    echo "VERIFY-FAIL: scope dir missing: $SCOPE" >&2
    echo "MIN=0.0"
    exit 1
fi

WORK=$(mktemp -d -t cadverify.XXXXXX)
trap "rm -rf '$WORK'" EXIT

# --- Bundle design artifacts into a single context blob ---
BUNDLE="$WORK/bundle.txt"
{
    echo "### PROJECT CONTEXT"
    echo "경로 2 (상온 butyl 봉착 + sol-gel 오버코트 + Ne 플러싱) 닉시관 제조 도면."
    echo "목표: 아마추어 서울 환경에서 ₩185K 이하, 메이커스페이스 + 자택 장비로 실증."
    echo
    echo "### EVALUATION RUBRIC"
    echo "0 = 치명적 오류 1건 이상 (조립불가능/기능결함)"
    echo "3 = 치명오류 없음, 마이너 문제 1건 이상"
    echo "5 = 마이너 문제 없음, 특장점 없음"
    echo "7 = 타 비교군 못지않거나 일부 우월"
    echo "9 = 월등한 장점 2개 이상 (new benchmark quality)"
    echo "10 = 이론상 만점 (실존 불가)"
    echo
    echo "### 9 CRITERIA"
    echo "C1 dimensional_accuracy  — 미터메트릭 치수 정확성"
    echo "C2 cots_match           — 기성 부품이 실제 벤더 데이터시트와 일치"
    echo "C3 assemblability       — 모든 부품이 서로 결합 가능"
    echo "C4 assembly_no_conflict — 결합 과정에서 공간/공정 모순 없음"
    echo "C5 fitness_for_purpose  — 최종 결합 후 본 용도 적합"
    echo "C6 aesthetics           — 닉시관 특유의 미학 보존"
    echo "C7 display_suitability  — 디스플레이용으로 사용 가능한 구조"
    echo "C8 manufacturability    — 제조 공정 용이성"
    echo "C9 process_efficiency   — 공정상 효율성"
    echo
    echo "### DESIGN ARTIFACTS"
    for f in parameters.py envelope.py end_cap.py cathode_stack.py anode_mesh.py assembly.py bom.yaml README.md; do
        if [ -f "$SCOPE_ABS/$f" ]; then
            echo "----- $f -----"
            cat "$SCOPE_ABS/$f"
            echo
        fi
    done
} > "$BUNDLE"

BUNDLE_CONTENT=$(cat "$BUNDLE")

# --- Stage 1: Defender ---
DEFENDER_OUT="$WORK/defender.txt"
claude --print --model claude-opus-4-6 --dangerously-skip-permissions <<PROMPT > "$DEFENDER_OUT" 2>/dev/null || true
You are the DEFENDER. The design below is a CAD bundle for a production-grade
Nixie tube assembly (경로 2, room-temp butyl seal). Your job is to state the
design intent and the strongest positive case for each of the 9 criteria in
200 words or less per criterion. Be concrete — cite specific dimensions or
part choices. Do not evaluate, only defend.

$BUNDLE_CONTENT
PROMPT

# --- Stage 2: Red Team (3 parallel critics, each attacks 3 criteria) ---
RED_DIR="$WORK/red"
mkdir -p "$RED_DIR"

red_team_attack() {
    local persona="$1"
    local criteria="$2"
    local outfile="$3"
    claude --print --model claude-opus-4-6 --dangerously-skip-permissions > "$outfile" 2>/dev/null <<PROMPT || true
You are a RED TEAM adversarial critic — $persona. Attack the CAD bundle below
on criteria: $criteria. For each criterion:
  1. Name the single most damaging flaw you can find.
  2. Classify severity: CRITICAL (score 0-3), MINOR (3-5), COSMETIC (5-7), NONE (7+).
  3. Cite the exact file + line or dimension that proves it.
Be ruthless. If the design is actually good, say so — do not invent flaws.

$BUNDLE_CONTENT
PROMPT
}

red_team_attack "a precision machinist who distrusts all tolerances" \
    "C1 dimensional_accuracy, C2 cots_match, C3 assemblability" \
    "$RED_DIR/critic1.txt" &
PID1=$!
red_team_attack "a process engineer who has seen every assembly blow up" \
    "C4 assembly_no_conflict, C5 fitness_for_purpose, C8 manufacturability" \
    "$RED_DIR/critic2.txt" &
PID2=$!
red_team_attack "an industrial designer with museum-quality expectations" \
    "C6 aesthetics, C7 display_suitability, C9 process_efficiency" \
    "$RED_DIR/critic3.txt" &
PID3=$!

wait $PID1 $PID2 $PID3 || true

DEFENDER_CONTENT=$(cat "$DEFENDER_OUT" 2>/dev/null || echo "(defender empty)")
CRITIC1=$(cat "$RED_DIR/critic1.txt" 2>/dev/null || echo "(critic1 empty)")
CRITIC2=$(cat "$RED_DIR/critic2.txt" 2>/dev/null || echo "(critic2 empty)")
CRITIC3=$(cat "$RED_DIR/critic3.txt" 2>/dev/null || echo "(critic3 empty)")

# --- Anchor: read previous scores AND critic findings for stability ---
# The anchor includes both the previous scores and a summary of what the
# previous critics found. This lets the judge compare "last time critics
# said X, now critics say Y" — enabling evidence-based promotion when
# a previous flaw has been genuinely resolved.
PREV_SCORES_FILE="$SCOPE_ABS/build/prev_scores.txt"
PREV_CRITICS_FILE="$SCOPE_ABS/build/prev_critics_summary.txt"
PREV_SCORES_LINE=""
PREV_CRITICS_SUMMARY=""
if [ -f "$PREV_SCORES_FILE" ]; then
    PREV_SCORES_LINE=$(cat "$PREV_SCORES_FILE")
fi
if [ -f "$PREV_CRITICS_FILE" ]; then
    PREV_CRITICS_SUMMARY=$(cat "$PREV_CRITICS_FILE")
fi

# --- Stage 3: Judge ---
JUDGE_OUT="$WORK/judge.txt"
claude --print --model claude-opus-4-6 --dangerously-skip-permissions > "$JUDGE_OUT" 2>/dev/null <<PROMPT || true
You are the JUDGE in a GAN-style adversarial evaluation. Read the design
bundle, the DEFENDER report, the THREE RED TEAM attacks, and the PREVIOUS
SCORES anchor. Assign ONE score per criterion from {0, 3, 5, 7, 9, 10}.

Rubric:
0  = critical flaw exists (assembly impossible OR function broken)
3  = no critical flaws, at least one minor issue
5  = no minor issues, no standout advantages
7  = matches or partially exceeds best-in-class comparators
9  = 2+ substantial advantages versus same class — new benchmark quality
10 = theoretically perfect (do NOT assign — reserved)

ANCHORING RULES (read carefully before scoring):
- The PREVIOUS SCORES line shows the last iteration's verdict.
- The PREVIOUS CRITIC FINDINGS (if any) show what specific flaws were found last time.
- For each criterion, start from the previous score and decide:

  PROMOTE (one rubric level up) if EITHER:
  (a) A specific flaw from the PREVIOUS critic findings is no longer present
      in the current critics' reports — the flaw was genuinely resolved.
  (b) The current critics explicitly score the criterion HIGHER than the
      previous anchor score and give concrete evidence why.

  KEEP (same score) if:
  (c) The current critics find the SAME type of flaw as before — no progress.

  DEMOTE (one or more levels down) if:
  (d) A NEW critical flaw was introduced that didn't exist before.

- "I now notice" a flaw that previous critics ALSO found is NOT a demotion.
- If no previous scores are provided, score absolutely with the rubric.

PREVIOUS SCORES (anchor — adjust per rules above):
${PREV_SCORES_LINE:-(none — first iteration, score absolutely)}

PREVIOUS CRITIC FINDINGS (compare with current critics to detect progress):
${PREV_CRITICS_SUMMARY:-(none — first iteration, no prior critics to compare)}

Output format — ONLY these three lines, nothing else:

SCORES_JSON={"C1":X,"C2":X,"C3":X,"C4":X,"C5":X,"C6":X,"C7":X,"C8":X,"C9":X}
MIN=<minimum of the nine scores>
SUM=<sum of the nine scores>

### BUNDLE
$BUNDLE_CONTENT

### DEFENDER
$DEFENDER_CONTENT

### RED TEAM CRITIC 1
$CRITIC1

### RED TEAM CRITIC 2
$CRITIC2

### RED TEAM CRITIC 3
$CRITIC3
PROMPT

# --- Extract MIN ---
JUDGE_CONTENT=$(cat "$JUDGE_OUT" 2>/dev/null || echo "")

# Log full judge output for audit trail (git-tracked alongside CAD changes)
mkdir -p "$SCOPE_ABS/build"
{
    echo "# Judge output — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo
    echo "## Defender"
    cat "$DEFENDER_OUT" 2>/dev/null || true
    echo
    echo "## Critic 1 (machinist)"
    cat "$RED_DIR/critic1.txt" 2>/dev/null || true
    echo
    echo "## Critic 2 (process engineer)"
    cat "$RED_DIR/critic2.txt" 2>/dev/null || true
    echo
    echo "## Critic 3 (industrial designer)"
    cat "$RED_DIR/critic3.txt" 2>/dev/null || true
    echo
    echo "## Judge"
    echo "$JUDGE_CONTENT"
} > "$SCOPE_ABS/build/judge.md"

# Extract SUM (primary metric), MIN (termination check), and SCORES (anchor)
SUM_VAL=$(echo "$JUDGE_CONTENT" | grep -oE 'SUM=[0-9]+(\.[0-9]+)?' | tail -1 | cut -d= -f2)
MIN_VAL=$(echo "$JUDGE_CONTENT" | grep -oE 'MIN=[0-9]+(\.[0-9]+)?' | tail -1 | cut -d= -f2)
SCORES_LINE=$(echo "$JUDGE_CONTENT" | grep -oE 'SCORES_JSON=\{[^}]*\}' | tail -1)

# Ratchet mechanism: for each criterion, take MAX(previous, new) to prevent
# noise-driven regressions. GAN variance is ±10 SUM on identical code (measured),
# so a single run's demotion is unreliable. Only persist improvements.
if [ -n "$SCORES_LINE" ] && [ -n "$PREV_SCORES_LINE" ]; then
    # Extract both score sets and compute per-criterion max
    RATCHETED=$(python3 -c "
import json, sys
prev = json.loads('$PREV_SCORES_LINE'.split('=',1)[1])
curr = json.loads('$SCORES_LINE'.split('=',1)[1])
merged = {k: max(prev.get(k,0), curr.get(k,0)) for k in prev}
s = sum(merged.values())
m = min(merged.values())
print(f'SCORES_JSON={json.dumps(merged)}')
print(f'MIN={m}')
print(f'SUM={s}')
" 2>/dev/null)
    if [ -n "$RATCHETED" ]; then
        RATCHET_SCORES=$(echo "$RATCHETED" | grep 'SCORES_JSON=' | head -1)
        SUM_VAL=$(echo "$RATCHETED" | grep 'SUM=' | head -1 | cut -d= -f2)
        MIN_VAL=$(echo "$RATCHETED" | grep 'MIN=' | head -1 | cut -d= -f2)
        SCORES_LINE="$RATCHET_SCORES"
    fi
fi
# Persist the (possibly ratcheted) scores
if [ -n "$SCORES_LINE" ]; then
    echo "$SCORES_LINE" > "$SCOPE_ABS/build/prev_scores.txt"
fi

# Persist critic summary for next iteration's anchor comparison.
# Extract the Summary tables from each critic report for compact representation.
{
    echo "# Previous critic findings (auto-extracted summaries)"
    echo "## Critic 1 (machinist) — C1/C2/C3"
    echo "$CRITIC1" | grep -A20 "^##\|^###\|Summary\|Score\|Severity\|CRITICAL\|MINOR\|COSMETIC" | head -30
    echo "## Critic 2 (process engineer) — C4/C5/C8"
    echo "$CRITIC2" | grep -A20 "^##\|^###\|Summary\|Score\|Severity\|CRITICAL\|MINOR\|COSMETIC" | head -30
    echo "## Critic 3 (industrial designer) — C6/C7/C9"
    echo "$CRITIC3" | grep -A20 "^##\|^###\|Summary\|Score\|Severity\|CRITICAL\|MINOR\|COSMETIC" | head -30
} > "$SCOPE_ABS/build/prev_critics_summary.txt"

if [ -z "$SUM_VAL" ]; then
    echo "VERIFY-FAIL: judge did not produce SUM= line" >&2
    # Emit worst-case so autoresearch reverts
    echo "MIN=0.0"
    echo "0.0"
    exit 0
fi

# Log both for audit; last stdout line MUST be the bare float autoresearch parses.
echo "MIN=$MIN_VAL"
echo "SUM=$SUM_VAL"

# Termination check (written to file; autoresearch does not see it directly).
if awk "BEGIN{exit !($MIN_VAL >= 9)}"; then
    touch "$SCOPE_ABS/build/GOAL_REACHED"
fi

echo "$SUM_VAL"
