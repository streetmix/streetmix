import { observeStore } from '../store'
import { saveStreetToServerIfNecessary } from './data_model'

/**
 * Initializes a subscriber to changes in the street name,
 * and updates various parts of the UI in response.
 */
export function initStreetDataChangedListener () {
  // We create a string representation of the values we need to compare
  const select = (state) =>
    JSON.stringify({
      leftBuildingHeight: state.street.leftBuildingHeight,
      leftBuildingVariant: state.street.leftBuildingVariant,
      rightBuildingHeight: state.street.rightBuildingHeight,
      rightBuildingVariant: state.street.rightBuildingVariant,
      name: state.street.name,
      location: state.street.location,
      skybox: state.street.skybox
    })

  const onChange = () => {
    saveStreetToServerIfNecessary()
  }

  return observeStore(select, onChange)
}
