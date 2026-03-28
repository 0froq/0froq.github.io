<script setup lang="ts">
import { data as yearData } from '~/src/year.data'
import LinkUnderline from './LinkUnderline.vue'

const years = yearData
</script>

<template>
  <section class="section-card">
    <div
      v-for="record in years"
      :key="record.year"
      un-pt-4
      un-mb-4
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
        {{ record.year }}
      </h3>
      <ul
        un-ml-4
      >
        <li
          v-for="goal in record.goals.filter(g => g.locale === $i18n.locale || !g.locale)"
          :key="goal.title"
        >
          <div>
            {{ goal.title }}
          </div>
          <ul
            v-if="goal.links?.length"
            un-ml-5
            un-text-sm
            un-text-stone-500
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
