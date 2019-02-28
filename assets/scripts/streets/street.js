import store from '../store'
import { saveStreetToServerIfNecessary } from './data_model'

const street = store.getState().street
let oldStreetName = street.name
let oldStreetLocation = (street.location) ? street.location.wofId : null
let oldLeftBuildingHeight = street.leftBuildingHeight
let oldRightBuildingHeight = street.rightBuildingHeight
let oldLeftBuildingVariant = street.leftBuildingVariant
let oldRightBuildingVariant = street.rightBuildingVariant

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
  // Checking building heights
  if (state.leftBuildingHeight !== oldLeftBuildingHeight) {
    oldLeftBuildingHeight = state.leftBuildingHeight
    changed = true
  }
  if (state.rightBuildingHeight !== oldRightBuildingHeight) {
    oldRightBuildingHeight = state.rightBuildingHeight
    changed = true
  }

  // Checking building variants
  if (state.leftBuildingVariant !== oldLeftBuildingVariant) {
    oldLeftBuildingVariant = state.leftBuildingVariant
    changed = true
  }
  if (state.rightBuildingVariant !== oldRightBuildingVariant) {
    oldRightBuildingVariant = state.rightBuildingVariant
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
