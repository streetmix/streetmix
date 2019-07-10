import { segmentsChanged } from '../segments/view'
import { setSettings } from '../users/settings'
import {
  setLastStreet,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { saveStreetToServer } from './xhr'

export const NEW_STREET_DEFAULT = 1
export const NEW_STREET_EMPTY = 2

export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareDefaultStreet()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

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
  setLastStreet()

  saveStreetToServer(false)
}
