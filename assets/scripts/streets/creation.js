import { segmentsChanged } from '../segments/view'
import { setSettings } from '../users/settings'
import {
  setLastStreet,
  getStreet,
  createDomFromData,
  setUpdateTimeToNow,
  trimStreetData,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { updateStreetName } from './name'
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

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(getStreet()))

  saveStreetToServer(false)
}

export function onNewStreetDefaultClick () {
  setSettings({
    newStreetPreference: NEW_STREET_DEFAULT
  })

  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  setSettings({
    newStreetPreference: NEW_STREET_EMPTY
  })

  setIgnoreStreetChanges(true)
  prepareEmptyStreet()

  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(getStreet()))

  saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  fetchLastStreet()
}
