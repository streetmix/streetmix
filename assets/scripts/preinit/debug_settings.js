/**
 * debug_settings
 *
 * Change the state of the application based on overrides
 * provided in the URL string. This is executed immediately
 * during the preinit stage, so it should depend on no
 * data, nor does it have access to any application state.
 * Later scripts may use these settings.
 *
 */
import store from '../store'
import { SET_DEBUG_FLAGS } from '../store/actions'

export const debug = {
  forceLeftHandTraffic: false,
  forceUnsupportedBrowser: false,
  forceNonRetina: false,
  forceNoInternet: false,
  forceReadOnly: false,
  forceTouch: false,
  forceLiveUpdate: false
}

const url = window.location.search

if (url.match(/[?&]debug-force-left-hand-traffic&?/)) {
  debug.forceLeftHandTraffic = true
}

if (url.match(/[?&]debug-force-unsupported-browser&?/)) {
  debug.forceUnsupportedBrowser = true
}

if (url.match(/[?&]debug-force-non-retina&?/)) {
  debug.forceNonRetina = true
}

if (url.match(/[?&]debug-force-no-internet&?/)) {
  debug.forceNoInternet = true
}

if (url.match(/[?&]debug-force-read-only&?/)) {
  debug.forceReadOnly = true
}

if (url.match(/[?&]debug-force-touch&?/)) {
  debug.forceTouch = true
}

if (url.match(/[?&]debug-force-live-update&?/)) {
  debug.forceLiveUpdate = true
}

store.dispatch({
  type: SET_DEBUG_FLAGS,
  ...debug
})
