/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
import { addLocaleData } from 'react-intl'
import { DEFAULT_LOCALE } from './constants'
import store, { observeStore } from '../store'
import { changeLocale } from '../store/actions/locale'
import LOCALES from '../../../app/data/locales.json'

// Add react-intl files for all the languages we support
// See https://github.com/yahoo/react-intl/wiki#locale-data-in-browsers
// We are taking a simpler approach by bundling all the locale data together
// (they are not large -- about 2kb-4kb pre-minification/gzip). We may consider
// dynamically loading locale data later.
import ar from 'react-intl/locale-data/ar'
import es from 'react-intl/locale-data/es'
import de from 'react-intl/locale-data/de'
import fi from 'react-intl/locale-data/fi'
import fr from 'react-intl/locale-data/fr'
import ja from 'react-intl/locale-data/ja'
import pl from 'react-intl/locale-data/pl'
import pt from 'react-intl/locale-data/pt'
import sv from 'react-intl/locale-data/sv'
import zh from 'react-intl/locale-data/zh'

/**
 * Initialize i18n / localization
 */
export function initLocale () {
  // Add react-intl locale data
  addLocaleData([...ar, ...es, ...de, ...fi, ...fr, ...ja, ...pl, ...pt, ...sv, ...zh])

  // Default language is set by browser, or is English if undetermined
  const defaultLocale = navigator.language || DEFAULT_LOCALE

  // Current language is the one set by Streetmix or is the browser default, if unset
  let locale

  // Try to read a stored value from LocalStorage; if it fails (access denied, etc)
  // then ignore this error and go with the browser's locale or default
  try {
    locale = JSON.parse(window.localStorage.getItem('locale')) || defaultLocale
  } catch (err) {
    locale = defaultLocale
  }

  // Listen for switches in language direction (right-to-left vs left-to-right)
  initRtlChangedListener()

  // Change app locale
  store.dispatch(changeLocale(locale))
}

/**
 * Whenever the language changes, this listener will apply the document's text
 * direction. Required to support right-to-left languages like Arabic, Hebrew, etc.
 */
function initRtlChangedListener () {
  const select = (state) => state.app.contentDirection
  const onChange = (direction) => {
    document.body.dir = direction
  }

  return observeStore(select, onChange)
}

/**
 * Port of the old i18next `t` function, still used in some legacy spot
 *
 * @param {string} key - translation id
 * @param {string} fallback - fallback / reference string
 * @param {object} options - options
 */
export function t (key, fallback, options = {}) {
  const locale = store.getState().locale
  if (options.ns === 'segment-info') {
    return locale.segmentInfo[key] || fallback
  } else {
    return locale.messages[key] || fallback
  }
}

/**
 * Gets the current locale level. See `./constants.js` for a description
 * of what each level is.
 *
 * @returns {Number} between 1-4
 */
function getLocaleLevel () {
  const flags = store.getState().flags

  // The lowest level marked "true" takes priority.
  let level = 4
  if (flags.LOCALES_LEVEL_3.value) level = 3
  if (flags.LOCALES_LEVEL_2.value) level = 2
  if (flags.LOCALES_LEVEL_1.value) level = 1

  return level
}

/**
 * Given the list of all locales set by Streetmix, returns a filtered and sorted
 * list of locales based on the current level of available locales. See
 * `./constants.js` for a description of what each level is.
 *
 * @returns {Array} of locale data objects
 */
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
