/**
 * app_settings
 *
 * Change the state of the application based on combinations of
 * debug and system settings.
 *
 */
import { debug } from './debug_settings'
import { system } from './system_capabilities'
import { setAppFlags } from '../store/actions/app'
import store from '../store'

// Just set readOnly
export const app = {
  readOnly: (system.phone || debug.forceReadOnly)
}

store.dispatch(setAppFlags(app))
