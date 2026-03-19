<script setup lang="ts">
import type { Data } from '../src/corpus.data.ts'
import type { NavItem } from './ContentNav.vue'
import { useEventListener, useMouse } from '@vueuse/core'
import { useRoute } from 'vitepress'
import { onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '../../utils/useRouteI18n.ts'
import { data as posts } from '../src/corpus.data.ts'
import ContentNav from './ContentNav.vue'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
import QSeperator from './QSeperator.vue'
import TooltipPostInfo from './TooltipPostInfo.vue'

const { path } = useRoute()
const { locale } = useI18n()

const layer = path.split('/')[2].split('_')[1].slice(0, 1).toUpperCase() + path.split('/')[2].split('_')[1].slice(1)

// Extend Data type to include createdComponent
interface PostWithCreatedComponent extends Data {
  createdComponent?: {
    year: string | number
    month?: string | number
    day?: string | number
  }
}

const thisPosts: PostWithCreatedComponent[] = posts.filter((post) => {
  return post.layer === path.split('/')[2] && !post.frontmatter.index
})

thisPosts.forEach((post, index) => {
  const year = new Date(post.created).getFullYear().toString()
  const month = (new Date(post.created).getMonth() + 1).toString().padStart(2, '0')
  const day = new Date(post.created).getDate().toString().padStart(2, '0')

  let yearFormatted: string | undefined,
    monthFormatted: string | undefined,
    dayFormatted: string | undefined

  const prevPost = thisPosts[index - 1]
  if (!prevPost) {
    post.createdComponent = {
      year,
      month,
      day,
    }
    return
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

  post.createdComponent = {
    year: yearFormatted === '' ? '' : year,
    month: monthFormatted === '' ? '' : month,
    day: dayFormatted === '' ? '' : day,
  }
})

// Mouse position / opacity effect (from TagTreeNode.vue)
const { x: pointerX, y: pointerY } = useMouse({ type: 'client', touch: false })
const pointerActive = ref(false)
let refreshRafId: number | null = null

const rowRefs = ref<(HTMLElement | null)[]>([])
const separatorOpacities = ref<number[]>(Array.from({ length: thisPosts.length }).fill(0.08) as Array<number>)

function scheduleSeparatorRefresh() {
  if (refreshRafId != null)
    cancelAnimationFrame(refreshRafId)
  refreshRafId = requestAnimationFrame(() => {
    refreshRafId = null
    updateSeparatorOpacities()
  })
}

function updateSeparatorOpacities() {
  for (let i = 0; i < thisPosts.length; i++) {
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

useEventListener(window, 'pointermove', () => {
  pointerActive.value = true
}, { passive: true })

useEventListener(window, 'pointerleave', () => {
  pointerActive.value = false
}, { passive: true })

useEventListener(window, 'scroll', () => {
  scheduleSeparatorRefresh()
}, { passive: true, capture: true })

useEventListener(window, 'resize', () => {
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

const navItems: NavItem[][] = [
  [{ label: 'Home', url: '/' }],
  [
    { label: 'Corpus', url: '/corpus/', current: true },
    { label: 'Posts', url: '/posts/' },
    { label: 'Dashboard', url: '/dashboard/' },
    { label: 'Tags', url: '/tags/' },
  ],
  [
    { label: 'Autopsia', url: '/corpus/000_autopsia/' },
    { label: 'Ingesta', url: '/corpus/100_ingesta/' },
    { label: 'Neoplasma', url: '/corpus/200_neoplasma/' },
    { label: 'Putredo', url: '/corpus/300_putredo/' },
    { label: 'Delirium', url: '/corpus/400_delirium/' },
    { label: 'Vigil', url: '/corpus/500_vigil/' },
  ],
]

const { currentBasePath } = useRouteI18n(path, locale.value)

navItems.forEach((group) => {
  group.forEach((item) => {
    if (item.url === currentBasePath.value) {
      item.current = true
    }
    if (item.children) {
      item.children.forEach((child) => {
        if (child.url === currentBasePath.value) {
          child.current = true
        }
      })
    }
  })
})
</script>

<template>
  <ContentNav
    :items="navItems"
  />
  <div>
    <ProgressBarHeader
      :key="layer"
      un-mb-4
      un-font="stylish"
      :title="layer"
    />
    <div
      v-for="(post, index) in thisPosts"
      :key="post.url"
      :ref="(el) => { rowRefs[index] = el as HTMLElement | null }"
      un-gap-2
      un-flex="~ row"
      un-items-center
      un-text-ellipsis
      class="article-row"
    >
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
          :vanilla="true"
          :href="post.url"
          :text="post.title"
          :un-text="post.frontmatter.status === 'void' ? 'stone-600 dark:stone-400' : ''"
        >
          <template #tooltip>
            <TooltipPostInfo :post="post" />
          </template>
        </LinkUnderline>
      </div>
      <QSeperator
        type="dashed"
        un-shrink-1
        :style="{ opacity: separatorOpacities[index], transition: 'opacity 140ms cubic-bezier(0.22, 1, 0.36, 1)' }"
      />
      <div
        v-if="post.createdComponent"
        class="date"
        un-font="mono"
        un-whitespace-nowrap
        un-transition="colors duration-200"
        un-text="stone-600 dark:stone-400"
      >
        <span
          v-if="post.createdComponent.year"
          un-text="sm"
        >
          {{ post.createdComponent.year }}
        </span>
        <span
          v-else
          un-text="stone-300 dark:stone-700 sm"
        >…………</span>/<span
          v-if="post.createdComponent.month"
          un-text="sm"
        >
          {{ post.createdComponent.month }}
        </span><span
          v-else
          un-text="stone-300 dark:stone-700 sm"
        >……</span>/<span
          v-if="post.createdComponent.day"
          un-text="sm"
        >
          {{ post.createdComponent.day }}
        </span><span
          v-else
          un-text="stone-300 dark:stone-700 sm"
        >……</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-stone-950 dark:text-stone-50 font-semibold';
  --uno: 'before:(w-full bg-stone-950 dark:bg-stone-50)';
}

.article-row:hover .date {
  --uno: 'text-stone-950 dark:text-stone-50';
  --uno: 'animate-pulse';
  --uno: 'underline-(~ px dashed stone-950 dark:stone-50)';
}
</style>
