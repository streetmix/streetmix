import LOCALES from '../../../app/data/locales.json'
import store from '../store'

function getLocaleLevel () {
  const flags = store.getState().flags

  // The lowest level marked "true" takes priority.
  let level = 4
  if (flags.LOCALES_LEVEL_3.value) level = 3
  if (flags.LOCALES_LEVEL_2.value) level = 2
  if (flags.LOCALES_LEVEL_1.value) level = 1

  return level
}

export function getAvailableLocales () {
  const level = getLocaleLevel()

  return LOCALES
    // Remove languages that aren't enabled
    .filter((item) => item.level >= level)
    // Sort the list of languages alphabetically
    .sort((a, b) => {
      if (a.label < b.label) return -1
      if (a.label > b.label) return 1
      return 0
    })
}
