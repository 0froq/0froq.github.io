# Repository Agent Notes

This repository is a VitePress knowledge-management site. Future agents must preserve the dashboard and corpus file formats below; malformed YAML/frontmatter causes later planning agents and dashboard renderers to misread state.

## Dashboard YAML conventions

Dashboard data lives under `docs/dashboard/`.

### Link-like notes

Dashboard items use `notes`, not `links`, for link-like annotations.

```yaml
notes:
  - text: Human-readable note text
    url: https://example.com/optional
  - text: Plain note without a URL
```

Rules:
- Do not write `links` in dashboard YAML.
- Do not write `label` under dashboard item notes; use `text`.
- `url` is optional. Omit it for status-change notes, handoff comments, or other non-link annotations.
- Existing render logic treats `notes[].text`/`notes[].url` like the old `links[].label`/`links[].url`.
- Top-level prose fields named `notes` may still be scalar strings or block scalars inside `meta`, review sections, or free-form context, but task/item `notes` must be a sequence of `{ text, url? }` objects.

### Board: `docs/dashboard/board.yml` (primary)

The board is the **single source of truth** for current tasks. It replaces the former dayTodos/weekTasks/monthBacklogs system.

```yaml
# AI-BOARD
updated: "YYYY-MM-DDTHH:mm:ss+08:00"
weekTheme: "本周主题"

active:
  - title: "任务标题"
    priority: high # high | medium | low
    status: inProgress # inProgress | notStarted | blocked | deferred
    dod: "完成定义"
    notes:
      - text: "说明或链接标题"
        url: "https://example.com/optional"
    tags: [deepWork] # optional: forIdiot, deepWork, timeBoxing, optional, etc.
    since: "YYYY-MM-DD"

done:
  - title: "已完成任务"
    completed: "YYYY-MM-DD"
    notes:
      - text: "备注"

backlog:
  - title: "待办任务"
    notes:
      - text: "说明"
# AI-BOARD-END
```

Sections:
- `active`: tasks currently in progress or planned for today/this week.
- `done`: recently completed tasks (rotate out old entries periodically).
- `backlog`: future tasks, low priority, waiting for conditions.

Rules:
- Update `board.yml` when task status changes (start, complete, defer, etc.), not on a fixed schedule.
- `active` tasks should have a `status` field. `done` and `backlog` tasks default to `done` and `notStarted` respectively if status is omitted.
- `notes` is always an array of `{ text, url? }` objects.
- `weekTheme` can be updated when the week's focus shifts.
- Old dayTodos/weekTasks/monthBacklogs files are preserved for history but should NOT be created for new plans.

### Visions and hints

`docs/dashboard/visions/*.yml`, `docs/dashboard/hints/fence.yml`, and `docs/dashboard/hints/tip.yml` are YAML sequences of items. Use `notes` for URLs or annotations:

```yaml
- title: "目标或提示"
  description: "可选说明"
  category: "分类"
  locale: zh
  notes:
    - text: "链接标题或补充说明"
      url: "https://example.com/optional"
```

## Dashboard advisor context

Advisor context lives in a **single rolling file**: `docs/dashboard/advisor/context.md`.

- Update it when something significant changes (direction shift, major milestone, new constraint), not as a daily ritual.
- `hard.md` contains fixed context: identity, routine, recurring commitments, current constraints, long-term projects, and rhythms. Update it when the user reports durable schedule/project changes.
- Old per-day advisor files (`YYYY-MM-DD-start.md`, `YYYY-MM-DD-end.md`) and state files (`state/*.yml`) are preserved for history but should NOT be created for new plans.

## Legacy formats (preserved, do not create new)

The following formats are retained in existing files for historical reference. **Do not create new files** using these schemas:

- `docs/dashboard/dayTodos/YYYY-MM-DD.yml` — old daily plans
- `docs/dashboard/weekTasks/YYYY-MM-DD.yml` — old weekly plans
- `docs/dashboard/monthBacklogs/YYYY-MM.yml` — old monthly backlogs
- `docs/dashboard/advisor/YYYY-MM-DD-start.md` — old daily advisor start context
- `docs/dashboard/advisor/YYYY-MM-DD-end.md` — old daily advisor end context
- `docs/dashboard/advisor/state/*.yml` — old verification state files

## Corpus conventions

Corpus content lives under `docs/corpus/` and uses the six-layer architecture defined in `docs/corpus/_lib/corpus_layers.zsh`:

| Layer | Alias | Directory | Meaning | Filename pattern | Scope |
|---|---|---|---|---|---|
| autopsia | aut | `000-autopsia/` | Metacognitive dissection and optimization | `aut-... .md` | Internal |
| ingesta | ing | `100-ingesta/` | Information intake and sources | `ing-... .md` | External |
| paper | paper | `100-ingesta/` | Paper/citation entries | `ing-@citation.md` or generated paper form | External |
| neoplasma | neo | `200-neoplasma/` | Internalization of external knowledge | `neo-... .md` | External → Internal |
| putredo | put | `300-putredo/` | Journaling and retrospective review | `put-YYYYMMDD... .md` or `put-topic.md` | Internal |
| delirium | del | `400-delirium/` | Aesthetic materials and wonders | `del-... .md` | External → Internal |
| vigil | vig | `500-vigil/` | Non-rational/semi-rational creation | `vig-... .md` | Internal |

### Corpus Markdown frontmatter

Use YAML frontmatter exactly at the top:

```markdown
---
title: Title
created: YYYY-MM-DD
status: draft
last_modified: YYYY-MM-DD HH:mm:ss
---

---

[[toc]]

#scope/... #source/...
```

Rules:
- `title`, `created`, `status`, and `last_modified` are required for normal corpus entries.
- `status` values seen in this corpus include `draft` and `form`; prefer `draft` unless the user explicitly says the note is finalized/formalized.
- Keep the separator line `---`, `[[toc]]`, and tag line structure from the templates in `docs/corpus/_template/`.
- Paper entries add bibliographic bullets after the tag line:
  - `citation_key`
  - `title`
  - `author`
  - `journal`
  - `year`
  - `doi`
- Prefer creating corpus entries through the existing corpus tooling/templates when possible instead of inventing a new structure.

### Hashtag conventions

- Do not invent new hashtags on the tag line or anywhere in corpus entries.
- If you believe a new hashtag is warranted, ask the user for review first. Use it only after approval.
- Existing tags (e.g. `#scope/...`, `#source/...`, `#log/...`) should be reused whenever they fit.

## Agent behavior requirements

- Read `board.yml` and `advisor/context.md` before starting any planning conversation.
- Do not create `links` fields in dashboard YAML.
- Do not mix scalar task/item notes with note arrays. For tasks/items, use `notes: [{ text, url? }]`.
- If a task becomes impossible because external constraints changed, update its status in `board.yml` and explain the reason in its `notes`.
- Do not create new files using the legacy dayTodos/weekTasks/monthBacklogs/advisor-start/advisor-end formats.
