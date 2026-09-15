# Agent Operational Notes (Draft)

This file collects operational edge cases and pitfalls for agents working in this repo.
Format per entry: Problem → Real case → Correct practice.

> ⚠️ **Draft — under review by froQ**

Day/week planning skills (`start-my-day`, `end-my-day`, `start-my-week`, `end-my-week`) are **retired**. Do not invoke them. Board and advisor files remain the source of truth for dashboard state.

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

  This applies to `board.yml` (active/backlog/archive) and visions.
  Hints use their own shape (`title` / `description` / `category`) — do not force a `notes` array there.
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
  - Full confirm flow: multi-task planning, weekly themes, context changes — anything that meaningfully changes the plan.
  - Brief acknowledgment: single-task status updates within `active`, flagging, priority tweaks — do it and say "done" or ask "anything else?".
  - Direct execute (no gate): error corrections the user explicitly flags as corrections, reverts, and "never mind" rollbacks.

### 1.4 Reading vs planning: trigger discrimination

- **Problem**: A read-only query triggers a heavy planning conversation, which feels overwhelming.
- **Case**: User asks "what's on my board today?" Agent launches into a full day-planning ritual.
- **Correct**: Read-only queries (status check, "show me X", "what's active") → read `board.yml` and serve the data plainly. Only enter planning/review conversation when user signals intent with phrases like "let's plan", "帮我规划", "复盘一下", or equivalent.

### 1.5 Malformed board.yml handling

- **Problem**: board.yml has a YAML syntax error (e.g. from a previous bad write by another agent). The agent silently fails to parse it and proceeds with an empty view.
- **Case**: A previous write left `notes: ""` instead of `notes: []`, causing YAML parse to return null for an entire section.
- **Correct**: If board.yml fails to parse or a section is unexpectedly empty/null:
  1. Report the exact file path and the parse error to the user.
  2. Attempt to identify and fix the syntax issue manually (the agent can reason about YAML structure).
  3. Present the fix as a diff and ask the user to verify.
  4. Do not proceed with planning/review on an empty parse.

### 1.6 Advisor files

- **Paths**:
  - `docs/dashboard/advisor/hard.md` — low-frequency hard constraints (identity, schedule, standing rules).
  - `docs/dashboard/advisor/context.md` — rolling notes (current focus, handoff).
  - `docs/dashboard/advisor/state/` — optional machine-readable snapshots; not required for conversational flows.
- **Correct**: Before planning or review conversations, read `board.yml` + `hard.md` + `context.md` (+ relevant hints). Do not invent a day/week skill ritual.

---

## 2. Public writing and archive boundaries

- Public content lives only in `docs/essays/`, `docs/journal/`, and `docs/cabinet/`.
- `docs/archive/` is historical material. Do not edit, publish, summarize into new public content, or use it as a template unless the user explicitly points to a file.
- Do not create a public entry from Capture, Yard, Work, a briefing, a task log, or an agent run. Public writing requires an explicit user request or a finished draft the user has chosen to publish.
- `Essays` holds independent arguments, technical writing, and finished pieces. `Journal` holds time-bound personal writing. `Cabinet` holds selected found or made materials. Living gatherings that will keep receiving fragments use `kind: evergreen` (existing `kind` field). Do not invent extra taxonomies.
- New public Markdown needs `title`, `created`, `status`, and `last_modified` frontmatter. Use `status: draft` until the user says it is public-ready; do not invent tags or metadata taxonomies.

## 3. Agent Behavior & Tool Use

### 3.1 Confirm gate vs direct instructions

- **Problem**: Applying a strict confirm sequence (preview → ask → write) to every agent action, even when the user's instruction is unambiguous and standalone.
- **Case**: User says "add this task to backlog: 'read paper X'". Agent responds with "Here's the preview, please confirm:" instead of just adding it and saying "done".
- **Correct**:
  - **Unambiguous, single-step instructions**: execute and report. The execution itself is the confirmation — if there's an error, the user will correct it.
  - **Multi-step or consequential changes**: preview → ask confirm → write. When in doubt, preview briefly.
  - Use judgment: "change status of active task X to done" → execute. "Move X to archive" → execute if explicit. "Let's plan the week" → full confirm flow (no retired skill required).

