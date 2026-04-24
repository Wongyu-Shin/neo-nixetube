#!/usr/bin/env bash
# harness/crosscheck.sh — Cross-artifact consistency audit
#
# Emits CROSSCHECK_PASS=N on stdout. Higher is better. Each of N categories
# counts exactly once — a category is either consistent or not.
#
# Categories (each is 0 or 1):
#   C1  no stale references to renamed entry hyperagent-planner-routing
#   C2  every HyperAgent(s) mention disambiguates Meta vs FPT
#   C3  triad completeness (feature ↔ research ↔ test, all three exist)
#   C4  frontmatter tc_script resolves to an executable file
#   C5  frontmatter sources list non-empty + every URL-ish source appears in the research note
#   C6  cross-reference symmetry (A says "pairs with B" ⇒ B mentions A)
#   C7  applicability.models list non-empty
#   C8  SCHEMA.md field list matches guard.sh enforced list
#   C9  README.md feature count matches actual count on disk
#   C10 report freshness — reports/harness/*.mdx either references the
#       current SCORE or contains a superseded-by header
#   C11 citation URL format consistency — every note's Primary source
#       line contains an http(s)://… URL (not bare arxiv:NNNN)
#
# Exit 0 always — the metric itself carries success/failure information.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FEATURES_DIR="$ROOT/harness/features"
RESEARCH_DIR="$ROOT/harness/research"
TESTS_DIR="$ROOT/harness/tests"
REPORTS_DIR="$ROOT/reports/harness"
BUILD_DIR="$ROOT/harness/build"
mkdir -p "$BUILD_DIR"
LOG="$BUILD_DIR/crosscheck.log"
: > "$LOG"

pass=0
emit() { echo "$1" >> "$LOG"; }

# ---------------------------------------------------------------
# C1 — no stale references to the renamed entry
# ---------------------------------------------------------------
stale=$(grep -rlnI 'hyperagent-planner-routing' \
    "$ROOT/harness" "$REPORTS_DIR" 2>/dev/null | \
    grep -vE '/build/|\.log$' || true)
if [ -z "$stale" ]; then
    pass=$((pass + 1))
    emit "C1_PASS no stale hyperagent-planner-routing references"
else
    emit "C1_FAIL stale hyperagent-planner-routing references in:"
    echo "$stale" | sed 's/^/  /' >> "$LOG"
fi

# ---------------------------------------------------------------
# C2 — every file mentioning "HyperAgent" (any case) disambiguates
#      Meta (Zhang 2026 / facebookresearch) vs FPT (Phan 2024)
# ---------------------------------------------------------------
c2_fail=0
while IFS= read -r f; do
    # Must cite at least one of the disambiguating anchors.
    if ! grep -qE 'Zhang|facebookresearch/Hyperagents|2603.19461|FPT|Phan|2409.16299|fpt-hyperagent|meta-hyperagents' "$f"; then
        emit "C2_FAIL $f mentions hyperagent without disambiguation"
        c2_fail=$((c2_fail + 1))
    fi
done < <(grep -rlIiE 'hyperagent' "$ROOT/harness" "$REPORTS_DIR" 2>/dev/null | \
    grep -vE '/build/|\.log$|crosscheck\.sh$|guard\.sh$|verify\.sh$')
