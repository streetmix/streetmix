/**
 * system_capabilities
 *
 * Detect capabilities and features of the current system (device,
 * browser, connection, etc).
 *
 */
/* global Modernizr */
import { NO_INTERNET_MODE } from '../app/config'
import { debug } from './debug_settings'
import store from '../store'
import { SET_SYSTEM_FLAGS } from '../store/actions'

// Default settings
export const system = {
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

// NOTE:
// This function might be called on very old browsers. Please make
// sure not to use modern faculties.

if (debug.forceNoInternet || NO_INTERNET_MODE === true) {
  system.noInternet = true
}

if (debug.forceTouch) {
  system.touch = true
} else {
  system.touch = Modernizr.touch || false
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

if ((typeof window.matchMedia !== 'undefined') &&
  (window.matchMedia('only screen and (max-device-width: 480px)').matches ||
  window.matchMedia('only screen and (max-device-height: 480px)').matches)) {
  system.phone = true
} else {
  system.phone = false
}

// Returns CSS prefixed property or false if not supported.
system.cssTransform = Modernizr.prefixed('transform')

if (navigator.userAgent.indexOf('Windows') !== -1) {
  system.windows = true
}

if ((navigator.userAgent.indexOf('Safari') !== -1) &&
  (navigator.userAgent.indexOf('Chrome') === -1)) {
  system.safari = true
}

store.dispatch({
  type: SET_SYSTEM_FLAGS,
  ...system
})
