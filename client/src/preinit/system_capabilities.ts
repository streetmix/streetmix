/**
 * system_capabilities
 *
 * Detect capabilities and features of the current system (device,
 * browser, connection, etc).
 *
 */
import { OFFLINE_MODE } from '../app/config.js'
import store from '../store'
import { setSystemFlags, type SystemState } from '../store/slices/system.js'
import { debug } from './debug_settings.js'

// Default settings
// TODO: move everything to Redux store, if possible.
// The settings remaining here ones that read from other parts of the app
export function initSystemCapabilities() {
  const system: Partial<SystemState> = {}

  if (debug.forceOfflineMode || OFFLINE_MODE === true) {
    system.offline = true
  }

  if (debug.forceNonRetina) {
    system.devicePixelRatio = 1.0
  }

  store.dispatch(setSystemFlags(system))
}
