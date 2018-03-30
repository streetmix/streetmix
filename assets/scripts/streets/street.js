import store from '../store'
import { saveStreetToServerIfNecessary } from './data_model'
import { updateStreetName } from './name'

const street = store.getState().street
let oldStreetName = street.name
let oldStreetLocation = (street.location) ? street.location.wofId : null
let oldLeftBuildingHeight = street.leftBuildingHeight
let oldRightBuildingHeight = street.rightBuildingHeight

export function initStreetReduxTransitionSubscriber () {
  store.subscribe(() => {
    const state = store.getState().street
    updateIfBuildingsChanged(state)
    updateIfStreetNameChanged(state)
    updateIfLocationChanged(state)
  })
}

function updateIfBuildingsChanged (state) {
  let changed = false
  if (state.leftBuildingHeight !== oldLeftBuildingHeight) {
    oldLeftBuildingHeight = state.leftBuildingHeight
    changed = true
  }
  if (state.rightBuildingHeight !== oldRightBuildingHeight) {
    oldRightBuildingHeight = state.rightBuildingHeight
    changed = true
  }
  if (changed) {
    saveStreetToServerIfNecessary()
  }
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
