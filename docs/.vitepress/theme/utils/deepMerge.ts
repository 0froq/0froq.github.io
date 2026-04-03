export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const output = { ...target } as Record<string, unknown>

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (isObject(sourceValue) && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      }
      else {
        output[key] = sourceValue
      }
    })
  }

  return output as T
}
