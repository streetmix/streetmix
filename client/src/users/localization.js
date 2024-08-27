import clone from 'just-clone'
import { debug } from '../preinit/debug_settings'
import { normalizeAllSegmentWidths } from '../segments/resizing'
import { segmentsChanged } from '../segments/view'
import {
  saveStreetToServerIfNecessary,
  setIgnoreStreetChanges
} from '../streets/data_model'
import { getUndoStack, getUndoPosition } from '../streets/undo_stack'
import { normalizeStreetWidth } from '../streets/width'
import store from '../store'
import {
  setUnits,
  updateStreetWidth,
  updateStreetData,
  updateSegments
} from '../store/slices/street'
import { setUserUnits } from '../store/slices/settings'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from './constants'

const COUNTRIES_IMPERIAL_UNITS = ['US']

let leftHandTraffic = false

export function getLeftHandTraffic () {
  return leftHandTraffic
}
const COUNTRIES_LEFT_HAND_TRAFFIC = [
  'AI',
  'AG',
  'AU',
  'BS',
  'BD',
  'BB',
  'BM',
  'BT',
  'BW',
  'BN',
  'KY',
  'CX',
  'CC',
  'CK',
  'CY',
  'DM',
  'TL',
  'FK',
  'FJ',
  'GD',
  'GG',
  'GY',
  'HK',
  'IN',
  'ID',
  'IE',
  'IM',
  'JM',
  'JP',
  'JE',
  'KE',
  'KI',
  'LS',
  'MO',
  'MW',
  'MY',
  'MV',
  'MT',
  'MU',
  'MS',
  'MZ',
  'NA',
  'NR',
  'NP',
  'NZ',
  'NU',
  'NF',
  'PK',
  'PG',
  'PN',
  'SH',
  'KN',
  'LC',
  'VC',
  'WS',
  'SC',
  'SG',
  'SB',
  'ZA',
  'LK',
  'SR',
  'SZ',
  'TZ',
  'TH',
  'TK',
  'TO',
  'TT',
  'TC',
  'TV',
  'UG',
  'GB',
  'VG',
  'VI',
  'ZM',
  'ZW'
]

export function updateSettingsFromCountryCode (countryCode) {
  if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(countryCode) !== -1) {
    leftHandTraffic = true
  }

  if (debug.forceLeftHandTraffic) {
    leftHandTraffic = true
  }

  updateUnitSettings(countryCode)
}

export function updateUnitSettings (countryCode) {
  const localStorageUnits = store.getState().settings.units
  let unitType

  if (localStorageUnits) {
    unitType = localStorageUnits
  } else if (COUNTRIES_IMPERIAL_UNITS.indexOf(countryCode) !== -1) {
    unitType = SETTINGS_UNITS_IMPERIAL
  } else {
    unitType = SETTINGS_UNITS_METRIC
  }

  store.dispatch(setUserUnits(unitType))
}

// Only changes the units of the street, not the user.
export function updateUnits (newUnits) {
  let fromUndo
  const street = store.getState().street
  if (street.units === newUnits) {
    return
  }

  store.dispatch(setUnits(newUnits))

  // If the user converts and then straight converts back, we just reach
  // to undo stack instead of double conversion (which could be lossy).
  const undoStack = getUndoStack()
  const undoPosition = getUndoPosition()
  if (
    undoStack[undoPosition - 1] &&
    undoStack[undoPosition - 1].units === newUnits
  ) {
    fromUndo = true
  } else {
    fromUndo = false
  }

  setIgnoreStreetChanges(true)
  if (!fromUndo) {
    const segments = normalizeAllSegmentWidths(street.segments, street.units)
    store.dispatch(updateSegments(segments))

    if (street.remainingWidth === 0) {
      let width = 0
      for (const i in street.segments) {
        width += street.segments[i].width
      }
      store.dispatch(updateStreetWidth(width))
    } else {
      store.dispatch(
        updateStreetWidth(normalizeStreetWidth(street.width, newUnits))
      )
    }
  } else {
    store.dispatch(updateStreetData(clone(undoStack[undoPosition - 1])))
  }
  segmentsChanged()

  setIgnoreStreetChanges(false)

  saveStreetToServerIfNecessary()
}
