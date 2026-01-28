<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import MarkdownItMdc from 'markdown-it-mdc'
import LinkUnderline from '../components/LinkUnderline.vue'
import { data } from '../src/dashboard.data'

const md = new MarkdownIt().use(MarkdownItMdc)

const d = data
console.warn('Dashboard data:', d)

const quadrantTitles = {
  q1: 'UI',
  q2: 'uI',
  q3: 'ui',
  q4: 'Ui',
}

const statusLabels = {
  'done': '完毕',
  'in-progress': '途中',
  'deferred': '延期',
  'cancelled': '取消',
  'not-started': '未始',
  'blocked': '阻塞',
}
</script>

<template>
  <section class="dash">
    <header
      un-p-y-4
    >
      <div
        un-text-2xl
        un-font-semibold
      >
        Dashboard
      </div>
      <div
        v-if="d.currentWeek"
        class="dash_meta"
      >
        <span class="dash_week">{{ d.currentWeek.start }} → {{ d.currentWeek.end }}</span>
        <span v-if="d.currentWeek.theme">· {{ d.currentWeek.theme }}</span>
      </div>
      <div
        v-else
        class="dash_meta"
      >
        有点问题，无法加载当前周数据……
      </div>
    </header>

    <section
      v-if="d.currentWeek"
      class="dash_grid"
      un-grid
      un-gap-2
      style="height: 800px; max-height: 800px; overflow: hidden;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: minmax(200px, 1fr) minmax(200px, 1fr);"
    >
      <div
        v-for="(tasks, quadrant) in d.currentWeek.quadrants"
        :key="quadrant"
        :data-quadrant="quadrant"
        un-rounded-sm
        un-flex="~ col"
        un-overflow-hidden
        un-relative
      >
        <div
          class="quad_title"
          un-p-2
          un-text-base
          un-border-b
          un-flex
          un-justify-between
          un-font-mono
        >
          <span
            un-font-medium
            un-tracking-wide
          >
            {{ quadrantTitles[quadrant] }}
          </span>
          <span
            style="font-variant-numeric: diagonal-fractions;"
          >
            {{
              tasks.filter(t => t.status === "done").length
            }}/{{
              tasks.filter(t => !['deferred', 'cancelled'].includes(t.status ?? '')).length
            }}
          </span>
        </div>
        <ul
          un-p-2
          un-m-0
          un-list-none
          un-text-sm
          un-overflow-auto
          style="flex: 1 1 auto; min-height: 0;"
        >
          <li
            v-for="status in new Set(tasks.map(t => t.status))"
            :key="status"
            un-mb-2
          >
            <div
              un-font-semibold
              un-mb-1
            >
              {{ statusLabels[status] || status }}
            </div>
            <ul
              un-ml-4
              un-list-disc
              un-space-y-1
            >
              <li
                v-for="t in tasks.filter(t => t.status === status)"
                :key="t.title"
              >
                <div
                  un-flex="~ row"
                  un-items-start
                >
                  <div
                    v-html="md.render(t.title)"
                  />
                </div>
                <ul
                  v-if="t.links?.length"
                  un-ml-9
                  un-text="neutral-500"
                >
                  <li
                    v-for="link in t.links"
                    :key="link.url"
                    un-inline
                  >
                    <LinkUnderline
                      :href="link.url"
                      :text="link.label"
                      :vanilla="true"
                    />
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </section>

    <section class="history">
      <h2 class="history_title">
        History
      </h2>
      <div class="history_list">
        <a
          v-for="w in d.weeks"
          :key="w.start"
          class="history_item"
          href="#"
        >
          <span class="history_week">{{ w.start }}</span>
          <span
            v-if="w.theme"
            class="history_theme"
          >· {{ w.theme }}</span>
          <span class="history_range">({{ w.start }} → {{ w.end }})</span>
        </a>
      </div>
    </section>
  </section>
</template>

<style scoped>
[data-quadrant='q1'] {
  --uno: 'bg-rose-100/30 dark:bg-rose-900/30';

  & .quad_title {
    --uno: 'bg-rose-100/50 dark:bg-rose-900/50';
    --uno: 'border-rose-300 dark:border-rose-700';
  }
}

/* .quad_task { */
/*   --uno: 'space-y-1'; */
/* } */
/**/
/* .task_links { */
/*   margin: 6px 0 0; */
/*   padding-left: 16px; */
/*   list-style: disc; */
/*   color: inherit; */
/* } */
/**/
/* .task_links a { */
/*   color: inherit; */
/*   text-decoration: underline; */
/* } */

[data-quadrant='q2'] {
  --uno: 'bg-emerald-100/30 dark:bg-emerald-900/30';

  & .quad_title {
    --uno: 'bg-emerald-100/50 dark:bg-emerald-900/50';
    --uno: 'border-emerald-300 dark:border-emerald-700';
  }
}

[data-quadrant='q3'] {
  --uno: 'bg-stone-100/30 dark:bg-stone-900/30';

  & .quad_title {
    --uno: 'bg-stone-100/50 dark:bg-stone-900/50';
    --uno: 'border-stone-300 dark:border-stone-700';
  }
}

[data-quadrant='q4'] {
  --uno: 'bg-sky-100/30 dark:bg-sky-900/30';

  & .quad_title {
    --uno: 'bg-sky-100/50 dark:bg-sky-900/50';
    --uno: 'border-sky-300 dark:border-sky-700';
  }
}

.status_icon {
  --uno: 'mr-1 flex-shrink-0 h-5';
}

/* .dash__header {
  padding: 8px 0 12px;
}

.dash__title {
  font-size: 18px;
  font-weight: 600;
}

.dash__meta {
  opacity: 0.8;
  font-size: 13px;
}

.quad {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: minmax(200px, 1fr) minmax(200px, 1fr);
  gap: 12px;
  min-height: 70vh;
}

.quad__cell {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.quad__title {
  padding: 10px 12px;
  font-size: 12px;
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  opacity: 0.9;
}

.quad__list {
  padding: 10px 12px;
  margin: 0;
  list-style: none;
  overflow: auto;
}

.quad__list li {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.quad__list li:last-child {
  border-bottom: none;
}

.quad__id {
  font-family: var(--vp-font-family-mono);
  opacity: 0.7;
}

.history {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.history__title {
  margin: 0 0 10px;
  font-size: 14px;
  opacity: 0.9;
}

.history__list {
  display: grid;
  gap: 6px;
}

.history__item {
  display: inline-flex;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
}

.history__item:hover {
  border-color: var(--vp-c-brand-1);
}

.history__week {
  font-family: var(--vp-font-family-mono);
}

.history__theme,
.history__range {
  opacity: 0.75;
}

@media (max-width: 900px) {
  .quad {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    min-height: auto;
  }
  .quad__list li {
    grid-template-columns: 64px 1fr;
  }
} */
</style>
