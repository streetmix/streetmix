/* global ignoreStreetChanges, _prepareDefaultStreet, _setUpdateTimeToNow */
/* global _resizeStreetWidth, _createDomFromData, _segmentsChanged */
/* global lastStreet, street, _saveStreetToServer, settings */
/* global _saveSettingsLocally, _prepareEmptyStreet, _fetchLastStreet */

import { shareMenu } from '../menus/_share'
import { updateStreetName } from './name'


export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  ignoreStreetChanges = true
  _prepareDefaultStreet()
  _setUpdateTimeToNow()

  _resizeStreetWidth()
  updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)

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

  ignoreStreetChanges = true
  _prepareEmptyStreet()

  _resizeStreetWidth()
  updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)

  _saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  _fetchLastStreet()
}
