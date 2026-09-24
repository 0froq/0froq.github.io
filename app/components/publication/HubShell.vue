<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  axis?: 'list' | 'wheel'
  fan?: boolean
}>(), {
  axis: 'list',
  fan: false,
})

providePublicationPeek()
</script>

<template>
  <div
    class="hub-shell group/hub"
    :data-axis="axis"
    un-relative
    un-box-border
    un-flex
    un-h-dvh
    un-w-full
    un-min-h-0
    un-flex-col
    un-overflow-hidden
    un-overscroll-none
    un-px="[var(--gutter)]"
    un-max-md="[--hub-pad-bottom:1.25rem] [--track-fade-bottom:4.75rem] [--track-fade-solid-bottom:1.25rem]"
  >
    <h1
      v-if="title"
      un-sr-only
    >
      {{ title }}
    </h1>
    <div
      class="hub-shell__cluster"
      un-relative
      un-flex
      un-h-full
      un-min-h-0
      un-min-w-0
      un-w-full
      un-flex-col
      un-lg:flex-row
      un-lg:gap-4
    >
      <div
        class="hub-shell__axis"
        :class="axis === 'list'
          ? 'lg:max-w-176'
          : 'lg:flex-none lg:w-max lg:max-w-[calc(100%-24rem-1rem)] lg:shrink-0'"
        un-relative
        un-min-h-0
        un-min-w-0
        un-flex-1
        un-overflow-hidden
      >
        <div
          v-if="axis === 'list'"
          class="hub-shell__track"
          un-absolute
          un-inset-x-0
          un-top="[var(--hub-pad-top)]"
          un-bottom="[var(--hub-pad-bottom)]"
          un-overflow-x-hidden
          un-overflow-y-auto
          un-overscroll-contain
          un-pt="[var(--hub-body-pad-top)]"
          un-pb="[calc(var(--track-fade-bottom)-var(--hub-pad-bottom)+1.25rem)]"
        >
          <slot />
        </div>
        <slot v-else />
        <SiteTrackFade edge="top" />
        <SiteTrackFade edge="bottom" />
      </div>
      <PublicationJournalFan v-if="fan" />
      <PublicationHubPeekRail
        v-else
        :axis="axis"
      />
    </div>
  </div>
</template>

<style scoped>
.hub-shell {
  --hub-pad-top: var(--site-chrome);
  --hub-pad-bottom: var(--site-footer);
  --hub-body-pad-top: 2.75rem;
  --track-fade-bottom: calc(var(--hub-pad-bottom) + 3.5rem);
  --track-fade-solid-bottom: var(--hub-pad-bottom);
}

.hub-shell__cluster {
  container-type: inline-size;
}

.hub-shell__track {
  scrollbar-width: none;
}

.hub-shell__track::-webkit-scrollbar {
  display: none;
}
</style>
