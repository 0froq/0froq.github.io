<script setup lang="ts">
const STORAGE = 'froq-desk-note'
const note = ref('')

onMounted(() => {
  note.value = localStorage.getItem(STORAGE) ?? ''
})

function persist() {
  localStorage.setItem(STORAGE, note.value)
}
</script>

<template>
  <label
    class="desk-note"
    un-mt-10
    un-block
    un-max-w="[28em]"
  >
    <span
      un-mb-2
      un-flex
      un-items-center
      un-gap-2
      un-font-mono
      un-text="xs muted"
    >
      <InkArrow
        seed="desk-note"
        dir="down"
        label="scratch"
      />
      scratch
    </span>
    <textarea
      v-model="note"
      rows="3"
      placeholder="A line for later. Stays on this machine."
      un-w-full
      un-resize-y
      un-border-0
      un-border-b
      un-border-line
      un-rounded-none
      un-bg-transparent
      un-p-0
      un-font-serif
      un-text="[1.05em] ink"
      un-leading-normal
      un-outline-none
      @blur="persist"
    />
  </label>
</template>
