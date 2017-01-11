import { API_URL } from '../app/config'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { getGalleryUserId } from '../app/page_url'
import { getAuthHeader } from '../users/authentication'
import { receiveGalleryData, hideGallery } from './view'

// Redux
import store from '../store'
import { SET_GALLERY_STATE } from '../store/actions'

export function fetchGalleryData () {
  if (getGalleryUserId()) {
    const url = API_URL + 'v1/users/' + getGalleryUserId() + '/streets'
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
    store.dispatch({
      type: SET_GALLERY_STATE,
      mode: 'ERROR'
    })
  }
}
