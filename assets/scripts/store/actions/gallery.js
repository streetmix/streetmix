import {
  showGallery as show,
  hideGallery as hide,
  setGalleryMode
} from '../slices/gallery'
import { hideControls } from '../../segments/resizing'
import { fetchGalleryData } from '../../gallery/fetch_data'
import { GALLERY_MODES } from '../../gallery/constants'
import { updatePageUrl } from '../../app/page_url'
import { showError, ERRORS } from '../../app/errors'
import { MODES, getMode, setMode } from '../../app/mode'
import { onWindowFocus } from '../../app/focus'

// TODO: Convert these to use createAsyncThunk from @redux/toolkit
// That way we can take advantage of the bog-standard `pending`
// `fulfilled` and `rejected` lifecycle actions. This will also
// require refactoring `fetchGalleryData` to return a promise we
// can work with.
// These will also need to be tested.

export function showGallery (userId, instant = false) {
  return (dispatch) => {
    dispatch(show(userId))
    hideControls()

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

    dispatch(setGalleryMode(GALLERY_MODES.LOADING))
    fetchGalleryData()
    updatePageUrl(true)
  }
}

export function hideGallery (instant = false) {
  return (dispatch, getState) => {
    const state = getState()
    if (state.gallery.visible) {
      dispatch(hide())

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
