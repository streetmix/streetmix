/**
 * app_settings
 *
 * Change the state of the application based on combinations of
 * debug and system settings.
 *
 */
import { setAppFlags } from '../store/slices/app'
import store from '../store'
import { debug } from './debug_settings'

// Just set readOnly
const system = store.getState().system

export const app = {
  readOnly: system.phone || debug.forceReadOnly
}

store.dispatch(setAppFlags(app))
