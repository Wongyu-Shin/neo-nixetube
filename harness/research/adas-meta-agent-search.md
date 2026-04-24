# ADAS — Automated Design of Agentic Systems

**Citation:** Hu, S., Lu, C., Clune, J.
*Automated Design of Agentic Systems.*
ICLR 2025. arXiv:2408.08435.

**Primary source:** https://arxiv.org/abs/2408.08435
**Reference code:** https://github.com/ShengranHu/ADAS

## Core idea

A *Meta Agent* writes Python code that defines new *base agents* (tool-using,
reasoning, multi-agent), runs them on a benchmark, and iterates — with the
full history of prior designs + their scores in context. The search space
is unbounded ("Turing-complete"): prompts, control flow, tools, sub-agents
are all code the meta agent can emit.

Reported win: Meta Agent Search discovers agents that outperform state-of-
the-art handcrafted baselines on ARC, DROP, MGSM, GPQA and transfer across
domains and models without rewriting.

## Why this matters for harness design

ADAS is the research-grade answer to the question "can the harness itself
be recursively improved?" — which is precisely what this project's
/autoresearch loop tries to do at a smaller scale. Each kept iteration in
this catalog is a tiny ADAS step: the Meta Agent (Claude) proposes a new
feature, the Verify measures it, the catalog accumulates.

Three importable ideas:

1. **Archive-conditioned generation.** Meta agent reads the full archive
   of prior candidates + scores before proposing the next. This is exactly
   the "git log + results.tsv" discipline already enforced by
   autoresearch's Phase 1 review.
2. **Reflection prompts on failed generations.** Before re-generating, the
   meta agent is forced to articulate why the previous design failed —
   overlaps with the `reflexion` feature (separate TC because the axis is
   different: reflexion acts on Editor failures; ADAS-reflection acts on
   whole-agent design failures).
3. **Novelty filter.** Candidate agents that are near-duplicates of
   archived ones (edit-distance on emitted code) are rejected before
   evaluation — saves budget on a noisy metric.

## Mapping to this project's axes

- **axis1:** `outer` — a meta-level script that edits `harness/features/*`
  and `harness/tests/*` itself. Claude Code does not provide an automated
  "improve your own harness" primitive.
- **axis2:** `pre-loop` (archive-conditioned proposal) with a `post-loop`
  novelty filter. Not `in-loop` — ADAS is about *designing* loops, not
  running them.

## Rippable signal

Absorbed when Claude Code (or a first-party Anthropic product) ships an
"agent-search" mode that reads prior agent definitions + scores and
proposes improvements without external orchestration. Concrete probe:
presence of `/agent-search` or equivalent slash command in the CC skills
list, plus a side-by-side ADAS-style score ≥ current outer loop on a
held-out 3-Goal benchmark.

## Minimal viable implementation for neo-nixetube

1. The `harness/features/` catalog IS the archive. Already conditioned on
   by anyone reading `git log` + `autoresearch-harness-results.tsv`.
2. `scripts/harness/novelty.py` — given a candidate feature spec, computes
   MinHash similarity against existing features; rejects if Jaccard > 0.7.
3. `scripts/harness/propose.sh` — spawns a Plan-mode Claude with the full
   catalog in context and asks for the next feature. Output is a draft
   PR into `harness/features/`.

## Contrast

Reflexion/Voyager work inside a single Goal. HyperAgent partitions one
Goal across roles. ADAS operates one level higher: the Goal itself is
"design a better agent", and individual autoresearch loops are the
substrate.
