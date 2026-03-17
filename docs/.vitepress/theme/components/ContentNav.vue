<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '../../utils/useRouteI18n'
import LinkUnderline from './LinkUnderline.vue'

const { locale, t } = useI18n({
  useScope: 'global',
  messages: {
    en: {
      tooltip: {
        autopsia: 'Self-reflection and introspection',
        ingesta: 'Ingesta, raw information without judgment',
        neoplasma: 'Thought fragments after internalization',
        putredo: 'Records of practice and experimentation',
        delirium: 'Aesthetics and irrationality',
        vigil: 'Proof of existence',
      },
    },
    zh: {
      tooltip: {
        autopsia: '自我反思与内省',
        ingesta: '摄入，未经评判的原始信息',
        neoplasma: '内化后的思考碎片',
        putredo: '实践与试验的记录',
        delirium: '审美与非理性',
        vigil: '存在的证明',
      },
    },
  },
})

const { path } = useRoute()
const { currentBasePath } = useRouteI18n(path, locale.value)

interface RouteItem {
  label: string
  url: string
  tooltip?: string
  children?: RouteItem[]
}

const hierarchy: RouteItem[] = [
  {
    label: 'HOME',
    url: '/',
    children: [
      {
        label: 'Corpus',
        url: '/corpus/',
        children: [
          { label: 'autopsia', url: '/corpus/000_autopsia/', tooltip: t('tooltip.autopsia') },
          { label: 'ingesta', url: '/corpus/100_ingesta/', tooltip: t('tooltip.ingesta') },
          { label: 'neoplasma', url: '/corpus/200_neoplasma/', tooltip: t('tooltip.neoplasma') },
          { label: 'putredo', url: '/corpus/300_putredo/', tooltip: t('tooltip.putredo') },
          { label: 'delirium', url: '/corpus/400_delirium/', tooltip: t('tooltip.delirium') },
          { label: 'vigil', url: '/corpus/500_vigil/', tooltip: t('tooltip.vigil') },
        ],
      },
      { label: 'Posts', url: '/posts/' },
      { label: 'Dashboard', url: '/dashboard/' },
      { label: 'Tags', url: '/tags/' },
    ],
  },
]

const currentRoute = computed(() => {
  // Use recursive search to find the current route in the hierarchy
  function findRoute(items: RouteItem[]): RouteItem | null {
    for (const item of items) {
      if (currentBasePath.value === item.url) {
        return item
      }
      if (item.children) {
        const found = findRoute(item.children)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  return findRoute(hierarchy)
})

const parentRoute = computed(() => {
  if (!currentRoute.value)
    return null
  if (currentRoute.value.url === '/')
    return { label: '', url: '/' }
  // Use recursive search to find the parent route in the hierarchy
  function findParent(items: RouteItem[], parent: RouteItem | null = null): RouteItem | null {
    for (const item of items) {
      if (currentBasePath.value === item.url) {
        return parent
      }
      if (item.children) {
        const found = findParent(item.children, item)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  return findParent(hierarchy)
})
</script>

<template>
  <div
    un-flex="~ col"
    un-gap-2
  >
    <LinkUnderline
      v-if="parentRoute"
      :href="`${parentRoute.url}${locale === 'zh' ? '' : `${locale}/`}`"
      :text="parentRoute.label || 'cd'"
      un-inline-block
      un-text-sm
      un-font-mono
      un-w-fit
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
      :data-current="currentRoute?.label === 'cd'"
    />
    <div
      v-if="parentRoute?.children"
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url, tooltip }) in parentRoute?.children || []"
        :key="url"
        :href="`${url}${locale === 'zh' ? '' : `${locale}/`}`"
        :text="label"
        :tooltip-text="tooltip || ''"
        un-inline-block
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
        :data-current="currentRoute?.url === url"
      />
    </div>
    <div
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url, tooltip }) in currentRoute?.children || []"
        :key="url"
        :href="`${url}${locale === 'zh' ? '' : `${locale}/`}`"
        :text="label"
        :tooltip-text="tooltip || ''"
        un-inline-block
        un-text-sm
        un-text="neutral-600 dark:neutral-400"
        un-before="h-px bg-neutral-950 dark:bg-neutral-50"
      />
    </div>
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
