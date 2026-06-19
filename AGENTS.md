# Agent Operational Notes (Draft)

This file collects operational edge cases and pitfalls not covered by skill definitions.
Format per entry: Problem → Real case → Correct practice.

> ⚠️ **Draft — under review by froQ**

---

## 1. Dashboard & Board.yml

### 1.1 notes format in YAML

- **Problem**: Writing `notes` as a scalar string or using `links`/`label` fields breaks dashboard render logic silently.
- **Case**: `notes: "just a note"` — YAML parser accepts this, but the dashboard renderer expects `[{text, url?}]` and produces blank output with no error.
- **Correct**: Always use `notes:` as a sequence of objects:
  ```yaml
  notes:
    - text: Human-readable note
      url: 'https://optional.url'
  ```
  This applies to `board.yml` (active/backlog/archive), visions, hints, and any other dashboard YAML.
  Top-level prose fields named `notes` outside dashboard YAML (e.g. in free-form context blocks) may still be scalar strings.

### 1.2 Board column semantics

- **Problem**: Treating top-level board columns and per-task execution status as the same state axis creates redundant or contradictory data.
- **Correct**:
  - `active`: all tasks that still belong to the current execution narrative. Active tasks may use `status` such as `inProgress`, `notStarted`, `blocked`, `done`, `deferred`, or `cancelled`.
  - `backlog`: ideas or possible tasks with no concrete arrangement yet. Backlog items should not use `status`.
  - `archive`: completed long ago, fully closed, or no longer relevant to subsequent work. Archive items should not use `status`; use `completed` when known.
  - There is no top-level `done` column. Recent completions that still inform ongoing work remain in `active` with `status: done`; only fully closed items move to `archive`.

### 1.3 Confirm gate: when to apply strictly vs when to skip

- **Problem**: Applying the full confirm flow (preview → ask → wait) to trivial or corrective updates makes the agent feel bureaucratic.
- **Case A — Trivial update**: User says "mark the blog-post task as done". Agent responds with "Here's the change, please confirm:" instead of just doing it.
- **Case B — Correction**: User says "actually I made a mistake, task X is NOT done, change it back". Agent re-applies the full confirm gate instead of just reverting.
- **Correct**:
  - ✅ Full confirm flow (skill-defined): multi-task planning, weekly themes, context changes — anything that meaningfully changes the plan.
  - ✅ Brief acknowledgment: single-task status updates within `active`, flagging, priority tweaks — do it and say "done" or ask "anything else?".
  - ✅ Direct execute (no gate): error corrections the user explicitly flags as corrections, reverts, and "never mind" rollbacks.

### 1.4 Reading vs planning: trigger discrimination

- **Problem**: A read-only query triggers the full start-my-day / end-my-day skill flow, which feels overwhelming.
- **Case**: User asks "what's on my board today?" Agent launches into "Good morning! Let me help you plan your day..."
- **Correct**: Read-only queries (status check, "show me X", "what's active") → read board.yml and serve the data plainly. Only enter planning/review conversation flow when user signals intent with phrases like "let's plan", "帮我规划", "复盘一下", or equivalent.

### 1.5 Malformed board.yml handling

- **Problem**: board.yml has a YAML syntax error (e.g. from a previous bad write by another agent). The agent silently fails to parse it and proceeds with an empty view.
- **Case**: A previous write left `notes: ""` instead of `notes: []`, causing YAML parse to return null for an entire section.
- **Correct**: If board.yml fails to parse or a section is unexpectedly empty/null:
  1. Report the exact file path and the parse error to the user.
  2. Attempt to identify and fix the syntax issue manually (the agent can reason about YAML structure).
  3. Present the fix as a diff and ask the user to verify.
  4. Do not proceed with planning/review on an empty parse.

---

## 2. Corpus Conventions

### 2.1 Filename prefix must match layer

