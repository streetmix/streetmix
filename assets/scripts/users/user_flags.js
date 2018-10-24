export function receiveUserFlags (flags) {
  if (!flags) return

  const sessionFlags = (window.localStorage.flags) ? JSON.parse(window.localStorage.flags) : {}
  // Convert to array
  const array = Object.entries(flags)
  // Filter flags not in session flags
  const filter = array.filter((item) => !(item[0] in sessionFlags))
  // Convert back to object

  return filter.reduce((obj, item) => {
    obj[item[0]] = {
      value: item[1],
      source: 'user'
    }

    return obj
  }, {})
}
