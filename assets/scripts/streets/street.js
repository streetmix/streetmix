import store from '../store'
import { saveStreetToServerIfNecessary } from './data_model'
import { updateStreetName } from './name'

const street = store.getState().street
let oldStreetName = street.name
let oldStreetLocation = (street.location) ? street.location.wofId : null

export function initStreetReduxTransitionSubscriber () {
  store.subscribe(() => {
    const state = store.getState().street
    updateIfStreetNameChanged(state)
    updateIfLocationChanged(state)
  })
}

function updateIfStreetNameChanged (state) {
  if (state.name !== oldStreetName) {
    oldStreetName = state.name
    saveStreetToServerIfNecessary()
    updateStreetName(state)
  }
}

function updateIfLocationChanged (state) {
  let changed = false
  if (state.location && state.location.wofId !== oldStreetLocation) {
    oldStreetLocation = state.location.wofId
    changed = true
  }
  // If location was cleared
  if (oldStreetLocation && !state.location) {
    street.location = null
    oldStreetLocation = null
    changed = true
  }
  if (changed) {
    saveStreetToServerIfNecessary()
  }
}
