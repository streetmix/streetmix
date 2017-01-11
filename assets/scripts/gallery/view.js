import { trackEvent } from '../app/event_tracking'
import { showError, ERRORS } from '../app/errors'
import { onWindowFocus } from '../app/focus'
import { getAbortEverything } from '../app/initialization'
import { msg } from '../app/messages'
import { MODES, getMode, setMode } from '../app/mode'
import {
  getGalleryUserId,
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
  updateToLatestSchemaVersion,
  getStreetUrl
} from '../streets/data_model'
import StreetName from '../streets/StreetName'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { getSignInData, isSignedIn } from '../users/authentication'
import { formatDate } from '../util/date_format'
import { removeElFromDOM } from '../util/dom_helpers'
import { fetchGalleryData } from './fetch_data'
import { fetchGalleryStreet } from './fetch_street'
import { drawStreetThumbnail } from './thumbnail'
import React from 'react'
import ReactDOM from 'react-dom'

// Redux
import store from '../store'
import { SET_GALLERY_STATE } from '../store/actions'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

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

  if (!signInPromo) {
    document.querySelector('#gallery .street-count').innerHTML = ''

    // TODO no class, but type?
    if (!userId) {
      document.querySelector('#gallery').classList.add('all-streets')
      document.querySelector('#gallery').classList.remove('another-user')
    } else if (isSignedIn() && (userId === getSignInData().userId)) {
      document.querySelector('#gallery').classList.remove('another-user')
      document.querySelector('#gallery').classList.remove('all-streets')
    } else {
      document.querySelector('#gallery').classList.add('another-user')
      document.querySelector('#gallery').classList.remove('all-streets')
    }
  }

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
  store.dispatch({
    type: SET_GALLERY_STATE,
    mode: 'GALLERY'
  })

  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    updateToLatestSchemaVersion(galleryStreet.data.street)

    var el = document.createElement('div')
    el.className = 'gallery-street-item'

    var anchorEl = document.createElement('a')

    galleryStreet.creatorId =
      (galleryStreet.creator && galleryStreet.creator.id)

    galleryStreet.name = galleryStreet.name || DEFAULT_NAME

    anchorEl.href = getStreetUrl(galleryStreet)

    anchorEl.streetName = galleryStreet.name
    anchorEl.setAttribute('streetId', galleryStreet.id)

    if (galleryState.streetId === galleryStreet.id) {
      anchorEl.classList.add('selected')
    }

    anchorEl.addEventListener('click', onGalleryStreetClick)

    var thumbnailEl = document.createElement('canvas')
    thumbnailEl.width = THUMBNAIL_WIDTH * system.hiDpi * 2
    thumbnailEl.height = THUMBNAIL_HEIGHT * system.hiDpi * 2
    var ctx = thumbnailEl.getContext('2d')
    drawStreetThumbnail(ctx, galleryStreet.data.street,
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
    anchorEl.appendChild(thumbnailEl)

    var nameEl = document.createElement('div')
    nameEl.className = 'street-name-wrap'
    anchorEl.appendChild(nameEl)

    ReactDOM.render(<StreetName name={galleryStreet.name} />, nameEl)

    var dateEl = document.createElement('span')
    dateEl.classList.add('date')
    dateEl.innerHTML = formatDate(galleryStreet.updatedAt)
    anchorEl.appendChild(dateEl)

    if (!getGalleryUserId()) {
      var creatorEl = document.createElement('span')
      creatorEl.classList.add('creator')

      var creatorName = galleryStreet.creatorId || msg('USER_ANONYMOUS')

      creatorEl.innerHTML = creatorName
      anchorEl.appendChild(creatorEl)
    }

    // Only show delete links if you own the street
    if (isSignedIn() && (galleryStreet.creatorId === getSignInData().userId)) {
      var removeEl = document.createElement('button')
      removeEl.classList.add('remove')
      removeEl.addEventListener('pointerdown', onDeleteGalleryStreet)
      removeEl.innerHTML = msg('UI_GLYPH_X')
      removeEl.title = msg('TOOLTIP_DELETE_STREET')
      anchorEl.appendChild(removeEl)
    }

    el.appendChild(anchorEl)
    document.querySelector('#gallery .streets').appendChild(el)
  }

  var streetCount = document.querySelectorAll('#gallery .streets li').length

  if (((getMode() === MODES.USER_GALLERY) && streetCount) || (getMode() === MODES.GLOBAL_GALLERY)) {
    switchGalleryStreet(transmission.streets[0].id)
  }

  const galleryEl = document.getElementById('gallery')
  const selectedEl = galleryEl.querySelector('.selected')
  if (selectedEl) {
    selectedEl.scrollIntoView()
    galleryEl.scrollTop = 0
  }

  updateGalleryStreetCount()
}

export function repeatReceiveGalleryData () {
  loadGalleryContents()
}

export function updateGallerySelection () {
  const galleryEl = document.getElementById('gallery')
  const els = galleryEl.querySelectorAll('.streets .selected')
  for (let el of els) {
    el.classList.remove('selected')
  }

  const selector = `.streets [streetId="${galleryState.streetId}"]`
  const el = galleryEl.querySelector(selector)
  if (el) {
    el.classList.add('selected')
  }
}

function switchGalleryStreet (id) {
  galleryState.streetId = id
  galleryState.noStreetSelected = false

  updateGallerySelection()
  fetchGalleryStreet(galleryState.streetId)
}

function onGalleryStreetClick (event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  var el = this
  switchGalleryStreet(el.getAttribute('streetId'))

  event.preventDefault()
}

function updateGalleryStreetCount () {
  let text

  const galleryEl = document.getElementById('gallery')
  if (getGalleryUserId()) {
    const streetCount = galleryEl.querySelectorAll('.streets li').length
    switch (streetCount) {
      case 0:
        text = msg('STREET_COUNT_0')
        break
      case 1:
        text = msg('STREET_COUNT_1')
        break
      default:
        text = msg('STREET_COUNT_MANY', { streetCount: streetCount })
        break
    }
  } else {
    text = ''
  }
  galleryEl.querySelector('.street-count').innerHTML = text
}

function loadGalleryContents () {
  store.dispatch({
    type: SET_GALLERY_STATE,
    mode: 'LOADING'
  })

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

function onDeleteGalleryStreet (event) {
  var el = event.target.parentNode
  var name = el.streetName

  // TODO escape name
  if (window.confirm(msg('PROMPT_DELETE_STREET', { name: name }))) {
    if (el.getAttribute('streetId') === getStreet().id) {
      galleryState.noStreetSelected = true
      showError(ERRORS.NO_STREET, false)
    }

    sendDeleteStreetToServer(el.getAttribute('streetId'))

    removeElFromDOM(el.parentNode)
    updateGalleryStreetCount()
  }

  event.preventDefault()
  event.stopPropagation()
}

export function onMyStreetsClick (event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return
  }

  if (isSignedIn()) {
    showGallery(getSignInData().userId, false)
  } else {
    showGallery(null, false, true)
  }

  event.preventDefault()
}
