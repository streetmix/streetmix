/* global MODES, mode, _processMode */
/* global API_URL, _getAuthHeader */
/* global galleryUserId */
import { receiveGalleryData, hideGallery } from './view'

export function fetchGalleryData () {
  if (galleryUserId) {
    const url = API_URL + 'v1/users/' + galleryUserId + '/streets'
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
  if ((mode === MODES.USER_GALLERY) && (data.status === 404)) {
    mode = MODES.NOT_FOUND
    _processMode()
    hideGallery(true)
  } else {
    document.querySelector('#gallery .loading').classList.remove('visible')
    document.querySelector('#gallery .error-loading').classList.add('visible')
  }
}
