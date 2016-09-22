import $ from 'jquery'
import Cookies from 'js-cookie'

import { API_URL } from '../app/config'
import { showError, ERRORS } from '../app/errors'
import { trackEvent } from '../app/event_tracking'
import { checkIfEverythingIsLoaded } from '../app/initialization'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { getStreet } from '../streets/data_model'
import { setPromoteStreet } from '../streets/remix'
import { fetchStreetFromServer } from '../streets/xhr'
import { receiveUserDetails } from './profile_image_cache'
import { checkIfSignInAndGeolocationLoaded } from './localization'
import {
  loadSettings,
  saveSettingsLocally,
  LOCAL_STORAGE_SIGN_IN_ID,
  getSettings
} from './settings'

const USER_ID_COOKIE = 'user_id'
const SIGN_IN_TOKEN_COOKIE = 'login_token'

let signInData = null

export function getSignInData () {
  return signInData
}

let signedIn = false

export function isSignedIn () {
  return signedIn
}

let signInLoaded = false

export function isSignInLoaded () {
  return signInLoaded
}

export function goReloadClearSignIn () {
  signInData = null // eslint-disable-line no-native-reassign
  saveSignInDataLocally()
  removeSignInCookies()

  window.location.reload()
}

function saveSignInDataLocally () {
  if (signInData) {
    window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = JSON.stringify(signInData)
  } else {
    window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = ''
  }
}

function removeSignInCookies () {
  Cookies.remove(SIGN_IN_TOKEN_COOKIE)
  Cookies.remove(USER_ID_COOKIE)
}

export function loadSignIn () {
  signInLoaded = false

  var signInCookie = Cookies.get(SIGN_IN_TOKEN_COOKIE)
  var userIdCookie = Cookies.get(USER_ID_COOKIE)

  if (signInCookie && userIdCookie) {
    signInData = { token: signInCookie, userId: userIdCookie }

    removeSignInCookies()
    saveSignInDataLocally()
  } else {
    if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
      signInData = JSON.parse(window.localStorage[LOCAL_STORAGE_SIGN_IN_ID])
    }
  }

  if (signInData && signInData.token && signInData.userId) {
    fetchSignInDetails()

    // This block was commented out because caching username causes
    // failures when the database is cleared. TODO Perhaps we should
    // be handling this more deftly.
    /* if (signInData.details) {
      signedIn = true
      _signInLoaded()
    } else {
      fetchSignInDetails()
    } */
  } else {
    signedIn = false
    _signInLoaded()
  }
}

function fetchSignInDetails () {
  $.ajax({
    url: API_URL + 'v1/users/' + signInData.userId,
    dataType: 'json',
    headers: { 'Authorization': getAuthHeader() }
  }).done(receiveSignInDetails).fail(errorReceiveSignInDetails)

  // TODO: This doesn't work

  // const options = {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': getAuthHeader()
  //   }
  // }

  // window.fetch(API_URL + 'v1/users/' + signInData.userId, options)
  //   .then(function (response) {
  //     if (response.status <= 200 || response.status >= 399) {
  //       throw new Error(response)
  //     }
  //
  //     return response.json()
  //   })
  //   .then(receiveSignInDetails)
  //   .catch(errorReceiveSignInDetails) // TODO: Test this to make sure it works with fetch
}

function receiveSignInDetails (details) {
  signInData.details = details
  saveSignInDataLocally()

  // cache the users profile image so we don't have to request it later
  receiveUserDetails(details)

  signedIn = true
  _signInLoaded()
}

function errorReceiveSignInDetails (data) {
  // If we get data.status === 0, it means that the user opened the page and
  // closed is quickly, so the request was aborted. We choose to do nothing
  // instead of clobbering sign in data below and effectively signing the
  // user out. Issue #302.

  // It also, unfortunately, might mean regular server failure, too. Marcin
  // doesn’t know what to do with it yet. Open issue #339.

  /* if (data.status === 0) {
    showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
    return
  } */

  if (data.status === 401) {
    trackEvent('ERROR', 'ERROR_RM1', null, null, false)

    signOut(true)

    showError(ERRORS.SIGN_IN_401, true)
    return
  } else if (data.status === 503) {
    trackEvent('ERROR', 'ERROR_15A', null, null, false)

    showError(ERRORS.SIGN_IN_SERVER_FAILURE, true)
    return
  }

  // Fail silently

  signInData = null
  signedIn = false
  _signInLoaded()
}

export function onSignOutClick (event) {
  signOut(false)

  if (event) {
    event.preventDefault()
  }
}

function signOut (quiet) {
  let settings = getSettings()
  settings.lastStreetId = null
  settings.lastStreetNamespacedId = null
  settings.lastStreetCreatorId = null
  saveSettingsLocally()

  removeSignInCookies()
  window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  sendSignOutToServer(quiet)
}

export function getAuthHeader () {
  if (signInData && signInData.token) {
    return 'Streetmix realm="" loginToken="' + signInData.token + '"'
  } else {
    return ''
  }
}

function sendSignOutToServer (quiet) {
  var call = {
    // TODO const
    url: API_URL + 'v1/users/' + signInData.userId + '/login-token',
    dataType: 'json',
    type: 'DELETE',
    headers: { 'Authorization': getAuthHeader() }
  }

  if (quiet) {
    $.ajax(call)
  } else {
    $.ajax(call).done(receiveSignOutConfirmationFromServer)
      .fail(errorReceiveSignOutConfirmationFromServer)
  }
}

function receiveSignOutConfirmationFromServer () {
  setMode(MODES.SIGN_OUT)
  processMode()
}

function errorReceiveSignOutConfirmationFromServer () {
  setMode(MODES.SIGN_OUT)
  processMode()
}

function _signInLoaded () {
  loadSettings()

  // This gets sent to the MenuBar component for rendering.
  // Send an empty object for `event.detail` if `signInData` does not exist.
  window.dispatchEvent(new window.CustomEvent('stmx:signed_in', {
    detail: signInData || {}
  }))

  var street = getStreet()
  let mode = getMode()
  if ((mode === MODES.CONTINUE) || (mode === MODES.JUST_SIGNED_IN) ||
    (mode === MODES.USER_GALLERY) || (mode === MODES.GLOBAL_GALLERY)) {
    let settings = getSettings()
    if (settings.lastStreetId) {
      street.creatorId = settings.lastStreetCreatorId
      street.id = settings.lastStreetId
      street.namespacedId = settings.lastStreetNamespacedId

      if ((mode === MODES.JUST_SIGNED_IN) && (!street.creatorId)) {
        setPromoteStreet(true)
      }

      if (mode === MODES.JUST_SIGNED_IN) {
        setMode(MODES.CONTINUE)
      }
    } else {
      setMode(MODES.NEW_STREET)
    }
  }
  mode = getMode()
  switch (mode) {
    case MODES.EXISTING_STREET:
    case MODES.CONTINUE:
    case MODES.USER_GALLERY:
    case MODES.GLOBAL_GALLERY:
      fetchStreetFromServer()
      break
  }

  signInLoaded = true
  document.querySelector('#loading-progress').value++
  checkIfSignInAndGeolocationLoaded()
  checkIfEverythingIsLoaded()
}
