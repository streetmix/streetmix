/**
 * app_settings
 *
 * Change the state of the application based on combinations of
 * debug and system settings.
 *
 */
import { debug } from './debug_settings'
import { system } from './system_capabilities'

// Just set readOnly
export const app = {
  readOnly: (system.phone || debug.forceReadOnly)
}
