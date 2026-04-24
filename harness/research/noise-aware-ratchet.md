# Noise-Aware Ratchet (Monotonic-MAX Anchor)

**Primary source:** Chen, R.Y. et al. *Ranking and Selection under Uncertainty:
a Unified Approach.* Operations Research, 2016.
https://arxiv.org/abs/1601.07077 — the "most-promising-best-so-far"
selection rule that the ratchet implements.

**Related references:**
- Henderson, P. et al. *Deep Reinforcement Learning That Matters.* AAAI 2018.
  arXiv:1709.06560 — why single-seed "best so far" is misleading.
- Bradley, R.A., Terry, M.E. *Rank Analysis of Incomplete Block Designs.*
  Biometrika 1952 — pairwise comparison foundation for anchor-vs-candidate.
- neo-nixetube user-memory: `feedback_gan_noise_handling.md` — the rule
  "LLM-as-judge has ±10 noise; use ratchet MAX, never weaken anchor" was
  learned the hard way on the path-2 CAD loop. This feature canonicalises
  that lesson.

## Core idea

Under a noisy metric, the naive "keep iff metric_new > metric_prev" rule
of autoresearch Phase 6 will *weaken the anchor*: a better iteration
gets discarded when it happens to be measured below an earlier lucky
high. Three-part fix:

1. **Anchor on the best-ever measurement, not the previous one.** The
   ratchet is a monotonic envelope. Keep iff `metric_new > ratchet_MAX`
   under higher-is-better.
2. **Re-measure the anchor under the same conditions before comparison.**
   The anchor's stored score becomes stale as model/env drifts.
   Re-running verify on the anchor commit before the comparison removes
   this drift.
3. **Require the candidate to beat the anchor by a margin > noise floor σ
   before keeping.** Empirical σ comes from N repeated measurements of
   the anchor (project practice: N=3).

Without (1) the loop regresses under noise. Without (2) the ratchet
inflates over time. Without (3) noise is mistaken for progress.

## Why this matters for axis design

This project's own autoresearch CAD loop learned this rule by hitting the
failure mode 41 iterations deep with SUM=35/90 (ratchet MAX) while the
anchor kept drifting. Feedback memory `feedback_gan_noise_handling.md`
records the rule. This feature makes that rule a first-class, rippable
catalog entry instead of tacit knowledge.

Tightly coupled to — but distinct from — `plateau-detection`:

- Plateau detection answers *when to stop or switch strategy*.
- Ratchet answers *which iterations to keep*.
- Both read the same noise floor σ from the same source of truth.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| in-loop (primary) | Phase 6 decision override: keep iff `metric_new > ratchet + σ`. |
| pre-loop | Before the loop starts, establish σ by running verify on the baseline commit N times. |
| post-loop | Report includes the σ, the ratchet trajectory, and any iterations that beat the ratchet by <σ (flagged as "possibly noise"). |

## Mapping to this project's axes

- **axis1:** `outer` — the ratchet state is stored in
  `autoresearch-results.tsv` (already emitted by the autoresearch
  SKILL's results-log) plus `harness/build/ratchet.json` for σ and the
  current anchor commit. Claude Code's built-in verify loop does *not*
  carry a noise-aware ratchet.
- **axis2:** `in-loop` (primary).

## Rippable signal

Absorbed when the autoresearch SKILL (or an equivalent CC-native
optimiser) implements a noise-aware ratchet with explicit σ estimation.
Probe: inject N=20 measurements of a fixed commit with known controlled
noise, σ_true = 10. If the CC-native implementation's estimated σ̂
converges to within ±15% of σ_true AND it refuses to keep iterations
that beat the anchor by < σ̂, rip this feature.

## Minimal viable implementation for neo-nixetube

1. `scripts/harness/ratchet.py` — maintains `harness/build/ratchet.json`
   with fields `{anchor_commit, anchor_score, sigma, n_samples,
   last_resampled_at}`.
2. Called from the autoresearch loop at Phase 6 via a pre-decision hook.
3. On every iteration, optionally re-measures the anchor commit (stale
   after >24h or >20 iterations).
4. Emits `KEEP=1|0` with reason (`beats-ratchet+sigma`, `within-noise`,
   `below-ratchet`).

## Contrast

`llm-as-judge-audit` uses a different judge to break self-enhancement
bias at the *score-generation* level. This feature breaks noise at the
*decision* level. Both are required when the metric is judge-based;
neither replaces the other.
