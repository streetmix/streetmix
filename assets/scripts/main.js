/**
 * Streetmix
 *
 */

// Export modules to window for the global-scoped JavaScript
require('./exports')

// Load things that are needed
require('./app/blocking_shield')
require('./app/debug_info')
require('./app/keyboard_commands')

// Menus
require('./menus/menu_manager')

// Dialogs
require('./dialogs/dialog_manager')

// Utilities
var keypress = require('./app/keypress')
keypress.startListening()

// Temp: use this while in transition
function _doWhatUsedToBeThe_onEverythingLoadedFunction () {
}

window._doWhatUsedToBeThe_onEverythingLoadedFunction = _doWhatUsedToBeThe_onEverythingLoadedFunction
