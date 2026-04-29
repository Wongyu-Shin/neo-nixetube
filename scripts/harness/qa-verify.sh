#!/usr/bin/env bash
# scripts/harness/qa-verify.sh — Harness MDX QA flaw counter.
#
# 8 deterministic checks. Each violation contributes 1 point.
# Output (last line, machine-parseable): QA_FLAWS=<int>
#
# Checks
#   F1 nav-active            NavDropdown active logic excludes "/harness" Overview
#                             from being highlighted on /harness/<sub> pages.
#   F2 scroll-restore         layout.tsx mounts a ScrollToTop client component
#                             that resets window.scrollY on pathname change.
#   F3 constitution-colocate  Each Article N section in constitution/page.mdx has
#                             its referenced visual *inside* the section block,
#                             not dumped at the end out of order.
#   F4 flow-appendix-explain  flow/page.mdx section "10. 부록" either removes
#                             ungrounded visuals or pairs each with ≥ 60 chars
#                             of prose preceding it (or hoists into body).
#   F5 const-map-font         ConstitutionArticlesMap.tsx has no
#                             text-[≤10px] / text-stone-700+ in its interactive
#                             SVG/canvas region.
#   F6 flow-diag-font         HarnessFlowDiagram.tsx — same constraint.
#   F7 article-index-color    ArticleIndex.tsx border + text colors fall inside
#                             approved palette (no border-amber-400/30 over-bright,
#                             no text-stone-700+ unreadable).
#   F8 global-palette         No banned color classes anywhere in
#                             web/app/harness/** or web/app/components/harness/**.
#                             Banned: text-{stone,zinc,gray,neutral}-{700..900},
#                             border-white/[0.3+], hex literals darker than #777777.
#
# Direction: lower-is-better. Floor: 0. Goal: 0.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web"
NAV="$WEB/app/components/NavDropdown.tsx"
LAYOUT="$WEB/app/layout.tsx"
SCROLL="$WEB/app/components/ScrollToTop.tsx"
CONST_MDX="$WEB/app/harness/constitution/page.mdx"
FLOW_MDX="$WEB/app/harness/flow/page.mdx"
CONST_MAP="$WEB/app/components/harness/ConstitutionArticlesMap.tsx"
FLOW_DIAG="$WEB/app/components/harness/HarnessFlowDiagram.tsx"
INDEX="$WEB/app/components/harness/ArticleIndex.tsx"

flaws=0
detail=""

# ───────────────── F1 nav active state ─────────────────
# PASS condition: NavDropdown contains an explicit guard so that
#   entry.href === "/harness" only matches when pathname === "/harness".
# We accept any of:
#   - a comment/marker `EXACT_OVERVIEW`
#   - longest-prefix helper `longestPrefix` / `pickActive`
#   - inline ternary referencing `=== "/harness"`
if grep -qE 'EXACT_OVERVIEW|longestPrefix|pickActive|=== "/harness"[^/]' "$NAV" 2>/dev/null; then
  :
else
  flaws=$((flaws+1)); detail+="F1 "
fi

# ───────────────── F2 scroll restoration ─────────────────
if [ -f "$SCROLL" ] && grep -q "ScrollToTop" "$LAYOUT" 2>/dev/null \
   && grep -qE "window\.scrollTo|scrollY = 0" "$SCROLL" 2>/dev/null; then
  :
else
  flaws=$((flaws+1)); detail+="F2 "
fi

# ───────────────── F3 constitution co-location ─────────────────
# Heuristic: each "## " heading section in CONST_MDX should not be a
# pure-visual section (≥ 2 component tags with < 80 chars of prose between
# them). Concretely we count "orphan visual blocks": a JSX component tag
# whose preceding 6 lines contain fewer than 60 alphabetic chars.
python3 - "$CONST_MDX" <<'PY' || { flaws=$((flaws+1)); detail+="F3 "; }
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
lines = p.read_text(encoding="utf-8").splitlines()
orphans = 0
for i, ln in enumerate(lines):
    m = re.match(r"^\s*<([A-Z][A-Za-z0-9]+)\b", ln)
    if not m: continue
    name = m.group(1)
    if name in ("Image","Link","Fragment"): continue
    # look back 6 lines, strip headings/imports/jsx
    window = "\n".join(lines[max(0,i-6):i])
    prose = re.sub(r"<[^>]+>|^\s*#+.*|^\s*import .*", "", window, flags=re.M)
    alpha = sum(1 for c in prose if c.isalpha())
    if alpha < 60:
        orphans += 1
sys.exit(1 if orphans > 0 else 0)
PY

# ───────────────── F4 flow appendix explained ─────────────────
# Same orphan-visual rule, scoped to lines after "## 10." in FLOW_MDX.
python3 - "$FLOW_MDX" <<'PY' || { flaws=$((flaws+1)); detail+="F4 "; }
import sys, re, pathlib
p = pathlib.Path(sys.argv[1])
text = p.read_text(encoding="utf-8")
m = re.search(r"^##\s*10\.", text, flags=re.M)
if not m:
    sys.exit(0)  # appendix removed → pass
appendix = text[m.start():]
lines = appendix.splitlines()
orphans = 0
for i, ln in enumerate(lines):
    if not re.match(r"^\s*<([A-Z][A-Za-z0-9]+)\b", ln): continue
    window = "\n".join(lines[max(0,i-4):i])
    prose = re.sub(r"<[^>]+>|^\s*#+.*", "", window, flags=re.M)
    alpha = sum(1 for c in prose if c.isalpha())
    if alpha < 60:
        orphans += 1
sys.exit(1 if orphans > 0 else 0)
PY

# ───────────────── F5 / F6 font size in interactive area ─────────────────
# SVG fontSize attributes ≤ 10 (string or numeric), Tailwind text-[≤10px],
# or banned dark text colors.
font_bad='text-\[(7|8|9|10)(\.[0-9])?px\]|text-stone-(700|800|900)|text-zinc-(700|800|900)|text-gray-(700|800|900)|text-neutral-(700|800|900)|fontSize="(7|8|9|10)"|fontSize=\{(7|8|9|10)\}'
if grep -qE "$font_bad" "$CONST_MAP" 2>/dev/null; then
  flaws=$((flaws+1)); detail+="F5 "
fi
if grep -qE "$font_bad" "$FLOW_DIAG" 2>/dev/null; then
  flaws=$((flaws+1)); detail+="F6 "
fi

# ───────────────── F7 article index outline + text ─────────────────
# Disallow over-bright borders (amber-400/30+ or white/[0.2+]) and
# unreadable text (stone-700+).
if grep -qE 'border-amber-400/(3[0-9]|[4-9][0-9])|border-white/\[0\.[2-9]|text-stone-(700|800|900)|text-zinc-(700|800|900)|text-neutral-(500|600|700|800|900)|border-neutral-(300|400|500)|text-\[(9|10|10\.5)px\]' "$INDEX" 2>/dev/null; then
  flaws=$((flaws+1)); detail+="F7 "
fi

# ───────────────── F8 global palette conformance ─────────────────
banned='text-(stone|zinc|gray|neutral)-(700|800|900)|border-white/\[0\.[3-9]|color:\s*"#[0-6][0-9a-fA-F]{5}"'
hits=$(grep -rEho "$banned" \
  "$WEB/app/harness" \
  "$WEB/app/components/harness" 2>/dev/null | wc -l | tr -d ' ')
if [ "${hits:-0}" -gt 0 ]; then
  flaws=$((flaws+1)); detail+="F8($hits) "
fi

echo "DETAIL=$detail"
echo "QA_FLAWS=$flaws"
exit 0
