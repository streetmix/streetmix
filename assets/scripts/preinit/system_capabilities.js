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
// TODO: move everything to Redux store, if possible.
// The settings remaining here ones that read from other parts of the app
export function initSystemCapabilities () {
  const system = {}

  if (debug.forceTouch) {
    system.touch = true
  }

  if (debug.forceNoInternet || NO_INTERNET_MODE === true) {
    system.noInternet = true
  }

  // Get system prefixes for page hidden and visibility state
  system.hiddenProperty = Modernizr.prefixed('hidden', document, false)

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
    system.devicePixelRatio = 1.0
  }

  store.dispatch({
    type: SET_SYSTEM_FLAGS,
    ...system
  })
}
