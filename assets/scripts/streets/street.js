import store from '../store'
import { getStreet, saveStreetToServerIfNecessary } from './data_model'
import { buildingHeightUpdated } from '../segments/buildings'
import { updateStreetName } from './name'

let oldLeftBuildingHeight
let oldRightBuildingHeight
let oldStreetName
let oldStreetLocation

// transition: when state changes, update legacy street object.
// todo: remove when no longer needed
export function initStreetReduxTransitionSubscriber () {
  store.subscribe(() => {
    const state = store.getState().street
    const street = getStreet()
    updateIfBuildingsChanged(state, street)
    updateIfStreetNameChanged(state, street)
    updateIfLocationChanged(state, street)
  })
}

function updateIfBuildingsChanged (state, street) {
  let changed = false
  if (state.leftBuildingHeight !== oldLeftBuildingHeight) {
    street.leftBuildingHeight = state.leftBuildingHeight
    oldLeftBuildingHeight = state.leftBuildingHeight
    changed = true
  }
  if (state.rightBuildingHeight !== oldRightBuildingHeight) {
    street.rightBuildingHeight = state.rightBuildingHeight
    oldRightBuildingHeight = state.rightBuildingHeight
    changed = true
  }
  if (changed) {
    buildingHeightUpdated()
  }
}

function updateIfStreetNameChanged (state, street) {
  if (state.name !== oldStreetName) {
    street.name = state.name
    street.userUpdated = state.userUpdated
    oldStreetName = state.name
    saveStreetToServerIfNecessary()
    updateStreetName()
  }
}

function updateIfLocationChanged (state, street) {
  if (state.location && state.location.wofId !== oldStreetLocation) {
    street.location = state.location
    oldStreetLocation = state.location.wofId
    saveStreetToServerIfNecessary()
  }
}