### 3.2 read-then-ask-then-write

- **Problem**: Agents start planning/review talk without reading board/advisor state.
- **Case**: User says "let's review my week" and the agent asks "so how was your week?" without having read the board.
- **Correct**: Always read `docs/dashboard/board.yml` + `docs/dashboard/advisor/hard.md` + `docs/dashboard/advisor/context.md` (+ relevant hints) before entering a planning or review conversation.

---

## 4. Git Conventions

### 4.1 Prohibited commit type: chore

- **Problem**: Using `chore` as a commit type undermines the conventional commit system by grouping semantically different changes under a single catch-all label.
- **Correct**: Do not use `chore` as a commit type. Use the most specific applicable type instead:

  | Type       | Use for                                                      |
  | ---------- | ------------------------------------------------------------ |
  | `feat`     | New user-facing features or functionality                    |
  | `fix`      | Bug fixes                                                    |
  | `docs`     | Documentation and public-writing changes     |
  | `refactor` | Code restructuring without behavioral change                 |
  | `style`    | Formatting, whitespace, lint fixes (no logic change)         |
  | `test`     | Adding or modifying tests                                    |
  | `build`    | Build system, dependencies, package manager changes          |
  | `ci`       | CI/CD pipeline, automation, deployment config                |
  | `perf`     | Performance optimization                                     |
  | `content`  | Content-only changes (public writing, dashboard data) |
  | `data`     | Data file updates (board.yml state, advisor context)         |
  | `config`   | Configuration file changes (eslint, tsconfig, etc.)          |

  Prefer `content` for public-writing additions, `data` for dashboard/board state changes, and `config` for tooling setup. When in doubt, `docs` covers most text file changes under `/docs`.

### 4.2 Commit scope

- **Problem**: Omitting scope makes commit history harder to navigate.
- **Correct**: Include a scope when the change is contained to a specific module or directory. Common scopes: `dashboard`, `board`, `advisor`, `essays`, `journal`, `cabinet`, `docs`, `scripts`, `config`.
- **Examples**:

  ```
  content(essays): publish lake warming draft
  content(journal): add dated entry
  data(board): mark exam review task as done
  config(scripts): remove unused BibTeX parser
  ```

---

## 5. Vue styling

### 5.1 UnoCSS first — template, then `--uno`, never `@screen`

