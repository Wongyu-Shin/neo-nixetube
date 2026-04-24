# LLM-as-Judge Post-loop Audit

**Primary citation:** Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E., Zhang, H., Gonzalez, J.E., Stoica, I.
*Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.*
NeurIPS 2023. arXiv:2306.05685.

**Related:**
- Dubois, Y. et al. *AlpacaFarm: A Simulation Framework for Methods that Learn from Human Feedback.* NeurIPS 2023. arXiv:2305.14387.
- Anthropic, *Constitutional AI: Harmlessness from AI Feedback.* arXiv:2212.08073.
- neo-nixetube practice: already uses LLM-as-judge scoring (see `autoresearch-cad-path2-results.tsv` SUM=35/90 pattern in project_cad_loop_state.md).

## Core idea

After the agent loop completes, run a *separate* LLM invocation (different
prompt, ideally different model) that grades the final artifact against a
fixed rubric. The judge produces a numeric score plus a free-text critique.

Two well-documented failure modes:

1. **Self-enhancement bias** — a model judging its own output scores ~10%
   higher than a different model would (Zheng 2023, Table 3). Mitigation:
   use a *different* model family for the judge (e.g., Opus ran the loop,
   Sonnet or a different-vendor model judges).
2. **Position/verbosity bias** — longer answers and first-position answers
   score higher regardless of quality. Mitigation: randomise order, cap
   token count, use explicit rubric checklists.

## Why this matters for axis design

The user's axis-2 charter puts "guard rule compliance check" and "human-
readable report" squarely in post-loop. An LLM-as-judge audit is the
obvious mechanism, but only if the self-enhancement floor is controlled.
This project already runs up against the noise: the recorded feedback
"GAN noise handling — LLM-as-judge has ±10 noise; use ratchet MAX, never
weaken anchor" in user memory is exactly this failure mode.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| post-loop (primary) | After the loop's termination condition, run the judge on the final diff + report; block `status=ship` if judge score < threshold. |
| in-loop (optional) | Use as a *ratchet anchor* — only keep iterations that hold or improve the judge score from the prior best. |

## Mapping to this project's axes

- **axis1:** `outer` — the audit runs as a separate shell/script invocation,
  typically via the Anthropic Messages API or a second Claude Code session.
  Claude Code does not ship an integrated "judge this branch" primitive.
- **axis2:** `post-loop` (primary) — the feature entry claims this slot.
  A separate `in-loop` feature can wrap the same judge for ratchet duty,
  tracked independently because the rippable signal differs.

## Rippable signal

Absorbed when the runtime (or a first-party Anthropic tool like
`/ultrareview`) provides a rubric-based audit with published self-
enhancement-bias controls. Measurable probe:

1. Run the candidate CC-native audit N=20 times on a fixed fixture pair
   (A=good, B=bad) with swapped position.
2. Compare against this feature's external judge with the same fixture.
3. If position-swap variance ≤ 5% AND agreement with external judge
   ≥ 85%, rip.

## Minimal viable implementation for neo-nixetube

1. `scripts/harness/judge.sh <artifact>` — shells into Anthropic Messages
   API with a fixed rubric prompt (defined in `harness/rubrics/<goal>.md`).
2. Rubric is versioned and referenced from the feature's frontmatter — a
   rubric change invalidates prior scores for comparability.
3. Output is `JUDGE_SCORE=N` on stdout, which autoresearch parses like
   any other metric.
4. To fight self-enhancement bias: use `claude-sonnet-4-6` as judge for
   loops run on `claude-opus-4-7`, and vice versa.

## Contrast

Guard (in the autoresearch sense) is deterministic — tests pass or fail.
LLM-as-judge is probabilistic and requires bias controls. The two are
not interchangeable; a well-designed harness uses both.
