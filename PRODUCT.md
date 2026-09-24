# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

[inferred from brief] Readers who land on a personal site looking for writing, a personal journal, a cabinet of materials, and a glimpse of ongoing work — not a product pitch. They may skim, linger, or leave. Chinese is the primary language; English exists as a secondary index.

## Product Purpose

froQ is a personal site: three public writing spaces (Essays, Journal, Cabinet), and a public work surface (Dashboard). Success is that a visitor can tell, without finishing the page, what the author is currently thinking and making.

## Positioning

Not a blog feed. An issue-style index of attempts — “一份不必全部读完，仍然可以知道主人正在想什么的索引。”

## Operating Context

Nuxt 4 + Nuxt Content, public markdown under `docs/essays`, `docs/journal`, and `docs/cabinet`; historical material under `docs/archive` is not deployed. Shared chrome (header/footer) wraps section shells. Local dev: `nr dev`.

## Capabilities and Constraints

- Content is real markdown; do not invent entries, dates, or quotes.
- Dashboard is not ported yet; show an honest empty desk, not fake board data.
- Chinese typography and mixed CN/EN meta labels are expected.

## Brand Commitments

- Name: froQ.
- First screen: quiet signature page, left-biased on wide screens — froQ SVG + short prose on the left, section routes only in the right whitespace. Fits one viewport when height allows (no Y scroll on the intro pane). Typography: EB Garamond (+ CJK fallbacks).
- Below the intro: sticky-scroll scrapboard (碎碎念) sourced from `docs/scraps.toml`. Cards may link to recommended reading; emoji reactions go through Cloudflare (`api.froq.me`), not GitHub.
- Essays, Journal, and Cabinet are entered directly from the home rail. Each has its own index and article route; inner headers show the current section and optional article title.
- Voice: precise, slightly wry, unwilling to over-explain.

## Evidence on Hand

- Homepage copy and structure from the pinned HTML mock.
- Real public entries in `docs/essays`, `docs/journal`, and `docs/cabinet`.
- Site identity: `public/logo.svg`, github.com/froQ.

## Product Principles

- Index, not feed: lists are editorial, not chronological dumps.
- Leave tabs open: the site can be incomplete in public.
- Shared chrome, sectional bodies: header and footer stay one piece of paper.
- Type and grid do the personality; do not decorate around empty content.
