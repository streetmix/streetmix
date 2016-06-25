/* global API_URL */

import { MODES, processMode, getMode, setMode } from '../app/mode'
import { getGalleryUserId } from '../app/page_url'
import { getAuthHeader } from '../users/authentication'
import { receiveGalleryData, hideGallery } from './view'

export function fetchGalleryData () {
  if (getGalleryUserId()) {
    const url = API_URL + 'v1/users/' + getGalleryUserId() + '/streets'
    const options = {
      headers: { 'Authorization': getAuthHeader() }
    }

    window.fetch(url, options)
      .then(function (response) {
        if (response.status < 200 || response.status >= 400) {
          throw new Error(response)
        }
        return response.json()
      })
      .then(receiveGalleryData)
      .catch(errorReceiveGalleryData)
  } else {
    const url = API_URL + 'v1/streets?count=200'

    window.fetch(url)
      .then(function (response) {
        if (response.status < 200 || response.status >= 400) {
          throw new Error(response)
        }
        return response.json()
      })
      .then(receiveGalleryData)
      .catch(errorReceiveGalleryData)
  }
}

function errorReceiveGalleryData (data) {
  if ((getMode() === MODES.USER_GALLERY) && (data.status === 404)) {
    setMode(MODES.NOT_FOUND)
    processMode()
    hideGallery(true)
  } else {
    document.querySelector('#gallery .loading').classList.remove('visible')
    document.querySelector('#gallery .error-loading').classList.add('visible')
  }
}
