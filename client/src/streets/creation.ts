import { segmentsChanged } from '~/src/segments/view'

import { setLastStreet, setIgnoreStreetChanges } from './data_model'
import { prepareStreet } from './templates'
import { saveStreetToServer } from './xhr'

// These are deprecated, but we may be able to use them elsewhere
export async function makeDefaultStreet(): Promise<void> {
  setIgnoreStreetChanges(true)
  await prepareStreet('default')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

export async function onNewStreetEmptyClick(): Promise<void> {
  setIgnoreStreetChanges(true)
  await prepareStreet('empty')

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}
