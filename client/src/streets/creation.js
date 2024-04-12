import store from '~/src/store'
import { updateSettings } from '~/src/store/slices/settings'
import { segmentsChanged } from '~/src/segments/view'

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
