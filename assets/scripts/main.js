/**
 * Streetmix
 *
 */

// Initalization scripts
import './app/initialization'

// Export modules to window for the global-scoped JavaScript
import './exports'

// Load things that are needed
import './app/event_tracking'
import './app/blocking_shield'
import './app/debug_info'
import './app/keyboard_commands'

// Menus
import './menus/_feedback'
import './menus/_help'
import './menus/_identity'
import './menus/_settings'
import './menus/_share'

// Dialogs
import './dialogs/dialog_manager'

// Utilities
import { startListening } from './app/keypress'

// Start listening for keypresses
startListening()

// Temp: use this while in transition
function _doWhatUsedToBeThe_onEverythingLoadedFunction () {
}

window._doWhatUsedToBeThe_onEverythingLoadedFunction = _doWhatUsedToBeThe_onEverythingLoadedFunction
