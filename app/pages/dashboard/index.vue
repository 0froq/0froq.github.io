<script setup lang="ts">
useHead({
  title: 'Dashboard',
})
</script>

<template>
  <section
    class="dash"
    un-relative
    un-box-border
    un-w-full
    un-px="[var(--gutter)] max-md:4"
    un-py-8
    un-pb-20
  >
    <header un-mb-10>
      <h1
        un-m-0
        un-mb-2
        un-font-serif
        un-text="[clamp(40px,6vw,64px)]"
        un-font-semibold
        un-italic
        un-tracking="[-0.04em]"
        un-leading-none
      >
        Dashboard
      </h1>
      <p
        un-m-0
        un-max-w="[34em]"
        un-font-serif
        un-text="muted"
        un-leading="[1.6]"
      >
        Search the web, skim the board.
      </p>
    </header>

    <div
      un-flex
      un-flex-col
      un-gap-14
      un-max-w="[48em]"
    >
      <WorkspaceSearch />

      <BoardPanel />

      <NowHappening />

      <footer class="dash-foot">
        <SiteStatsLine detailed />
      </footer>
    </div>
  </section>
</template>

<style scoped>
.dash-foot {
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
}
</style>
