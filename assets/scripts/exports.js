/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required while we're transitioning to a module bundler
 * Only keep require()s that are needed and please remove them at earliest
 * convenience
 */

window.msg = require('./app/messages')

import { trackEvent } from './app/event_tracking'
window.trackEvent = trackEvent

window.blockingShield = require('./app/blocking_shield')
import { showStatusMessage, hideStatusMessage } from './app/status_message'
window._statusMessage = {
  show: showStatusMessage,
  hide: hideStatusMessage
}

window.ERRORS = require('./app/errors')

import { getElAbsolutePos } from './util/helpers'
window._getElAbsolutePos = getElAbsolutePos

// Menus
import { isAnyMenuVisible, hideAllMenus } from './menus/menu'
window.isAnyMenuVisible = isAnyMenuVisible
window.hideAllMenus = hideAllMenus

window.shareMenu = require('./menus/_share')
window.feedbackMenu = require('./menus/_feedback')

// Dialogs
window.DialogManager = require('./dialogs/dialog_manager')

window._fetchAvatars = require('./users/avatars').fetch
window._receiveAvatar = require('./users/avatars').receive

window._formatDate = require('./util/date_format')
window._updateStreetMetadata = require('./streets/metadata')

window._removeElFromDom = require('./util/dom_helpers').remove

window._showError = require('./app/errors').show
window._hideError = require('./app/errors').hide
window._showErrorFromUrl = require('./app/errors').showFromUrl
