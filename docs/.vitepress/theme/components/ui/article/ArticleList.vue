<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TooltipArticleInfo from '@/ui/article/TooltipArticleInfo.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import QSeperator from '@/ui/base/QSeperator.vue'
import { useArticleListMeta } from '~/composables/stats/useArticleListMeta'
import { buildCreatedComponents } from '~/utils/articleListDate'
import { useSeparatorOpacity } from '~/utils/useSeparatorOpacity'

const props = withDefaults(defineProps<{
  items: ArticleListItem[]
  /** Show C/P source badge (tags pages). */
  showSource?: boolean
  /** Show void/draft/lang/aigc badges. */
  showBadges?: boolean
  /** Title uses serif (corpus layers). */
  titleSerif?: boolean
  /** Show article info tooltip on hover. */
  showTooltip?: boolean
  /** Show per-item excerpt under the row. */
  showExcerpts?: boolean
  /** Show annotation comment counts (default on). */
  showCommentCount?: boolean
  /** Show cumulative visit counts (default on). */
  showVisitCount?: boolean
}>(), {
  showSource: false,
  showBadges: true,
  titleSerif: false,
  showTooltip: true,
  showExcerpts: false,
  showCommentCount: true,
  showVisitCount: true,
})

const EXCERPT_P_RE = /<p>|<\/p>/g

export interface ArticleListItem {
  url: string
  title: string
  created: Date | string | number
  frontmatter?: Record<string, any>
  /** Optional tooltip payload; falls back to the item itself. */
  post?: Record<string, any>
  /** Tags detail: corpus vs posts badge. */
  source?: 'corpus' | 'posts'
  /**
   * Trailing meta instead of the collapsed date
   * (e.g. viewing count on the homepage).
   */
  meta?: string
  /** Optional excerpt HTML (shown when showExcerpts). */
  excerpt?: string
  /** Override fetched comment count. */
  commentCount?: number | null
  /** Override fetched visit count. */
  visitCount?: number | null
}

const { locale, t } = useI18n({ useScope: 'global' })
const { setRowRef, getOpacity, refresh } = useSeparatorOpacity()
const meta = useArticleListMeta({
  comments: props.showCommentCount,
  visits: props.showVisitCount,
})

const createdParts = computed(() =>
  buildCreatedComponents(props.items.map(i => i.created)),
)

watch(() => props.items.length, () => refresh())

function underlineClass(item: ArticleListItem): string {
  if (!props.showSource || !item.source)
    return 'bg-neutral-900 dark:bg-neutral-100'
  return item.source === 'corpus'
    ? 'bg-rose-600 dark:bg-rose-400'
    : 'bg-emerald-600 dark:bg-emerald-400'
}

function tooltipPost(item: ArticleListItem) {
  return item.post ?? item
}

function excerptHtml(excerpt?: string): string {
  return excerpt?.replace(EXCERPT_P_RE, '') ?? ''
}

function resolvedCommentCount(item: ArticleListItem): number | null {
  if (!props.showCommentCount)
    return null
  if (item.commentCount != null)
    return item.commentCount
  return meta.commentCountFor(item.url)
}

function resolvedVisitCount(item: ArticleListItem): number | null {
  if (!props.showVisitCount)
    return null
  if (item.visitCount != null)
    return item.visitCount
  return meta.visitCountFor(item.url)
}

function statsLabel(item: ArticleListItem): string {
  const parts: string[] = []
  const comments = resolvedCommentCount(item)
  const visits = resolvedVisitCount(item)
  if (comments != null && comments > 0)
    parts.push(t('stats.commentCount', { n: comments }))
  if (visits != null && visits > 0)
    parts.push(t('stats.visitCount', { n: visits }))
  return parts.join(t('stats.metaSep'))
}
</script>

