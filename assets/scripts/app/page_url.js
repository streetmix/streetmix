import { debug } from '../preinit/debug_settings'
import { setMode, MODES } from './mode'
import {
  URL_NEW_STREET,
  URL_NEW_STREET_COPY_LAST,
  JUST_SIGNED_IN_PATH,
  URL_ERROR,
  URL_GLOBAL_GALLERY,
  URL_NO_USER,
  URL_RESERVED_PREFIX,
  SURVEY_FINISHED,
  RESERVED_URLS
} from './constants'
import { normalizeSlug } from '../util/helpers'
import store from '../store'
import { setGalleryUserId } from '../store/slices/gallery'
import { saveCreatorId, saveStreetId } from '../store/slices/street'

let errorUrl = ''

export function getErrorUrl () {
  return errorUrl
}

export function processUrl () {
  var url = window.location.pathname

  // Remove heading slash
  if (!url) {
    url = '/'
  }
  url = url.substr(1)

  // Remove trailing slashes
  url = url.replace(/\/+$/, '')

  var urlParts = url.split(/\//)

  if (!url) {
    // Continue where we left off… or start with a default (demo) street

    setMode(MODES.CONTINUE)
  } else if (urlParts.length === 1 && urlParts[0] === URL_NEW_STREET) {
    // New street

    setMode(MODES.NEW_STREET)
  } else if (
    urlParts.length === 1 &&
    urlParts[0] === URL_NEW_STREET_COPY_LAST
  ) {
    // New street (but start with copying last street)

    setMode(MODES.NEW_STREET_COPY_LAST)
  } else if (urlParts.length === 1 && urlParts[0] === JUST_SIGNED_IN_PATH) {
    // Coming back from a successful sign in

    setMode(MODES.JUST_SIGNED_IN)
  } else if (urlParts.length >= 1 && urlParts[0] === URL_ERROR) {
    // Error

    setMode(MODES.ERROR)
    errorUrl = urlParts[1]
  } else if (urlParts.length === 1 && urlParts[0] === URL_GLOBAL_GALLERY) {
    // Global gallery

    setMode(MODES.GLOBAL_GALLERY)
  } else if (urlParts.length === 1 && urlParts[0] === SURVEY_FINISHED) {
    setMode(MODES.SURVEY_FINISHED)
  } else if (urlParts.length === 1 && urlParts[0]) {
    // User gallery

    store.dispatch(setGalleryUserId(urlParts[0]))

    setMode(MODES.USER_GALLERY)
  } else if (
    urlParts.length === 2 &&
    urlParts[0] === URL_NO_USER &&
    urlParts[1]
  ) {
    // TODO add is integer urlParts[1]
    // Existing street by an anonymous person

    store.dispatch(saveCreatorId(null))
    store.dispatch(saveStreetId(null, urlParts[1]))

    setMode(MODES.EXISTING_STREET)
  } else if (urlParts.length >= 2 && urlParts[0] && urlParts[1]) {
    // Existing street by a user person
    let creatorId = urlParts[0]

    if (creatorId.charAt(0) === URL_RESERVED_PREFIX) {
      creatorId = creatorId.substr(1)
    }

    store.dispatch(saveCreatorId(creatorId))

    // if `urlParts[1]` is not an integer, redirect to user's gallery
    if (Number.isInteger(window.parseInt(urlParts[1])) === false) {
      store.dispatch(setGalleryUserId(urlParts[0]))
      setMode(MODES.USER_GALLERY)
    } else {
      store.dispatch(saveStreetId(null, urlParts[1]))
      setMode(MODES.EXISTING_STREET)
    }
  } else {
    setMode(MODES.NOT_FOUND)
  }
}

export function getStreetUrl (street) {
  let url = '/'
  if (street.creatorId) {
    if (RESERVED_URLS.indexOf(street.creatorId) !== -1) {
      url += URL_RESERVED_PREFIX
    }

    url += street.creatorId
  } else {
    url += URL_NO_USER
  }

  url += '/'

  url += street.namespacedId

  if (street.creatorId) {
    const slug = normalizeSlug(street.name)
    if (slug) {
      url += '/' + window.encodeURIComponent(slug)
    }
  }

  return url
}

export function updatePageUrl (forceGalleryUrl, userId = null) {
  let url
  if (forceGalleryUrl) {
    const slug = userId || 'gallery/'
    url = '/' + slug
  } else {
    url = getStreetUrl(store.getState().street)
  }

  if (debug.forceLeftHandTraffic) {
    url += '&debug-force-left-hand-traffic'
  }
  if (debug.forceUnsupportedBrowser) {
    url += '&debug-force-unsupported-browser'
  }
  if (debug.forceNonRetina) {
    url += '&debug-force-non-retina'
  }
  if (debug.forceReadOnly) {
    url += '&debug-force-read-only'
  }
  if (debug.forceLiveUpdate) {
    url += '&debug-force-live-update'
  }
  if (debug.forceNoInternet) {
    url += '&debug-force-no-internet'
  }

  url = url.replace(/&/, '?')

  window.history.replaceState(null, null, url)
}
