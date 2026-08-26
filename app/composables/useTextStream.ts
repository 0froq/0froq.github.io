import {
  STREAM_INTERVAL_MS,
  prefersReducedStream,
} from '~/utils/textStream'

export function useTextStream(options: {
  enabled?: MaybeRefOrGetter<boolean>
  total: MaybeRefOrGetter<number>
  interval?: MaybeRefOrGetter<number>
  delayFor?: (nextIndex: number) => number
}) {
  const enabled = () => toValue(options.enabled) !== false
  const shown = shallowRef(enabled() ? 0 : Number.POSITIVE_INFINITY)
  let timer = 0

  const streaming = computed(() => {
    const total = toValue(options.total)
    return enabled() && Number.isFinite(shown.value) && shown.value < total
  })

  function wait(nextIndex: number) {
    return options.delayFor?.(nextIndex) ?? toValue(options.interval) ?? STREAM_INTERVAL_MS
  }

  function stop() {
    if (!timer)
      return
    window.clearTimeout(timer)
    timer = 0
  }

  function play() {
    stop()
    const total = toValue(options.total)
    if (!enabled() || total <= 0 || prefersReducedStream()) {
      shown.value = total > 0 ? total : Number.POSITIVE_INFINITY
      return
    }
    shown.value = 0
    const step = () => {
      shown.value += 1
      if (shown.value < toValue(options.total))
        timer = window.setTimeout(step, wait(shown.value))
      else
        timer = 0
    }
    timer = window.setTimeout(step, wait(0))
  }

  onUnmounted(stop)

  return { shown, streaming, play, stop }
}
