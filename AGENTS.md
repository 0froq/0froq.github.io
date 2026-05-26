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

### Day plans: `docs/dashboard/dayTodos/YYYY-MM-DD.yml`

```yaml
# AI-DAY-PLAN-START
date: "YYYY-MM-DD"
weekday: "周一"
theme: "本日主题"

tasks:
  - title: "任务标题"
    priority: high # high | medium | low
    dod: "完成定义"
    status: notStarted # done | inProgress | notStarted | deferred | cancelled | blocked
    tags: [deepWork] # optional: forIdiot, deepWork, timeBoxing, optional, etc.
    notes:
      - text: "说明或链接标题"
        url: "https://example.com/optional"

constraints:
  - "当日时间或环境约束"

meta:
  generatedAt: "YYYY-MM-DDTHH:mm:ss+08:00"
  basedOn: [week, advisor, corpus, hard-context]
  weekId: "YYYY-MM-DD" # that week's Monday
  notes: "自由文本元信息"
# AI-DAY-PLAN-END
```

### Week plans: `docs/dashboard/weekTasks/YYYY-MM-DD.yml`

The filename and `weekId` are the Monday of the week.

```yaml
# AI-WEEK-PLAN-START
weekId: "YYYY-MM-DD"
theme: "本周主题"

tasks:
  - title: "任务标题"
    priority: high
    dod: "完成定义"
    status: notStarted
    tags: [deepWork]
    notes:
      - text: "说明或链接标题"
        url: "https://example.com/optional"

goals:
  - "本周目标"

capacity:
  estimatedDays: 5
  plannedDeepWorkDays: 3

meta:
  generatedAt: "YYYY-MM-DDTHH:mm:ss+08:00"
  basedOn: [last-week-review, month-backlog, year-vision]
  constraints:
    - "本周时间约束"
  notes: "自由文本元信息"
# AI-WEEK-PLAN-END
```

When objective time disappears because of travel, exams, experiments, illness, etc., mark unfinished planned tasks as `deferred` and explain the cause in task `notes[].text` and/or `meta.notes`. Do not leave them as `notStarted` if the reason is a legitimate external constraint.

### Month backlogs: `docs/dashboard/monthBacklogs/YYYY-MM.yml`

```yaml
# AI-MONTH-BACKLOG-START
monthId: YYYY-MM
period: YYYY-MM-01 至 YYYY-MM-DD

categories:
  - name: 分类名
    description: 分类说明

items:
  - title: "任务标题"
    dod: "完成定义"
    status: arranging # arranging | notPlanned | deferred
    category: 分类名
    due: 2026/05/31 # optional
    notes:
      - text: "说明或链接标题"
        url: "https://example.com/optional"

meta:
  generatedAt: "YYYY-MM-DDTHH:mm:ss+08:00"
  lastReview: null
  nextReview: YYYY-MM-DD
  notes: |
    自由文本月度说明。
# AI-MONTH-BACKLOG-END
```

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

## Dashboard advisor Markdown

Advisor context files live under `docs/dashboard/advisor/`.

- Start context files: `YYYY-MM-DD-start.md`.
- End/review context files: `YYYY-MM-DD-end.md`.
- Persistent state files: `docs/dashboard/advisor/state/latest-end.daily.yml` and `latest-end.weekly.yml`.
- `hard.md` contains fixed context: identity, routine, recurring commitments, current constraints, long-term projects, and rhythms. Update it when the user reports durable schedule/project changes.

Advisor Markdown is free-form but should include explicit headings for:
- date/week id,
- theme,
- context used,
- constraints,
- task carryover,
- outcome/reason when a plan is deferred.

## Corpus conventions

Corpus content lives under `docs/corpus/` and uses the six-layer architecture defined in `docs/corpus/_lib/corpus_layers.zsh`:

| Layer | Alias | Directory | Meaning | Filename pattern |
|---|---|---|---|---|
| autopsia | aut | `000-autopsia/` | Metacognitive dissection and optimization | `aut-... .md` |
| ingesta | ing | `100-ingesta/` | Information intake and sources | `ing-... .md` |
| paper | paper | `100-ingesta/` | Paper/citation entries | `ing-@citation.md` or generated paper form |
| neoplasma | neo | `200-neoplasma/` | Internalization and thinking | `neo-... .md` |
| putredo | put | `300-putredo/` | Journaling and retrospective review | `put-YYYYMMDD... .md` or `put-topic.md` |
| delirium | del | `400-delirium/` | Aesthetic materials and wonders | `del-... .md` |
| vigil | vig | `500-vigil/` | Non-rational/semi-rational creation | `vig-... .md` |

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

## Agent behavior requirements

- Before writing dashboard plans, read the relevant existing dashboard files and preserve the current schema.
- Do not create `links` fields in dashboard YAML.
- Do not mix scalar task/item notes with note arrays. For tasks/items, use `notes: [{ text, url? }]`.
- If a plan was made but later became impossible because external time disappeared, update statuses to `deferred` and record the reason so future agents do not interpret it as being stuck.
