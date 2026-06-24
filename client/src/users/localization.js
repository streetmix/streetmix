import { debug } from '../preinit/debug_settings'
import { saveStreetToServerIfNecessary } from '../streets/data_model'
import store from '../store'
import { setUnits } from '../store/slices/street'
import { setUserUnits } from '../store/slices/settings'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from './constants'

const COUNTRIES_IMPERIAL_UNITS = ['US']

let leftHandTraffic = false

export function getLeftHandTraffic() {
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
  'ZW',
]

export function updateSettingsFromCountryCode(countryCode) {
  if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(countryCode) !== -1) {
    leftHandTraffic = true
  }

  if (debug.forceLeftHandTraffic) {
    leftHandTraffic = true
  }

  updateUnitSettings(countryCode)
}

export function updateUnitSettings(countryCode) {
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
export function updateUnits(newUnits) {
  const street = store.getState().street
  if (street.units === newUnits) {
    return
  }

  store.dispatch(setUnits(newUnits))

  saveStreetToServerIfNecessary()
}
