var readOnly = false
var system = {
  touch: false,
  phone: false,
  safari: false,
  windows: false,
  noInternet: false,
  viewportWidth: null,
  viewportHeight: null,
  hiDpi: 1.0,
  cssTransform: false,
  ipAddress: null,
  apiUrl: null
}

function _detectSystemCapabilities () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (debug.forceNoInternet || NO_INTERNET_MODE === true) {
    system.noInternet = true
  }

  if (debug.forceTouch) {
    system.touch = true
  } else {
    system.touch = Modernizr.touch
  }

  // Get system prefixes for page visibility API, page hidden and visibility state
  system.pageVisibility = Modernizr.pagevisibility
  system.hiddenProperty = Modernizr.prefixed('hidden', document, false)
  system.visibilityState = Modernizr.prefixed('visibilityState', document, false)
  if (system.hiddenProperty) {
    switch (system.hiddenProperty.toLowerCase()) {
      case 'hidden':
        system.visibilityChange = 'visibilitychange'
        break
      case 'mozhidden':
        system.visibilityChange = 'mozvisibilitychange'
        break
      case 'mshidden':
        system.visibilityChange = 'msvisibilitychange'
        break
      case 'webkithidden':
        system.visibilityChange = 'webkitvisibilitychange'
        break
      default:
        system.visibilityChange = false
        break
    }
  }

  if (debug.forceNonRetina) {
    system.hiDpi = 1.0
  } else {
    system.hiDpi = window.devicePixelRatio || 1.0
  }

  if ((typeof matchMedia != 'undefined') &&
    matchMedia('only screen and (max-device-width: 480px)').matches) {
    system.phone = true
  } else {
    system.phone = false
  }

  // Returns CSS prefixed property or false if not supported.
  system.cssTransform = Modernizr.prefixed('transform')

  if (navigator.userAgent.indexOf('Windows') != -1) {
    system.windows = true
  }

  if ((navigator.userAgent.indexOf('Safari') != -1) &&
    (navigator.userAgent.indexOf('Chrome') == -1)) {
    system.safari = true
  }

  if (system.phone || debug.forceReadOnly) {
    readOnly = true
  }

  var meta = document.createElement('meta')
  meta.setAttribute('name', 'viewport')
  if (system.phone) {
    meta.setAttribute('content', 'initial-scale=.5, maximum-scale=.5')
  } else {
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1')
  }
  var headEls = document.getElementsByTagName('head')
  headEls[0].appendChild(meta)

  var language = window.navigator.userLanguage || window.navigator.language
  if (language) {
    var language = language.substr(0, 2).toUpperCase()
    _updateSettingsFromCountryCode(language)
  }
}

function _addBodyClasses () {
  document.body.classList.add('environment-' + ENV)

  if (system.windows) {
    document.body.classList.add('windows')
  }

  if (system.safari) {
    document.body.classList.add('safari')
  }

  if (system.touch) {
    document.body.classList.add('touch-support')
  }

  if (readOnly) {
    document.body.classList.add('read-only')
  }

  if (system.phone) {
    document.body.classList.add('phone')
  }

  if (system.noInternet) {
    document.body.classList.add('no-internet')
  }
}
