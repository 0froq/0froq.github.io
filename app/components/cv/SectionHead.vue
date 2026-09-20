<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  side?: 'left' | 'right'
  size?: 'base' | 'sm'
  tone?: 'accent' | 'ink'
}>(), {
  side: 'right',
  size: 'base',
  tone: 'accent',
})

const left = computed(() => props.side === 'left')
const compact = computed(() => props.size === 'sm')
const mark = computed(() => props.tone === 'ink' ? 'ink' : 'colored-ink')
const markVar = computed(() => `var(--${mark.value})`)
const fadeToLine = computed(() => `linear-gradient(to right, ${markVar.value}, var(--line))`)
const fadeFromLine = computed(() => `linear-gradient(to right, var(--line), ${markVar.value})`)
const fadeLineIn = computed(() => `linear-gradient(to right, color-mix(in srgb, var(--line) 0%, transparent), var(--line))`)
const fadeLineOut = computed(() => `linear-gradient(to right, var(--line), color-mix(in srgb, var(--line) 0%, transparent))`)
</script>

<template>
  <component
    :is="compact ? 'h3' : 'h2'"
    un-m-0
    un-flex
    un-items-center
    un-gap-3
    un-font-normal
    :class="compact
      ? (left ? 'mb-2 text-sm' : 'mb-2 text-sm justify-end')
      : 'mb-4 text-base'"
    :style="{ color: markVar }"
  >
    <template v-if="left">
      <span
        aria-hidden="true"
        un-w-4
        un-h-px
        un-shrink-0
        :style="{ background: markVar }"
      />
      {{ title }}
      <span
        aria-hidden="true"
        un-flex
        un-items-center
        :class="compact ? undefined : 'min-w-8 flex-1 mr-4'"
      >
        <span
          un-h-px
          un-shrink-0
          :class="compact ? 'w-10' : 'w-24'"
          :style="{ background: fadeToLine }"
        />
        <span
          v-if="!compact"
          un-min-w-4
          un-flex-1
          un-h-px
          un-bg-line
        />
        <span
          v-if="!compact"
          un-w-24
          un-h-px
          un-shrink-0
          :style="{ background: fadeLineOut }"
        />
      </span>
    </template>
    <template v-else>
      <span
        aria-hidden="true"
        un-flex
        un-items-center
        :class="compact ? undefined : 'min-w-8 flex-1'"
      >
        <span
          v-if="!compact"
          un-w-24
          un-h-px
          un-shrink-0
          :style="{ background: fadeLineIn }"
        />
        <span
          v-if="!compact"
          un-min-w-4
          un-flex-1
          un-h-px
          un-bg-line
        />
        <span
          un-h-px
          un-shrink-0
          :class="compact ? 'w-10' : 'w-24'"
          :style="{ background: fadeFromLine }"
        />
      </span>
      {{ title }}
      <span
        aria-hidden="true"
        un-w-4
        un-h-px
        un-shrink-0
        :style="{ background: markVar }"
      />
    </template>
  </component>
</template>
