import { showBlockingShield, hideBlockingShield } from '../app/blocking_shield'
import { API_URL } from '../app/config'
import { hideError } from '../app/errors'
import {
  setLastStreet,
  getStreet,
  createDomFromData,
  trimStreetData,
  createDataFromDom
} from '../streets/data_model'
import { updateStreetName } from '../streets/name'
import { setIgnoreStreetChanges } from '../streets/undo_stack'
import { unpackServerStreetData } from '../streets/xhr'
import { resizeStreetWidth, recalculateOccupiedWidth } from '../streets/width'
import { getAuthHeader } from '../users/authentication'
import { propagateUnits } from '../users/localization'
import { segmentsChanged } from './view'

let lastRequestedStreetId = null

export function fetchGalleryStreet (streetId) {
  showBlockingShield()

  lastRequestedStreetId = streetId

  const url = API_URL + 'v1/streets/' + streetId
  const options = {
    headers: { 'Authorization': getAuthHeader() }
  }

  window.fetch(url, options)
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

function errorReceiveGalleryStreet () {
  // updateGallerySelection()
}

// TODO similar to receiveLastStreet
function receiveGalleryStreet (transmission) {
  // Reject stale transmissions
  if (transmission.id !== lastRequestedStreetId) {
    return
  }

  setIgnoreStreetChanges(true)

  hideError()
  unpackServerStreetData(transmission, null, null, true)
  propagateUnits()
  recalculateOccupiedWidth()

  // TODO this is stupid, only here to fill some structures
  createDomFromData()
  createDataFromDom()

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new window.CustomEvent('stmx:receive_gallery_street'))

  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(getStreet()))
}
