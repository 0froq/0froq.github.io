import type { InjectionKey, Ref } from 'vue'
import type { LayerEntry } from '~/utils/issueList'

export const hubPeekKey: InjectionKey<Ref<LayerEntry | null>> = Symbol.for('froq.hubPeek')

export function provideHubPeek() {
  const peek = ref<LayerEntry | null>(null)
  provide(hubPeekKey, peek)
  return peek
}

export function useHubPeek() {
  return inject(hubPeekKey, null)
}
