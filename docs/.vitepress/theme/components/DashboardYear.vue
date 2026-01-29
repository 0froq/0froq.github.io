<script setup lang="ts">
import { data as yearData } from '../src/year.data'
import LinkUnderline from './LinkUnderline.vue'
import ProgressBarHeader from './ProgressBarHeader.vue'

const years = yearData
</script>

<template>
  <section class="section-card">
    <ProgressBarHeader
      id="yearly-goals-header"
      title="年们"
    />
    <div
      v-for="record in years"
      :key="record.year"
      un-pt-4
      un-mb-4
    >
      <h3 class="section-subheading">
        {{ record.year }}
      </h3>
      <ul
        un-ml-4
      >
        <li
          v-for="goal in record.goals"
          :key="goal.title"
        >
          <div>
            {{ goal.title }}
          </div>
          <ul
            v-if="goal.links?.length"
            un-list-disc
            un-ml-5
            un-text-sm
            un-text-neutral-500
          >
            <li
              v-for="link in goal.links"
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

<style scoped>
</style>
