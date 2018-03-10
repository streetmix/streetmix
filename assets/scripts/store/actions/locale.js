import { SET_LOCALE } from './index'

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

export function setLocale (locale, messages) {
  return {
    type: SET_LOCALE,
    // Converts "es_MX" to "en-MX" (and similar) for react-intl
    locale: locale.replace('_', '-'),
    messages: flattenObject(messages)
  }
}
