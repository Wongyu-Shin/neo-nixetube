---
slug: harness-mdx-translation-loop
title: "Harness MDX en→ko translation loop — 5 pages, PROGRESS=66.0/100"
keywords:
  - translation
  - mdx
  - korean
  - glossary
  - ratchet
  - anchor-stickiness
  - gan
created: 2026-04-28
sources:
  - autoresearch-translate-results.tsv
  - loops/docs-loop-translate/source-en/
  - harness/glossary-ko.md
  - scripts/harness/translation-verify.sh
half_life_days: 180
---

## TL;DR

10 iters, 5 MDX pages translated en→ko, final PROGRESS=66.0/100 (page-SUM 198/300, ratchet-protected). Per-page ratcheted SUM: overview=37, constitution=37, flow=41, wiki=40, catalog=43. 10 keeps / 0 discards. Validated the cross-repo `[[feedback_gan_noise_handling]]` rule that ratchet MAX defends against ±6 measured noise.

## Operating rules for follow-up work

- `loops/docs-loop-translate/source-en/` is **frozen** — do not edit; it is the rollback baseline.
- `harness/glossary-ko.md` is the **authoritative glossary** (35+ mappings + Do-Not-Translate list + `-한다` style rules).
- JSX/import lines in MDX must remain **byte-identical** to source-en; the G2 import guard enforces this.
- npm build must always pass (G1 guard).

## Three lessons learned

1. **Anchor stickiness pattern.** Judge ANCHOR RULES say "DEFAULT keep prev unless defender cites concrete fix"; qualitative refinement alone (iters 6–7) barely moves the anchor. To shift score requires either (a) lucky upward noise, or (b) defender-citable structural change. Pure-polish iters look like 0-improvement runs.
2. **±6 noise empirically measured.** Re-verifying identical text: overview 37→35→31, constitution 37→34. Ratchet MAX defended every time — exactly the policy `feedback_gan_noise_handling` codifies.
3. **First pass dominates the metric.** Iters 1–5 (each page's first translation) drove PROGRESS 0→66.0. Iters 6–10 (polish/re-verify) showed 0 metric movement despite clearly-better Korean — **metric saturation, not quality saturation**.

## Things follow-up work must know

- Glossary changes apply via 5-page bulk sed (page-cross-glossary consistency drives the T6 score directly).
- "0 metric movement" in iter 6+ is **not** proof of useless changes — the diff still seeds the next verify's base.
- `source-en/` is preserved permanently (even after loop close). New page additions follow the same freeze pattern.

## Infra

- `scripts/harness/page-translate-verify.sh` — per-page GAN (Defender + 4 Critics + Judge), 6 criteria (T1 terminology, T2 fidelity, T3 idiomatic_korean, T4 jsx_intact, T5 length_parity, T6 glossary_consistency).
- `scripts/harness/translation-verify.sh` — 5-page orchestrator, ratchet MAX, supports `--bootstrap` / `--dry` / `--pages=`.
- `scripts/harness/translation-guard.sh` — npm build + import integrity + glossary advisory.

## Cross-references

- `[[harness-component-translation-loop]]` — the follow-up loop that translated the imported TSX components (where the MDX-only GAN was blind).
- `[[harness-mdx-qa-loop]]` — uncovered defects in the same translated pages later.
- User memory `feedback_gan_noise_handling` — the cross-repo distilled rule.
