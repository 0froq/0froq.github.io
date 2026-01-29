<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import MarkdownItMdc from 'markdown-it-mdc'
import LinkUnderline from '../components/LinkUnderline.vue'
import ProgressBarHeader from '../components/ProgressBarHeader.vue'
import { data } from '../src/dashboard.data'

const md = new MarkdownIt().use(MarkdownItMdc)

const d = data

const historyRepoUrl = 'https://github.com/0froq/0froq.github.io/tree/main/docs/dashboard/weeks'

const quadrantTitles = {
  q1: 'UI',
  q2: 'uI',
  q3: 'ui',
  q4: 'Ui',
}
</script>

<template>
  <section class="dash">
    <ProgressBarHeader
      v-if="d.currentWeek"
      id="dashboard-header"
      title="Dashboard"
      :intro="`${d.currentWeek?.start} - ${d.currentWeek?.end}`"
    />
    <div
      v-else
      un-py-4
    >
      有点问题，无法加载当前周数据……
    </div>

    <section
      v-if="d.currentWeek"
      class="dash-grid"
      un-grid
      un-gap-2
      un-pt-4
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
          class="quad-title"
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
              tasks.filter(t => t.status === "完毕").length
            }}/{{
              tasks.filter(t => !['延期', '取消'].includes(t.status ?? '')).length
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
              {{ status }}
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
      <LinkUnderline
        :href="historyRepoUrl"
        text="探索往期"
        un-block
        un-mt-4
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="bg-teal-400 dark:bg-teal-600"
      />
    </section>
  </section>
</template>

<style scoped>
[data-quadrant='q1'] {
  --uno: 'bg-rose-100/30 dark:bg-rose-900/30';

  & .quad-title {
    --uno: 'bg-rose-100/50 dark:bg-rose-900/50';
    --uno: 'border-rose-300 dark:border-rose-700';
  }
}

[data-quadrant='q2'] {
  --uno: 'bg-emerald-100/30 dark:bg-emerald-900/30';

  & .quad-title {
    --uno: 'bg-emerald-100/50 dark:bg-emerald-900/50';
    --uno: 'border-emerald-300 dark:border-emerald-700';
  }
}

[data-quadrant='q3'] {
  --uno: 'bg-stone-100/30 dark:bg-stone-900/30';

  & .quad-title {
    --uno: 'bg-stone-100/50 dark:bg-stone-900/50';
    --uno: 'border-stone-300 dark:border-stone-700';
  }
}

[data-quadrant='q4'] {
  --uno: 'bg-sky-100/30 dark:bg-sky-900/30';

  & .quad-title {
    --uno: 'bg-sky-100/50 dark:bg-sky-900/50';
    --uno: 'border-sky-300 dark:border-sky-700';
  }
}

.status-icon {
  --uno: 'mr-1 flex-shrink-0 h-5';
}
</style>
