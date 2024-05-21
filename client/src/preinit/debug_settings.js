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
import { setDebugFlags } from '../store/slices/debug'

export const debug = {
  forceLeftHandTraffic: false,
  forceNonRetina: false,
  forceOfflineMode: false,
  forceReadOnly: false
}

const params = new URLSearchParams(window.location.search)

// Historically, params were valueless and they we had our own string
// parsing code, but now we use the `URLSearchParams` global interface.
// For backwards compatibility, only the presence of a key indicates
// truthiness. Recent usage will upgrade truthy values to `1`. However,
// the value doesn't mean anything for these keys, for now.
if (params.has('debug-force-left-hand-traffic')) {
  debug.forceLeftHandTraffic = true
}

if (params.has('debug-force-non-retina')) {
  debug.forceNonRetina = true
}

if (params.has('debug-force-offline')) {
  debug.forceOfflineMode = true
}

if (params.has('debug-force-read-only')) {
  debug.forceReadOnly = true
}

store.dispatch(
  setDebugFlags({
    ...debug
  })
)
