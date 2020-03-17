import { MODES, getMode } from '../app/mode'
import { updateToLatestSchemaVersion } from '../streets/data_model'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { fetchGalleryData } from './fetch_data'
import { fetchGalleryStreet } from './fetch_street'

// Redux
import store from '../store'
import { setGalleryMode, receiveGalleryStreets } from '../store/actions/gallery'

export function receiveGalleryData (transmission) {
  // Prepare data object
  const streets = []
  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    updateToLatestSchemaVersion(galleryStreet.data.street)

    streets.push(galleryStreet)
  }

  store.dispatch(receiveGalleryStreets(streets))

  if (
    (getMode() === MODES.USER_GALLERY && streets.length) ||
    getMode() === MODES.GLOBAL_GALLERY
  ) {
    switchGalleryStreet(streets[0].id)
  }
}

export function repeatReceiveGalleryData () {
  loadGalleryContents()
}

export function switchGalleryStreet (id) {
  // Save previous street's thumbnail before switching streets.
  saveStreetThumbnail(
    store.getState().street,
    SAVE_THUMBNAIL_EVENTS.PREVIOUS_STREET
  )

  fetchGalleryStreet(id)
}

function loadGalleryContents () {
  store.dispatch(setGalleryMode('LOADING'))
  fetchGalleryData()
}
