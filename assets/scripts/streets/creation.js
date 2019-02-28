import { segmentsChanged } from '../segments/view'
import { setSettings } from '../users/settings'
import {
  setLastStreet,
  setUpdateTimeToNow,
  trimStreetData,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { saveStreetToServer, fetchLastStreet } from './xhr'
import store from '../store'

export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareDefaultStreet()
  setUpdateTimeToNow()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(store.getState().street))

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

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(store.getState().street))

  saveStreetToServer(false)
}

export function onNewStreetLastClick () {
  fetchLastStreet()
}
