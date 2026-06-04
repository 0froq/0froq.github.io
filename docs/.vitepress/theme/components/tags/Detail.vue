<script setup lang="ts">
import { useEventListener, useMouse } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TooltipArticleInfo from '@/ui/article/TooltipArticleInfo.vue'
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import ProgressBarHeader from '@/ui/base/ProgressBarHeader.vue'
import QSeperator from '@/ui/base/QSeperator.vue'
import TagDisplay from '@/ui/tag/TagDisplay.vue'
import { data as corpus } from '~/src/corpus.data'
import { data as posts } from '~/src/posts.data'

const { t, locale } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      inThis: 'In This',
      inExtended: 'In Extended',
    },
    zh: {
      inThis: '在此',
      inExtended: '在更深处',
    },
  },
})
const { params } = useData()

// Combine corpus and posts data
// Add a 'source' field to distinguish between corpus and posts
const articles = [
  ...corpus.map(item => ({ ...item, source: 'corpus' })),
  ...posts.map(item => ({ ...item, source: 'posts' })),
].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

const postsInCurrentTag = computed(() => {
  return articles.filter(post =>
    post.tags.includes(params.value?.tag),
  )
})

const postsInExtendedTags = computed(() => {
  return articles.filter(post =>
    post.tagsExtended?.some(tag => tag === params.value?.tag && !post.tags.includes(params.value?.tag)),
  )
})

// Process posts to add formatted date components (from Layer.vue)
function processPosts(postsList: typeof articles) {
  return postsList.map((post, index) => {
    const year = new Date(post.created).getFullYear().toString()
    const month = (new Date(post.created).getMonth() + 1).toString().padStart(2, '0')
    const day = new Date(post.created).getDate().toString().padStart(2, '0')

    let yearFormatted: string | undefined,
      monthFormatted: string | undefined,
      dayFormatted: string | undefined

    const prevPost = postsList[index - 1]
    if (!prevPost) {
      return {
        ...post,
        createdComponent: { year, month, day },
      }
    }

    const prevYear = new Date(prevPost.created).getFullYear().toString()
    if (year === prevYear) {
      yearFormatted = ''
    }

    const prevMonth = (new Date(prevPost.created).getMonth() + 1).toString().padStart(2, '0')
    if (month === prevMonth && year === prevYear) {
      monthFormatted = ''
    }

    const prevDay = new Date(prevPost.created).getDate().toString().padStart(2, '0')
    if (day === prevDay && month === prevMonth && year === prevYear) {
      dayFormatted = ''
    }

    return {
      ...post,
      createdComponent: {
        year: yearFormatted === '' ? '' : year,
        month: monthFormatted === '' ? '' : month,
        day: dayFormatted === '' ? '' : day,
      },
    }
  })
}

// Mouse position / opacity effect (from Layer.vue)
const { x: pointerX, y: pointerY } = useMouse({ type: 'client', touch: false })
const pointerActive = ref(false)
let refreshRafId: number | null = null

const rowRefs = ref<(HTMLElement | null)[]>([])
const separatorOpacities = ref<number[]>([])

function scheduleSeparatorRefresh() {
  if (typeof window === 'undefined')
    return
  if (refreshRafId != null)
    cancelAnimationFrame(refreshRafId)
  refreshRafId = requestAnimationFrame(() => {
    refreshRafId = null
    updateSeparatorOpacities()
  })
}

function updateSeparatorOpacities() {
  for (let i = 0; i < rowRefs.value.length; i++) {
    const el = rowRefs.value[i]
    if (!el || !pointerActive.value) {
      separatorOpacities.value[i] = 0.08
      continue
    }

    const rect = el.getBoundingClientRect()
    const horizontalPadding = 80
    const withinX = pointerX.value >= rect.left - horizontalPadding && pointerX.value <= rect.right + horizontalPadding
    if (!withinX) {
      separatorOpacities.value[i] = 0.08
      continue
    }

    const centerY = rect.top + rect.height / 2
    const dy = pointerY.value - centerY
    const sigma = 56
    const influence = Math.exp(-(dy * dy) / (2 * sigma * sigma))
    separatorOpacities.value[i] = 0.08 + (0.72 - 0.08) * influence
  }
}

watch([pointerX, pointerY, pointerActive], () => {
  scheduleSeparatorRefresh()
})

useEventListener('pointermove', () => {
  pointerActive.value = true
}, { passive: true })

useEventListener('pointerleave', () => {
  pointerActive.value = false
}, { passive: true })

useEventListener('scroll', () => {
  scheduleSeparatorRefresh()
}, { passive: true, capture: true })

useEventListener('resize', () => {
  scheduleSeparatorRefresh()
}, { passive: true })

onMounted(() => {
  scheduleSeparatorRefresh()
})

onUpdated(() => {
  scheduleSeparatorRefresh()
})

onBeforeUnmount(() => {
  if (refreshRafId != null) {
    cancelAnimationFrame(refreshRafId)
    refreshRafId = null
  }
})

// Compute total post count for array sizing
const totalPosts = computed(() => {
  return postsInCurrentTag.value.length + postsInExtendedTags.value.length
})

// Update separatorOpacities array when total posts change
watch(totalPosts, (count) => {
  separatorOpacities.value = Array.from({ length: count }).fill(0.08) as Array<number>
  scheduleSeparatorRefresh()
}, { immediate: true })

// Helper to calculate global index for separator opacities
function getGlobalIndex(section: 'current' | 'extended', index: number) {
  if (section === 'current') {
    return index
  }
  return postsInCurrentTag.value.length + index
}
</script>