<template>
  <div>
    <div
      v-for="(item, index) in items"
      :key="item.url"
      un-flex="~ col"
      un-gap-1
    >
      <div
        :ref="(el) => setRowRef(index, el as HTMLElement | null)"
        un-gap-2
        un-flex="~ row"
        un-items-center
        un-text-ellipsis
        class="article-row"
      >
        <span
          v-if="showSource && item.source === 'corpus'"
          un-text="rose-600 dark:rose-400"
          un-font-mono
          un-px-1
        >C</span>
        <span
          v-else-if="showSource && item.source === 'posts'"
          un-text="emerald-600 dark:emerald-400"
          un-font-mono
          un-px-1
        >P</span>

        <div
          un-w-fit
          un-max-w="50%"
          un-shrink-0
          :class="titleSerif ? 'font-serif' : ''"
          :style="item.frontmatter?.status === 'void' ? {
            textDecorationLine: 'line-through',
            textDecorationThickness: '1px',
          } : undefined"
        >
          <LinkUnderline
            :href="item.url"
            :text="item.title"
            :un-before="underlineClass(item)"
          >
            <template
              v-if="showTooltip && item.post"
              #tooltip
            >
              <TooltipArticleInfo :post="tooltipPost(item)" />
            </template>
          </LinkUnderline>
        </div>

        <QSeperator
          type="dashed"
          un-shrink-1
          :style="{ opacity: getOpacity(index), transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
        />

        <template v-if="showBadges && item.frontmatter">
          <div
            v-if="item.frontmatter.status === 'void'"
            un-text="rose-600 dark:rose-400 xs"
            un-font="mono italic"
            un-shrink-0
          >
            {{ item.frontmatter.status }}
          </div>
          <div
            v-if="item.frontmatter.status === 'draft'"
            un-text="sky-600 dark:sky-400 xs"
            un-font="mono italic"
            un-shrink-0
          >
            {{ item.frontmatter.status }}
          </div>
          <div
            v-if="locale !== (item.frontmatter.lang || 'zh') && (item.frontmatter.lang || 'zh')"
            un-text="amber-600 dark:amber-400 xs"
            un-font="mono italic"
            un-shrink-0
          >
            {{ item.frontmatter.lang || 'zh' }}
          </div>
          <div
            v-if="item.frontmatter.aigc"
            un-text="violet-600 dark:violet-400 xs"
            un-font="mono italic"
            un-shrink-0
          >
            AIGC
          </div>
        </template>

        <div
          v-if="statsLabel(item)"
          class="date"
          un-font="mono"
          un-whitespace-nowrap
          un-text="xs neutral-500"
          un-transition="colors duration-200"
          un-shrink-0
        >
          {{ statsLabel(item) }}
        </div>

        <div
          v-if="item.meta != null"
          class="date"
          un-font="mono"
          un-whitespace-nowrap
          un-text="xs neutral-500"
          un-transition="colors duration-200"
        >
          {{ item.meta }}
        </div>
        <div
          v-else-if="createdParts[index]"
          class="date"
          un-font="mono"
          un-whitespace-nowrap
          un-transition="colors duration-200"
          un-text="neutral-500"
        >
          <span
            v-if="createdParts[index].year"
            un-text="sm"
          >
            {{ createdParts[index].year }}
          </span>
          <span
            v-else
            un-text="neutral-400 dark:neutral-600 sm"
          >…………</span>/<span
            v-if="createdParts[index].month"
            un-text="sm"
          >
            {{ createdParts[index].month }}
          </span>
          <span
            v-else
            un-text="neutral-400 dark:neutral-600 sm"
          >……</span>/<span
            v-if="createdParts[index].day"
            un-text="sm"
          >
            {{ createdParts[index].day }}
          </span>
          <span
            v-else
            un-text="neutral-400 dark:neutral-600 sm"
          >……</span>
        </div>
      </div>

      <div
        v-if="showExcerpts && item.excerpt"
        un-text="neutral-400 dark:neutral-600 xs"
        un-pl-2
        class="markdown-rendered"
        v-html="excerptHtml(item.excerpt)"
      />
    </div>
  </div>
</template>

<style scoped>
.article-row:hover .date,
.article-row:hover .date span {
  --uno: 'text-neutral-900 dark:text-neutral-100';
  --uno: 'transition-colors duration-200';
}
</style>
