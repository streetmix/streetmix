import { cloneDeep } from 'lodash'

import { ERRORS, showError } from '../app/errors'
import { MODES, getMode } from '../app/mode'
import { hideAllMenus } from '../menus/menu_controller'
import { app } from '../preinit/app_settings'
import { debug } from '../preinit/debug_settings'
import {
  normalizeAllSegmentWidths,
  setSegmentWidthResolution,
  setSegmentWidthClickIncrement,
  setSegmentWidthDraggingResolution
} from '../segments/resizing'
import { segmentsChanged } from '../segments/view'
import {
  getStreet,
  setStreet,
  createDomFromData,
  saveStreetToServerIfNecessary
} from '../streets/data_model'
import {
  getUndoStack,
  getUndoPosition,
  setIgnoreStreetChanges
} from '../streets/undo_stack'
import { createNewStreetOnServer } from '../streets/xhr'
import {
  normalizeStreetWidth,
  resizeStreetWidth
} from '../streets/width'
import { wasGeolocationAttempted } from './geolocation'
import { isSignInLoaded } from './authentication'
import { saveSettingsLocally } from './settings'
import store from '../store'
import { setUserUnits } from '../store/actions/settings'

export const SETTINGS_UNITS_IMPERIAL = 1
export const SETTINGS_UNITS_METRIC = 2

export function getUnits () {
  return store.getState().settings.units
}

const SEGMENT_WIDTH_RESOLUTION_IMPERIAL = 0.25
const SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = 0.5
const SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = 0.5

// don't use const because of rounding problems
const SEGMENT_WIDTH_RESOLUTION_METRIC = 1 / 6 // .05 / IMPERIAL_METRIC_MULTIPLER
const SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 2 / 6 // .1 / IMPERIAL_METRIC_MULTIPLER
const SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 2 / 6 // .1 / IMPERIAL_METRIC_MULTIPLER

const COUNTRIES_IMPERIAL_UNITS = ['US']

let leftHandTraffic = false

export function getLeftHandTraffic () {
  return leftHandTraffic
}

const COUNTRIES_LEFT_HAND_TRAFFIC = [
  'AI', 'AG', 'AU', 'BS', 'BD', 'BB', 'BM', 'BT', 'BW', 'BN',
  'KY', 'CX', 'CC', 'CK', 'CY', 'DM', 'TL', 'FK', 'FJ', 'GD', 'GG',
  'GY', 'HK', 'IN', 'ID', 'IE', 'IM', 'JM', 'JP', 'JE', 'KE', 'KI',
  'LS', 'MO', 'MW', 'MY', 'MV', 'MT', 'MU', 'MS', 'MZ', 'NA', 'NR',
  'NP', 'NZ', 'NU', 'NF', 'PK', 'PG', 'PN', 'SH', 'KN', 'LC', 'VC',
  'WS', 'SC', 'SG', 'SB', 'ZA', 'LK', 'SR', 'SZ', 'TZ', 'TH', 'TK',
  'TO', 'TT', 'TC', 'TV', 'UG', 'GB', 'VG', 'VI', 'ZM', 'ZW'
]

export function checkIfSignInAndGeolocationLoaded () {
  if (wasGeolocationAttempted() && isSignInLoaded()) {
    switch (getMode()) {
      case MODES.NEW_STREET:
      case MODES.NEW_STREET_COPY_LAST:
        if (app.readOnly) {
          showError(ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE, true)
        } else {
          createNewStreetOnServer()
        }
        break
    }
  }
}

export function updateSettingsFromCountryCode (countryCode) {
  if (COUNTRIES_IMPERIAL_UNITS.indexOf(countryCode) !== -1) {
    setUserUnits(SETTINGS_UNITS_IMPERIAL)
  } else {
    setUserUnits(SETTINGS_UNITS_METRIC)
  }

  if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(countryCode) !== -1) {
    leftHandTraffic = true
  }

  if (debug.forceLeftHandTraffic) {
    leftHandTraffic = true
  }
  if (debug.forceMetric) {
    setUserUnits(SETTINGS_UNITS_METRIC)
  }
}

export function updateUnits (newUnits) {
  let fromUndo
  var street = getStreet()
  if (street.units === newUnits) {
    return
  }

  setUserUnits(newUnits)
  street.units = newUnits

  // If the user converts and then straight converts back, we just reach
  // to undo stack instead of double conversion (which could be lossy).
  var undoStack = getUndoStack()
  var undoPosition = getUndoPosition()
  if (undoStack[undoPosition - 1] &&
    (undoStack[undoPosition - 1].units === newUnits)) {
    fromUndo = true
  } else {
    fromUndo = false
  }

  propagateUnits()

  setIgnoreStreetChanges(true)
  if (!fromUndo) {
    normalizeAllSegmentWidths()

    if (street.remainingWidth === 0) {
      street.width = 0
      for (var i in street.segments) {
        street.width += street.segments[i].width
      }
    } else {
      street.width = normalizeStreetWidth(street.width)
    }
  } else {
    setStreet(cloneDeep(undoStack[undoPosition - 1]))
  }
  createDomFromData()
  segmentsChanged()
  resizeStreetWidth()

  setIgnoreStreetChanges(false)

  hideAllMenus()

  saveStreetToServerIfNecessary()
  saveSettingsLocally()
}

export function propagateUnits () {
  switch (getStreet().units) {
    case SETTINGS_UNITS_IMPERIAL:
      setSegmentWidthResolution(SEGMENT_WIDTH_RESOLUTION_IMPERIAL)
      setSegmentWidthClickIncrement(SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL)
      setSegmentWidthDraggingResolution(
        SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL)

      document.body.classList.add('units-imperial')
      document.body.classList.remove('units-metric')

      break
    case SETTINGS_UNITS_METRIC:
      setSegmentWidthResolution(SEGMENT_WIDTH_RESOLUTION_METRIC)
      setSegmentWidthClickIncrement(SEGMENT_WIDTH_CLICK_INCREMENT_METRIC)
      setSegmentWidthDraggingResolution(
        SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC)

      document.body.classList.add('units-metric')
      document.body.classList.remove('units-imperial')

      break
  }
}
