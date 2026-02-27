<script setup lang="ts">
import { data as visionData } from '../src/vision.data'
import LinkUnderline from './LinkUnderline.vue'

const visions = visionData
</script>

<template>
  <section
    class="section-card"
    un-relative
  >
    <h3
      un-text-5xl
      un-font-medium
      un-mb-2
      un-absolute
      un-opacity-10
      un-right-0
    >
      愿景
    </h3>
    <ul
      un-pt-4
      un-ml-4
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
