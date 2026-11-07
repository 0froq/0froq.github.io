<script setup lang="ts">
/**
 * Inline icon + label link for prose — antfu Core-team style.
 * Outer inline-flex link on the text baseline, icon sits in the `#icon` slot
 * (DoodleIcon, a span with background-image, any svg atom).
 * :icon-link{to="…" icon="x18n"}[x18n]  or  <IconLink to="…"><template #icon>…</template>label</IconLink>
 */
const props = defineProps<{
  /** Link target. Internal or external — origin is detected at runtime. */
  to?: string
  /** MDC-only shortcut: renders /icons/{icon}-light.svg + -dark.svg via background-image. */
  icon?: string
  /** MDC-only shortcut: renders a DoodleIcon by name (mutually exclusive with `icon`). */
  doodle?: string
  /** Pass-through to DoodleIcon when `doodle` is set. */
  draw?: boolean | 'true' | 'false' | ''
  boil?: boolean | 'true' | 'false' | ''
}>()

const origin = useRequestURL().origin
const external = computed(() => {
  if (!props.to) return false
  try {
    return new URL(props.to, origin).origin !== origin
  } catch {
    return true
  }
})
const slots = useSlots()
const wrap = computed(() => (props.to ? resolveComponent('NuxtLink') : 'span'))
const inked = computed(() => Boolean(props.to && slots.default))
const linkProps = computed(() =>
  props.to
    ? {
        to: props.to,
        target: external.value ? '_blank' : undefined,
        rel: external.value ? 'noreferrer' : undefined,
        external: external.value || undefined,
      }
    : {},
)
</script>

<template>
  <component
    :is="wrap"
    v-bind="linkProps"
    un-inline-flex
    un-items-baseline
    un-align-baseline
    un-decoration-none
    un-text-inherit
    un-gap-1
  >
    <slot
      name="icon"
      :external="external"
    >
      <DoodleIcon
        v-if="doodle"
        :name="doodle"
        :draw="draw"
        :boil="boil"
        data-stream-atom
      />
      <span
        v-else-if="icon"
        :style="{
          '--icon-light': `url(/icons/${icon}-light.svg)`,
          '--icon-dark': `url(/icons/${icon}-dark.svg)`,
        }"
        data-stream-atom
        aria-hidden="true"
        un-block
        un-flex-none
        un-self-center
        un-w-1em
        un-h-1em
        class="[background-image:var(--icon-light)] dark:[background-image:var(--icon-dark)] bg-no-repeat bg-center bg-contain"
      />
    </slot>
    <span
      v-if="slots.default"
      :data-ink="inked ? 'underline' : undefined"
      :data-hover-ink="inked ? 'mark' : undefined"
      ><slot
    /></span>
  </component>
</template>
