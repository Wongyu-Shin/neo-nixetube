# Alignment-Free Self-Improvement

**Primary citation:** Zhang, J. et al. *HyperAgents.* 2026.
arXiv:2603.19461, §2 Related Work + §3 Methods.
**Primary source:** https://arxiv.org/abs/2603.19461
**Reference code:** https://github.com/facebookresearch/Hyperagents

**Contextual references:**
- Zhang et al., *The Darwin Gödel Machine.* 2025b — the coding-aligned
  predecessor whose limitation HyperAgents critiques.
- Wang, G. et al., *Voyager.* arXiv:2305.16291 — lifelong learning tied
  to Minecraft-skill evaluation (alignment by construction).
- Schmidhuber 2003, *Gödel Machine* — the theoretical self-modifier
  whose impracticality motivates empirical alignment proxies.

## Core claim — quoted from §2

> "To improve at self-improving, the DGM relies on a limiting
> assumption: that the skills required to solve the evaluation tasks
> are the same as those required for effective self-reflection and
> self-modification. This assumption is unlikely to hold outside
> coding domains, where task-solving skills may differ substantially
> from the skills needed to analyze failures, propose self-improvements,
> and implement them."

And the HyperAgents move (§3):

> "Prior work therefore relies on an alignment between the evaluation
> task and the skills required for self-modification. In contrast,
> hyperagents do not assume such alignment, because the self-modification
> mechanism is fully modifiable and not tied to any particular task
> domain. Hence, hyperagents can improve both task performance and the
> process of improvement itself across any computable task."

## Why this is a feature, not just a paper insight

For *this* project — a nixie-tube feasibility study — the evaluation
task (CAD drawing fidelity, Paschen simulation MAPE, manufacturing-
scenario safety scoring) has almost zero overlap with the skills needed
to improve the *harness* (bash scripting, prompt engineering, schema
design, statistical test plumbing). That is exactly the misalignment
the quote names. Any harness feature that assumes `evaluation skill ≈
self-modification skill` is therefore mis-designed for this project.

This feature catalogues the **negative constraint** that rules out
such designs, plus the positive discipline that lets the harness
evolve without alignment:

1. **Separate the evaluation artefact from the self-modification
   artefact.** `cad/`, `sim/`, `reason/` evaluate; `harness/`,
   `scripts/harness/`, `.claude/` self-modify. These are different
   codebases with different skills. The `Scope:` of any autoresearch
   Goal should live in exactly one of them.
2. **Cross-domain transfer is the only honest validation.** If a
   harness change improves evaluation metric on CAD but degrades it
   on simulation, the change was over-fitting the CAD skill into the
   harness. See `cross-domain-transfer-metric` (next feature) for the
   measurement discipline.
3. **The harness's success metric must not be the project's success
   metric.** If it were, we'd be back in the alignment regime.
   `SCORE` in `harness/verify.sh` is *about the harness itself* —
   feature completeness, TC pass-rate — not about CAD fidelity or
   Paschen MAPE.

## Harness-relevant decomposition

Principles map weakly to one phase, but the natural pin is pre-loop:
Goal design is where alignment mistakes are introduced.

| Phase | Role |
|---|---|
| pre-loop (primary) | During `/autoresearch:plan`, reject Goals whose Scope straddles both `harness/` and project-content directories. |
| in-loop | The meta agent is forbidden from editing eval artefacts (CAD files, simulation code) when its Goal is harness improvement. Enforceable via `cc-hook-guardrail` scope rules. |
| post-loop | Reporter includes a *skill-domain audit* — which directories were touched, was there cross-domain bleed. |

## Mapping to this project's axes

- **axis1:** `outer` — this is a discipline enforced by planning
  conventions and hook-level scope checks. No CC-native primitive
  knows about "harness vs. content" separation.
- **axis2:** `pre-loop` (primary).

## Rippable signal

The feature is rippable when the runtime infers skill-domain boundaries
automatically and refuses cross-domain Goals without prompting. Probe:

1. Draft an autoresearch Goal that straddles `harness/` and `cad/`
   (e.g., "improve cad/path-2 fidelity by editing the harness schema").
2. Submit to CC-native planning primitive.
3. If CC flags the cross-domain straddle unprompted (either rejects
   or requires explicit two-scope declaration), rip.

Without that capability, operators may unknowingly write aligned
Goals and the harness quietly overfits.

## Minimal viable implementation for neo-nixetube

1. `harness/SCOPE.md` — declares which directories are "harness
   domain" vs. "content domain". Currently: harness = `{harness/,
   scripts/harness/, .claude/}`; content = `{cad/, sim/, reason/,
   predict/, scenario/, web/, tests/}`.
2. A pre-loop skill (`.claude/skills/scope-check/`) that reads the
   proposed `Scope:` and rejects cross-domain straddles with an
   explanation referencing this file.
3. Post-loop auditor (reusable bash) that runs `git diff --name-only
   baseline..HEAD | xargs ...` against `SCOPE.md` and reports bleed.

## Contrast

- `swe-agent-aci` — tool surface curation, not Goal validation.
- `plan-mode-discipline` — forces HITL through a specific channel;
  says nothing about domain separation.
- `cross-domain-transfer-metric` (next) — the *measurement* half of
  this feature's *design* half. Both are needed; neither subsumes the
  other.
