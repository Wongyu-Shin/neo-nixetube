# Parallel Statistical TC Runner

**Primary source:** Welch, B. L. *The generalization of Student's problem
when several different population variances are involved.* Biometrika,
1947. https://doi.org/10.1093/biomet/34.1-2.28

**Related references:**
- Miller, J. *Reaction Time Analysis with Outlier Exclusion.* Bulletin of
  the Psychonomic Society, 1988 — establishes the pattern of pre-registering
  sample sizes and exclusion criteria.
- Henderson, P. et al. *Deep Reinforcement Learning That Matters.* AAAI
  2018. arXiv:1709.06560 — case study in why single-seed RL results mislead
  and how to fix with N-seed multi-run + confidence intervals.
- MLPerf Training benchmark — canonical parallel statistical test harness.
- neo-nixetube user-memory: "LLM-as-judge has ±10 noise; tests must be
  parallel + statistical" — explicit axis-1 requirement from the user.

## Core idea

Agent-harness features are probabilistic: the same TC run twice against the
same model can produce different trajectories because the model is
stochastic. A single-run TC therefore cannot reliably answer "is this
harness feature still needed on model M / CC version V?". The runner
addresses this by:

1. **Parallel N-sample execution.** Each TC run is an independent trial;
   runs are dispatched via a pool (default N=10, bounded by wall-clock).
2. **Pre-registered statistic.** For each TC the catalog declares the
   decision rule, e.g. *"feature is needed iff `with` arm mean iterations-
   to-fix < `without` arm mean with Welch t-test p < 0.05"*.
3. **Deterministic aggregation.** Statistics are computed from raw per-run
   results; the runner outputs a single pass/fail + effect size + p-value.
4. **Auto-triggered.** The runner is invoked by a Claude Code
   `SessionStart` hook whenever it detects a version/model change
   (comparing `claude --version` against a pinned cache) — satisfies the
   user's "TC 는 필요한 시점에 자동으로 트리거" requirement.

## Why this matters for axis design

This is the **axis-1 meta-feature** — the mechanism that makes every
other feature's `tc_script` field load-bearing. Without a parallel
statistical runner the TCs degenerate to smoke tests and rippable claims
are untestable. The user's axis-1 requirements list parallel execution
and statistical proof as first-class concerns, which is why this feature
gets a catalog entry of its own rather than being folded into `verify.sh`.

## Harness-relevant decomposition

| Phase | Role |
|---|---|
| pre-loop | The `SessionStart` auto-trigger compares installed CC/model against a pinned manifest; if either changed, the runner re-executes all TCs and updates the applicability field of stale entries. |
| in-loop (primary) | Every autoresearch iteration runs the fast tier (N=1 smoke tests); the slow statistical tier runs asynchronously in the background, its results batched into the next Phase-1 review. |
| post-loop | The runner's final report lists features whose TC is now failing (i.e., absorbed upstream) and queues them for rip. |

## Mapping to this project's axes

- **axis1:** `outer` — orchestrates parallel workers across multiple
  Claude Code sessions / Anthropic API calls. Claude Code's current
  test surface is single-run.
- **axis2:** `in-loop` (primary) — but with a fractal link:
  pre-loop auto-trigger and post-loop rip-queue.

## Rippable signal

Absorbed when Claude Code's own test / skill infrastructure provides
N-sample parallel execution with pre-registered aggregation for any
user-supplied TC. Probe:

1. Define a reference TC with known p-value (inject controlled noise).
2. Run CC-native N-sample on it.
3. If effect-size estimate within 5% of the oracle AND runtime within
   2× the external runner on equal parallelism, rip.

## Minimal viable implementation for neo-nixetube

1. `scripts/harness/stat_run.py` — takes a TC script path and a spec
   (`N`, `decision_rule`, `arms: [with, without]`), dispatches via
   `concurrent.futures.ProcessPoolExecutor`, aggregates.
2. Per-feature statistical TC: `harness/tests/statistical/<name>.py`
   (referenced in the feature frontmatter as `statistical_tc` — optional,
   upgraded from `tc_script` over time).
3. `SessionStart` hook in `.claude/settings.json` invokes
   `scripts/harness/on_version_change.sh` which runs stat_run against
   every feature's optional statistical TC when a delta is detected.
4. Results cached in `harness/build/stat-cache/<commit>/<name>.json`;
   verify.sh reads the cache and short-circuits re-runs on identical
   inputs.

## Why this is tracked as a single feature

This *is* the axis-1 machinery. Every other feature's TC depends on it
once they upgrade from smoke-test to statistical tier. Keeping it as one
catalog entry makes the dependency explicit and rippable as a unit.
