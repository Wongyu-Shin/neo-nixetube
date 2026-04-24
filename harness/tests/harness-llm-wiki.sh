#!/usr/bin/env bash
# TC for feature: harness-llm-wiki
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NOTE="$ROOT/harness/research/harness-llm-wiki.md"

[ -f "$NOTE" ] || { echo "TC_FAIL llm-wiki: missing research note"; exit 1; }
grep -q "docs.openhands.dev" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing OpenHands keyword-skills citation"; exit 1; }

# Must name all three existing knowledge layers (user memory, CLAUDE.md, research notes).
grep -qi "user memory\|~/.claude.*memory\|user-scoped" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing user-memory layer reference"; exit 1; }
grep -q "CLAUDE.md" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing CLAUDE.md layer reference"; exit 1; }
grep -q "research note" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing research-notes layer reference"; exit 1; }

# Must spec the frontmatter with triggers.
grep -q "triggers:" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing triggers: frontmatter field"; exit 1; }

# Must spec half-life / re-verification.
grep -qi "half_life\|half-life\|stale" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing half-life / staleness mechanism"; exit 1; }

# Must cover BOTH read and write mechanics.
grep -qi "Loading mechanic\|SessionStart hook\|surfac" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing read/load mechanic"; exit 1; }
grep -qi "Write mechanic\|post-loop.*propose\|wiki-add" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing write/post-loop mechanic"; exit 1; }

# Must cite Article VII (the Constitution mandate).
grep -q "Article VII" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing Article VII reference"; exit 1; }

# Must contrast with voyager-skill-library (biggest overlap risk).
grep -q "voyager-skill-library" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing voyager-skill-library contrast"; exit 1; }

# Must name the bidirectional axis mapping.
grep -qFi "pre-loop (primary)" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing pre-loop (primary) mapping"; exit 1; }
grep -qi "post-loop" "$NOTE" \
    || { echo "TC_FAIL llm-wiki: missing post-loop write mapping"; exit 1; }

echo "TC_PASS harness-llm-wiki"
exit 0
