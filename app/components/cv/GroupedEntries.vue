<script setup lang="ts">
import Doodle from '~/components/content/Doodle.vue'

const props = defineProps<{
  items: readonly CvEntry[]
}>()

const groups = computed(() => groupCvEntries(props.items))
</script>

<template>
  <div
    un-flex
    un-flex-col
    un-gap-10
  >
    <div
      v-for="group in groups"
      :key="group.when"
      :class="group.items.length <= 2 ? 'print:break-inside-avoid' : undefined"
    >
      <CvSectionHead
        :title="group.when"
        size="sm"
        tone="ink"
      />
      <ul
        un-m-0
        un-p-0
        un-flex
        un-flex-col
        un-gap-6
        un-list-none
      >
        <li
          v-for="item in group.items"
          :key="item.title"
          class="print:break-inside-avoid"
        >
          <div
            un-flex
            un-flex-wrap
            un-items-baseline
            un-gap-x-3
            un-gap-y-1
          >
            <h3
              un-m-0
              un-font-bold
              un-tracking-tight
              un-leading-tight
              un-italic
              un-text="2xl ink"
            >
              <NuxtLink
                v-if="item.href"
                :to="item.href"
                un-text="ink hover:colored-ink"
                un-transition-colors
              >
                {{ item.title }}
              </NuxtLink>
              <template v-else>
                {{ item.title }}
              </template>
            </h3>
            <span
              un-inline-flex
              un-items-baseline
              un-gap-2
            >
              <span un-text="base muted">{{ item.what }}</span>
              <span
                v-if="item.warn"
                un-inline-flex
                un-items-baseline
                un-gap-1.5
                un-text="sm callout-warning"
              >
                <Doodle
                  name="warning"
                  size="1em"
                  un-self-center
                />
                {{ item.warn }}
              </span>
            </span>
          </div>
          <p
            un-ml-4
            un-mt-2
            un-mb-0
            un-leading-relaxed
            un-text="base ink"
          >
            {{ item.blurb }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
