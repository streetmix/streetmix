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

import { showBlockingShield, hideBlockingShield, darkenBlockingShield} from './app/blocking_shield'
window.blockingShield = {
  show: showBlockingShield,
  hide: hideBlockingShield,
  darken: darkenBlockingShield
}

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

import { fetchAvatars, receiveAvatar} from './users/avatars'
window._fetchAvatars = fetchAvatars
window._receiveAvatar = receiveAvatar

import { formatDate } from './util/date_format'
window._formatDate = formatDate

import { updateStreetMetadata } from './streets/metadata'
window._updateStreetMetadata = updateStreetMetadata

window._removeElFromDom = require('./util/dom_helpers').remove

window._showError = require('./app/errors').show
window._hideError = require('./app/errors').hide
window._showErrorFromUrl = require('./app/errors').showFromUrl