- **Problem**: Agents dump layout into `<style scoped>`, invent `@media (min-width: 760px)` or `@screen md`, and write `padding: 1rem` instead of `un-p-4`. The same rules have been restated in chat and forgotten.
- **Case**: Hub peek used `@media (min-width: 1200px)` / `@screen lg` while the template already had `un-lg:flex-row`. Two breakpoint systems, and the list got squeezed at `md` because CSS did not match attributify.
- **Correct** — read `uno.config.mts` before writing styles. This repo uses `presetWind4` + `presetAttributify` (`prefix: 'un-'`, `prefixedOnly: true`) + `presetTagify` (`prefix: 'un-'`) + `transformerDirectives` / `transformerVariantGroup`. Theme breakpoints: `sm` 600, `md` 760, `lg` 1200 (`app/utils/breakpoints.ts`). Semantic surfaces use CSS tokens (`ink`, `paper`, `muted`, `line`, `colored-ink`, `wry`, …). Wind palette colors (`rose`, `emerald`, …) are fine for one-off accents — do not invent a new CSS token just to avoid a Wind hue. Shortcuts to reuse: `chrome-blur`, `reach-hit`, `filter-hit`. Do not add page layout shortcuts (`sheet`, rails). JS `matchMedia` uses `mqMin('lg')` / `mqMax('md')`, not magic pixels.

  **Order of work:**
  1. **Template first.** Put layout, type, color, gap, and simple motion on the element with attributify (`un-flex`, `un-text-ink`, `un-md:flex-row`). Prefer semantic HTML + `un-*`. Tagify (`<un-flex>`) is for layout-only wrappers with no extra semantics; do not wrap prose in tagify just to avoid attributify.
  2. **Simple pseudos and states are still template Uno.** Hover, focus, active, `before:` / `after:` (when the content is a utility, not a novel drawing), `group-data-*`, `aria-*` variants. Example: `un-hover:text-colored-ink`, `un-after:content-empty`.
  3. **`<style scoped>` is the exception.** Keep it only when the template cannot carry the rule: `::view-transition-*`, `@keyframes`, `paint-order`, Vue `<Transition>` generated classes (`*-enter-from` / `*-leave-to`), deep descendant/combinator logic, or a thicket of interpolating CSS variables and `calc()`.
  4. **Inside that exception, still Uno.** Write `--uno: '…'` (see `app/assets/css/main.css`). Utilities inside `--uno` are **unprefixed** Wind tokens (`p-4`, `md:flex-row`, `max-md:mx-auto`), not `un-p-4`. Do **not** use `@screen`, `@media (min-width: 760px)`, or `@media (max-width: 1199px)`.
  5. **Breakpoints — the only width RWD on this site.** Layout that changes with viewport width uses Uno `sm:` `md:` `lg:` and `max-sm:` `max-md:` `max-lg:` (attributify `un-md:flex-row`, quoted `class="lg:block"`, or `--uno: 'max-md:hidden'`). Names and pixels live in `uno.config.mts` `theme.breakpoint` and `app/utils/breakpoints.ts`: `sm` 600, `md` 760, `lg` 1200. Do not add `xl` / `2xl` / a fourth cutoff. Do not write `@screen`, `@media (min-width: …)`, `@media (max-width: …)`, or `min-[760px]:`. Native `@media` is only for capability queries (`prefers-reduced-motion`, `prefers-reduced-transparency`, `scripting: none`, `pointer: fine`). If script must know the cut (peek overlay listeners, sidenote collect), use `useMin('lg')` / `useMax('md')` / `mqMin` / `mqMax` — same names, no magic pixels. Fluid `clamp` / `vw` on type and gutter is not a breakpoint; do not use it to switch columns or hide chrome.

  **Spacing scale (Wind / Windi):** `1` = `0.25rem`. `un-p-4` = `1rem`. Prefer `un-p-4`, `un-gap-5`, `un-w-96` (`24rem`) over `un-p="[1rem]"`. Use explicit units only when the value is not a rem multiple of the scale: `ch`, `vh`, `dvh`, `cqi`, `px` hairlines, `pt`, or a `calc()`/`clamp()` that mixes tokens (`var(--gutter)`, `--hub-pad-top`).

  **Vue parser vs attributify:** An attribute *name* must not contain `=`. `un-lg:group-data-[axis=list]/hub:max-w-176` is invalid HTML and Vue throws `Unquoted attribute value cannot contain U+003D`. Put those utilities in a quoted `class="…"` (Wind tokens, no `un-` prefix). `un-text="group-data-[rest]/row:ink"` is fine — the `=` is inside a quoted value.

  **`--uno` crash:** `transformerDirectives` can throw `Cannot read properties of undefined (reading 'get')` on unknown or awkward tokens. If that happens, move the utilities to a quoted `class="…"` instead of debugging the transformer. Keep `--uno` for tokens that already work in `app/assets/css/main.css`.

  **When touching an existing SFC:** move what the template (or `--uno`) can carry before adding more raw CSS. Do not empty-`<style>` to silence PostCSS.

  **PostCSS / `import type`:** Do not `import type` in an SFC that has (or recently had) `<style>`. Vite asks for `*.vue?vue&type=style&scoped=…`. When that module is stale, PostCSS parses the script and reports `Unknown word` on TypeScript and `{{ … }}`. Types from `utils/` are auto-imported. After deleting a `<style>` block, restart `nuxt dev` if the overlay still cites `type=style`.
