// -- Utilities ----------------------------------------------------------------
function getCacheId (inputs) {
  return JSON.stringify(
    inputs.map(input =>
      input && typeof input === 'object' ? orderedProps(input) : input
    )
  )
}

function orderedProps (obj) {
  return Object.keys(obj)
    .sort()
    .map(k => ({ [k]: obj[k] }))
}

const memoizeFormatConstructor = FormatConstructor => {
  var cache = {}

  return (...args) => {
    const cacheId = getCacheId(args)
    let format = cacheId && cache[cacheId]
    if (!format) {
      format = new (FormatConstructor)(...args)
      if (cacheId) {
        cache[cacheId] = format
      }
    }

    return format
  }
}

export default memoizeFormatConstructor
