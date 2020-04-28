import { getGalleryForUser, getGalleryForAllStreets } from '../util/api'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { receiveGalleryData } from './view'
import { GALLERY_MODES } from './constants'

// Redux
import store from '../store'
import { closeGallery } from '../store/actions/gallery'
import { setGalleryMode } from '../store/slices/gallery'

export async function fetchGalleryData () {
  const galleryUserId = store.getState().gallery.userId

  try {
    if (galleryUserId) {
      const response = await getGalleryForUser(galleryUserId)
      receiveGalleryData(response.data)
    } else {
      const response = await getGalleryForAllStreets()
      receiveGalleryData(response.data)
    }
  } catch (error) {
    errorReceiveGalleryData(error.response)
  }
}

function errorReceiveGalleryData (data) {
  if (getMode() === MODES.USER_GALLERY && data.status === 404) {
    setMode(MODES.NOT_FOUND)
    processMode()
    store.dispatch(closeGallery(true))
  } else {
    store.dispatch(setGalleryMode(GALLERY_MODES.ERROR))
  }
}
