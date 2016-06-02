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

import { isblockingAjaxRequestInProgress, newBlockingAjaxRequest } from './util/fetch_blocking'
window.isblockingAjaxRequestInProgress = isblockingAjaxRequestInProgress
window._newBlockingAjaxRequest = newBlockingAjaxRequest

import { newNonblockingAjaxRequest, getNonblockingAjaxRequestCount } from './util/fetch_nonblocking'
window._newNonblockingAjaxRequest = newNonblockingAjaxRequest
window._getNonblockingAjaxRequestCount = getNonblockingAjaxRequestCount

import { trackEvent } from './app/event_tracking'
window.trackEvent = trackEvent

import { loseAnyFocus, isFocusOnBody } from './app/focus'
window._loseAnyFocus = loseAnyFocus
window._isFocusOnBody = isFocusOnBody

import { goNewStreet } from './app/routing'
window.goNewStreet = goNewStreet

import { showStatusMessage, hideStatusMessage } from './app/status_message'
window.showStatusMessage = showStatusMessage
window.hideStatusMessage = hideStatusMessage

import { ERRORS, showError, showErrorFromUrl } from './app/errors'
window.ERRORS = ERRORS
window._showError = showError
window._showErrorFromUrl = showErrorFromUrl

import { normalizeSlug } from './util/helpers'
window.normalizeSlug = normalizeSlug

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

import { fetchAvatars, receiveAvatar } from './users/avatars'
window._fetchAvatars = fetchAvatars
window._receiveAvatar = receiveAvatar

import {
  makeDefaultStreet,
  NEW_STREET_DEFAULT,
  NEW_STREET_EMPTY,
  onNewStreetDefaultClick,
  onNewStreetEmptyClick,
  onNewStreetLastClick
} from './streets/creation'
window._makeDefaultStreet = makeDefaultStreet
window._onNewStreetDefaultClick = onNewStreetDefaultClick
window._onNewStreetEmptyClick = onNewStreetEmptyClick
window._onNewStreetLastClick = onNewStreetLastClick
window.NEW_STREET_DEFAULT = NEW_STREET_DEFAULT
window.NEW_STREET_EMPTY = NEW_STREET_EMPTY

import { updateStreetMetadata } from './streets/metadata'
window._updateStreetMetadata = updateStreetMetadata

import { updateStreetName } from './streets/name'
window._updateStreetName = updateStreetName

import { onStreetSectionScroll } from './streets/scroll'
window._onStreetSectionScroll = onStreetSectionScroll

import { infoBubble } from './info_bubble/info_bubble'
window._infoBubble = infoBubble

import {
  BUILDING_SPACE,
  DEFAULT_BUILDING_HEIGHT_LEFT,
  DEFAULT_BUILDING_HEIGHT_RIGHT,
  DEFAULT_BUILDING_VARIANT_LEFT,
  DEFAULT_BUILDING_VARIANT_RIGHT,
  DEFAULT_BUILDING_HEIGHT_EMPTY,
  DEFAULT_BUILDING_VARIANT_EMPTY,
  changeBuildingHeight,
  createBuildings,
  onBuildingMouseEnter,
  onBuildingMouseLeave,
  updateBuildingPosition
} from './segments/buildings'
window.BUILDING_SPACE = BUILDING_SPACE
window.DEFAULT_BUILDING_HEIGHT_LEFT = DEFAULT_BUILDING_HEIGHT_LEFT
window.DEFAULT_BUILDING_HEIGHT_RIGHT = DEFAULT_BUILDING_HEIGHT_RIGHT
window.DEFAULT_BUILDING_VARIANT_LEFT = DEFAULT_BUILDING_VARIANT_LEFT
window.DEFAULT_BUILDING_VARIANT_RIGHT = DEFAULT_BUILDING_VARIANT_RIGHT
window.DEFAULT_BUILDING_HEIGHT_EMPTY = DEFAULT_BUILDING_HEIGHT_EMPTY
window.DEFAULT_BUILDING_VARIANT_EMPTY = DEFAULT_BUILDING_VARIANT_EMPTY
window._changeBuildingHeight = changeBuildingHeight
window._createBuildings = createBuildings
window._onBuildingMouseEnter = onBuildingMouseEnter
window._onBuildingMouseLeave = onBuildingMouseLeave
window._updateBuildingPosition = updateBuildingPosition

import { DEFAULT_SEGMENTS } from './segments/default'
window.DEFAULT_SEGMENTS = DEFAULT_SEGMENTS

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

import { SEGMENT_INFO, prepareSegmentInfo } from './segments/info'
window.SEGMENT_INFO = SEGMENT_INFO
window._prepareSegmentInfo = prepareSegmentInfo

import {
  getSegmentWidthResolution,
  setSegmentWidthResolution,
  setSegmentWidthClickIncrement,
  setSegmentWidthDraggingResolution,
  handleSegmentResizeCancel,
  normalizeAllSegmentWidths,
  incrementSegmentWidth
} from './segments/resizing'
window._getSegmentWidthResolution = getSegmentWidthResolution
window._setSegmentWidthResolution = setSegmentWidthResolution
window._setSegmentWidthClickIncrement = setSegmentWidthClickIncrement
window._setSegmentWidthDraggingResolution = setSegmentWidthDraggingResolution
window._handleSegmentResizeCancel = handleSegmentResizeCancel
window._normalizeAllSegmentWidths = normalizeAllSegmentWidths
window._incrementSegmentWidth = incrementSegmentWidth

import { getVariantString, getVariantArray } from './segments/variant_utils'
window._getVariantString = getVariantString
window._getVariantArray = getVariantArray

import {
  TILE_SIZE,
  createSegment,
  createSegmentDom,
  fillEmptySegments,
  repositionSegments,
  segmentsChanged
} from './segments/view'
window.TILE_SIZE = TILE_SIZE
window._createSegment = createSegment
window._createSegmentDom = createSegmentDom
window._fillEmptySegments = fillEmptySegments
window._repositionSegments = repositionSegments
window._segmentsChanged = segmentsChanged

import { processWidthInput, prettifyWidth } from './util/width_units'
window._processWidthInput = processWidthInput
window._prettifyWidth = prettifyWidth

import { generateRandSeed } from './util/random'
window.generateRandSeed = generateRandSeed
