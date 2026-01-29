<script setup lang="ts">
import { data as hints } from '../src/guidance.data'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'
</script>

<template>
  <section class="section-card">
    <div
      v-for="block in hints.categories"
      :key="block.category"
      un-mb-3
    >
      <h3
        un-text-base
        un-font-medium
        un-mb-1
      >
        {{ block.category }}
      </h3>
      <ul
        un-ml-4
      >
        <li
          v-for="item in block.items"
          :key="item.title"
        >
          <div un-font-semibold>
            {{ item.title }}
          </div>
          <div
            v-if="item.description"
            un-text-sm
            un-text-neutral-600
          >
            {{ item.description }}
          </div>
          <ul
            un-ml-5
            un-text-sm
            un-text-neutral-500
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
  </section>
</template>
