/* global _resizeStreetWidth, _saveStreetToServer, settings */
/* global _saveSettingsLocally, _fetchLastStreet */
/* global ignoreStreetChanges */ // eslint-disable-line no-unused-vars

import { shareMenu } from '../menus/_share'
import { segmentsChanged } from '../segments/view'
import {
  setLastStreet,
  getStreet,
  createDomFromData,
  setUpdateTimeToNow,
  trimStreetData,
  prepareDefaultStreet,
  prepareEmptyStreet
} from './data_model'
import { updateStreetName } from './name'

export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  ignoreStreetChanges = true // eslint-disable-line no-native-reassign
  prepareDefaultStreet()
  setUpdateTimeToNow()

  _resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false // eslint-disable-line no-native-reassign
  setLastStreet(trimStreetData(getStreet()))

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
  prepareEmptyStreet()

  _resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false // eslint-disable-line no-native-reassign
  setLastStreet(trimStreetData(getStreet()))

  _saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  _fetchLastStreet()
}
