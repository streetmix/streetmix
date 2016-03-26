var initializing = false
var bodyLoaded
var readyStateCompleteLoaded

var abortEverything

var TRACK_ACTION_TOUCH_CAPABLE = 'Touch capability detected'

// Some things are placed on the generic Stmx app object to keep it out of global scope
// Do this as little as possible. Eventually, code becomes a collection of
// individual modules that are require()'d by browserify
var Stmx = {}

Stmx.preInit = function () {
  initializing = true
  ignoreStreetChanges = true

  var language = window.navigator.userLanguage || window.navigator.language
  if (language) {
    language = language.substr(0, 2).toUpperCase()
    _updateSettingsFromCountryCode(language)
  }
}

Stmx.init = function () {
  /* global Locale */
  if (!debug.forceUnsupportedBrowser) {
    // TODO temporary ban
    if ((navigator.userAgent.indexOf('Opera') != -1) ||
      (navigator.userAgent.indexOf('Internet Explorer') != -1) ||
      (navigator.userAgent.indexOf('MSIE') != -1)) {
      mode = MODES.UNSUPPORTED_BROWSER
      _processMode()
      return
    }
  }

  _initGallery() // formerly _fillDom()
  _fillEmptySegments()
  _prepareSegmentInfo()

  // TODO make it better
  // Related to Enter to 404 bug in Chrome
  $.ajaxSetup({ cache: false })

  readyStateCompleteLoaded = false
  document.addEventListener('readystatechange', _onReadyStateChange)

  bodyLoaded = false
  window.addEventListener('load', _onBodyLoad)

  _processUrl()
  _processMode()

  if (abortEverything) {
    return
  }

  // Asynchronously loading…

  // …detecting country from IP for units and left/right-hand driving
  if ((mode == MODES.NEW_STREET) || (mode == MODES.NEW_STREET_COPY_LAST)) {
    _detectGeolocation()
  } else {
    geolocationLoaded = true
  }

  // …sign in info from our API (if not previously cached) – and subsequent
  // street data if necessary (depending on the mode)
  _loadSignIn()

// Note that we are waiting for sign in and image info to show the page,
// but we give up on country info if it’s more than 1000ms.
}

function _onEverythingLoaded () {
  switch (mode) {
    case MODES.NEW_STREET_COPY_LAST:
      _onNewStreetLastClick()
      break
  }

  _showWelcome()

  _onResize()
  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()

  initializing = false
  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)

  _updatePageUrl()
  _buildStreetWidthMenu()
  _addScrollButtons(document.querySelector('#palette'))
  _addScrollButtons(document.querySelector('#gallery .streets'))
  _addEventListeners()

  var event = new CustomEvent('stmx:everything_loaded')
  window.dispatchEvent(event)

  if (mode == MODES.USER_GALLERY) {
    _showGallery(galleryUserId, true)
  } else if (mode == MODES.GLOBAL_GALLERY) {
    _showGallery(null, true)
  } else if (mode == MODES.ABOUT) {
    aboutDialog.show()
  }

  if (promoteStreet) {
    _remixStreet()
  }

  // Track touch capability in Google Analytics
  if (system.touch === true) {
    trackEvent('System', TRACK_ACTION_TOUCH_CAPABLE, null, null, true)
  }
}

function _onBodyLoad () {
  bodyLoaded = true

  document.querySelector('#loading-progress').value++
  _checkIfEverythingIsLoaded()
}

function _onReadyStateChange () {
  if (document.readyState == 'complete') {
    readyStateCompleteLoaded = true

    document.querySelector('#loading-progress').value++
    _checkIfEverythingIsLoaded()
  }
}
