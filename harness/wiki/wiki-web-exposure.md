---
slug: wiki-web-exposure
title: "Wiki web exposure — dynamic [slug] route + index card grid"
keywords:
  - wiki
  - web
  - exposure
  - dynamic-route
  - generateStaticParams
  - next-mdx-remote
  - gray-matter
  - static-export
created: 2026-04-29
sources:
  - autoresearch-wiki-web-results.tsv
  - scripts/harness/wiki-web-verify.sh
  - web/lib/wiki.ts
  - web/app/harness/wiki/[slug]/page.tsx
  - web/app/components/harness/WikiIndex.tsx
half_life_days: 365
---

## TL;DR

1 iter, WIKI_WEB_MISSING 6→0. The harness/wiki/ entries landed in the previous migration are now exposed at `/harness/wiki/<slug>/` with full body rendering + at `/harness/wiki/` as a card grid. Article VII finally dogfoods end-to-end: SessionStart matcher reads the same files that GitHub Pages publishes, with a single source of truth (`harness/wiki/*.md`).

## How the static export works

- `next.config.mjs` has `output: 'export'` + `trailingSlash: true` → no SSR; everything is built at compile time.
- `web/lib/wiki.ts` reads `harness/wiki/*.md` from `path.resolve(process.cwd(), '..')` (repo root from `web/`), filters `SCHEMA.md` + `_*` prefixes. Frontmatter parsed via `gray-matter` (already a project dep).
- `web/app/harness/wiki/[slug]/page.tsx` exports `generateStaticParams()` returning every slug. Body rendered via `next-mdx-remote/rsc` + `remark-gfm`. Header carries slug + title + keyword pills + created/half-life (orange "stale — revalidate" when age > half_life_days). Footer lists `sources:` (URLs as anchors, repo paths as `<code>`).
- `web/app/components/harness/WikiIndex.tsx` is a server component; it calls `listWikiEntries()` at build time and emits a 2-column card grid.

## Why it's a single iter

The metric was a union: `unrendered ∪ index_unlinked`. Rendering all 6 entries dropped `unrendered` to 0, and adding `<WikiIndex />` to the existing `web/app/harness/wiki/page.mdx` dropped `index_unlinked` to 0 in the same commit. Splitting into 2 iters would have shown 6 → 6 → 0 (the rendering iter alone wouldn't move the metric since the same 6 slugs stayed in the union via the unlinked side). Cohesive single-iter avoided the false-stall.

## Things follow-up work must know

- **Next 16 Promise params signature.** Both `default async function Page({ params }: { params: Promise<{ slug: string }> })` AND `generateMetadata` need to await `params`. Sync signatures compile but the route serves "Not found" metadata while the body still renders correctly — easy to miss.
- **`process.cwd()` in `web/lib/wiki.ts` is `web/` at build time.** Hence `path.resolve(process.cwd(), '..')` to reach repo root. If the build is ever invoked from repo root directly (unusual for Next), update.
- **Adding a new wiki entry is friction-free now.** Drop a new `harness/wiki/<slug>.md` (with SCHEMA frontmatter), rebuild — it appears at `/harness/wiki/<slug>/` and on the index card grid automatically. No registration step.
- **TL;DR extraction is regex-based** in `WikiIndex.tsx`: matches `## TL;DR` heading then captures up to the next `##`/`---`/EOF. If a future entry lacks a TL;DR section, the card just shows no preview.

## Cross-references

- `[[harness-tier1-implementation]]` — the impl loop that built `/harness:wiki-add` and the SessionStart keyword matcher; this loop is the "publish to web" companion.
- `[[harness-mdx-qa-loop]]` — same deterministic-binary metric pattern.
- `[[harness-csv-legibility]]` — same Playwright-cross-checked single-iter pattern.
