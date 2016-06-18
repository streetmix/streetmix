/**
 * exports.js
 *
 * A shim for exporting browserify modules to the global scope that are
 * required / imported while we're transitioning to a module bundler
 * Only keep imports that are needed and please remove them at earliest
 * convenience
 */
import $ from 'jquery'
window.$ = $

import _ from 'lodash'
window._ = _

import { trackEvent } from './app/event_tracking'
window.trackEvent = trackEvent

import { isFocusOnBody } from './app/focus'
window._isFocusOnBody = isFocusOnBody

import { ERRORS, showError, showErrorFromUrl } from './app/errors'
window.ERRORS = ERRORS
window._showError = showError
window._showErrorFromUrl = showErrorFromUrl

// Gallery
import { showGallery } from './gallery/view'
window._showGallery = showGallery

// Menus
import { hideAllMenus } from './menus/menu'
window.hideAllMenus = hideAllMenus

import { shareMenu } from './menus/_share'
window.shareMenu = shareMenu

// Dialogs
import { aboutDialog } from './dialogs/_about'
window.aboutDialog = aboutDialog

import {
  loadSignIn,
  onSignOutClick,
  getAuthHeader,
  getSignInData,
  isSignedIn,
  isSignInLoaded
} from './users/authentication'
window._loadSignIn = loadSignIn
window._onSignOutClick = onSignOutClick
window.getSignInData = getSignInData
window.isSignedIn = isSignedIn
window.isSignInLoaded = isSignInLoaded

import { fetchAvatars, receiveAvatar } from './users/avatars'
window._fetchAvatars = fetchAvatars
window._receiveAvatar = receiveAvatar

import { saveSettingsLocally, onStorageChange } from './users/settings'
window._saveSettingsLocally = saveSettingsLocally
window._onStorageChange = onStorageChange

import {
  NEW_STREET_DEFAULT,
  onNewStreetDefaultClick,
  onNewStreetEmptyClick,
  onNewStreetLastClick
} from './streets/creation'
window._onNewStreetDefaultClick = onNewStreetDefaultClick
window._onNewStreetEmptyClick = onNewStreetEmptyClick
window._onNewStreetLastClick = onNewStreetLastClick
window.NEW_STREET_DEFAULT = NEW_STREET_DEFAULT

import { updateStreetName } from './streets/name'
window._updateStreetName = updateStreetName

import {
  getPromoteStreet,
  setPromoteStreet,
  remixStreet,
} from './streets/remix'
window.getPromoteStreet = getPromoteStreet
window.setPromoteStreet = setPromoteStreet
window._remixStreet = remixStreet

import {
  createNewStreetOnServer,
  fetchStreetFromServer
} from './streets/xhr'
window._createNewStreetOnServer = createNewStreetOnServer
window._fetchStreetFromServer = fetchStreetFromServer

import { infoBubble } from './info_bubble/info_bubble'
window._infoBubble = infoBubble

import {
  BUILDING_SPACE,
  changeBuildingHeight,
  createBuildings,
  onBuildingMouseEnter,
  onBuildingMouseLeave,
  updateBuildingPosition
} from './segments/buildings'
window.BUILDING_SPACE = BUILDING_SPACE
window._changeBuildingHeight = changeBuildingHeight
window._createBuildings = createBuildings
window._onBuildingMouseEnter = onBuildingMouseEnter
window._onBuildingMouseLeave = onBuildingMouseLeave
window._updateBuildingPosition = updateBuildingPosition

import {
  DRAGGING_TYPE_MOVE,
  DRAGGING_TYPE_RESIZE,
  onBodyMouseOut,
  onBodyMouseDown,
  onBodyMouseMove,
  handleSegmentMoveCancel,
  onBodyMouseUp,
  draggingType
} from './segments/drag_and_drop'
window.DRAGGING_TYPE_MOVE = DRAGGING_TYPE_MOVE
window.DRAGGING_TYPE_RESIZE = DRAGGING_TYPE_RESIZE
window._onBodyMouseOut = onBodyMouseOut
window._onBodyMouseDown = onBodyMouseDown
window._onBodyMouseMove = onBodyMouseMove
window._handleSegmentMoveCancel = handleSegmentMoveCancel
window._onBodyMouseUp = onBodyMouseUp
window.draggingType = draggingType

import { prepareSegmentInfo } from './segments/info'
window._prepareSegmentInfo = prepareSegmentInfo

import {
  setSegmentWidthResolution,
  setSegmentWidthClickIncrement,
  setSegmentWidthDraggingResolution,
  handleSegmentResizeCancel,
  normalizeAllSegmentWidths,
  incrementSegmentWidth
} from './segments/resizing'
window._setSegmentWidthResolution = setSegmentWidthResolution
window._setSegmentWidthClickIncrement = setSegmentWidthClickIncrement
window._setSegmentWidthDraggingResolution = setSegmentWidthDraggingResolution
window._handleSegmentResizeCancel = handleSegmentResizeCancel
window._normalizeAllSegmentWidths = normalizeAllSegmentWidths
window._incrementSegmentWidth = incrementSegmentWidth

import { TILE_SIZE, fillEmptySegments, segmentsChanged } from './segments/view'
window.TILE_SIZE = TILE_SIZE
window._fillEmptySegments = fillEmptySegments
window._segmentsChanged = segmentsChanged

import {
  setLastStreet,
  getStreet,
  setStreet,
  createDomFromData,
  saveStreetToServerIfNecessary,
  trimStreetData,
  getStreetUrl
} from './streets/data_model'
window._setLastStreet = setLastStreet
window._getStreet = getStreet
window._setStreet = setStreet
window._createDomFromData = createDomFromData
window._saveStreetToServerIfNecessary = saveStreetToServerIfNecessary
window._trimStreetData = trimStreetData
window._getStreetUrl = getStreetUrl

import {
  getUndoStack,
  getUndoPosition,
  setIgnoreStreetChanges,
  undo,
  redo,
} from './streets/undo_stack'
window.getUndoStack = getUndoStack
window.getUndoPosition = getUndoPosition
window.setIgnoreStreetChanges = setIgnoreStreetChanges
window._undo = undo
window._redo = redo

import {
  onStreetWidthChange,
  buildStreetWidthMenu,
  onStreetWidthClick,
  resizeStreetWidth,
  normalizeStreetWidth
} from './streets/width'
window._onStreetWidthChange = onStreetWidthChange
window._buildStreetWidthMenu = buildStreetWidthMenu
window._onStreetWidthClick = onStreetWidthClick
window._resizeStreetWidth = resizeStreetWidth
window._normalizeStreetWidth = normalizeStreetWidth
