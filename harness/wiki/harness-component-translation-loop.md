---
slug: harness-component-translation-loop
title: "Harness component (TSX) en→ko translation — residue 461→77, PROGRESS=83.3"
keywords:
  - translation
  - component
  - tsx
  - korean
  - residue
  - deterministic-metric
  - jsx-struct
  - glossary
created: 2026-04-28
sources:
  - autoresearch-comp-translate-results.tsv
  - loops/docs-loop-translate-comp/source-en/
  - scripts/harness/component-residue.sh
  - scripts/harness/component-translate-verify.sh
half_life_days: 180
---

## TL;DR

6 iters, 34 TSX components translated en→ko, residue 461→77 (PROGRESS=83.3/100), 0 discards. Validated that **deterministic mechanical metric beats GAN** for translation: residue dropped monotonically (461→394→278→214→156→77→77), no anchor stickiness. The G3 jsx_struct guard (export name + props identifier set + useState/useEffect counts byte-equal) caught zero regressions across 6 iters — translation never broke component identity.

## Why this loop existed

The MDX translation loop (`[[harness-mdx-translation-loop]]`) discovered that MDX text was Korean but the imported TSX component data/JSX text remained English — pages rendered partially English. This loop closed that gap.

## Three findings vs the prior loop

1. **Anchor stickiness avoided.** Switching from LLM-judge to deterministic mechanical residue (count of multi-word English phrases in string literals + JSX text, after filtering import/className/path-like) gave a monotonically-decreasing metric. No iter sat at the same value.
2. **Ratchet unnecessary.** Zero-noise deterministic metric → simple keep-on-improve replaces SUM=MAX ratchet.
3. **Stronger guard.** G3 jsx_struct (export, props, hook count byte-equal) added on top of G1 build + G2 import. 100% PASS over 6 iters confirms translation never altered identifiers or signatures.

## Things follow-up work must know

- New TSX components: bootstrap by adding to `loops/docs-loop-translate-comp/source-en/`, write Korean from the first commit, follow `harness/glossary-ko.md`.
- The remaining 77 residue is **hard residue**: identifier-prose hybrids (e.g. `Bash deny hook`), DOM noun-phrases, short primitive labels. Further compression has low ROI — 83.3 is a natural stop.
- **MDX-GAN and component-residue are orthogonal scopes.** Component translations did NOT move the MDX-GAN PROGRESS=66.0 (anchor remained stable) — proof the two loops covered disjoint regions.

## Recommended follow-ups

- To push residue lower: (a) translate caller-side data of props-driven components (FeatureCard etc.), or (b) sweep short JSX label literals.
- To raise MDX-level GAN: needs a separate polish loop with structural changes (see anchor-stickiness lesson in `[[harness-mdx-translation-loop]]`).

## Infra

- `scripts/harness/component-residue.sh` — English-phrase residue counter (filters className / import / identifier code / path-like literals).
- `scripts/harness/component-translate-verify.sh` — bootstrap freezes baseline + 34 source-en files; `--gan` runs MDX 5-page GAN as adjunct.
- `scripts/harness/component-translate-guard.sh` — G1 build, G2 import (34 components + 5 MDX), G3 jsx_struct.
- `loops/docs-loop-translate-comp/source-en/*.tsx` — frozen English baseline (preserved permanently).

## Cross-references

- `[[harness-mdx-translation-loop]]` — the prior loop that left the gap this one filled.
- `[[harness-mdx-qa-loop]]` — discovered visual defects across the same translated components.
- `[[harness-csv-legibility]]` — followed up on font-size issues in the now-translated SVG components.
