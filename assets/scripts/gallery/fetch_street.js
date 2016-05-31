/* global street, API_URL, _getAuthHeader */
/* global _unpackServerStreetData, _propagateUnits, _recalculateOccupiedWidth,
      _createDomFromData, _createDataFromDom, _resizeStreetWidth,
      _segmentsChanged, _trimStreetData */
/* global CustomEvent */
/* global ignoreStreetChanges, lastStreet */ // eslint-disable-line no-unused-vars
import { showBlockingShield, hideBlockingShield } from '../app/blocking_shield'
import { hideError } from '../app/errors'
import { shareMenu } from '../menus/_share'
import { updateStreetName } from '../streets/name'
import { galleryState, updateGallerySelection } from './view'

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

  ignoreStreetChanges = true // eslint-disable-line no-native-reassign

  hideError()
  _unpackServerStreetData(transmission, null, null, true)
  _propagateUnits()
  _recalculateOccupiedWidth()

  // TODO this is stupid, only here to fill some structures
  _createDomFromData()
  _createDataFromDom()

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new CustomEvent('stmx:receive_gallery_street'))

  _resizeStreetWidth()
  updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false // eslint-disable-line no-native-reassign
  lastStreet = _trimStreetData(street) // eslint-disable-line no-native-reassign
}
