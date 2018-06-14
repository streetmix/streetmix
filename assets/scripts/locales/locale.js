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

// Add react-intl files for all the languages we support (added manually for now)
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
 * Initalize i18n / localization
 * Currently experimental-only for all languages except English
 */
export function initLocale () {
  const flags = store.getState().flags
  const experimental = flags.LOCALES_LEVEL_1.value || flags.LOCALES_LEVEL_2.value || flags.LOCALES_LEVEL_3.value

  // Current language is the one set by Streetmix or is the browser default, if unset
  let locale

  if (experimental) {
    // Add react-intl locale data
    addLocaleData([...ar, ...es, ...de, ...fi, ...fr, ...ja, ...pl, ...pt, ...sv, ...zh])

    // Default language is set by browser, or is English if undetermined
    const defaultLocale = navigator.language || DEFAULT_LOCALE

    try {
      locale = JSON.parse(window.localStorage.getItem('locale')) || defaultLocale
    } catch (err) {
      locale = defaultLocale
    }
  } else {
    locale = DEFAULT_LOCALE
  }

  initRtlChangedListener()
  store.dispatch(changeLocale(locale))
}

// right-to-left languages support
function initRtlChangedListener () {
  const select = (state) => state.app.contentDirection
  const onChange = (direction) => {
    document.body.dir = direction
  }

  return observeStore(select, onChange)
}

export function t (key, fallback, options = {}) {
  const locale = store.getState().locale
  if (options.ns === 'segment-info') {
    return locale.segmentInfo[key] || fallback
  } else {
    return locale.messages[key] || fallback
  }
}

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
