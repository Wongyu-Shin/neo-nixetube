---
name: statistical-tc-runner
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5]
tc_script: harness/tests/statistical-tc-runner.sh
rippable_check: "Reference TC with controlled injected noise, oracle p-value known. Run CC-native N-sample infra on same TC. If effect-size estimate within 5% of oracle AND runtime within 2× external runner on equal parallelism, rip."
sources:
  - "https://doi.org/10.1093/biomet/34.1-2.28"
  - "https://arxiv.org/abs/1709.06560"
  - "https://mlcommons.org/en/training-normal-21/"
---

# Parallel statistical TC runner

This is the axis-1 machinery itself: every other feature's `tc_script`
becomes load-bearing only once a runner can execute it as a pre-
registered, parallel, statistically-aggregated trial — not a single-shot
smoke test.

Satisfies the four inline requirements from the user's axis-1 charter
that no prior feature addressed head-on:

| Requirement (user's words) | How this feature satisfies it |
|---|---|
| 재현 가능한 TC | Pre-registered decision rule in the feature frontmatter |
| 적용 범위 (claude_code 버전 / 모델별) | `applicability.claude_code` + `applicability.models` consumed by the runner |
| 병렬 실행 + 통계적 증명 | `ProcessPoolExecutor` dispatch, Welch t / CI aggregation |
| 자동 트리거 | `SessionStart` hook diffs installed CC/model vs. pinned manifest, kicks stat_run on change |

Every prior feature's TC is currently a deterministic smoke test; the
upgrade path is `harness/tests/statistical/<name>.py` — referenced from
the feature's frontmatter once implemented. Tracking this as its own
catalog entry keeps the dependency explicit.

See `harness/research/statistical-tc-runner.md` for the decision-rule
schema and the cache/short-circuit protocol.
