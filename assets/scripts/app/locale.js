/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
import { addLocaleData } from 'react-intl'
import store, { observeStore } from '../store'
import { changeLocale } from '../store/actions/locale'

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

// Add react-intl locale data
addLocaleData([...ar, ...es, ...de, ...fi, ...fr, ...ja, ...pl, ...pt, ...sv, ...zh])

export function initLocale (experimental) {
  // Current language is the one set by Streetmix or is the browser default, if unset
  let locale

  if (experimental) {
    // Default language is set by browser, or is English if undetermined
    const defaultLocale = navigator.language || 'en'

    try {
      locale = JSON.parse(window.localStorage.getItem('locale')) || defaultLocale
    } catch (err) {
      locale = defaultLocale
    }
  } else {
    locale = 'en'
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
  const messages = store.getState().locale.messages
  if (options.ns === 'segment-info') {
    return messages['segmentInfo.' + key] || fallback
  } else {
    return messages[key] || fallback
  }
}
