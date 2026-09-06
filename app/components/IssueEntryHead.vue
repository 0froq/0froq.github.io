<script setup lang="ts">
const props = withDefaults(defineProps<{
  entry: LayerEntry
  variant?: 'peek' | 'article'
}>(), {
  variant: 'peek',
})

const slots = useSlots()

const words = computed(() => {
  const n = props.entry.words
  if (!n)
    return ''
  return n === 1 ? '1 word' : `${formatCompact(n)} words`
})

const statusMark = computed(() => {
  const status = props.entry.status
  if (status === 'draft' || status === 'void')
    return status
  return ''
})

const metaBits = computed(() => {
  const bits: { key: string, text: string, accent?: boolean }[] = []
  if (props.entry.created)
    bits.push({ key: 'date', text: issueDate(props.entry.created) })
  if (words.value)
    bits.push({ key: 'words', text: words.value })
  if (props.entry.aigc)
    bits.push({ key: 'aigc', text: 'aigc', accent: true })
  if (statusMark.value)
    bits.push({ key: 'status', text: statusMark.value, accent: true })
  return bits
})

const isArticle = computed(() => props.variant === 'article')

const hasMeta = computed(() =>
  !!(metaBits.value.length || slots['meta-after']),
)

const hasTags = computed(() => !!props.entry.tags?.length)

const hasPeekSecondary = computed(() =>
  !!(props.entry.description || hasTags.value),
)

const hasArticleRail = computed(() => hasMeta.value || hasTags.value)
</script>

<template>
  <header
    un-m-0
    :un-mb="isArticle ? '10' : '0'"
  >
    <div un-min-w-0>
      <h1
        un-m-0
        un-font-serif
        un-font-normal
        :un-text="isArticle ? '[clamp(1.85rem,3.6vw,2.75rem)]' : '2xl'"
      >
        {{ entry.title }}
      </h1>
      <p
        v-if="!isArticle && hasMeta"
        un-flex="~ wrap items-baseline"
        un-m-0
        un-mt-3
        un-font-mono
        un-text="xs muted"
        un-tracking="[0.04em]"
        un-tabular-nums
      >
        <template
          v-for="(bit, i) in metaBits"
          :key="bit.key"
        >
          <span
            v-if="i"
            aria-hidden="true"
            un-mx="[0.45em]"
            un-opacity-70
          >·</span>
          <time v-if="bit.key === 'date'">{{ bit.text }}</time>
          <span
            v-else-if="bit.accent"
            un-text-colored-ink
          >{{ bit.text }}</span>
          <span v-else>{{ bit.text }}</span>
        </template>
        <slot name="meta-after" />
      </p>
    </div>

    <template v-if="!isArticle && hasPeekSecondary">
      <hr
        un-w-9
        un-h-0
        un-m-0
        un-mt="[0.85rem]"
        un-border-0
        un-border-t
        un-border-line
      >
      <div un-min-w-0>
        <p
          v-if="entry.description"
          un-m-0
          un-mt="[0.85rem]"
          un-font-serif
          un-leading="[1.55]"
          un-text="sm muted"
        >
          {{ entry.description }}
        </p>
        <hr
          v-if="entry.description && hasTags"
          un-w-9
          un-h-0
          un-m-0
          un-mt="[0.85rem]"
          un-border-0
          un-border-t
          un-border-line
        >
        <div
          v-if="hasTags"
          un-flex="~ col"
          un-gap="[0.35rem]"
          un-m-0
          un-mt="[0.85rem]"
          un-font-mono
          un-text="xs muted"
          un-tracking="[0.04em]"
          un-leading-normal
        >
          <span
            v-for="tag in entry.tags"
            :key="tag"
            un-inline-flex
            un-items-center
          >
            <InkHash :seed="`${entry.path}:${tag}`" />
            <span>{{ tag }}</span>
          </span>
        </div>
      </div>
    </template>

    <div
      v-else-if="isArticle && hasArticleRail"
      un-min-w-0
      un-pt="[0.15rem]"
      un-flex="~ col"
      un-gap="[0.85rem]"
      un-font-mono
      un-text="xs muted"
      un-tracking="[0.04em]"
      un-leading-normal
    >
      <div
        v-if="hasMeta"
        un-flex="~ col"
        un-gap="[0.55rem]"
        un-tabular-nums
      >
        <template
          v-for="bit in metaBits"
          :key="bit.key"
        >
          <time v-if="bit.key === 'date'">{{ bit.text }}</time>
          <span
            v-else-if="bit.accent"
            un-text-colored-ink
          >{{ bit.text }}</span>
          <span v-else>{{ bit.text }}</span>
        </template>
        <slot name="meta-after" />
      </div>
      <hr
        v-if="hasMeta && hasTags"
        un-w-9
        un-h-0
        un-m-0
        un-border-0
        un-border-t
        un-border-line
      >
      <div
        v-if="hasTags"
        un-flex="~ col"
        un-gap="[0.45rem]"
      >
        <span
          v-for="tag in entry.tags"
          :key="tag"
          un-inline-flex
          un-items-center
        >
          <InkHash :seed="`${entry.path}:${tag}`" />
          <span>{{ tag }}</span>
        </span>
      </div>
    </div>
  </header>
</template>
