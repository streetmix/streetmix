import { segmentsChanged } from '../segments/view'
import {
  setLastStreet,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from './constants'
import { saveStreetToServer } from './xhr'
import store from '../store'
import { setSettings } from '../store/actions/settings'

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
    setSettings({
      newStreetPreference: NEW_STREET_DEFAULT
    })
  )

  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  store.dispatch(
    setSettings({
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
