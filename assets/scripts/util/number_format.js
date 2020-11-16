// Initialized a memoized instance of Intl.NumberFormat
const NumberFormat = memoizeFormatConstructor(Intl.NumberFormat)

/**
 * Formats a number using Intl.NumberFormat to the given locale. This uses
 * the memoized formatter (defined above) to improve performance.
 *
 * @param {Number} amount - raw value of capacity
 * @param {String} locale - what locale to format number in
 */
export function formatNumber (number, locale, options = {}) {
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
function getCacheId (inputs) {
  return JSON.stringify(
    inputs.map((input) =>
      input && typeof input === 'object' ? orderedProps(input) : input
    )
  )
}

function orderedProps (obj) {
  return Object.keys(obj)
    .sort()
    .map((k) => ({ [k]: obj[k] }))
}

function memoizeFormatConstructor (FormatConstructor) {
  const cache = {}

  return (...args) => {
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