<template>
  <TagDisplay />
  <Content />

  <!-- In This section -->
  <template v-if="postsInCurrentTag.length > 0">
    <ProgressBarHeader
      :title="t('inThis')"
      un-mb-8
      un-mt-8
    />
    <div
      v-for="(post, index) in processPosts(postsInCurrentTag)"
      :key="post.url"
      :ref="(el) => { rowRefs[getGlobalIndex('current', index)] = el as HTMLElement | null }"
      un-gap-2
      un-flex="~ row"
      un-items-center
      un-text-ellipsis
      class="article-row"
    >
      <span
        v-if="post.source === 'corpus'"
        un-text="rose-600 dark:rose-400"
        un-font-mono
        un-px-1
      >C</span>
      <span
        v-else
        un-text="emerald-600 dark:emerald-400"
        un-font-mono
        un-px-1
      >P</span>

      <div
        v-if="post.frontmatter.status === 'void'"
        un-text="rose-600 dark:rose-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="post.frontmatter.status === 'draft'"
        un-text="sky-600 dark:sky-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="locale !== (post.frontmatter.lang || 'zh') && (post.frontmatter.lang || 'zh')"
        un-text="amber-600 dark:amber-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.lang || 'zh' }}
      </div>

      <div
        un-w-fit
        un-max-w="50%"
        un-shrink-0
        :style="post.frontmatter.status === 'void' ? {
          textDecorationLine: 'line-through',
          textDecorationThickness: '1px',
        } : ''"
      >
        <LinkUnderline
          :href="post.url"
          :text="post.title"
          :un-before="post.source === 'corpus' ? 'bg-rose-600 dark:bg-rose-400' : 'bg-emerald-600 dark:bg-emerald-400'"
        >
          <template #tooltip>
            <TooltipArticleInfo :post="post" />
          </template>
        </LinkUnderline>
      </div>

      <QSeperator
        type="dashed"
        un-shrink-1
        :style="{ opacity: separatorOpacities[getGlobalIndex('current', index)], transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      />

      <div
        v-if="post.createdComponent"
        class="date"
        un-font="mono"
        un-whitespace-nowrap
        un-transition="colors duration-200"
        un-text="stone-500"
      >
        <span
          v-if="post.createdComponent.year"
          un-text="sm"
        >
          {{ post.createdComponent.year }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >…………</span>/<span
          v-if="post.createdComponent.month"
          un-text="sm"
        >
          {{ post.createdComponent.month }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>/<span
          v-if="post.createdComponent.day"
          un-text="sm"
        >
          {{ post.createdComponent.day }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>
      </div>
    </div>
  </template>

  <!-- In Extended section -->
  <template v-if="postsInExtendedTags.length > 0">
    <ProgressBarHeader
      :title="t('inExtended')"
      un-mb-8
      un-mt-8
    />
    <div
      v-for="(post, index) in processPosts(postsInExtendedTags)"
      :key="post.url"
      :ref="(el) => { rowRefs[getGlobalIndex('extended', index)] = el as HTMLElement | null }"
      un-gap-2
      un-flex="~ row"
      un-items-center
      un-text-ellipsis
      class="article-row"
    >
      <span
        v-if="post.source === 'corpus'"
        un-text="rose-600 dark:rose-400"
        un-font-mono
        un-px-1
      >C</span>
      <span
        v-else
        un-text="emerald-600 dark:emerald-400"
        un-font-mono
        un-px-1
      >P</span>

      <div
        v-if="post.frontmatter.status === 'void'"
        un-text="rose-600 dark:rose-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="post.frontmatter.status === 'draft'"
        un-text="sky-600 dark:sky-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.status }}
      </div>

      <div
        v-if="locale !== (post.frontmatter.lang || 'zh') && (post.frontmatter.lang || 'zh')"
        un-text="amber-600 dark:amber-400 xs"
        un-font="mono italic"
      >
        {{ post.frontmatter.lang || 'zh' }}
      </div>

      <div
        un-w-fit
        un-max-w="50%"
        un-shrink-0
        :style="post.frontmatter.status === 'void' ? {
          textDecorationLine: 'line-through',
          textDecorationThickness: '1px',
        } : ''"
      >
        <LinkUnderline
          :href="post.url"
          :text="post.title"
          :un-before="post.source === 'corpus' ? 'bg-rose-600 dark:bg-rose-400' : 'bg-emerald-600 dark:bg-emerald-400'"
        >
          <template #tooltip>
            <TooltipArticleInfo :post="post" />
          </template>
        </LinkUnderline>
      </div>

      <QSeperator
        type="dashed"
        un-shrink-1
        :style="{ opacity: separatorOpacities[getGlobalIndex('extended', index)], transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      />

      <div
        v-if="post.createdComponent"
        class="date"
        un-font="mono"
        un-whitespace-nowrap
        un-transition="colors duration-200"
        un-text="stone-500"
      >
        <span
          v-if="post.createdComponent.year"
          un-text="sm"
        >
          {{ post.createdComponent.year }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >…………</span>/<span
          v-if="post.createdComponent.month"
          un-text="sm"
        >
          {{ post.createdComponent.month }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>/<span
          v-if="post.createdComponent.day"
          un-text="sm"
        >
          {{ post.createdComponent.day }}
        </span>
        <span
          v-else
          un-text="stone-400 dark:stone-600 sm"
        >……</span>
      </div>
    </div>
  </template>
</template>

<style scoped>
.article-row:hover .date span {
  --uno: 'text-stone-950 dark:text-stone-50';
  --uno: 'transition-colors duration-200';
}
</style>
