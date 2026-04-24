---
name: dgm-h-archive-parent-selection
axis1: outer
axis2: in-loop
applicability:
  claude_code: ">=2.0.0 <3.0.0"
  models: [claude-opus-4-7, claude-sonnet-4-6]
tc_script: harness/tests/dgm-h-archive-parent-selection.sh
rippable_check: "Fixture Goal with two interfering local optima; N=20 iter × 5 seeds; CC-native vs. external sampler. If CC-native matches on (both-optima-discovery fraction, iterations-to-second-optimum) within 15% across all seeds, rip."
sources:
  - "https://arxiv.org/abs/2603.19461"
  - "https://github.com/facebookresearch/Hyperagents"
  - "https://doi.org/10.1162/EVCO_a_00025"
---

# DGM-H archive & probabilistic parent selection

Zhang 2026's open-ended exploration substrate: an archive of every
generated hyperagent (not just successes), sampled probabilistically
with weight ∝ performance × 1/(1+#compiled_children). Without the
children-count factor the archive collapses onto the current best;
without the performance factor search is random. The two-factor rule
is what preserves exploration while biasing toward fertile ancestors.

The project's `autoresearch-harness-results.tsv` + git history is
structurally an archive already — every experiment commit is retained.
What's missing is the parent sampler: the current loop always branches
from HEAD. This feature catalogues the gap and the fix.

Explicit non-overlap with `voyager-skill-library` (retrieval-by-
embedding of successes only) and `adas-meta-agent-search` (archive-
conditioned proposal without evolutionary weights). The feature
`meta-hyperagents-metacognitive` assumes this feature's substrate —
if this rips, that one loses its evolutionary base.

See `harness/research/dgm-h-archive-parent-selection.md` for the
quoted §3 mechanism, the full comparison table vs. Voyager, and the
two-local-optima fixture that drives the rippable probe.

## Referenced by

- `harness-pause-resume`
