import { MODES, getMode } from '../app/mode'
import { updateToLatestSchemaVersion } from '../streets/data_model'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { fetchGalleryStreet } from './fetch_street'
import store from '../store'

export function receiveGalleryData (transmission) {
  // Prepare data object
  const streets = transmission.streets.map((street) => {
    // There is a bug where sometimes street data is non-existent for an
    // unknown reason. Skip over so that the rest of gallery will display
    if (!street.data) return {}

    // This mutates street data in place (not preferred; TODO: fix later)
    updateToLatestSchemaVersion(street.data.street)

    return street
  })

  if (
    (getMode() === MODES.USER_GALLERY && streets.length) ||
    getMode() === MODES.GLOBAL_GALLERY
  ) {
    switchGalleryStreet(streets[0].id)
  }

  return streets
}

export function switchGalleryStreet (id) {
  // Save previous street's thumbnail before switching streets.
  saveStreetThumbnail(
    store.getState().street,
    SAVE_THUMBNAIL_EVENTS.PREVIOUS_STREET
  )

  fetchGalleryStreet(id)
}
