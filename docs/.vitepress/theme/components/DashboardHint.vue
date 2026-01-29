<script setup lang="ts">
import { data as hintData } from '../src/hint.data'

const hints = hintData
</script>

<template>
  <section class="section-card">
    <h2 class="section-heading">
      Hint
    </h2>
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
        un-list-disc
        un-ml-4
        un-space-y-1
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
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.section-card {
  --uno: 'p-4 rounded-md border border-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)] shadow-sm';
  backdrop-filter: blur(6px);
}

.section-heading {
  --uno: 'text-lg font-semibold tracking-wide mb-3 flex items-center gap-2';
  position: relative;
}

.section-heading::after {
  content: '';
  display: inline-block;
  width: 42px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #84fab0, #8fd3f4);
}
</style>
