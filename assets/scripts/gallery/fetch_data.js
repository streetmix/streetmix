import { API_URL } from '../app/config'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { getAuthHeader } from '../users/authentication'
import { receiveGalleryData, hideGallery } from './view'

// Redux
import store from '../store'
import { setGalleryMode } from '../store/actions/gallery'

export function fetchGalleryData () {
  const galleryUserId = store.getState().gallery.userId

  if (galleryUserId) {
    const url = API_URL + 'v1/users/' + galleryUserId + '/streets'
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
      .then(receiveGalleryData)
      .catch(errorReceiveGalleryData)
  } else {
    const url = API_URL + 'v1/streets?count=200'

    window.fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw response
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
    store.dispatch(setGalleryMode('ERROR'))
  }
}
