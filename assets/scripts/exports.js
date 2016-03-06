/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required while we're transitioning to a module bundler
 * Only keep require()s that are needed and please remove them at earliest
 * convenience
 */

window.msg = require('./app/messages')

window.EventTracking = require('./app/event_tracking')
window.blockingShield = require('./app/blocking_shield')

// Menus
window.MenuManager = require('./menus/menu_manager')
window.shareMenu = require('./menus/_share')
window.feedbackMenu = require('./menus/_feedback')

// Dialogs
window.DialogManager = require('./dialogs/dialog_manager')

window._fetchAvatars = require('./users/avatars').fetch
window._receiveAvatar = require('./users/avatars').receive

window._formatDate = require('./util/date_format')
window._updateStreetMetadata = require('./streets/metadata')
