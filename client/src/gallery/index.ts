import {
  hideBlockingShield,
  showBlockingShield,
} from '../app/blocking_shield.js'
import { ERRORS, showError } from '../app/errors.js'
import { getMode, MODES, processMode, setMode } from '../app/mode.js'
import store from '../store'
import { segmentsChanged } from '../store/actions/street.js'
import { hideError } from '../store/slices/errors.js'
import { resetMapState } from '../store/slices/map.js'
import { setIgnoreStreetChanges, setLastStreet } from '../streets/data_model.js'
import { SAVE_THUMBNAIL_EVENTS, saveStreetThumbnail } from '../streets/image.js'
import { unpackServerStreetData } from '../streets/xhr.js'
import {
  getGalleryForAllStreets,
  getGalleryForUser,
  getStreet,
} from '../util/api.js'

import type { StreetAPIResponse } from '@streetmix/types'

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
    .then((response): StreetAPIResponse => {
      hideBlockingShield()
      return response.data
    })
    .then(receiveGalleryStreet)
    .catch(errorReceiveGalleryStreet)
}

// TODO similar to receiveLastStreet
function receiveGalleryStreet(transmission: StreetAPIResponse) {
  // Reject stale transmissions
  if (transmission.id !== lastRequestedStreetId) {
    return
  }

  setIgnoreStreetChanges(true)

  store.dispatch(hideError())
  unpackServerStreetData(transmission, null, null, true)

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new window.CustomEvent('stmx:receive_gallery_street'))

  store.dispatch(segmentsChanged())

  setIgnoreStreetChanges(false)
  setLastStreet()

  // Save new street's thumbnail.
  saveStreetThumbnail(store.getState().street, SAVE_THUMBNAIL_EVENTS.INITIAL)

  store.dispatch(resetMapState())
}

function errorReceiveGalleryStreet(err: unknown) {
  console.log(err)
  showError(ERRORS.GALLERY_STREET_FAILURE, false)
}

export async function fetchGalleryData(userId: string, page: number) {
  try {
    const data = await fetchGalleryPageData(userId, page)

    if (
      data.streets.length &&
      (getMode() === MODES.USER_GALLERY || getMode() === MODES.GLOBAL_GALLERY)
    ) {
      switchGalleryStreet(data.streets[0].id)
    }

    return data
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

export async function fetchGalleryPageData(userId: string, page: number) {
  if (userId) {
    const response = await getGalleryForUser(userId, page)
    return response.data
  } else {
    const response = await getGalleryForAllStreets(page)
    return response.data
  }
}
