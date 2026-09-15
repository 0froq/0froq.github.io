---
name: verify-froq
description: Drive the froQ Nuxt site in a browser the way a visitor does — home, essays, journal, cabinet, dashboard, contact — and capture proof. Use when proving a UI change works, before merging route/layout/content-render work, or when asked to verify froQ locally.
---

# Verify froQ

froQ is a public Nuxt 4 site (this repo). Visitors read Essays, Journal, and Cabinet, skim the dashboard board, and reach contact/stack. There is no product login. Drive the **web UI** at a dedicated local URL. The Cloudflare Worker (`workers/froq-api`) is a separate surface; do not treat it as the primary app.

This skill is for the next agent, mid-task, who has never seen the site. Follow it literally.

## Launch

Start only an instance this run owns. Default port `4317` so it does not collide with a human `pnpm dev` on 3000.

```bash
.cursor/skills/verify-froq/scripts/control-froq launch
.cursor/skills/verify-froq/scripts/control-froq doctor
```

- Ready: `GET http://127.0.0.1:4317/` returns 200 and the HTML contains `froQ`. Launch double-forks Nuxt into a new session so the instance stays up after the command returns.
- Isolation: launch sets `NUXT_PUBLIC_FROQ_API=http://127.0.0.1:9` so the dev `/__froq` proxy does not write likes, reactions, or presence to production. Dashboard board still loads from `docs/dashboard/board.yml` via `GET /api/board`.
- Log: `/tmp/verify-froq/nuxt.log`
- Second instance: set `FROQ_VERIFY_PORT` and `FROQ_VERIFY_DIR` to a different pair. If port 4317 is already listening and is not this run's pid, `launch` refuses. Do not drive a shared instance.

Teardown:

```bash
.cursor/skills/verify-froq/scripts/control-froq cleanup
```

Cleanup kills only the pid in `/tmp/verify-froq/instance.env`. It does not delete `/tmp/verify-froq/artifacts`.

## Doctor

Run before driving whenever anything looks off.

```bash
.cursor/skills/verify-froq/scripts/control-froq doctor
```

Require `doctor=ok`: process alive, port owned by that pid, `GET /`, `GET /essays`, `GET /journal`, `GET /cabinet`, and `GET /api/board` all 200, identity `froQ`. If doctor fails, do not click around a mystery server.

HTTP-only route check:

```bash
.cursor/skills/verify-froq/scripts/control-froq fetch /essays
.cursor/skills/verify-froq/scripts/control-froq url
```

`fetch` is not user-path proof. Use it to confirm the instance is the one you launched.

## Drive

Harness: `control-froq` for process/HTTP, Cursor browser (or any CDP browser) for the visitor path.

1. Open `$(.cursor/skills/verify-froq/scripts/control-froq url)` plus the route in the feature file.
2. Snapshot the accessibility tree. Prefer roles and accessible names over CSS and coordinates.
3. Click named links/buttons from the feature map. Do not click `Like this page`, `Like this site`, or anything whose name starts with `React to`.
4. Capture the action and the resulting state (URL + heading + screenshot/ARIA), not only the final screen.

Stable handles that exist in this repo:

| Handle | Where |
| --- | --- |
| heading / sr-only `froQ` | `/` logo |
| navigation `Sections` with links `Essays`, `Journal`, `Cabinet`, `Dashboard` | `/` |
| link `contact` | home prose → `/contact` |
| link `stack` | home prose → `/stack` |
| button `Scroll to scraps` / `Back to landing` | home mast |
| region `Scraps` | home below the fold |
| link `Home` (`← home`) | every non-home page |
| navigation `Sections` | `/essays`, `/journal`, `/cabinet` |
| links `Essays`, `Journal`, `Cabinet` | publication rail |
| article heading from `docs/essays/...` / `docs/journal/...` / `docs/cabinet/...` frontmatter `title` | reading pages |
| heading `Dashboard`, searchbox `Web search` | `/dashboard` |
| headings `Active`, `Backlog`, `Archive` | dashboard board (omit a heading if that column is empty) |
| heading `Contact`; `Email sayhola@froq.me`; `Copy WeChat @_froq_` | `/contact` |
| heading `Stack`; buttons `Expand: Fluent` etc. | `/stack` |

Fixture article (stable, `status: form`):

- Essays: `/essays/d-hyalina-is-not-rat` — title `透明溞不是老鼠`
- Journal: `/journal/speaking-english` — title `Speaking English: A Comedy of Errors and Small Victories`
- Cabinet: `/cabinet/absurdity` — title `如此荒诞`

Read `.cursor/skills/verify-froq/features/README.md` and the matching feature file before driving. A proof that uses one convenient URL is incomplete when the map lists other entry points; report an untried entry as untried, not verified.

## Evidence

Proof lives in `/tmp/verify-froq/artifacts/<feature-id>/`. Cleanup must not remove it.

For each driven feature keep:

- `before.aria.txt` / `after.aria.txt` — accessibility snapshots
- `before.png` / `after.png` — screenshots that show the froQ identity (logo, `← home`, or page heading)
- `note.md` — feature id, entry point, URL before/after, what was clicked, pass/fail

Standards:

- Exercise the real visitor path (home rail, section index, reading page). Do not call `$fetch` or write Vue test state and call that a UI proof.
- Capture the click and the resulting heading/URL, not only a later screen.
- Side effects: board data is the YAML file (read-only). Clipboard copy on contact is a real side effect — assert the button still exists and, if the browser exposes clipboard, the copied string `_froq_`. Do not open `mailto:` or external search tabs as proof of the site.
- Isolation: likes/reactions/presence are pointed at a closed local port. Do not treat missing like counts as a product regression during a verification run.

## Cleanup

```bash
.cursor/skills/verify-froq/scripts/control-froq cleanup
```

Stops the pid this run started. Leaves `/tmp/verify-froq/artifacts` and `/tmp/verify-froq/nuxt.log`. Do not `killall node` / `pkill nuxi`.

## Helpers

```bash
.cursor/skills/verify-froq/scripts/control-froq launch
.cursor/skills/verify-froq/scripts/control-froq doctor
.cursor/skills/verify-froq/scripts/control-froq url
.cursor/skills/verify-froq/scripts/control-froq fetch /dashboard --out /tmp/verify-froq/artifacts/dashboard-board/dashboard.html
.cursor/skills/verify-froq/scripts/control-froq cleanup
```

The script is executable. If it is not, `chmod +x` it once.
