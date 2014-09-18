var CSS_TRANSFORMS = ['webkitTransform', 'MozTransform', 'transform'];
var TRACK_ACTION_TOUCH_CAPABLE = 'Touch capability detected';

var readOnly = false;

var system = {
  touch: false,
  phone: false,
  safari: false,
  windows: false,

  viewportWidth: null,
  viewportHeight: null,

  hiDpi: 1.0,
  cssTransform: false,

  ipAddress: null,

  apiUrl: null
};

function _detectSystemCapabilities() {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (debug.forceTouch) {
    system.touch = true;
  } else {
    system.touch = Modernizr.touch;
  }
  // Track touch capability in Google Analytics
  if (system.touch === true) {
    _eventTracking.track(TRACK_CATEGORY_SYSTEM, TRACK_ACTION_TOUCH_CAPABLE, null, null, true);
  }

  system.pageVisibility = Modernizr.pagevisibility;
  if (debug.forceNonRetina) {
    system.hiDpi = 1.0;
  } else {
    system.hiDpi = window.devicePixelRatio || 1.0;
  }

  if ((typeof matchMedia != 'undefined') &&
      matchMedia('only screen and (max-device-width: 480px)').matches) {
    system.phone = true;
  } else {
    system.phone = false;
  }

  system.cssTransform = false;
  var el = document.createElement('div');
  for (var i in CSS_TRANSFORMS) {
    if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
      system.cssTransform = CSS_TRANSFORMS[i];
      break;
    }
  }

  if (navigator.userAgent.indexOf('Windows') != -1) {
    system.windows = true;
  }

  if ((navigator.userAgent.indexOf('Safari') != -1) &&
      (navigator.userAgent.indexOf('Chrome') == -1)) {
    system.safari = true;
  }

  if (system.phone || debug.forceReadOnly) {
    readOnly = true;
  }

  var meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  if (system.phone) {
    meta.setAttribute('content', 'initial-scale=.5, maximum-scale=.5');
  } else {
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1');
  }
  var headEls = document.getElementsByTagName('head');
  headEls[0].appendChild(meta);

  var language = window.navigator.userLanguage || window.navigator.language;
  if (language) {
    var language = language.substr(0, 2).toUpperCase();
    _updateSettingsFromCountryCode(language);
  }
}

function _addBodyClasses() {
  document.body.classList.add('environment-' + ENV);

  if (system.windows) {
    document.body.classList.add('windows');
  }

  if (system.safari) {
    document.body.classList.add('safari');
  }

  if (system.touch) {
    document.body.classList.add('touch-support');
  }

  if (readOnly) {
    document.body.classList.add('read-only');
  }

  if (system.phone) {
    document.body.classList.add('phone');
  }
}