- **Problem**: Creating a file in the wrong directory or with the wrong prefix for its content type. The corpus tooling and the six-layer architecture rely on consistent prefix→layer mapping.
- **Case**: Dropping a metacognitive entry into `100-ingesta/` with prefix `aut-`, or putting an aesthetic entry in `000-autopsia/` with prefix `del-`.
- **Correct**: Prefix strictly follows layer directory:

  | Directory        | Prefix | Content                  |
  | ---------------- | ------ | ------------------------ |
  | `000-autopsia/`  | `aut-` | Metacognition            |
  | `100-ingesta/`   | `ing-` | External intake & papers |
  | `200-neoplasma/` | `neo-` | Internalized knowledge   |
  | `300-putredo/`   | `put-` | Journaling & review      |
  | `400-delirium/`  | `del-` | Aesthetic materials      |
  | `500-vigil/`     | `vig-` | Non-rational creation    |

  The [layer reference tooling](docs/corpus/_lib/corpus_layers.zsh) provides `corpus_normalize_layer` to resolve aliases.

### 2.2 Putredo: date-based vs topic-based naming

- **Problem**: Not knowing when to use a date vs a topic as the filename, leading to either a cluttered directory or untrackable entries.
- **Case A**: Creating `put-my-thoughts.md` for a single-day journal entry — should have been `put-YYYYMMDD.md`.
- **Case B**: Creating `put-20260528.md` for a long-term recurring topic like "research-ltmp" — should have been `put-research-ltmp.md`.
- **Correct**:
  - **Journal entry** (single day, one-off reflection): `put-YYYYMMDD.md`
  - **Topic entry** (recurring or long-form reflection on a specific theme): `put-topic.md`
  - **Dated topic entry** (a session on a topic that may recur): `put-topic-YYYYMMDDHHMM.md`
  - Examples from the corpus: `put-20260527.md` (journal), `put-research-ltmp.md` (topic), `put-lswt-hiatus-202603261356.md` (dated topic).

### 2.3 Paper entries require the @ prefix

- **Problem**: Creating paper entries without the `@` prefix, which breaks the paper-vs-other-ingesta distinction.
- **Case**: Creating `ing-dai2018.md` instead of `ing-@dai2018.md`.
- **Correct**: Paper entries in `100-ingesta/` use `ing-@citation_key.md`. The `@` signals a paper citation rather than a general intake note. Use the paper template (`_template/tp-paper.md`) which includes bib metadata fields after the tag line:
  ```markdown
  - citation_key: dai2018
  - title: ...
  - author: ...
  - journal: ...
  - year: ...
  - doi: ...
  ```

### 2.4 Frontmatter completeness

- **Problem**: Omitting one or more required frontmatter fields, which breaks corpus rendering and tag-based queries.
- **Case**: Creating a corpus entry with only `title` and `created`, missing `status` and `last_modified`.
- **Correct**: Every corpus entry must have all four required fields:
  ```yaml
  ---
  title: Entry Title
  created: YYYY-MM-DD
  status: draft # or "form" if the user says finalized
  last_modified: YYYY-MM-DD HH:mm:ss
  ---
  ```
  Always start from the corresponding template in `docs/corpus/_template/`.

### 2.5 Hashtag invention

- **Problem**: Inventing new hashtags on the tag line without user approval, creating tag fragmentation.
- **Case**: Adding `#my-custom-tag` to a corpus entry when existing tags like `#scope/work`, `#source/paper`, or `#log/reading` would fit.
- **Correct**:
  - Reuse existing tags (`#scope/...`, `#source/...`, `#log/...`) whenever they fit.
  - If no existing tag covers the concept, propose the new tag to the user in conversation and wait for approval.
  - Do not add unapproved tags to the file.

### 2.6 Markdown source line width

