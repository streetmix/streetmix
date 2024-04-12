import { segmentsChanged } from '../segments/view'
import store from '../store'
import { updateSettings } from '../store/slices/settings'
import {
  setLastStreet,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from './constants'
import { saveStreetToServer } from './xhr'

export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareDefaultStreet()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

export function onNewStreetDefaultClick () {
  store.dispatch(
    updateSettings({
      newStreetPreference: NEW_STREET_DEFAULT
    })
  )

  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  store.dispatch(
    updateSettings({
      newStreetPreference: NEW_STREET_EMPTY
    })
  )

  setIgnoreStreetChanges(true)
  prepareEmptyStreet()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}
