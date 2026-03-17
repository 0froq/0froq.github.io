<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMdInline } from '../../utils/renderMdInline'
import { data as d } from '../src/week.data'
import LinkUnderline from './LinkUnderline.vue'
import QSeperator from './QSeperator.vue'

const { t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      status: {
        done: 'Done',
        inProgress: 'In Progress',
        notStarted: 'Not Started',
        deffered: 'Deffered',
        cancelled: 'Cancelled',
        blocked: 'Blocked',
      },
      empty: 'Empty',
    },
    zh: {
      status: {
        done: '完毕',
        inProgress: '途中',
        notStarted: '未始',
        deffered: '延期',
        cancelled: '取消',
        blocked: '阻塞',
      },
      empty: '空的',
    },
  },
})

const quadrantTitles = {
  q1: 'UI',
  q2: 'uI',
  q3: 'Ui',
  q4: 'ui',
}

const openQuadrants = ref<Set<string>>(new Set())

function toggleQuadrant(quadrant: string) {
  const next = new Set(openQuadrants.value)
  if (next.has(quadrant))
    next.delete(quadrant)
  else
    next.add(quadrant)

  openQuadrants.value = next
}

const isOpen = (quadrant: string) => openQuadrants.value.has(quadrant)
</script>

<template>
  <section
    v-if="d.currentWeek"
    un-flex="~ col"
    un-gap-2
    un-pt-4
  >
    <div
      v-for="(tasks, quadrant) in d.currentWeek.quadrants"
      :key="quadrant"
      un-rounded-sm
      :data-quadrant="quadrant"
      un-flex="~ col"
      un-overflow-hidden
      un-relative
    >
      <div
        class="quad-title"
        un-cursor-pointer
        un-p-2
        un-text-base
        un-border-b
        un-flex
        un-justify-between
        un-font-mono
        @click="toggleQuadrant(quadrant)"
      >
        <span
          un-font-medium
          un-tracking-wide
        >
          {{ quadrant.toLocaleUpperCase() }} - {{ quadrantTitles[quadrant] }}

        </span>
        <span
          style="font-variant-numeric: diagonal-fractions;"
        >
          {{
            tasks.filter(t => t.status === "done").length
          }}/{{
            tasks.filter(t => !['deffered', 'cancelled'].includes(t.status ?? '')).length
          }}
        </span>
      </div>
      <Transition name="expand">
        <div
          v-show="isOpen(quadrant)"
          class="quad-content"
          un-p-2
          un-text-sm
          un-overflow-hidden
        >
          <ul
            v-if="tasks.length"
            un-list-none
            un-overflow-auto
            un-grow-1
            un-shrink-1
          >
            <li
              v-for="status in new Set(tasks.map(t => t.status))"
              :key="status"
              un-mb-2
            >
              <div
                un-w="50%"
                un-mx-auto
              >
                <QSeperator
                  v-if="status"
                  un-text="neutral-900 dark:neutral-100"
                  un-my-2
                  :title="t(`status.${status}`) || status"
                />
              </div>
              <ul>
                <li
                  v-for="task in tasks.filter(t => t.status === status)"
                  :key="task.title"
                  un-my-2
                >
                  <div
                    un-flex="~ row wrap"
                    un-items-center
                    un-gap-x-2
                  >
                    <div
                      v-html="renderMdInline(task.title)"
                    />
                    <un-i-openmj-drooling-face
                      v-if="task.tags?.includes('forIdiot')"
                      un-text-xl
                    />
                  </div>
                  <div
                    v-if="task.dod"
                    class="dod-text"
                    un-ml-4
                    un-text="neutral-700 dark:neutral-300"
                    v-html="renderMdInline(task.dod)"
                  />
                  <ul
                    v-if="task.links?.length"
                    un-ml-8
                    un-text-sm
                    un-text="neutral-500"
                  >
                    <li
                      v-for="link in task.links"
                      :key="link.url"
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
          <ul
            v-else
          >
            <div
              un-w="50%"
              un-mx-auto
            >
              <QSeperator
                un-my-2
                un-text="neutral-400 dark:neutral-600"
                un-italic
                :title="t('empty')"
                type="dashed"
              />
            </div>
          </ul>
        </div>
      </Transition>
    </div>
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
  --uno: 'bg-sky-100/30 dark:bg-sky-900/30';

  & .quad-title {
    --uno: 'bg-sky-100/50 dark:bg-sky-900/50';
    --uno: 'border-sky-300 dark:border-sky-700';
  }
}

[data-quadrant='q4'] {
  --uno: 'bg-stone-100/30 dark:bg-stone-900/30';

  & .quad-title {
    --uno: 'bg-stone-100/50 dark:bg-stone-900/50';
    --uno: 'border-stone-300 dark:border-stone-700';
  }
}

.status-icon {
  --uno: 'mr-1 flex-shrink-0 h-5';
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 800px;
  opacity: 1;
}
</style>
