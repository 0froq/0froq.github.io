<script setup lang="ts">
import LinkUnderline from '@/ui/base/LinkUnderline.vue'
import { useRouteI18n } from '~/utils/useRouteI18n'

export interface NavItem {
  label: string
  url: string
  tooltip?: string
  current?: boolean
  children?: NavItem[]
}

interface Props {
  items: NavItem[][]
}

const props = defineProps<Props>()

const { currentBasePath, getLocaledPath } = useRouteI18n()

props.items.forEach((group) => {
  group.filter(i => i.url !== '/').forEach((item) => {
    if (currentBasePath.value.startsWith(item.url)) {
      item.current = true
    }
    if (item.children) {
      item.children.forEach((child) => {
        if (currentBasePath.value.startsWith(child.url)) {
          child.current = true
        }
      })
    }
  })
})
</script>

<template>
  <div
    un-flex="~ col"
    un-gap-2
  >
    <div
      v-for="(row, rowIndex) in items"
      :key="rowIndex"
      un-flex="~ row wrap"
      un-gap-2
    >
      <template
        v-for="item in row"
        :key="item.url"
      >
        <div
          :data-current="item.current"
          :un-font="item.current ? '400' : '100'"
          un-italic
          un-font-italicSerif
        >
          <LinkUnderline
            :href="getLocaledPath(item.url)"
            :text="item.label"
            :follow-mouse="!item.children"
            :un-text="`${item.current ? 'stone-950 dark:stone-50' : ''}`"
            :un-before="`bg-stone-300 dark:bg-stone-700${item.current ? ' w-full text-stone-950 dark:text-stone-50' : ''}`"
          >
            <template
              v-if="item.tooltip || item.children"
              #tooltip
            >
              <div
                un-break-words
                un-whitespace-normal
              >
                {{ item.tooltip }}
              </div>
              <div
                v-for="child in item.children"
                :key="child.url"
                un-italic
                un-font-italicSerif
              >
                <LinkUnderline
                  :href="child.url"
                  :text="child.label"
                  un-before="bg-stone-700 dark:bg-stone-300"
                />
              </div>
            </template>
          </LinkUnderline>
        </div>
      </template>
    </div>
  </div>
</template>
