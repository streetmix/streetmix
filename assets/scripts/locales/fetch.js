import { API_URL } from '../app/config'

/**
 * Given a locale, returns an object representing all translation messages.
 *
 * @todo Move this util/api module
 * @param {string}
 * @return {Promise}
 */
export function fetchTranslationMessages (locale) {
  return Promise.all([
    window.fetch(`${API_URL}v1/translate/${locale}/main`).then((r) => r.json()),
    window
      .fetch(`${API_URL}v1/translate/${locale}/segment-info`)
      .then((r) => r.json())
  ]).then((responses) => ({
    messages: responses[0],
    segmentInfo: responses[1]
  }))
}
