<script setup lang="ts">
import { data as backlogData } from '../src/backlog.data'
import LinkUnderline from './LinkUnderline.vue'

const backlog = backlogData
</script>

<template>
  <section class="section-card">
    <div
      v-if="backlog.current"
      un-py-8
    >
      <ul
        un-ml-4
      >
        <li
          v-for="item in backlog.current.items"
          :key="item.title"
          un-mb-3
        >
          <div
            un-flex="~ row wrap"
            un-items-center
            un-gap-x-2
          >
            <span un-font-semibold>{{ item.title }}</span>
            <span
              v-if="item.status"
              un-text-sm
              un-text="neutral-500"
              un-bg="neutral-200 dark:neutral-800"
              un-px-2
              un-rounded-full
            >
              {{ item.status }}
            </span>
            <span
              v-if="item.due"
              un-text-sm
              un-text="neutral-500"
            >
              due on {{ item.due }}
            </span>
          </div>
          <div
            v-if="item.dod"
            class="dod-text"
            un-ml-6
          >
            {{ item.dod }}
          </div>
          <ul
            v-if="item.links?.length"
            un-ml-12
            un-text-sm
            un-text="neutral-500"
          >
            <li
              v-for="link in item.links"
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
    </div>
    <div
      v-else
      un-pt-4
      un-text-sm
      un-text="neutral-500"
    >
      本月暂无 backlog
    </div>
  </section>
</template>

<style scoped>
</style>
