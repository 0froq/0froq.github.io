# Dashboard board

Dashboard lets a visitor search the web from a local field and skim the same board YAML the site serves. Search must not be submitted during verification; the board is the proof.

## Sub-features

- `dash-open` opens Dashboard from home or `/dashboard`.
- `dash-search-field` shows the web-search box without opening an external tab.
- `dash-board` shows the Active / Backlog / Archive columns that have tasks.
- `dash-home` returns via `← home`.

## How to get to it (user POV)

- From home, choose `Dashboard`.
- Open `/dashboard` directly.
- Type in `Web search` (do not submit).
- Choose `Home` to leave.

## Driving it with control-froq

Preconditions:

- froQ is healthy at `http://127.0.0.1:4317`.
- `control-froq doctor` reports `doctor=ok` including `GET /api/board = 200`.
- `docs/dashboard/board.yml` has at least one task in `active`, `backlog`, or `archive`.

- **Open.** Open Dashboard. Navigate to `$(control-froq url)/dashboard` or click `Dashboard` from `/`. Heading `Dashboard` is visible. Copy includes `Search the web, skim the board.`
- **Search field.** Find the searchbox named `Web search`. Do not press `go` and do not submit the form. The URL stays on `/dashboard`. No new tab.
- **Board.** Read the headings `Active`, `Backlog`, and `Archive` that are present. At least one of those headings exists. A task title from `board.yml` is visible as text (not only in the network response).
- **HTTP cross-check.** Run `control-froq fetch /api/board --out /tmp/verify-froq/artifacts/dashboard-board/board.json`. Status 200. The JSON `active` / `backlog` / `archive` arrays match what the page shows. This is a second view of the same data, not a substitute for the page heading.
- **Proof.** Snapshot and screenshot `/dashboard` at `/tmp/verify-froq/artifacts/dashboard-board/dash.aria.txt` and `dash.png`. Both show heading `Dashboard` and at least one board column heading.

## Gotchas

- Submitting search opens Google/Bing/DuckDuckGo in a new tab. That is not froQ behavior to prove. Leave the field empty or filled but unsubmitted.
- Empty columns are omitted. Do not fail because `Archive` is missing if `board.yml` has no archive tasks.
- Site stats in the footer may be empty under API isolation. That is expected for a verification instance.
- `Now happening` presence also depends on the isolated API. Do not require live visitor counts.
