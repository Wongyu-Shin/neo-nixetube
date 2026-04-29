---
slug: cad-path-2-room-temp
title: "Path 2 (Room-Temp) CAD GAN loop — anchored at SUM=35/90"
keywords:
  - cad
  - path-2
  - nixie
  - room-temp
  - composite-seal
  - butyl
  - torr-seal
  - ratchet
  - gan
  - cadquery
created: 2026-04-13
sources:
  - cad/path-2-room-temp/LOOP_STATE.md
  - autoresearch-cad-path2-results.tsv
  - autoresearch-cad-mdx-results.tsv
half_life_days: 90
---

## TL;DR

3 sessions, 41 iters of GAN-adversarial autoresearch on the Path 2 (room-temperature composite-seal) Nixie tube CAD; landed at SUM=35/90 (MIN=3) with 18 GAN-found flaws. **Resume rule:** read `cad/path-2-room-temp/LOOP_STATE.md` (~270 lines) before any further iteration — it carries the anchor+ratchet mechanism, the ±10 noise profile, 7 CadQuery bugs, the 6-stage convergence trajectory, and 8 strategy options.

## Operating envelope

- Goal: 9 manufacturing-quality criteria all ≥ 9. Currently MIN=3, SUM=35/90.
- Cost: ~5 Opus calls per verify, 20–35 min per iter. Total to date: ~205 calls / ~15 h wall-clock.
- Anchor file: `build/prev_scores.txt` (per-criterion ratchet MAX, protects against GAN noise).
- Critic comparison: `build/prev_critics_summary.txt`.
- Strategy: "design change under ratchet protection" — regressions auto-blocked, only promotions accumulate.

## Session 3 key discoveries (2026-04-13)

- **GAN noise is ±10 SUM** on identical code (iter 36 measurement).
- **Silicone RTV is 200× worse than butyl** for permeation.
- **CTE 7× mismatch** between glass and rubber → composite seal (butyl inner + Torr Seal outer).
- **Font text() achieves C6=5** (proven iter 33).
- **Geometry changes regress unrelated criteria by ±4–8** — the GAN re-judges holistically, not per-change.
- **Documentation purpose changes can regress up to −8** — catastrophic on intent drift.
- **Ratchet (per-criterion MAX) eliminates noise regressions** — every metric drop after a kept iter is blocked.

## Next-session priorities

Hybrid metric design: deterministic check (`harness-rip-test.sh`-style) **AND** GAN — to bypass the ±10 noise ceiling that pure GAN cannot push through.

## Cross-references

- `harness-rip-test` — feature that gives the deterministic half of the hybrid.
- `[[harness-mdx-translation-loop]]` and `[[harness-component-translation-loop]]` — same project, different loops; their deterministic-metric pattern is what the hybrid borrows from.
- User memory `feedback_gan_noise_handling` — the cross-repo lesson distilled from this loop's noise discovery.
