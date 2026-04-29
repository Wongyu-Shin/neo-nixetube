#!/usr/bin/env bash
# .claude/hooks/wiki-keyword-matcher.sh — SessionStart hook that
# surfaces harness/wiki/ entries whose keywords overlap with the
# active loop's spec.md / clarifications.md.
#
# Implements harness/features/harness-llm-wiki.md (axis1=inner,
# axis2=post-loop / SessionStart). Per Article VII, the wiki is the
# only keyword-triggered project-scoped knowledge layer.
#
# CC SessionStart hook contract:
#   stdin  = JSON with session metadata (we ignore body, just react)
#   stdout = additional context surfaced to the agent
#   exit 0 always
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WIKI_DIR="$ROOT/harness/wiki"
PY=/opt/homebrew/Caskroom/miniforge/base/bin/python
[ -x "$PY" ] || PY=$(command -v python3)

# No wiki dir or no entries → silent exit
[ -d "$WIKI_DIR" ] || exit 0
shopt -s nullglob
entries=("$WIKI_DIR"/*.md)
# Exclude SCHEMA.md and _archive/
filtered=()
for f in "${entries[@]}"; do
    case "$(basename "$f")" in
        SCHEMA.md|_*) continue ;;
    esac
    filtered+=("$f")
done
[ ${#filtered[@]} -eq 0 ] && exit 0

# Source pool: most recent loop's spec.md + clarifications.md, plus
# the operator's last 5 user prompts in this session if available.
active_loop=$(ls -dt "$ROOT"/loops/[0-9]*/ 2>/dev/null | head -1)
context_text=""
if [ -n "$active_loop" ]; then
    [ -f "$active_loop/spec.md" ]            && context_text+=$(cat "$active_loop/spec.md")$'\n'
    [ -f "$active_loop/clarifications.md" ]  && context_text+=$(cat "$active_loop/clarifications.md")$'\n'
fi
# Fallback when no loop is active: show all wiki TL;DRs (cheap, ~1 line each)

"$PY" - "$WIKI_DIR" "$context_text" <<'PY'
import os, sys, re, pathlib, json
wiki_dir = pathlib.Path(sys.argv[1])
ctx = (sys.argv[2] if len(sys.argv) > 2 else "").lower()

def parse_frontmatter(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
    if not m: return None, text
    fm_block = m.group(1)
    fm = {}
    cur_list_key = None
    for line in fm_block.splitlines():
        if not line.strip(): continue
        if re.match(r'^\s*-\s+', line) and cur_list_key:
            fm[cur_list_key].append(line.strip()[2:].strip().strip('"\''))
            continue
        m2 = re.match(r'^([\w_-]+):\s*(.*)$', line)
        if m2:
            k = m2.group(1); v = m2.group(2).strip()
            if v == "":
                fm[k] = []
                cur_list_key = k
            else:
                fm[k] = v.strip('"\'')
                cur_list_key = None
    body = text[m.end():]
    return fm, body

surfaced = []
for path in sorted(wiki_dir.glob("*.md")):
    if path.name == "SCHEMA.md" or path.name.startswith("_"):
        continue
    fm, body = parse_frontmatter(path.read_text(encoding="utf-8", errors="replace"))
    if not fm:
        continue
    keywords = fm.get("keywords") or []
    if not isinstance(keywords, list):
        keywords = [keywords]
    if not keywords:
        continue
    # Match: any keyword (lowercased) appearing as substring in ctx
    hits = [k for k in keywords if k and k.lower() in ctx]
    if hits or not ctx:  # if no ctx, surface all (TL;DR-only mode)
        # extract TL;DR — first non-empty paragraph after frontmatter
        para = ""
        for chunk in re.split(r'\n\s*\n', body.strip()):
            if chunk.strip():
                para = chunk.strip().splitlines()[0]
                break
        surfaced.append({
            "slug": fm.get("slug") or path.stem,
            "title": fm.get("title") or path.stem,
            "matched": hits,
            "tldr": para[:200],
            "path": str(path.relative_to(wiki_dir.parent.parent)),
        })

if not surfaced:
    sys.exit(0)

print("═══ Harness wiki — keyword-triggered surfacing ═══")
for e in surfaced:
    if e["matched"]:
        print(f"  • [{e['slug']}] {e['title']}  (match: {', '.join(e['matched'])})")
    else:
        print(f"  • [{e['slug']}] {e['title']}")
    if e["tldr"]:
        print(f"      {e['tldr']}")
    print(f"      → read full: {e['path']}")
print("═══")
PY
exit 0