- **Problem**: Writing long Markdown source lines makes corpus/posts hard to edit in terminal editors and produces noisy diffs.
- **Case**: A prose paragraph is written as one 200+ character line; it renders fine, but exceeds the editor's comfortable width and is hard to review.
- **Correct**:
  - For Markdown prose, wrap lines by semantic units. Aim for about 80 English-character visual width, or about 40 Chinese characters.
  - Prefer line breaks after Chinese punctuation, English punctuation, spaces, or Chinese/English boundaries.
  - Do not hard-break between two adjacent Chinese characters if a nearby punctuation or phrase boundary exists.
  - Do not break Markdown syntax units such as links, inline code, footnote markers, emphasis markers, or image syntax.
  - Lists should wrap with indentation preserved.
  - Frontmatter, tables, code blocks, raw URLs, and generated machine-readable blocks are exempt when wrapping would reduce correctness or readability.

---

## 4. Git Conventions

### 4.1 Prohibited commit type: chore

- **Problem**: Using `chore` as a commit type undermines the conventional commit system by grouping semantically different changes under a single catch-all label.
- **Correct**: Do not use `chore` as a commit type. Use the most specific applicable type instead:

  | Type        | Use for                                                    |
  | ----------- | ---------------------------------------------------------- |
  | `feat`      | New user-facing features or functionality                  |
  | `fix`       | Bug fixes                                                  |
  | `docs`      | Documentation changes including corpus entries and posts   |
  | `refactor`  | Code restructuring without behavioral change               |
  | `style`     | Formatting, whitespace, lint fixes (no logic change)       |
  | `test`      | Adding or modifying tests                                  |
  | `build`     | Build system, dependencies, package manager changes        |
  | `ci`        | CI/CD pipeline, automation, deployment config              |
  | `perf`      | Performance optimization                                   |
  | `content`   | Content-only changes (corpus entries, posts, dashboard data) |
  | `data`      | Data file updates (board.yml state, advisor context)       |
  | `config`    | Configuration file changes (eslint, tsconfig, etc.)        |

  Prefer `content` for corpus/posts additions, `data` for dashboard/board state changes, and `config` for tooling setup. When in doubt, `docs` covers most text file changes under `/docs`.

### 4.2 Commit scope

- **Problem**: Omitting scope makes commit history harder to navigate.
- **Correct**: Include a scope when the change is contained to a specific module or directory. Common scopes: `dashboard`, `board`, `advisor`, `corpus`, `posts`, `skills`, `docs`, `vitepress`, `scripts`, `config`.
- **Examples**:
  ```
  docs(corpus): add growth patrol entries 2026-06-19
  content(posts): update lake warming draft notes
  data(board): mark exam review task as done
  config(scripts): remove unused BibTeX parser
  ```

---

## 3. Agent Behavior & Tool Use

### 3.1 Confirm gate for skills vs direct instructions

(Related to 1.2 above, but from the tool-use perspective rather than board structural perspective.)

- **Problem**: Applying the skill's strict confirm sequence (preview → ask → write) to every agent action, even when the user's instruction is unambiguous and standalone.
- **Case**: User says "add this task to backlog: 'read paper X'". Agent responds with "Here's the preview, please confirm:" instead of just adding it and saying "done".
- **Correct**:
  - **Unambiguous, single-step instructions**: execute and report. The execution itself is the confirmation — if there's an error, the user will correct it.
  - **Multi-step or consequential changes**: preview → ask confirm → write. When in doubt, preview briefly.
  - Use judgment: "change status of active task X to done" → execute. "Move X to archive" → execute if explicit. "Let's plan the week" → full confirm flow.

### 3.2 read-then-ask-then-write: the one exception

- **Problem**: Reading `board.yml` + `context.md` is mandatory before any planning/review conversation, but some agents skip this in the name of "natural conversation".
- **Case**: User says "let's review my week" and the agent starts asking "so how was your week?" without having read the board — leading to uninformed questions like "what did you work on?"
- **Correct**: Always read `board.yml` + `advisor/context.md` + relevant hints before entering a planning or review conversation. The skill flow explicitly calls this out as step 1 in all four skills.
