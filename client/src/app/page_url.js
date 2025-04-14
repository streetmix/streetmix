import { debug } from '../preinit/debug_settings'
import { normalizeSlug } from '../util/helpers'
import store from '../store'
import { setGalleryUserId } from '../store/slices/gallery'
import { saveCreatorId, saveStreetId } from '../store/slices/street'
import {
  URL_NEW_STREET,
  JUST_SIGNED_IN_PATH,
  URL_ERROR,
  URL_GLOBAL_GALLERY,
  URL_RESERVED_PREFIX,
  URL_SURVEY_FINISHED,
  RESERVED_URLS,
  NEW_STREET_COPY_LAST,
  NEW_STREET_DEFAULT,
  NEW_STREET_EMPTY
} from './constants'
import { setMode, MODES } from './mode'

// Used as a placeholder in URLs when the street is by an anonymous user
export const ANONYMOUS_USER_ID_FRAGMENT = '-'

let errorUrl = ''

export function getErrorUrl () {
  return errorUrl
}

export function processUrl () {
  // Get current pathname. The pathname will contain an initial `/` followed
  // by the path of the URL. The root pathname should always be `/`. It may
  // be possible for the URL to contain a trailing slash, but we don't want
  // that, so remove it, if present. This will cause the root pathname to be
  // an empty string.
  const url = new URL(window.location)
  const pathname = url.pathname.replace(/\/+$/, '')

  // parts being split, although we really don't need to
  // filter out empty string parts
  const urlParts = pathname.split(/\//).filter((x) => x !== '')

  // Continue where we left off… or start with a default (demo) street
  if (pathname === '/' || pathname === '') {
    setMode(MODES.CONTINUE)

    // New street
  } else if (pathname === URL_NEW_STREET) {
    const params = new URLSearchParams(url.search)
    const type = params.get('type')
    switch (type) {
      case NEW_STREET_COPY_LAST:
        setMode(MODES.NEW_STREET_COPY_LAST)
        break
      case NEW_STREET_EMPTY:
        setMode(MODES.NEW_STREET_EMPTY)
        break
      case NEW_STREET_DEFAULT:
      default:
        setMode(MODES.NEW_STREET)
        break
    }

    // clear this param after processing.
    params.delete('type')
    let newUrl = `${url.origin}${url.pathname}`
    if (params.size > 0) {
      newUrl += `?${params.toString()}`
    }
    window.history.replaceState(null, '', newUrl)

    // Coming back from a successful sign in
  } else if (pathname === JUST_SIGNED_IN_PATH) {
    setMode(MODES.JUST_SIGNED_IN)

    // Error
  } else if (pathname.startsWith(URL_ERROR)) {
    setMode(MODES.ERROR)
    errorUrl = urlParts[1]

    // Global gallery
  } else if (pathname === URL_GLOBAL_GALLERY) {
    setMode(MODES.GLOBAL_GALLERY)

    // Survey finished
  } else if (pathname === URL_SURVEY_FINISHED) {
    setMode(MODES.SURVEY_FINISHED)

    // User gallery
  } else if (urlParts.length === 1 && urlParts[0]) {
    store.dispatch(setGalleryUserId(urlParts[0]))
    setMode(MODES.USER_GALLERY)

    // TODO add is integer urlParts[1]
    // Existing street by an anonymous person
  } else if (
    urlParts.length === 2 &&
    urlParts[0] === ANONYMOUS_USER_ID_FRAGMENT &&
    urlParts[1]
  ) {
    store.dispatch(saveCreatorId(null))
    store.dispatch(saveStreetId(null, urlParts[1]))
    setMode(MODES.EXISTING_STREET)

    // Existing street by a user person
  } else if (urlParts.length >= 2 && urlParts[0] && urlParts[1]) {
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

    // 404: Catch-all
  } else {
    setMode(MODES.NOT_FOUND)
  }
}

export function getStreetUrl (street) {
  let url = '/'
  if (street.creatorId) {
    // Add a initial slash to the creator check to match reserved paths
    if (RESERVED_URLS.indexOf('/' + street.creatorId) !== -1) {
      url += URL_RESERVED_PREFIX
    }

    url += street.creatorId
  } else {
    url += ANONYMOUS_USER_ID_FRAGMENT
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

  const params = new URLSearchParams(window.location.search)

  // Historically, params were valueless and they we had our own string
  // parsing code, but now we use the `URLSearchParams` global interface.
  // For clarity, truthy values are set to the value of 1.
  if (debug.forceLeftHandTraffic) {
    params.set('debug-force-left-hand-traffic', 1)
  }
  if (debug.forceNonRetina) {
    params.set('debug-force-non-retina', 1)
  }
  if (debug.forceReadOnly) {
    params.set('debug-force-read-only', 1)
  }
  if (debug.forceOfflineMode) {
    params.set('debug-force-offline', 1)
  }

  // If we have params, append to the URL
  if (params.size > 0) {
    url += `?${params.toString()}`
  }

  window.history.replaceState(null, '', url)
}
