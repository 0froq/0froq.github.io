<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteI18n } from '../../utils/useRouteI18n'
import { createDefaultContentNavTree, findRouteContext, type ContentNavItem } from '../../utils/contentNav'
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

interface Props {
  tree?: ContentNavItem[]
  parentText?: string
  showParentChildren?: boolean
  showCurrentChildren?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showParentChildren: true,
  showCurrentChildren: true,
})

const resolvedTree = computed(() =>
  props.tree?.length
    ? props.tree
    : createDefaultContentNavTree(t),
)

const routeContext = computed(() =>
  findRouteContext(resolvedTree.value, currentBasePath.value),
)

const currentRoute = computed(() => routeContext.value.current)
const parentRoute = computed(() => routeContext.value.parent)
const resolvedParentText = computed(() => props.parentText ?? parentRoute.value?.label ?? 'cd')
</script>

<template>
  <div
    un-flex="~ col"
    un-gap-2
  >
    <LinkUnderline
      v-if="parentRoute"
      :href="`${parentRoute.url}${locale === 'zh' ? '' : `${locale}/`}`"
      :text="resolvedParentText"
      un-inline-block
      un-text-sm
      un-w-fit
      un-text="neutral-600 dark:neutral-400"
      un-before="h-px bg-neutral-950 dark:bg-neutral-50"
      :data-current="currentRoute?.label === 'cd'"
    />
    <div
      v-if="showParentChildren && parentRoute?.children"
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url, tooltip }) in parentRoute.children"
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
      v-if="showCurrentChildren && currentRoute?.children"
      un-flex="~ row wrap"
      un-gap-2
    >
      <LinkUnderline
        v-for="({ label, url, tooltip }) in currentRoute.children"
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
