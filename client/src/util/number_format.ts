// Initialize a memoized instance of Intl.NumberFormat
const NumberFormat = memoizeFormatConstructor(Intl.NumberFormat)

/**
 * Formats a number using Intl.NumberFormat to the given locale. This uses
 * the memoized formatter (defined above) to improve performance.
 *
 * @param number - raw value of capacity
 * @param locale - what locale to format number in
 * @param options - Intl.NumberFormat options
 */
export function formatNumber (
  number: number,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string {
  return NumberFormat(locale, options).format(number)
}

// -- Utilities ---------------------------------------------------------------

/**
 * These utility functions create a memoized formatter, since calling
 * `new Intl.NumberFormat` multiple times in succession is a performance hit.
 *
 * See https://github.com/yahoo/intl-format-cache for inspiration and reference.
 * @todo: Simplify (or abstract out) the memoization process
 */
function getCacheId (inputs: unknown[]): string {
  return JSON.stringify(
    inputs.map((input) =>
      input && typeof input === 'object'
        ? orderedProps(input as Record<string, unknown>)
        : input
    )
  )
}

function orderedProps (obj: Record<string, unknown>): Record<string, unknown>[] {
  return Object.keys(obj)
    .sort()
    .map((k) => ({ [k]: obj[k] }))
}

function memoizeFormatConstructor<
  T extends new (...args: unknown[]) => unknown
>(
  FormatConstructor: T
): (...args: ConstructorParameters<T>) => InstanceType<T> {
  const cache: Record<string, InstanceType<T>> = {}

  return (...args: ConstructorParameters<T>): InstanceType<T> => {
    const cacheId = getCacheId(args)
    let format = cacheId && cache[cacheId]
    if (!format) {
      format = new FormatConstructor(...args)
      if (cacheId) {
        cache[cacheId] = format
      }
    }

    return format
  }
}
