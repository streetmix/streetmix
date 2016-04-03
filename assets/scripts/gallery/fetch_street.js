import { showBlockingShield, hideBlockingShield } from '../app/blocking_shield'
import { galleryState, updateGallerySelection } from './view'
import { shareMenu } from '../menus/_share'

export function fetchGalleryStreet (streetId) {
  showBlockingShield()

  const url = API_URL + 'v1/streets/' + streetId
  const options = {
    headers: { 'Authorization': _getAuthHeader() }
  }

  window.fetch(url, options)
    .then(function (response) {
      if (response.status < 200 || response.status >= 400) {
        throw new Error(response)
      }
      return response.json()
    })
    .then(function (data) {
      hideBlockingShield()
      galleryState.loaded = true
      return data
    })
    .then(receiveGalleryStreet)
    .catch(errorReceiveGalleryStreet)
}

function errorReceiveGalleryStreet () {
  galleryState.streetId = street.id
  updateGallerySelection()
}

// TODO similar to receiveLastStreet
function receiveGalleryStreet (transmission) {
  // Is this necessary?
  if (transmission.id !== galleryState.streetId) {
    return
  }

  ignoreStreetChanges = true

  _hideError()
  _unpackServerStreetData(transmission, null, null, true)
  _propagateUnits()
  _recalculateOccupiedWidth()

  // TODO this is stupid, only here to fill some structures
  _createDomFromData()
  _createDataFromDom()

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new CustomEvent('stmx:receive_gallery_street'))

  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)
}
