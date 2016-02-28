/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
'use strict'

var i18next = require('i18next')
var i18nextXhr = require('i18next-xhr-backend')

// Default language is set by browser, or is US English if undetermined
var defaultLocale = navigator.language || 'en-US'

function init () {
  // Current language is the one set by Streetmix or is the browser default, if unset
  var locale = getLocale() || defaultLocale

  initSettingDropdown(locale)
  doTheI18n(locale)
}

function initSettingDropdown (locale) {
  var el = document.querySelector('#language-select')

  // Set the dropdown to the current language.
  // If current language is not in the list, fallback to US English.
  el.value = locale
  if (!el.value) {
    el.value = 'en-US'
  }

  el.addEventListener('change', onNewLocaleSelected)
}

function onNewLocaleSelected () {
  setLocale(this.value)
}

function getLocale () {
  return window.localStorage.getItem('locale')
}

function setLocale (locale) {
  window.localStorage.setItem('locale', locale)
  doTheI18n(locale)
}

function clearLocale () {
  window.localStorage.removeItem('locale')
// TODO: clear language cache here if it's activated
}

function doTheI18n (locale) {
  var options = {
    lng: locale,
    //ns: ['app'], //'segments'],
    //defaultNs: 'app',
    fallbackLng: 'en-US',
    load: 'currentOnly',
    debug: false,
    backend: {
      loadPath: API_URL + 'v1/translate/{{lng}}'
    }
  }

  var callback = function (err, t) {
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

module.exports = {
  init: init,
  get: getLocale,
  set: setLocale,
  clear: clearLocale
}
