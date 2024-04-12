import { IntlMessageFormat } from 'intl-messageformat'
import type { MessageFormatElement } from 'react-intl'
import LOCALES from '@streetmix/i18n'
import type { LocaleDefinition, LocaleLevel } from '@streetmix/types'
import store, { observeStore, type RootState } from '../store'
import { changeLocale } from '../store/slices/locale'
import {
  DEFAULT_LOCALE,
  LOCALES_LEVEL_1,
  LOCALES_LEVEL_2,
  LOCALES_LEVEL_3,
  LOCALES_LEVEL_4
} from './constants'

/**
 * Initialize i18n / localization
 */
export async function initLocale (): Promise<void> {
  // See if there is a requested locale via the lang param
  const paramLocale = new URLSearchParams(window.location.search).get('lang')

  // Default language is set by browser, or is English if undetermined
  const defaultLocale = navigator.language || DEFAULT_LOCALE

  // Current language is the one set by Streetmix or is the browser default
  // if unset
  let requestedLocale: string

  // Try to read locale from param first; second, a stored value from
  // LocalStorage; if it fails (access denied, etc) then ignore this error and
  // go with the browser's locale or default
  try {
    requestedLocale =
      paramLocale ??
      JSON.parse(window.localStorage.getItem('settings') ?? '{}').locale ??
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
 * direction. Required to support rtl languages like Arabic, Hebrew, etc.
 */
function initRtlChangedListener (): void {
  const select = (state: RootState): string => state.app.contentDirection
  const onChange = (direction: string): void => {
    document.documentElement.dir = direction
  }

  observeStore(select, onChange)
}

/**
 * For the same Intl.FormatMessage functionality outside of React, use this
 */
export function formatMessage (
  key: string, // translation key
  fallback = '', // fallback or reference string
  options: { ns?: string } = {}
): string | string[] | MessageFormatElement[] {
  const locale = store.getState().locale

  let message
  if (options.ns === 'segment-info') {
    message = locale.segmentInfo[key]
  } else {
    message = locale.messages[key]
  }

  if (message === undefined) return fallback

  // If message is an array (e.g. segment descriptions), return as is;
  // don't format it
  if (Array.isArray(message)) {
    return message
  }

  const msg = new IntlMessageFormat(message || fallback, locale.locale)
  return msg.format(options)
}

/**
 * Gets the current locale level. See `./constants.ts` for a description
 * of what each level is.
 */
function getLocaleLevel (): LocaleLevel {
  const flags = store.getState().flags

  // The lowest level marked "true" takes priority.
  let level = LOCALES_LEVEL_4
  if (flags.LOCALES_LEVEL_3.value) level = LOCALES_LEVEL_3
  if (flags.LOCALES_LEVEL_2.value) level = LOCALES_LEVEL_2
  if (flags.LOCALES_LEVEL_1.value) level = LOCALES_LEVEL_1

  return level
}

/**
 * Given the list of all locales set by Streetmix, returns a filtered and
 * sorted list of locales based on the current level of available locales.
 * See `./constants.ts` for a description of what each level is.
 */
export function getAvailableLocales (): LocaleDefinition[] {
  const level = getLocaleLevel()

  return (
    (LOCALES as LocaleDefinition[])
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
 * Given a user-requested locale, make sure that it is a locale we support and
 * that the user has access to use it.
 *
 * examples:
 *  - if user requests locale `ja` but is not allowed to use it, return `en`
 *  - if user requests locale `en-AU`, return the superset `en`
 *  - if user requests locale `pt-PT` but only `pt-BR` exists, return `pt-BR`
 */
export function getActualLocaleFromRequested (requested: string): string {
  const locales = getAvailableLocales()
  let locale = DEFAULT_LOCALE

  // Is the proposed locale in the current list?
  let exactFound = false

  for (let i = 0; i < locales.length; i++) {
    if (requested === locales[i].value) {
      exactFound = true
      locale = locales[i].value
      break
    }
  }

  if (exactFound) return locale

  // If there is not an exact match, is the proposed locale a subset of a
  // primary language? e.g. en-AU vs en
  let supersetFound = false

  for (let i = 0; i < locales.length; i++) {
    if (requested.indexOf(locales[i].value) === 0) {
      locale = locales[i].value
      supersetFound = true
      break
    }
  }

  if (supersetFound) return locale

  // If neither exact or subset, is there a "fuzzy" match with another region's
  // locale? e.g. pt-PT vs pt-BR.
  let fuzzyMatch = false
  const primaryTag = requested.split('-')[0]

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
