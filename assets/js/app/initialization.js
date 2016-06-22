var initializing = false
var bodyLoaded
var readyStateCompleteLoaded
var serverContacted

var abortEverything

// Some things are placed on the generic Stmx app object to keep it out of global scope
// Do this as little as possible. Eventually, code becomes a collection of
// individual modules that are require()'d by browserify
var Stmx = {}

Stmx.preInit = function () {
  initializing = true
  setIgnoreStreetChanges(true)

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
      setMode(MODES.UNSUPPORTED_BROWSER)
      _processMode()
      return
    }
  }

  window.dispatchEvent(new CustomEvent('stmx:init'))

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
  var mode = getMode()
  if ((mode == MODES.NEW_STREET) || (mode == MODES.NEW_STREET_COPY_LAST)) {
    _detectGeolocation()
  } else {
    setGeolocationLoaded(true)
  }

  // …sign in info from our API (if not previously cached) – and subsequent
  // street data if necessary (depending on the mode)
  _loadSignIn()

// Note that we are waiting for sign in and image info to show the page,
// but we give up on country info if it’s more than 1000ms.
}

function _checkIfEverythingIsLoaded () {
  if (abortEverything) {
    return
  }

  if ((imagesToBeLoaded == 0) && isSignInLoaded() && bodyLoaded &&
    readyStateCompleteLoaded && getGeolocationLoaded() && serverContacted) {
    _onEverythingLoaded()
  }
}

function _onEverythingLoaded () {
  switch (getMode()) {
    case MODES.NEW_STREET_COPY_LAST:
      _onNewStreetLastClick()
      break
  }

  _onResize()
  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()

  initializing = false
  setIgnoreStreetChanges(false)
  _setLastStreet(_trimStreetData(_getStreet()))

  _updatePageUrl()
  _buildStreetWidthMenu()
  _addEventListeners()

  var event = new CustomEvent('stmx:everything_loaded')
  window.dispatchEvent(event)

  var mode = getMode()
  if (mode == MODES.USER_GALLERY) {
    _showGallery(galleryUserId, true)
  } else if (mode == MODES.GLOBAL_GALLERY) {
    _showGallery(null, true)
  } else if (mode == MODES.ABOUT) {
    aboutDialog.show()
  }

  if (getPromoteStreet()) {
    _remixStreet()
  }

  // Track touch capability in Google Analytics
  if (system.touch === true) {
    trackEvent('SYSTEM', 'TOUCH_CAPABLE', null, null, true)
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
