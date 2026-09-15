# froQ verification map

This directory is the maintained source for verifying visitor-facing behavior of froQ. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch froQ with `.cursor/skills/verify-froq/scripts/control-froq launch` at `http://127.0.0.1:4317`.
- Run `.cursor/skills/verify-froq/scripts/control-froq doctor` and require `doctor=ok`.
- Never drive an instance that was not started by this verification run.
- Do not click `Like this page`, `Like this site`, or `React to …`. Those paths proxy to the froQ API; launch isolates them to a closed local port.
- Proof artifacts go to `/tmp/verify-froq/artifacts/<feature-id>/`. Cleanup must leave them.

## Driving conventions

- Start every recipe from `/` unless the feature file says otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or paint coordinates.
- Treat quoted names as literal: `Essays`, `Journal`, `Cabinet`, `Dashboard`, `Home`.
- Browser: Cursor browser MCP (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_take_screenshot`).
- HTTP: `control-froq fetch` only confirms the instance; it is not visitor-path proof.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with froQ identity visible (logo, `← home`, or the page heading).
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted name and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-froq` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home navigation](./home-nav.md) covers landing identity, section links, scraps, stack, and return home.
- [Read an essay](./essays-read.md) covers the Essays index and a fixture article.
- [Read a journal entry](./journal-read.md) covers the Journal index and a fixture entry.
- [Read a cabinet piece](./cabinet-read.md) covers the Cabinet index and a fixture piece.
- [Dashboard board](./dashboard-board.md) covers the board columns and the web-search field (no external submit).
- [Contact](./contact-reach.md) covers the contact sheet and copyable WeChat handle.
