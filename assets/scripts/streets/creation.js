/* global settings, _saveSettingsLocally */

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
import { setIgnoreStreetChanges } from './undo_stack'
import { resizeStreetWidth } from './width'
import { saveStreetToServer, fetchLastStreet } from './xhr'

export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareDefaultStreet()
  setUpdateTimeToNow()

  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()
  shareMenu.update()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(getStreet()))

  saveStreetToServer(false)
}

export function onNewStreetDefaultClick () {
  settings.newStreetPreference = NEW_STREET_DEFAULT
  _saveSettingsLocally()

  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  settings.newStreetPreference = NEW_STREET_EMPTY
  _saveSettingsLocally()

  setIgnoreStreetChanges(true)
  prepareEmptyStreet()

  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()
  shareMenu.update()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(getStreet()))

  saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  fetchLastStreet()
}
