---
slug: harness-mdx-qa-loop
title: "Harness MDX QA loop — 2 bugs + 5 defects + global palette, QA_FLAWS=8→0"
keywords:
  - qa
  - mdx
  - bug
  - defect
  - dark-prefix
  - tailwind
  - navdropdown
  - scrolltotop
  - dark-mode
  - palette
created: 2026-04-29
sources:
  - autoresearch-qa-results.tsv
  - scripts/harness/qa-verify.sh
  - "https://github.com/Wongyu-Shin/neo-nixietube/commits/main"
half_life_days: 180
---

## TL;DR

9 iters, 8 mechanical checks (F1–F8) drove all reported MDX/UI defects to 0. The most consequential finding for any future visual fix on this codebase: **`dark:` Tailwind prefixes are dead code here** — the app has no light/dark toggle, so `text-neutral-900 dark:text-neutral-100` always renders as the light-mode class (invisible black-on-black on the dark layout).

## Eight checks closed

- **F1 nav-active** — `NavDropdown` longest-prefix-wins via `pickActive` (the naive `pathname.startsWith` always false-positives `/harness` Overview on `/harness/<sub>`).
- **F2 scroll-restore** — `ScrollToTop` client component watches `usePathname()`.
- **F3 constitution co-location** — hoisted 8 visuals from §9 dump into article sections in `web/app/harness/constitution/page.mdx`.
- **F4 flow appendix** — hoisted 5 visuals into §2/§3/§5 in `web/app/harness/flow/page.mdx`; deleted 3 duplicates; dropped §10.
- **F5 / F6** — SVG `fontSize` 7–10 → 11–14, opacity 0.6 → 0.92.
- **F7** — `ArticleIndex` dropped unused `dark:` prefix; switched to direct stone palette + amber/25 hover.
- **F8** — same `dark:` migration on 4 more components; regex tightened from `[0-6]` to `[0-4]` per channel pair to drop false-positive saturated-accent flags.

## How to apply

- For QA loops on this codebase, prefer **deterministic per-defect bash check + binary aggregate count** (`scripts/harness/qa-verify.sh` pattern) over LLM-as-judge — same anti-stickiness benefit as `[[harness-component-translation-loop]]`.
- The app has **no dark/light toggle** in `web/app/layout.tsx`. When you see `text-neutral-900 dark:text-neutral-100` in this repo, it almost certainly renders invisible. Drop the `dark:` prefix and use `text-stone-100` directly.
- `NavDropdown.tsx` requires longest-prefix-wins (`pickActive`) for any future overview-vs-subpage active state.
- Per-iter Chrome MCP visual verification is efficient (~30 s/iter) for font/color defects but adds no value for grep-only checks; selectively use it on F5/F6/F7-style visual fixes.
- Verify-script regex correctness matters: F8 hex check first used `[0-6][0-9a-fA-F]{5}` and false-flagged 16 saturated palette greens; tightened to `([0-4][0-9a-fA-F]){3}` (each channel < 0x50) to catch only true dark grays.

## Pending follow-up (not blocking)

Introduce VSCode Dark+ semantic tokens (`--fg-strong / --fg-base / --fg-muted / --border-subtle`) in `web/app/globals.css` and migrate harness pages incrementally. The user accepted but didn't require this for QA_FLAWS=0.

## Cross-references

- `[[harness-csv-legibility]]` — direct follow-up: F5/F6 fontSize fix was incomplete because of max-width container scaling; that loop closed it.
- `[[harness-mdx-translation-loop]]` and `[[harness-component-translation-loop]]` — the QA loop ran on top of those translations.
