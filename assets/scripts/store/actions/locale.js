import { LOAD_LOCALE, SET_LOCALE } from './index'
import {
  getActualLocaleFromRequested,
  fetchTranslationMessages
} from '../../locales/locale'

// Flattens a nested object from translation response, e.g.
// { key1: { key2: "string" }} => { "key1.key2": "string" }
// This is because react-intl expects to look up translations this way.
// ES6-ported function from https://gist.github.com/penguinboy/762197
// Ignores arrays and passes them through unchanged.
// Does not address null values, since the responses from the server will not be containing those.
function flattenObject (obj) {
  const toReturn = {}
  let flatObject
  Object.keys(obj).forEach((i) => {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      flatObject = flattenObject(obj[i])
      Object.keys(flatObject).forEach((x) => {
        toReturn[i + '.' + x] = flatObject[x]
      })
    } else {
      toReturn[i] = obj[i]
    }
  })
  return toReturn
}

export function setLocaleLoadingState (locale) {
  return {
    type: LOAD_LOCALE,
    locale
  }
}

export function setLocale (locale, messages, segmentInfo = {}) {
  return {
    type: SET_LOCALE,
    locale,
    messages: flattenObject(messages),
    segmentInfo: flattenObject(segmentInfo)
  }
}

export function changeLocale (requestedLocale) {
  const locale = getActualLocaleFromRequested(requestedLocale)

  return async (dispatch) => {
    // Set loading state to true
    dispatch(setLocaleLoadingState(locale))

    const translation = await fetchTranslationMessages(locale)
    dispatch(setLocale(locale, translation.messages, translation.segmentInfo))

    return translation
  }
}
