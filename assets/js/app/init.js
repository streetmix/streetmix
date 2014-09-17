app.preInit = function() {
  initializing = true;
  ignoreStreetChanges = true;

  _detectDebugUrl();
  _detectSystemCapabilities();
}

app.init = function() {
  if (!debug.forceUnsupportedBrowser) {

    // TODO temporary ban
    if ((navigator.userAgent.indexOf('Opera') != -1) ||
        (navigator.userAgent.indexOf('Internet Explorer') != -1) ||
        (navigator.userAgent.indexOf('MSIE') != -1)) {
      mode = MODES.UNSUPPORTED_BROWSER;
      _processMode();
      return;
    }
  }

  _fillDom();
  _prepareSegmentInfo();

  // Temporary as per https://github.com/Modernizr/Modernizr/issues/788#issuecomment-12513563
  Modernizr.addTest('pagevisibility', !!Modernizr.prefixed('hidden', document, false));

  // TODO make it better
  // Related to Enter to 404 bug in Chrome
  $.ajaxSetup({ cache: false });

  readyStateCompleteLoaded = false;
  document.addEventListener('readystatechange', _onReadyStateChange);

  bodyLoaded = false;
  window.addEventListener('load', _onBodyLoad);

  _addBodyClasses();
  _processUrl();
  _processMode();

  if (abortEverything) {
    return;
  }

  // Asynchronously loading…

  // …detecting country from IP for units and left/right-hand driving
  if ((mode == MODES.NEW_STREET) || (mode == MODES.NEW_STREET_COPY_LAST)) {
    _detectGeolocation();
  } else {
    geolocationLoaded = true;
  }

  // …sign in info from our API (if not previously cached) – and subsequent
  // street data if necessary (depending on the mode)
  _loadSignIn();

  // …images
  _loadImages();

  // Note that we are waiting for sign in and image info to show the page,
  // but we give up on country info if it’s more than 1000ms.
}
