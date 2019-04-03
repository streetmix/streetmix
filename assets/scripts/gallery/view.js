import { trackEvent } from '../app/event_tracking'
import { showError, ERRORS } from '../app/errors'
import { onWindowFocus } from '../app/focus'
import { MODES, getMode, setMode } from '../app/mode'
import { updatePageUrl } from '../app/page_url'
import { hideStatusMessage } from '../app/status_message'
import { app } from '../preinit/app_settings'
import { hideControls } from '../segments/resizing'
import { updateToLatestSchemaVersion } from '../streets/data_model'
import { saveStreetThumbnail, SAVE_THUMBNAIL_EVENTS } from '../streets/image'
import { fetchGalleryData } from './fetch_data'
import { fetchGalleryStreet } from './fetch_street'

// Redux
import store from '../store'
import {
  setGalleryMode,
  receiveGalleryStreets,
  showGallery as showGalleryAction,
  hideGallery as hideGalleryAction
} from '../store/actions/gallery'

const galleryState = {
  // set to true when the current street is deleted from the gallery
  // this prevents the gallery from being hidden while no street is shown
  noStreetSelected: false
}

export function showGallery (userId, instant = false) {
  if (app.readOnly) {
    return
  }

  trackEvent('INTERACTION', 'OPEN_GALLERY', userId, null, false)

  // TODO: Handle modes better.
  store.dispatch(showGalleryAction(userId, 'NONE'))

  hideControls()
  hideStatusMessage()

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

  if ((getMode() === MODES.USER_GALLERY) || (getMode() === MODES.GLOBAL_GALLERY)) {
    // Prevents showing old street before the proper street loads
    showError(ERRORS.NO_STREET, false)
  }

  loadGalleryContents()
  updatePageUrl(true)
}

export function hideGallery (instant = false) {
  // Do not hide the gallery if there is no street selected.
  if (galleryState.noStreetSelected === true) {
    return
  }

  const state = store.getState()
  if (state.gallery.visible) {
    store.dispatch(hideGalleryAction())

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

export function receiveGalleryData (transmission) {
  // Prepare data object
  const streets = []
  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    updateToLatestSchemaVersion(galleryStreet.data.street)

    galleryStreet.creatorId =
      (galleryStreet.creator && galleryStreet.creator.id)

    streets.push(galleryStreet)
  }

  store.dispatch(receiveGalleryStreets(streets))

  if (((getMode() === MODES.USER_GALLERY) && streets.length) || (getMode() === MODES.GLOBAL_GALLERY)) {
    switchGalleryStreet(streets[0].id)
  }
}

export function repeatReceiveGalleryData () {
  loadGalleryContents()
}

export function switchGalleryStreet (id) {
  // Save previous street's thumbnail before switching streets.
  saveStreetThumbnail(store.getState().street, SAVE_THUMBNAIL_EVENTS.PREVIOUS_STREET)

  galleryState.noStreetSelected = false

  fetchGalleryStreet(id)
}

function loadGalleryContents () {
  store.dispatch(setGalleryMode('LOADING'))
  fetchGalleryData()
}
