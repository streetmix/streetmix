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

export const app = {
  readOnly: debug.forceReadOnly,
}

store.dispatch(setAppFlags(app))
