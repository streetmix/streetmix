import { showBlockingShield, hideBlockingShield } from '../app/blocking_shield'
import { showError, ERRORS } from '../app/errors'
import { MODES, processMode, setMode, getMode } from '../app/mode'
import { segmentsChanged } from '../segments/view'
import { setLastStreet, setIgnoreStreetChanges } from '../streets/data_model'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { unpackServerStreetData } from '../streets/xhr'
import store from '../store'
import { resetMapState } from '../store/slices/map'
import { hideError } from '../store/slices/errors'
import {
  getStreet,
  getGalleryForUser,
  getGalleryForAllStreets
} from '../util/api'

let lastRequestedStreetId = null

export function switchGalleryStreet (id) {
  // Save previous street's thumbnail before switching streets.
  saveStreetThumbnail(
    store.getState().street,
    SAVE_THUMBNAIL_EVENTS.PREVIOUS_STREET
  )

  fetchGalleryStreet(id)
}

function fetchGalleryStreet (streetId) {
  showBlockingShield()

  lastRequestedStreetId = streetId

  getStreet(streetId)
    .then((response) => {
      hideBlockingShield()
      return response.data
    })
    .then(receiveGalleryStreet)
    .catch(errorReceiveGalleryStreet)
}

// TODO similar to receiveLastStreet
function receiveGalleryStreet (transmission) {
  // Reject stale transmissions
  if (transmission.id !== lastRequestedStreetId) {
    return
  }

  setIgnoreStreetChanges(true)

  store.dispatch(hideError())
  unpackServerStreetData(transmission, null, null, true)

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new window.CustomEvent('stmx:receive_gallery_street'))

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  // Save new street's thumbnail.
  saveStreetThumbnail(store.getState().street, SAVE_THUMBNAIL_EVENTS.INITIAL)

  store.dispatch(resetMapState())
}

function errorReceiveGalleryStreet (err) {
  console.log(err)
  showError(ERRORS.GALLERY_STREET_FAILURE, false)
  // updateGallerySelection()
}

export async function fetchGalleryData (userId) {
  try {
    if (userId) {
      const response = await getGalleryForUser(userId)
      const streets = receiveGalleryData(response.data)

      return streets
    } else {
      const response = await getGalleryForAllStreets()
      const streets = receiveGalleryData(response.data)

      return streets
    }
  } catch (error) {
    // If the error is a 404, throw up a not-found page
    if (error.response.status === 404) {
      setMode(MODES.NOT_FOUND)
      processMode()
    }

    // Re-throw the original error. This is caught by Redux Toolkit's
    // `asyncThunkCreator` and dispatches a rejected action
    throw error
  }
}

function receiveGalleryData (transmission) {
  // Prepare data object
  const streets = transmission.streets.map((street) => {
    // There is a bug where sometimes street data is non-existent for an
    // unknown reason. Skip over so that the rest of gallery will display
    if (!street.data) return {}

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
