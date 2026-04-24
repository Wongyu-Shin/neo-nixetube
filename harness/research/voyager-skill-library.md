# Voyager — An Open-Ended Embodied Agent with LLM Skill Library

**Citation:** Wang, G., Xie, Y., Jiang, Y., Mandlekar, A., Xiao, C., Zhu, Y., Fan, L., Anandkumar, A.
*Voyager: An Open-Ended Embodied Agent with Large Language Models.*
TMLR 2024. arXiv:2305.16291.

**Primary source:** https://arxiv.org/abs/2305.16291
**Reference code:** https://github.com/MineDojo/Voyager

## Core idea

Three-pronged lifelong-learning harness for a Minecraft agent:

1. **Automatic curriculum** — the LLM proposes increasingly hard goals based on
   current state and inventory (pre-loop fractal loop).
2. **Iterative prompting with environment feedback** — retry-with-correction
   until the skill compiles and executes (in-loop).
3. **Skill library** — verified skills (Javascript functions) are stored with
   a natural-language description + embedding; future tasks retrieve relevant
   skills via vector search instead of re-generating from scratch.

Reported win: 3.3× more unique items, 15.3× faster tech-tree progression vs.
ReAct/Reflexion baselines in Minecraft.

## Harness-relevant decomposition

Voyager's *skill library* is the most transferable idea to a software
autoresearch loop: distil each *kept* experiment into a reusable playbook
entry so later loops can retrieve instead of re-derive.

| Phase | Role |
|---|---|
| pre-loop | Retrieve top-k relevant skills for the Goal; seed the context. |
| in-loop | On `status=keep`, extract the diff + rationale into a skill card. |
| post-loop | Re-embed and re-index skills; prune near-duplicates. |

## Mapping to this project's axes

- **axis1:** `outer` — the skill store is an on-disk JSONL/MD corpus managed
  by a script; Claude Code has no built-in skill retrieval tied to commit
  history. (Claude's SDK "skills" are a different, authored primitive.)
- **axis2:** `pre-loop` (retrieval) + `in-loop` (write). Separate TC per phase.

## Rippable signal

The feature is absorbed when Claude Code (or the model) automatically
surfaces prior kept-commit playbooks at Phase-1 review without explicit
retrieval. Measure: Precision@5 of "relevant past skills named in the
Phase-1 review transcript" vs. ground-truth tagging; if ≥0.8 for three
consecutive Goals, rip.

## Minimal viable implementation for neo-nixetube

1. `harness/skills/<slug>.md` — one file per distilled skill with frontmatter
   `{embed_vector, tags, src_commit, goal_family}`.
2. `scripts/skills/index.py` — rebuilds `harness/skills/.index.jsonl` with
   embeddings (sentence-transformers, local, no network).
3. `scripts/skills/retrieve.py <query>` — returns top-k skill paths; used
   at Phase-1 of every autoresearch run.

## Contrast with reflexion

Reflexion persists *failures* (avoid repeats); Voyager's skill library
persists *successes* (compound gains). A complete harness needs both;
tracked separately because their rippable signals differ.
