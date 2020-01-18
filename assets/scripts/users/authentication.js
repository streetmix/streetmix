import Cookies from 'js-cookie'

import USER_ROLES from '../../../app/data/user_roles'
import { app } from '../preinit/app_settings'
import { API_URL } from '../app/config'
import { showError, ERRORS } from '../app/errors'
import { trackEvent } from '../app/event_tracking'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { goTwitterSignIn } from '../app/routing'
import { generateFlagOverrides, applyFlagOverrides } from '../app/flag_utils'
import { setPromoteStreet } from '../streets/remix'
import { fetchStreetFromServer, createNewStreetOnServer } from '../streets/xhr'
import { loadSettings, getSettings, setSettings } from './settings'
import store from '../store'
import {
  createSetSignInData,
  createSignedInState,
  createSignInLoadedState,
  rememberUserProfile
} from '../store/actions/user'
import { showDialog } from '../store/actions/dialogs'

const USER_ID_COOKIE = 'user_id'
const SIGN_IN_TOKEN_COOKIE = 'login_token'
const LOCAL_STORAGE_SIGN_IN_ID = 'sign-in'

export function doSignIn () {
  const state = store.getState()
  const newAuthEnabled = state.flags.AUTHENTICATION_V2.value

  // The sign in dialog is only limited to users where the UI has been localized
  if (newAuthEnabled) {
    store.dispatch(showDialog('SIGN_IN'))
  } else {
    goTwitterSignIn()
  }
}

export function getSignInData () {
  return store.getState().user.signInData
}

function setSignInData (data) {
  store.dispatch(createSetSignInData(data))
}

function clearSignInData () {
  store.dispatch(createSetSignInData(null))
}

export function isSignedIn () {
  return store.getState().user.signedIn
}

function setSignedInState (bool) {
  store.dispatch(createSignedInState(bool))
}

function setSignInLoadedState (bool) {
  store.dispatch(createSignInLoadedState(bool))
}

export function goReloadClearSignIn () {
  clearSignInData()
  saveSignInDataLocally()
  removeSignInCookies()

  window.location.reload()
}

export function onStorageChange () {
  if (isSignedIn() && !window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    setMode(MODES.FORCE_RELOAD_SIGN_OUT)
    processMode()
  } else if (!isSignedIn() && window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    setMode(MODES.FORCE_RELOAD_SIGN_IN)
    processMode()
  }
}

function saveSignInDataLocally () {
  const signInData = getSignInData()
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

export async function loadSignIn () {
  setSignInLoadedState(false)

  var signInCookie = Cookies.get(SIGN_IN_TOKEN_COOKIE)
  var userIdCookie = Cookies.get(USER_ID_COOKIE)

  if (signInCookie && userIdCookie) {
    setSignInData({ token: signInCookie, userId: userIdCookie })

    removeSignInCookies()
    saveSignInDataLocally()
  } else {
    if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
      setSignInData(JSON.parse(window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]))
    }
  }

  const signInData = getSignInData()

  const storage = JSON.parse(window.localStorage.getItem('flags'))
  const sessionOverrides = generateFlagOverrides(storage, 'session')

  let flagOverrides = []

  if (signInData && signInData.token && signInData.userId) {
    flagOverrides = await fetchSignInDetails(signInData.userId)
  } else {
    setSignedInState(false)
  }

  if (!flagOverrides) {
    flagOverrides = []
  }
  applyFlagOverrides(store.getState().flags, ...flagOverrides, sessionOverrides)

  setSignInLoadedState(true)

  _signInLoaded()

  return true
}

/**
 *
 * @param {String} userId
 * @returns {Array}
 */
async function fetchSignInDetails (userId) {
  const options = {
    headers: { Authorization: getAuthHeader() }
  }

  try {
    const response = await window.fetch(API_URL + 'v1/users/' + userId, options)

    if (!response.ok) {
      throw response
    }

    const json = await response.json()
    const { flags, roles = [] } = json

    const flagOverrides = [
      // all role flag overrides
      ...roles.map((key) =>
        generateFlagOverrides(USER_ROLES[key].flags, `role:${key}`)
      ),
      // user flag overrides
      generateFlagOverrides(flags, 'user')
    ]

    receiveSignInDetails(json)
    return flagOverrides
  } catch (error) {
    errorReceiveSignInDetails(error)
  }
}

function receiveSignInDetails (details) {
  const signInData = getSignInData()
  signInData.details = details
  setSignInData(signInData)
  saveSignInDataLocally()

  // cache the users profile image so we don't have to request it later
  store.dispatch(rememberUserProfile(details))

  setSignedInState(true)
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

  clearSignInData()
  setSignedInState(false)
}

export function onSignOutClick (event) {
  signOut(false)

  if (event) {
    event.preventDefault()
  }
}

function signOut (quiet) {
  setSettings({
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null
  })

  removeSignInCookies()
  window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  sendSignOutToServer(quiet)
}

export function getAuthHeader () {
  const signInData = getSignInData()
  if (signInData && signInData.token && signInData.userId) {
    return `Streetmix realm="" loginToken="${signInData.token}" userId="${signInData.userId}"`
  } else {
    return ''
  }
}

function sendSignOutToServer (quiet) {
  const signInData = getSignInData()
  const options = {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader() }
  }

  // TODO const
  window
    .fetch(API_URL + 'v1/users/' + signInData.userId + '/login-token', options)
    .then((response) => {
      if (!quiet) {
        receiveSignOutConfirmationFromServer()
      }
    })
    .catch(errorReceiveSignOutConfirmationFromServer)
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

  const street = store.getState().street
  let mode = getMode()
  if (
    mode === MODES.CONTINUE ||
    mode === MODES.JUST_SIGNED_IN ||
    mode === MODES.USER_GALLERY ||
    mode === MODES.GLOBAL_GALLERY
  ) {
    const settings = getSettings()
    if (settings.lastStreetId) {
      street.creatorId = settings.lastStreetCreatorId
      street.id = settings.lastStreetId
      street.namespacedId = settings.lastStreetNamespacedId

      if (mode === MODES.JUST_SIGNED_IN && !street.creatorId) {
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
    case MODES.NEW_STREET:
    case MODES.NEW_STREET_COPY_LAST:
      if (app.readOnly) {
        showError(ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE, true)
      } else {
        createNewStreetOnServer()
      }
      break
  }
}
