/* global _trimStreetData, _prepareDefaultStreet, _setUpdateTimeToNow */
/* global _resizeStreetWidth, _createDomFromData */
/* global street, _saveStreetToServer, settings */
/* global _saveSettingsLocally, _prepareEmptyStreet, _fetchLastStreet */
/* global ignoreStreetChanges, lastStreet */ // eslint-disable-line no-unused-vars

import { shareMenu } from '../menus/_share'
import { segmentsChanged } from '../segments/view'
import { updateStreetName } from './name'

export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  ignoreStreetChanges = true // eslint-disable-line no-native-reassign
  _prepareDefaultStreet()
  _setUpdateTimeToNow()

  _resizeStreetWidth()
  updateStreetName()
  _createDomFromData()
  segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false // eslint-disable-line no-native-reassign
  lastStreet = _trimStreetData(street) // eslint-disable-line no-native-reassign

  _saveStreetToServer(false)
}

export function onNewStreetDefaultClick () {
  settings.newStreetPreference = NEW_STREET_DEFAULT
  _saveSettingsLocally()

  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  settings.newStreetPreference = NEW_STREET_EMPTY
  _saveSettingsLocally()

  ignoreStreetChanges = true // eslint-disable-line no-native-reassign
  _prepareEmptyStreet()

  _resizeStreetWidth()
  updateStreetName()
  _createDomFromData()
  segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false // eslint-disable-line no-native-reassign
  lastStreet = _trimStreetData(street) // eslint-disable-line no-native-reassign

  _saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  _fetchLastStreet()
}
