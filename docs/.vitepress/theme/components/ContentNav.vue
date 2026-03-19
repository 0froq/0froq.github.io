<script setup lang="ts">
import LinkUnderline from './LinkUnderline.vue'

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

defineProps<Props>()
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
          :un-font="item.current ? 'bold' : 'medium'"
        >
          <LinkUnderline
            :href="item.url"
            :text="item.label"
            :follow-mouse="!item.children"
            :un-before="`h-px bg-stone-700 dark:bg-stone-300${item.current ? ' w-full text-stone-950 dark:text-stone-50' : ''}`"
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
              >
                <LinkUnderline
                  :href="child.url"
                  :text="child.label"
                  un-before="h-px bg-stone-950 dark:bg-stone-50"
                />
              </div>
            </template>
          </LinkUnderline>
        </div>
      </template>
    </div>
  </div>
</template>
