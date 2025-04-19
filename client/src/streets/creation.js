import { segmentsChanged } from '~/src/segments/view'

import {
  setLastStreet,
  prepareStreet,
  setIgnoreStreetChanges
} from './data_model'
import { saveStreetToServer } from './xhr'

// These are deprecated, but we may be able to use them elsewhere
export function makeDefaultStreet () {
  setIgnoreStreetChanges(true)
  prepareStreet('default')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

export function onNewStreetEmptyClick () {
  setIgnoreStreetChanges(true)
  prepareStreet('empty')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}
