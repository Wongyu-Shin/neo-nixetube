---
slug: harness-csv-legibility
title: "Harness SVG legibility — RENDERED_SMALL=397→0 via FullBleed + bulk fontSize bump"
keywords:
  - svg
  - fontsize
  - legibility
  - max-width
  - fullbleed
  - playwright
  - viewbox
  - container
created: 2026-04-29
sources:
  - autoresearch-csv-render-results.tsv
  - scripts/harness/csv-render-verify.sh
  - web/app/components/FullBleed.tsx
  - web/mdx-components.tsx
half_life_days: 180
---

## TL;DR

1 iter, RENDERED_SMALL 397→0 across `/harness`, `/harness/constitution`, `/harness/flow`. The fix needed **both** a container break-out (`<FullBleed>`) **and** bulk fontSize bump in the source SVGs — neither alone moved the metric, because the two causes multiplied each other.

## Why two causes multiplied

- **Cause A — `max-w-4xl` container.** `web/app/layout.tsx` wraps `<main>` in `max-w-4xl` (56rem ≈ 896 px) which is great for prose readability (70–80 chars/line) but downscales any SVG with viewBox 800–960 px to ~0.9× — so a `fontSize="11"` attribute renders as ~10 px on screen.
- **Cause B — small source fontSizes.** A previous loop (`[[harness-mdx-qa-loop]]`'s F5/F6) bumped fontSize on a few components. But >50% of the 34 harness components still had `fontSize="9"` etc. Even FullBleed's 1.85× expansion left those below 12 px on viewBoxes with high text density.

## How the fix works

- **`web/app/components/FullBleed.tsx`** — `margin-left:50% + translateX(-50%)` trick + `width: min(72rem, 100vw - 2rem)`. Breaks out of the parent's max-w-4xl while staying viewport-bounded. Registered globally in `web/mdx-components.tsx` so MDX can use `<FullBleed><X /></FullBleed>` directly.
- **3-page wrapping (41 instances)** — Python regex wraps every self-closing component tag.
- **Bulk fontSize bump** — across all 34 harness components, every SVG `fontSize` attribute (string, brace, ternary forms) and every Tailwind `text-[Npx]` < 12 → ≥ 12.

## Verification

Playwright Python (`/opt/homebrew/Caskroom/miniforge/base/bin/playwright`) + chromium-headless-shell are installed on this machine. `scripts/harness/csv-render-verify.sh` starts dev-server :3000, opens 1280×900 viewport, walks every `<svg text>`, counts those with `getComputedStyle(t).fontSize < 12 px`. Cross-confirmed live via Chrome MCP — both Playwright and live render show 0.

## Things follow-up work must know

- **Always suspect both causes when SVG text is illegible on this site.** Fixing only one (raise fontSize OR widen container) leaves the other multiplier active.
- **`<FullBleed>` is the docs/notion full-bleed pattern** — preserves prose narrowness while letting visuals use viewport. Reusable on any future page.
- **Per-iter Chrome MCP cross-check** validates the Playwright headless metric — they should agree; disagreement is a metric integrity problem.

## Cross-references

- `[[harness-mdx-qa-loop]]` — the prior loop's F5/F6 was the partial fix that this one completed.
- `[[harness-component-translation-loop]]` — same components, different aspect (prose translation).
