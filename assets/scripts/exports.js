/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required / imported while we're transitioning to a module bundler
 * Only keep imports that are needed and please remove them at earliest
 * convenience
 */

import _ from 'lodash'
window._ = _

import { trackEvent } from './app/event_tracking'
window.trackEvent = trackEvent

import { showBlockingShield, hideBlockingShield, darkenBlockingShield } from './app/blocking_shield'
window.showBlockingShield = showBlockingShield
window.hideBlockingShield = hideBlockingShield
window.darkenBlockingShield = darkenBlockingShield

import { showStatusMessage, hideStatusMessage } from './app/status_message'
window.showStatusMessage = showStatusMessage
window.hideStatusMessage = hideStatusMessage

import { ERRORS, showError, hideError, showErrorFromUrl } from './app/errors'
window.ERRORS = ERRORS
window._showError = showError
window._hideError = hideError
window._showErrorFromUrl = showErrorFromUrl

import { getElAbsolutePos } from './util/helpers'
window._getElAbsolutePos = getElAbsolutePos

// Menus
import { isAnyMenuVisible, hideAllMenus } from './menus/menu'
window.isAnyMenuVisible = isAnyMenuVisible
window.hideAllMenus = hideAllMenus

import { shareMenu } from './menus/_share'
window.shareMenu = shareMenu

// Dialogs
import { isAnyDialogVisible, hideAllDialogs } from './dialogs/dialog'
window.isAnyDialogVisible = isAnyDialogVisible
window.hideAllDialogs = hideAllDialogs

import { aboutDialog } from './dialogs/_about'
window.aboutDialog = aboutDialog

import { fetchAvatars, receiveAvatar } from './users/avatars'
window._fetchAvatars = fetchAvatars
window._receiveAvatar = receiveAvatar

import { formatDate } from './util/date_format'
window._formatDate = formatDate

import { updateStreetMetadata } from './streets/metadata'
window._updateStreetMetadata = updateStreetMetadata

import { drawProgrammaticPeople } from './segments/people'
window.drawProgrammaticPeople = drawProgrammaticPeople

import { processWidthInput, prettifyWidth, undecorateWidth } from './util/width_units'
window._processWidthInput = processWidthInput
window._prettifyWidth = prettifyWidth
window.undecorateWidth = undecorateWidth

import { removeElFromDOM } from './util/dom_helpers'
window.removeElFromDOM = removeElFromDOM

import { generateRandSeed, RandomGenerator } from './util/random'
window.generateRandSeed = generateRandSeed
window.RandomGenerator = RandomGenerator
