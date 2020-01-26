import {
  SHOW_GALLERY,
  HIDE_GALLERY,
  RECEIVE_GALLERY_STREETS,
  DELETE_GALLERY_STREET,
  SET_GALLERY_STATE
} from '../actions'
import { hideStatusMessage } from './status'
import { hideControls } from '../../segments/resizing'
import { fetchGalleryData } from '../../gallery/fetch_data'
import { updatePageUrl } from '../../app/page_url'
import { showError, ERRORS } from '../../app/errors'
import { MODES, getMode, setMode } from '../../app/mode'
import { onWindowFocus } from '../../app/focus'

function showGalleryAction (userId) {
  return {
    type: SHOW_GALLERY,
    userId
  }
}

export function showGallery (userId, instant = false) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(showGalleryAction(userId))
    hideControls()

    if (state.status.showMessage) {
      dispatch(hideStatusMessage())
    }

    // TODO: Handle transition inside Gallery component.
    if (instant) {
      document.body.classList.add('gallery-no-move-transition')
    }
    document.body.classList.add('gallery-visible')

    if (instant) {
      window.setTimeout(function () {
        document.body.classList.remove('gallery-no-move-transition')
      }, 0)
    }

    // TODO: Handle modes better.
    if (
      getMode() === MODES.USER_GALLERY ||
      getMode() === MODES.GLOBAL_GALLERY
    ) {
      // Prevents showing old street before the proper street loads
      showError(ERRORS.NO_STREET, false)
    }

    dispatch(setGalleryMode('LOADING'))
    fetchGalleryData()
    updatePageUrl(true)
  }
}

function hideGalleryAction () {
  return { type: HIDE_GALLERY }
}

export function hideGallery (instant = false) {
  return (dispatch, getState) => {
    const state = getState()
    if (state.gallery.visible) {
      dispatch(hideGalleryAction())

      if (instant) {
        document.body.classList.add('gallery-no-move-transition')
      }
      document.body.classList.remove('gallery-visible')

      if (instant) {
        window.setTimeout(function () {
          document.body.classList.remove('gallery-no-move-transition')
        }, 0)
      }

      onWindowFocus()

      if (!state.errors.abortEverything) {
        updatePageUrl()
      }

      setMode(MODES.CONTINUE)
    }
  }
}

export function receiveGalleryStreets (streets) {
  return {
    type: RECEIVE_GALLERY_STREETS,
    streets
  }
}

export function deleteGalleryStreet (streetId) {
  return {
    type: DELETE_GALLERY_STREET,
    id: streetId
  }
}

export function setGalleryMode (mode) {
  return {
    type: SET_GALLERY_STATE,
    mode
  }
}

export function setGalleryUserId (userId) {
  return {
    type: SET_GALLERY_STATE,
    userId
  }
}
