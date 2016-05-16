/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
/* global API_URL */
import i18next from 'i18next'
import i18nextXhr from 'i18next-xhr-backend'

// Default language is set by browser, or is English if undetermined
const defaultLocale = navigator.language || 'en'

export function initLocale () {
  // Current language is the one set by Streetmix or is the browser default, if unset
  const locale = getLocale() || defaultLocale

  initSettingDropdown(locale)
  doTheI18n(locale)
}

function initSettingDropdown (locale) {
  const el = document.querySelector('#language-select')

  // Set the dropdown to the current language.
  // If current language is not in the list, fallback to US English.
  el.value = locale
  if (!el.value) {
    el.value = 'en'
  }

  el.addEventListener('change', onNewLocaleSelected)
}

function onNewLocaleSelected () {
  setLocale(this.value)
}

export function getLocale () {
  return window.localStorage.getItem('locale')
}

export function setLocale (locale) {
  window.localStorage.setItem('locale', locale)
  doTheI18n(locale)
}

export function clearLocale () {
  window.localStorage.removeItem('locale')
// TODO: clear language cache here if it's activated
}

function doTheI18n (locale) {
  const options = {
    lng: locale,
    // ns: ['app'], //'segments'],
    // defaultNs: 'app',
    fallbackLng: 'en',
    load: 'currentOnly',
    debug: false,
    backend: {
      loadPath: API_URL + 'v1/translate/{{lng}}'
    }
  }

  const callback = function (err, t) {
    if (err) {
      console.log(err)
    }
    var els = document.querySelectorAll('[data-i18n]')
    for (var i = 0, j = els.length; i < j; i++) {
      els[i].textContent = t(els[i].getAttribute('data-i18n'))
    }
  }

  i18next
    .use(i18nextXhr)
    .init(options, callback)
}
