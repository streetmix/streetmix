import { observeStore, type RootState } from '../store'
import { saveStreetToServerIfNecessary } from './data_model.js'

/**
 * Initializes a subscriber to changes in the street name,
 * and updates various parts of the UI in response.
 */
export function initStreetDataChangedListener() {
  // We create a string representation of the values we need to compare
  const select = (state: RootState) =>
    JSON.stringify({
      boundary: state.street.boundary,
      name: state.street.name,
      location: state.street.location,
      skybox: state.street.skybox,
      weather: state.street.weather,
    })

  const onChange = () => {
    saveStreetToServerIfNecessary()
  }

  return observeStore(select, onChange)
}
