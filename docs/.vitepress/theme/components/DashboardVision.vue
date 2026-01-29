<script setup lang="ts">
import { data as visionData } from '../src/vision.data'
import LinkUnderline from './LinkUnderline.vue'

const visions = visionData
</script>

<template>
  <section class="section-card">
    <h2 class="section-heading">
      愿景
    </h2>
    <ul
      un-list-disc
      un-ml-4
      un-space-y-1
    >
      <li
        v-for="vision in visions"
        :key="vision.title"
      >
        <div>
          {{ vision.title }}
        </div>
        <ul
          v-if="vision.links?.length"
          un-list-disc
          un-ml-5
          un-text-sm
          un-text-neutral-500
        >
          <li
            v-for="link in vision.links"
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
  background: linear-gradient(90deg, #a1c4fd, #c2e9fb);
}
</style>
