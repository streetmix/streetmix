import { segmentsChanged } from '~/src/segments/view'

import {
  setLastStreet,
  prepareDefaultStreet,
  prepareEmptyStreet,
  setIgnoreStreetChanges
} from './data_model'
import { saveStreetToServer } from './xhr'

export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareDefaultStreet()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

// These are deprecated, but we may be able to use them elsewhere
export function onNewStreetDefaultClick () {
  makeDefaultStreet()
}

export function onNewStreetEmptyClick () {
  setIgnoreStreetChanges(true)
  prepareEmptyStreet()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}
