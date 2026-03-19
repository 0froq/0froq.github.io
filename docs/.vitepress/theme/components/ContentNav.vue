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
          style="--decoration-color: var(--colors-rose-500)"
        >
          <LinkUnderline
            :href="item.url"
            :text="item.label"
            :follow-mouse="!item.children"
            :vanilla="true"
            :data-current="item.current"
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
                  :data-current="child.current"
                  un-before="h-px bg-neutral-950 dark:bg-neutral-50"
                />
              </div>
            </template>
          </LinkUnderline>
        </div>
        <!-- <div -->
        <!--   v-else -->
        <!-- > -->
        <!--   <LinkUnderline -->
        <!--     :href="item.url" -->
        <!--     :text="item.label" -->
        <!--     :tooltip-text="item.tooltip || ''" -->
        <!--     un-inline-block -->
        <!--     un-text-sm -->
        <!--     un-text="neutral-600 dark:neutral-400" -->
        <!--     :data-current="item.current" -->
        <!--   /> -->
        <!-- </div> -->
      </template>
    </div>
  </div>
</template>

<style scoped>
[data-current='true'] {
  --uno: 'text-neutral-950 dark:text-neutral-50';
  --uno: 'before:(w-full bg-neutral-950 dark:bg-neutral-50)';
}
</style>