if [ "$c2_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C2_PASS hyperagent disambiguation complete"
fi

# ---------------------------------------------------------------
# C3 — triad completeness
# ---------------------------------------------------------------
c3_fail=0
for f in "$FEATURES_DIR"/*.md; do
    name=$(basename "$f" .md)
    [ -f "$RESEARCH_DIR/$name.md" ] || { emit "C3_FAIL missing research: $name"; c3_fail=$((c3_fail + 1)); }
    [ -f "$TESTS_DIR/$name.sh" ] || { emit "C3_FAIL missing test: $name"; c3_fail=$((c3_fail + 1)); }
done
for f in "$RESEARCH_DIR"/*.md; do
    name=$(basename "$f" .md)
    [ -f "$FEATURES_DIR/$name.md" ] || { emit "C3_FAIL orphan research: $name"; c3_fail=$((c3_fail + 1)); }
done
for f in "$TESTS_DIR"/*.sh; do
    name=$(basename "$f" .sh)
    [ -f "$FEATURES_DIR/$name.md" ] || { emit "C3_FAIL orphan test: $name"; c3_fail=$((c3_fail + 1)); }
done
if [ "$c3_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C3_PASS triad completeness"
fi

# ---------------------------------------------------------------
# C4 — frontmatter tc_script resolves
# ---------------------------------------------------------------
c4_fail=0
for f in "$FEATURES_DIR"/*.md; do
    tc=$(awk '/^---$/{c++; next} c==1 && /^tc_script:/{print $2; exit}' "$f" | tr -d '"'\''' )
    if [ -z "$tc" ] || [ ! -x "$ROOT/$tc" ]; then
        emit "C4_FAIL $f tc_script=$tc not executable"
        c4_fail=$((c4_fail + 1))
    fi
done
if [ "$c4_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C4_PASS all tc_script paths resolve and are executable"
fi

# ---------------------------------------------------------------
# C5 — sources URLs in frontmatter appear in the research note
# ---------------------------------------------------------------
c5_fail=0
for f in "$FEATURES_DIR"/*.md; do
    name=$(basename "$f" .md)
    note="$RESEARCH_DIR/$name.md"
    [ -f "$note" ] || continue
    # Extract URLs from frontmatter sources: list.
    urls=$(awk '/^sources:/{flag=1; next} flag && /^[a-z]/{flag=0} flag' "$f" | \
        grep -oE 'https?://[^"[:space:]]+' || true)
    for u in $urls; do
        # Strip trailing punctuation.
        u_clean=$(echo "$u" | sed 's/[.,;]*$//')
        if ! grep -qF "$u_clean" "$note"; then
            emit "C5_FAIL $name: frontmatter source $u_clean missing from note"
            c5_fail=$((c5_fail + 1))
        fi
    done
done
if [ "$c5_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C5_PASS all frontmatter source URLs backed by research notes"
fi

# ---------------------------------------------------------------
# C6 — cross-reference symmetry
#
# Rule: if feature A's body says "pairs with B" / "complements B" /
# "contrast(s) with B" / "see B", then B's body or research note
# must mention A somewhere. Mentions in research notes count too.
# ---------------------------------------------------------------
c6_fail=0
for f in "$FEATURES_DIR"/*.md; do
    a=$(basename "$f" .md)
    # Refs from feature A body — feature names are kebab-case and >3 chars.
    refs=$(grep -oE '\b[a-z]+(-[a-z0-9]+){2,}\b' "$f" | sort -u | while read candidate; do
        [ "$candidate" = "$a" ] && continue
        [ -f "$FEATURES_DIR/$candidate.md" ] && echo "$candidate"
    done)
    for b in $refs; do
        # B must mention A somewhere (feature or research).
        if ! grep -qF "$a" "$FEATURES_DIR/$b.md" 2>/dev/null && \
           ! grep -qF "$a" "$RESEARCH_DIR/$b.md" 2>/dev/null; then
            emit "C6_FAIL asymmetric cross-ref: $a → $b (B does not mention A)"
            c6_fail=$((c6_fail + 1))
        fi
    done
done
if [ "$c6_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C6_PASS cross-reference symmetry"
fi

# ---------------------------------------------------------------
# C7 — applicability.models list non-empty
# ---------------------------------------------------------------
c7_fail=0
for f in "$FEATURES_DIR"/*.md; do
    models_line=$(grep -E '^[[:space:]]+models:' "$f" || true)
    if [ -z "$models_line" ]; then
        emit "C7_FAIL $f missing applicability.models"
        c7_fail=$((c7_fail + 1))
    elif ! echo "$models_line" | grep -qE 'claude-'; then
        emit "C7_FAIL $f applicability.models has no claude-* entries: $models_line"
        c7_fail=$((c7_fail + 1))
    fi
done
if [ "$c7_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C7_PASS applicability.models non-empty and populated"
fi

# ---------------------------------------------------------------
# C8 — SCHEMA.md field list matches guard.sh enforced list
# ---------------------------------------------------------------
schema_fields=$(awk '/^```yaml/,/^```$/' "$ROOT/harness/SCHEMA.md" | \
    grep -oE '^[a-z_][a-z0-9_]*:' | sort -u | tr -d ':' | tr '\n' ' ')
guard_fields=$(grep -oE 'REQUIRED_FIELDS=\([^)]+\)' "$ROOT/harness/guard.sh" | \
    tr -d '()' | sed 's/REQUIRED_FIELDS=//' | tr ' ' '\n' | sort -u | tr '\n' ' ')
if [ -n "$schema_fields" ] && [ -n "$guard_fields" ]; then
    # Each required-field in guard must appear in schema.
    missing=""
    for gf in $guard_fields; do
        echo "$schema_fields" | grep -qw "$gf" || missing="$missing $gf"
    done
    if [ -z "$missing" ]; then
        pass=$((pass + 1))
        emit "C8_PASS SCHEMA.md lists every guard.sh required field"
    else
        emit "C8_FAIL SCHEMA.md missing fields enforced by guard.sh:$missing"
    fi
else
    emit "C8_FAIL could not parse schema or guard field lists"
fi

# ---------------------------------------------------------------
# C9 — README.md feature count matches actual count on disk
# ---------------------------------------------------------------
actual_count=$(ls "$FEATURES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
# The README may or may not quote an explicit number; we accept either
# (a) no explicit count claim, or (b) the claimed count matches.
readme_count=$(grep -oE '\b([0-9]+) (features|catalog entries|feature entries)\b' "$ROOT/harness/README.md" 2>/dev/null | head -1 | grep -oE '^[0-9]+' || true)
if [ -z "$readme_count" ]; then
    pass=$((pass + 1))
    emit "C9_PASS README.md makes no quantitative claim (count=$actual_count)"
elif [ "$readme_count" = "$actual_count" ]; then
    pass=$((pass + 1))
    emit "C9_PASS README.md count $readme_count == actual $actual_count"
else
    emit "C9_FAIL README.md claims $readme_count features, actual $actual_count"
fi

# ---------------------------------------------------------------
# C10 — report freshness
# ---------------------------------------------------------------
c10_fail=0
if [ -d "$REPORTS_DIR" ]; then
    for r in "$REPORTS_DIR"/*.mdx; do
        [ -f "$r" ] || continue
        # The report is fresh if its `final:` frontmatter field matches
        # the current feature count, OR it carries a `superseded_by:` field.
        final=$(awk '/^---$/{c++; next} c==1 && /^final:/{print $2; exit}' "$r" | tr -d '"'\''' )
        superseded=$(grep -c '^superseded_by:' "$r" || true)
        if [ "$superseded" -gt 0 ]; then
            continue
        fi
        if [ "$final" != "$actual_count" ]; then
            emit "C10_FAIL $r: final=$final but actual_count=$actual_count and no superseded_by"
            c10_fail=$((c10_fail + 1))
        fi
    done
fi
if [ "$c10_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C10_PASS reports are either current or explicitly superseded"
fi

# ---------------------------------------------------------------
# C11 — citation URL format consistency (every research note's
#        Primary source line must be a full http(s) URL)
# ---------------------------------------------------------------
c11_fail=0
for f in "$RESEARCH_DIR"/*.md; do
    # If the note has a "Primary source:" line, it must include http(s)://.
    if grep -qE '^\*\*Primary source:\*\*' "$f"; then
        if ! grep -E '^\*\*Primary source:\*\*' "$f" | grep -qE 'https?://'; then
            emit "C11_FAIL $f Primary source line lacks http(s):// URL"
            c11_fail=$((c11_fail + 1))
        fi
    fi
done
if [ "$c11_fail" -eq 0 ]; then
    pass=$((pass + 1))
    emit "C11_PASS all Primary source lines are http(s) URLs"
fi

# ---------------------------------------------------------------
# Emit metric
# ---------------------------------------------------------------
echo "CROSSCHECK_PASS=$pass"
echo "DETAIL total=11 pass=$pass log=$LOG"
