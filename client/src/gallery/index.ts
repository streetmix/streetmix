import { hideBlockingShield, showBlockingShield } from '../app/blocking_shield'
import { ERRORS, showError } from '../app/errors'
import { getMode, MODES, processMode, setMode } from '../app/mode'
import { segmentsChanged } from '../segments/view'
import store from '../store'
import { hideError } from '../store/slices/errors'
import { resetMapState } from '../store/slices/map'
import { setIgnoreStreetChanges, setLastStreet } from '../streets/data_model'
import { SAVE_THUMBNAIL_EVENTS, saveStreetThumbnail } from '../streets/image'
import { unpackServerStreetData } from '../streets/xhr'
import {
  getGalleryForAllStreets,
  getGalleryForUser,
  getStreet,
} from '../util/api'

import type { Street } from '@streetmix/types'

let lastRequestedStreetId: string | null = null

export function switchGalleryStreet(id: string) {
  // Save previous street's thumbnail before switching streets.
  saveStreetThumbnail(
    store.getState().street,
    SAVE_THUMBNAIL_EVENTS.PREVIOUS_STREET
  )

  fetchGalleryStreet(id)
}

function fetchGalleryStreet(streetId: string) {
  showBlockingShield()

  lastRequestedStreetId = streetId

  getStreet(streetId)
    .then((response): Street => {
      hideBlockingShield()
      return response.data
    })
    .then(receiveGalleryStreet)
    .catch(errorReceiveGalleryStreet)
}

// TODO similar to receiveLastStreet
function receiveGalleryStreet(transmission: Street) {
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

function errorReceiveGalleryStreet(err: unknown) {
  console.log(err)
  showError(ERRORS.GALLERY_STREET_FAILURE, false)
  // updateGallerySelection()
}

export async function fetchGalleryData(userId: string) {
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
    if (error.response?.status === 404) {
      setMode(MODES.NOT_FOUND)
      processMode()
    }

    // Re-throw the original error. This is caught by Redux Toolkit's
    // `asyncThunkCreator` and dispatches a rejected action
    throw error
  }
}

function receiveGalleryData(transmission: { streets: Street[] }) {
  // There is a bug where sometimes street data is non-existent for an
  // unknown reason. Skip over so that the rest of gallery will display
  const streets = transmission.streets.filter(
    (street) => typeof street.data !== 'undefined'
  )

  if (
    (getMode() === MODES.USER_GALLERY && streets.length) ||
    getMode() === MODES.GLOBAL_GALLERY
  ) {
    switchGalleryStreet(streets[0].id)
  }

  return streets
}
