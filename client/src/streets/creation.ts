import { segmentsChanged } from '~/src/segments/view'

import { setLastStreet, setIgnoreStreetChanges } from './data_model'
import { prepareStreet } from './templates'
import { saveStreetToServer } from './xhr'

// These are deprecated, but we may be able to use them elsewhere
export function makeDefaultStreet (): void {
  setIgnoreStreetChanges(true)
  prepareStreet('default')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

export function onNewStreetEmptyClick (): void {
  setIgnoreStreetChanges(true)
  prepareStreet('empty')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}
