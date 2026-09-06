<script setup lang="ts">
useHead({
  title: 'Dashboard',
})
</script>

<template>
  <section
    un-box-border
    un-w-full
    un-px="[var(--gutter)] max-md:4"
    un-py-8
    un-pb-20
  >
    <div
      un-min-h="[calc(100dvh-16rem)]"
      un-flex
      un-flex-col
      un-items-center
      un-justify-center
      un-text-center
    >
      <div
        un-relative
        un-flex
        un-flex-col
        un-items-center
        un-gap-5
      >
        <h1
          un-m-0
          un-font-serif
          un-text="[clamp(3rem,8vw,5.5rem)]"
          un-font-semibold
          un-italic
          un-tracking-tighter
          un-leading-none
        >
          Dashboard
        </h1>
        <InkRule
          seed="dashboard"
          un-block
          un-max-w-24
          un-opacity-80
        />
        <p
          un-m-0
          un-font-serif
          un-text="[clamp(1.35rem,2.6vw,1.75rem)] colored-ink"
          un-italic
          un-tracking-wide
          un-leading-tight
        >
          Coming soon
        </p>
        <p
          un-m-0
          un-max-w="[26em]"
          un-font-serif
          un-text="[1.02rem] muted"
          un-italic
          un-leading-relaxed
        >
          The board is resting. Notes are being folded into the corpus.
        </p>
      </div>
    </div>
  </section>
</template>
