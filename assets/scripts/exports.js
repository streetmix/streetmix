/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required while we're transitioning to a module bundler
 * Only keep require()s that are needed and please remove them at earliest
 * convenience
 */

window.Keypress = require('./app/keypress')
window.DebugInfo = require('./app/debug_info')

window.blockingShield = require('./app/blocking_shield')

// Menus
window.MenuManager = require('./menus/menu_manager')
window.shareMenu = require('./menus/_share')
window.feedbackMenu = require('./menus/_feedback')

// Dialogs
window.DialogManager = require('./dialogs/dialog_manager')
