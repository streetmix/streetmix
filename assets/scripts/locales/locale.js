/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
import LOCALES from '@streetmix/i18n'
import { IntlMessageFormat } from 'intl-messageformat'
import store, { observeStore } from '../store'
import { changeLocale } from '../store/slices/locale'
import { DEFAULT_LOCALE } from './constants'

/**
 * Initialize i18n / localization
 */
export async function initLocale () {
  // See if there is a requested locale via the lang param
  const paramLocale = new URLSearchParams(window.location.search).get('lang')

  // Default language is set by browser, or is English if undetermined
  const defaultLocale = navigator.language || DEFAULT_LOCALE

  // Current language is the one set by Streetmix or is the browser default, if unset
  let requestedLocale

  // Try to read locale from param first; second, a stored value from LocalStorage;
  // if it fails (access denied, etc) then ignore this error and go with the browser's
  // locale or default
  try {
    requestedLocale =
      paramLocale ||
      JSON.parse(window.localStorage.getItem('settings')).locale ||
      defaultLocale
  } catch (err) {
    requestedLocale = defaultLocale
  }

  // Listen for switches in language direction (right-to-left vs left-to-right)
  initRtlChangedListener()

  // Change app locale
  const locale = getActualLocaleFromRequested(requestedLocale)
  store.dispatch(changeLocale(locale))
}

/**
 * Whenever the language changes, this listener will apply the document's text
 * direction. Required to support right-to-left languages like Arabic, Hebrew, etc.
 */
function initRtlChangedListener () {
  const select = (state) => state.app.contentDirection
  const onChange = (direction) => {
    document.documentElement.dir = direction
  }

  return observeStore(select, onChange)
}

/**
 * For the same Intl.FormatMessage functionality but outside of React, use this
 *
 * @param {string} key - translation id
 * @param {string} fallback - fallback / reference string
 * @param {object} options - options
 * @returns {string}
 */
export function formatMessage (key, fallback = '', options = {}) {
  const locale = store.getState().locale

  let message
  if (options.ns === 'segment-info') {
    message = locale.segmentInfo[key]
  } else {
    message = locale.messages[key]
  }

  if (!message) return fallback

  // If message is an array (e.g. segment descriptions), return as is; don't format
  if (Array.isArray(message)) {
    return message
  }

  const msg = new IntlMessageFormat(message || fallback, locale.locale)
  return msg.format(options)
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

  return (
    LOCALES
      // Remove languages that aren't enabled
      .filter((item) => item.level >= level)
      // Sort the list of languages alphabetically
      .sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
  )
}

/**
 * Given a proposed locale, make sure that it is a locale we support and that
 * the user has access to use it.
 *
 * examples:
 *  - if user requests locale `ja` but is not allowed to use it, return `en`
 *  - if user requests locale `en-AU`, return the superset `en`
 *  - if user requests locale `pt-PT` but only `pt-BR` exists, return `pt-BR`
 *
 * @param {string} proposedLocale - a user/client requested locale to use
 */
export function getActualLocaleFromRequested (proposedLocale) {
  const locales = getAvailableLocales()
  let locale = DEFAULT_LOCALE

  // Is the proposed locale in the current list?
  let exactFound = false

  for (let i = 0; i < locales.length; i++) {
    if (proposedLocale === locales[i].value) {
      exactFound = true
      locale = locales[i].value
      break
    }
  }

  if (exactFound) return locale

  // If there is not an exact match, is the proposed locale a subset of a primary language?
  // e.g. en-AU vs en
  let supersetFound = false

  for (let i = 0; i < locales.length; i++) {
    if (proposedLocale.indexOf(locales[i].value) === 0) {
      locale = locales[i].value
      supersetFound = true
      break
    }
  }

  if (supersetFound) return locale

  // If neither exact or subset, is there a "fuzzy" match with another region's locale?
  // e.g. pt-PT vs pt-BR.
  let fuzzyMatch = false
  const primaryTag = proposedLocale.split('-')[0]

  for (let i = 0; i < locales.length; i++) {
    if (primaryTag === locales[i].value.split('-')[0]) {
      locale = locales[i].value
      fuzzyMatch = true
      break
    }
  }

  if (fuzzyMatch) return locale

  // Finally, return DEFAULT_LOCALE if nothing else matches
  return locale
}
