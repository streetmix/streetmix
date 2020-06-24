import { showBlockingShield, hideBlockingShield } from '../app/blocking_shield'
import { API_URL } from '../app/config'
import { showError, ERRORS } from '../app/errors'
import { setLastStreet, setIgnoreStreetChanges } from '../streets/data_model'
import { unpackServerStreetData } from '../streets/xhr'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { segmentsChanged } from '../segments/view'
import store from '../store'
import { resetMapState } from '../store/slices/map'
import { hideError } from '../store/slices/errors'

let lastRequestedStreetId = null

export function fetchGalleryStreet (streetId) {
  showBlockingShield()

  lastRequestedStreetId = streetId

  const url = API_URL + 'v1/streets/' + streetId

  window
    .fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw response
      }
      return response.json()
    })
    .then(function (data) {
      hideBlockingShield()
      return data
    })
    .then(receiveGalleryStreet)
    .catch(errorReceiveGalleryStreet)
}

function errorReceiveGalleryStreet (err) {
  console.log(err)
  showError(ERRORS.GALLERY_STREET_FAILURE, false)
  // updateGallerySelection()
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
