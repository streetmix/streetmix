import { SET_LOCALE } from './index'
import { API_URL } from '../../app/config'

// Flattens a nested object from translation response, e.g.
// { key1: { key2: "string" }} => { "key1.key2": "string" }
// This is because react-intl expects to look up translations this way.
// ES6-ported function from https://gist.github.com/penguinboy/762197
// This is quite simple; it does not address arrays or null values, since
// the responses from the server will not be containing those.
function flattenObject (obj) {
  const toReturn = {}
  let flatObject
  Object.keys(obj).forEach(i => {
    if (typeof obj[i] === 'object') {
      flatObject = flattenObject(obj[i])
      Object.keys(flatObject).forEach(x => {
        toReturn[i + '.' + x] = flatObject[x]
      })
    } else {
      toReturn[i] = obj[i]
    }
  })
  return toReturn
}

export function setLocale (locale, messages, segmentInfo = {}) {
  // Substitute 'en' for 'en-US' locales
  if (locale === 'en-US') locale = 'en'

  return {
    type: SET_LOCALE,
    locale,
    messages: flattenObject(messages),
    segmentInfo: flattenObject(segmentInfo)
  }
}

export function changeLocale (locale) {
  return (dispatch) => {
    Promise.all([
      window.fetch(`${API_URL}v1/translate/${locale}/main`).then((r) => r.json()),
      window.fetch(`${API_URL}v1/translate/${locale}/segment-info`).then((r) => r.json())
    ]).then((responses) => {
      const messages = responses[0]
      const segmentInfo = responses[1]

      dispatch(setLocale(locale, messages, segmentInfo))
    })
  }
}
