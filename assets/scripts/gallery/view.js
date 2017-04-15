import { trackEvent } from '../app/event_tracking'
import { showError, ERRORS } from '../app/errors'
import { onWindowFocus } from '../app/focus'
import { getAbortEverything } from '../app/initialization'
import { MODES, getMode, setMode } from '../app/mode'
import {
  setGalleryUserId,
  updatePageUrl
} from '../app/page_url'
import { hideStatusMessage } from '../app/status_message'
import { app } from '../preinit/app_settings'
import { system } from '../preinit/system_capabilities'
import { hideControls } from '../segments/resizing'
import {
  DEFAULT_NAME,
  getStreet,
  updateToLatestSchemaVersion
} from '../streets/data_model'
import { getSignInData, isSignedIn } from '../users/authentication'
import { fetchGalleryData } from './fetch_data'
import { fetchGalleryStreet } from './fetch_street'

// Redux
import store from '../store'
import { SET_GALLERY_STATE } from '../store/actions'
import { setGalleryMode } from '../store/actions/gallery'

export const galleryState = {
  streetId: null,
  streetLoaded: false,
  // set to true when the current street is deleted from the gallery
  // this prevents the gallery from being hidden while no street is shown
  noStreetSelected: false
}

export function attachGalleryViewEventListeners () {
  window.addEventListener('stmx:init', function () {
    document.querySelector('#gallery-shield').addEventListener('pointerdown', onGalleryShieldClick)
  })

  window.addEventListener('stmx:everything_loaded', function () {
    updateGalleryShield()
  })
}

export function showGallery (userId, instant, signInPromo = false) {
  if (app.readOnly) {
    return
  }

  trackEvent('INTERACTION', 'OPEN_GALLERY', userId, null, false)

  galleryState.streetLoaded = true
  galleryState.streetId = getStreet().id
  setGalleryUserId(userId)

  store.dispatch({
    type: SET_GALLERY_STATE,
    visible: true,
    userId: userId,
    // TODO: Handle modes better.
    mode: (signInPromo) ? 'SIGN_IN_PROMO' : 'NONE'
  })

  hideControls()
  hideStatusMessage()

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

  if (!signInPromo) {
    loadGalleryContents()
    updatePageUrl(true)
  }
}

export function hideGallery (instant) {
  // Do not hide the gallery if there is no street selected.
  if (galleryState.noStreetSelected === true) {
    return
  }

  if (galleryState.streetLoaded) {
    store.dispatch({
      type: SET_GALLERY_STATE,
      visible: false
    })

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

    if (!getAbortEverything()) {
      updatePageUrl()
    }

    setMode(MODES.CONTINUE)
  }
}

export function receiveGalleryData (transmission) {
  // Prepare data object
  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    updateToLatestSchemaVersion(galleryStreet.data.street)

    galleryStreet.creatorId =
      (galleryStreet.creator && galleryStreet.creator.id)

    galleryStreet.name = galleryStreet.name || DEFAULT_NAME
  }

  store.dispatch({
    type: SET_GALLERY_STATE,
    mode: 'GALLERY',
    streets: transmission.streets
  })

  if (((getMode() === MODES.USER_GALLERY) && transmission.streets.length) || (getMode() === MODES.GLOBAL_GALLERY)) {
    switchGalleryStreet(transmission.streets[0].id)
  }
}

export function repeatReceiveGalleryData () {
  loadGalleryContents()
}

export function switchGalleryStreet (id) {
  galleryState.streetId = id
  galleryState.noStreetSelected = false

  fetchGalleryStreet(galleryState.streetId)
}

function loadGalleryContents () {
  store.dispatch(setGalleryMode('LOADING'))
  fetchGalleryData()
}

function onGalleryShieldClick (event) {
  hideGallery(false)
}

function updateGalleryShield () {
  document.querySelector('#gallery-shield').style.width = 0
  window.setTimeout(function () {
    document.querySelector('#gallery-shield').style.height =
      system.viewportHeight + 'px'
    document.querySelector('#gallery-shield').style.width =
      document.querySelector('#street-section-outer').scrollWidth + 'px'
  }, 0)
}

export function onMyStreetsClick (event) {
  event.preventDefault()
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  if (isSignedIn()) {
    showGallery(getSignInData().userId, false)
  } else {
    showGallery(null, false, true)
  }
}
