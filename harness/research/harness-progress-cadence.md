# Harness Progress Cadence — In-run Status UX

**Inspiration sources:**
- autoresearch SKILL.md Phase 8: "DO print a brief one-line status
  every ~5 iterations". https://github.com/uditgoenka/autoresearch
- Claude Code statusline customization (`statusline-setup` skill) —
  bottom-of-terminal persistent line.
- `tqdm` / `rich.progress` — Python ecosystem progress UX baseline.
- k6 / hyperfine benchmark CLIs — compact periodic summaries with
  percentiles.
- OpenHands trajectories — full record for replay, not in-run display.

## Core idea

Long-running loops produce a lot of output. Without deliberate
pacing the operator either:

- Gets flooded (agent prints every tool call + reasoning trace)
- Is left in silence (agent runs for 30 minutes without status)
- Has to grep through scrollback to find "are we making progress?"

This feature specifies the in-run status UX that keeps operators
oriented without spamming context. Three cadence levels:

| Level | When | Content |
|---|---|---|
| **Per-iteration** (concise) | After each iteration's Phase 7 logging | One line: `[iter N/M] SCORE=X (+Δ) iter=<desc> status=<keep\|discard\|crash>` |
| **Milestone** (every 5 iters) | At iterations 5, 10, 15, … | Compact block: ratchet trajectory, keep/discard counts, last 3 descriptions, plateau signal |
| **Final** (loop end) | At termination | Full summary: baseline → final, axis coverage delta, crosscheck result, report file path, wiki-refs file path |

Additionally, a **live statusline** (via CC's statusline primitive)
shows: `harness:<slug> iter=N/M score=X guard=<pass/fail>` — updated
every iteration, visible bottom-of-terminal throughout.

## Why this matters for this project's axes

Prior loops in this project (CAD path-2, 41 iterations) demonstrated
that without a cadence discipline, the operator ends a session
unclear on "was progress made?". This is especially bad under noisy
metrics (see `noise-aware-ratchet`) where a single iteration's number
is not meaningful — the operator needs the *trajectory* to know.

Cadence also enables healthy interrupt semantics: the operator
reads the milestone summary, decides to pause/steer/abandon, and
the `harness-pause-resume` checkpoint gives them a clean boundary
to act on.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| in-loop (primary) | Per-iteration + milestone summaries printed mid-loop; statusline updated every iteration. |
| pre-loop | Operator configures cadence level in `loops/NNN/spec.md` (default: per-iter + milestone; noise options: milestone-only; debug option: verbose). |
| post-loop | Final summary + pointer to report.mdx + wiki-refs. |

## Mapping to this project's axes

- **axis1:** `outer` — output formatters live in
  `scripts/harness/progress.sh`; CC's native autoresearch SKILL has a
  coarse "every 10 iter" rule but does not format into the 3-tier
  cadence this feature specifies.
- **axis2:** `in-loop` (primary).

## Rippable signal

Absorbed when the autoresearch SKILL (or a CC-shipped loop framework)
emits:

1. A per-iteration concise line matching the schema above.
2. A milestone summary at configurable interval.
3. A final summary with axis coverage delta.
4. A live statusline update per iteration.

Probe:

1. Run a 15-iteration bounded loop.
2. Capture stdout.
3. If the four cadence artifacts (concise per-iter, 2 milestones, 1
   final) appear in the expected structure without external
   formatter, rip.

## Minimal viable implementation for neo-nixetube

1. `scripts/harness/progress.sh <run_id> --level <concise|milestone|final>`
   — emits the formatted block from the run's results TSV.
2. `.claude/statusline` (see `statusline-setup` skill) reads latest
   iter from the active loop's TSV.
3. Called from autoresearch's Phase 7 (concise + milestone triggers)
   and Phase 8 bounded/unbounded terminator (final).
4. Integrates with `gcli-agent-run-telemetry` as telemetry source:
   reads events, formats, emits — no duplicated state.

## Non-overlap

| Feature | What it does | Distinction |
|---|---|---|
| `cc-post-loop-slash` | post-loop MDX report | Narrative, one-shot, not in-run |
| `llm-as-judge-audit` | post-loop rubric grade | Score-artifact, not progress |
| `gcli-agent-run-telemetry` | in-loop JSONL events | Raw data; this feature is presentation |
| `harness-pause-resume` | pause/resume UX | Interrupt semantics, not status display |

This feature owns **in-run presentation** — the layer between raw
telemetry and post-loop narrative.
