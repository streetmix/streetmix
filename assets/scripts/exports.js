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

import {
  URL_JUST_SIGNED_IN,
  URL_NEW_STREET,
  URL_NEW_STREET_COPY_LAST,
  URL_GLOBAL_GALLERY,
  URL_ERROR,
  URL_NO_USER,
  URL_HELP,
  URL_ABOUT,
  URL_RESERVED_PREFIX
} from './app/routing'
window.URL_JUST_SIGNED_IN = URL_JUST_SIGNED_IN
window.URL_NEW_STREET = URL_NEW_STREET
window.URL_NEW_STREET_COPY_LAST = URL_NEW_STREET_COPY_LAST
window.URL_GLOBAL_GALLERY = URL_GLOBAL_GALLERY
window.URL_ERROR = URL_ERROR
window.URL_NO_USER = URL_NO_USER
window.URL_HELP = URL_HELP
window.URL_ABOUT = URL_ABOUT
window.URL_RESERVED_PREFIX = URL_RESERVED_PREFIX

// Gallery
import { showGallery } from './gallery/view'
window._showGallery = showGallery

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

import {
  getGeolocationLoaded,
  setGeolocationLoaded,
  detectGeolocation,
  updateSettingsFromCountryCode
} from './users/localization'
window.getGeolocationLoaded = getGeolocationLoaded
window.setGeolocationLoaded = setGeolocationLoaded
window._detectGeolocation = detectGeolocation
window._updateSettingsFromCountryCode = updateSettingsFromCountryCode

import { onStorageChange } from './users/settings'
window._onStorageChange = onStorageChange

import {
  onNewStreetDefaultClick,
  onNewStreetEmptyClick,
  onNewStreetLastClick
} from './streets/creation'
window._onNewStreetDefaultClick = onNewStreetDefaultClick
window._onNewStreetEmptyClick = onNewStreetEmptyClick
window._onNewStreetLastClick = onNewStreetLastClick

import { updateStreetName } from './streets/name'
window._updateStreetName = updateStreetName

import { getPromoteStreet, remixStreet } from './streets/remix'
window.getPromoteStreet = getPromoteStreet
window._remixStreet = remixStreet

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
  handleSegmentResizeCancel,
  incrementSegmentWidth
} from './segments/resizing'
window._handleSegmentResizeCancel = handleSegmentResizeCancel
window._incrementSegmentWidth = incrementSegmentWidth

import { TILE_SIZE, fillEmptySegments, segmentsChanged } from './segments/view'
window.TILE_SIZE = TILE_SIZE
window._fillEmptySegments = fillEmptySegments
window._segmentsChanged = segmentsChanged

import {
  setLastStreet,
  getStreet,
  createDomFromData,
  trimStreetData,
  getStreetUrl
} from './streets/data_model'
window._setLastStreet = setLastStreet
window._getStreet = getStreet
window._createDomFromData = createDomFromData
window._trimStreetData = trimStreetData
window._getStreetUrl = getStreetUrl

import { setIgnoreStreetChanges, undo, redo } from './streets/undo_stack'
window.setIgnoreStreetChanges = setIgnoreStreetChanges
window._undo = undo
window._redo = redo

import {
  onStreetWidthChange,
  buildStreetWidthMenu,
  onStreetWidthClick,
  resizeStreetWidth
} from './streets/width'
window._onStreetWidthChange = onStreetWidthChange
window._buildStreetWidthMenu = buildStreetWidthMenu
window._onStreetWidthClick = onStreetWidthClick
window._resizeStreetWidth = resizeStreetWidth
