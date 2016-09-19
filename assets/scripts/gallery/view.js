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
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/routing'
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
import { StreetName } from '../streets/name_sign'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { getSignInData, isSignedIn } from '../users/authentication'
import { formatDate } from '../util/date_format'
import { removeElFromDOM } from '../util/dom_helpers'
import { fetchGalleryData } from './fetch_data'
import { fetchGalleryStreet } from './fetch_street'
import { updateScrollButtons } from './scroll'
import { drawStreetThumbnail } from './thumbnail'
import React from 'react'
import ReactDOM from 'react-dom'
import Avatar from '../app/Avatar'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

export const galleryState = {
  visible: false,
  // userId: null, // TODO: replace galleryUserId in globals
  streetId: null,
  streetLoaded: false,
  // set to true when the current street is deleted from the gallery
  // this prevents the gallery from being hidden while no street is shown
  noStreetSelected: false
}

// Cache a reference to the gallery element
const GALLERY_EL = document.getElementById('gallery')

window.addEventListener('stmx:init', function () {
  // Populate gallery UI button URLs on init
  document.querySelector('#new-street').href = '/' + URL_NEW_STREET
  document.querySelector('#copy-last-street').href = '/' + URL_NEW_STREET_COPY_LAST

  document.querySelector('#gallery-try-again').addEventListener('pointerdown', repeatReceiveGalleryData)
  document.querySelector('#gallery-shield').addEventListener('pointerdown', onGalleryShieldClick)
})

window.addEventListener('stmx:everything_loaded', function () {
  updateGalleryShield()
})

export function showGallery (userId, instant, signInPromo) {
  if (app.readOnly) {
    return
  }

  trackEvent('INTERACTION', 'OPEN_GALLERY', userId, null, false)

  galleryState.visible = true
  galleryState.streetLoaded = true
  galleryState.streetId = getStreet().id
  setGalleryUserId(userId)

  if (!signInPromo) {
    if (userId) {
      ReactDOM.render(<Avatar userId={getGalleryUserId()} />, document.querySelector('#gallery .avatar-wrap'))
      document.querySelector('#gallery .user-id').innerHTML = getGalleryUserId()

      var linkEl = document.createElement('a')
      // TODO const
      linkEl.href = 'https://twitter.com/' + getGalleryUserId()
      linkEl.innerHTML = 'Twitter profile »'
      linkEl.classList.add('twitter-profile')
      linkEl.target = '_blank'
      document.querySelector('#gallery .user-id').appendChild(linkEl)
    } else {
      document.querySelector('#gallery .user-id').innerHTML = 'All streets'
    }

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
  document.querySelector('#gallery .sign-in-promo').classList.remove('visible')

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
  } else {
    document.querySelector('#gallery .sign-in-promo').classList.add('visible')
  }
}

export function hideGallery (instant) {
  // Do not hide the gallery if there is no street selected.
  if (galleryState.noStreetSelected === true) {
    return
  }

  if (galleryState.streetLoaded) {
    galleryState.visible = false

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
  document.querySelector('#gallery .loading').classList.remove('visible')

  for (var i in transmission.streets) {
    var galleryStreet = transmission.streets[i]

    // There is a bug where sometimes street data is non-existent for an unknown reason
    // Skip over so that the rest of gallery will display
    if (!galleryStreet.data) continue

    updateToLatestSchemaVersion(galleryStreet.data.street)

    var el = document.createElement('li')

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
    nameEl.className = 'street-name'
    anchorEl.appendChild(nameEl)

    // This adds the street name plaque to each thumbnail.
    // the variable is assigned, but not re-used. Do not remove!
    let streetName = new StreetName(nameEl, galleryStreet.name) // eslint-disable-line no-unused-vars

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

  const selectedEl = GALLERY_EL.querySelector('.selected')
  if (selectedEl) {
    selectedEl.scrollIntoView()
    GALLERY_EL.scrollTop = 0
  }

  updateScrollButtons()

  updateGalleryStreetCount()
}

function repeatReceiveGalleryData () {
  loadGalleryContents()
}

export function updateGallerySelection () {
  const els = GALLERY_EL.querySelectorAll('.streets .selected')
  for (let el of els) {
    el.classList.remove('selected')
  }

  const selector = `.streets [streetId="${galleryState.streetId}"]`
  const el = GALLERY_EL.querySelector(selector)
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

  if (getGalleryUserId()) {
    const streetCount = GALLERY_EL.querySelectorAll('.streets li').length
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
  GALLERY_EL.querySelector('.street-count').innerHTML = text
}

function loadGalleryContents () {
  const els = GALLERY_EL.querySelectorAll('.streets li')
  for (let el of els) {
    removeElFromDOM(el)
  }

  GALLERY_EL.querySelector('.loading').classList.add('visible')
  GALLERY_EL.querySelector('.error-loading').classList.remove('visible')

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
    showGallery(false, false, true)
  }

  event.preventDefault()
}
