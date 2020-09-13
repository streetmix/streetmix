import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'
import * as Sentry from '@sentry/browser'

import USER_ROLES from '../../../app/data/user_roles'
import { app } from '../preinit/app_settings'
import { API_URL } from '../app/config'
import { showError, ERRORS } from '../app/errors'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { goTwitterSignIn } from '../app/routing'
import { generateFlagOverrides, applyFlagOverrides } from '../app/flag_utils'
import { formatMessage } from '../locales/locale'
import { setPromoteStreet } from '../streets/remix'
import { fetchStreetFromServer, createNewStreetOnServer } from '../streets/xhr'
import { loadSettings } from './settings'
import store from '../store'
import { updateSettings } from '../store/slices/settings'
import {
  setSignInData,
  clearSignInData,
  rememberUserProfile
} from '../store/slices/user'
import { showDialog } from '../store/slices/dialogs'
import { updateStreetIdMetadata } from '../store/slices/street'
import { addToast } from '../store/slices/toasts'

const USER_ID_COOKIE = 'user_id'
const SIGN_IN_TOKEN_COOKIE = 'login_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
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
  return store.getState().user.signInData || {}
}

export function isSignedIn () {
  return store.getState().user.signedIn
}

/**
 * Clears sign in data on the client side. Use this when authentication
 * data has become corrupted or expired on the client side and needs to be reset.
 * Do not use this to sign out a user. For that, use signOut(), which ensures
 * that sign out data is also sent to the server.
 */
export function clearAllClientSignInData () {
  store.dispatch(clearSignInData())
  window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  removeSignInCookies()
}

export function goReloadClearSignIn () {
  clearAllClientSignInData()
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
    window.localStorage.setItem(
      LOCAL_STORAGE_SIGN_IN_ID,
      JSON.stringify(signInData)
    )
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  }
}

function removeSignInCookies () {
  Cookies.remove(SIGN_IN_TOKEN_COOKIE)
  Cookies.remove(REFRESH_TOKEN_COOKIE)
  Cookies.remove(USER_ID_COOKIE)
}

export async function loadSignIn () {
  const signInCookie = Cookies.get(SIGN_IN_TOKEN_COOKIE)
  const refreshCookie = Cookies.get(REFRESH_TOKEN_COOKIE)
  const userIdCookie = Cookies.get(USER_ID_COOKIE)

  if (signInCookie && userIdCookie && refreshCookie) {
    store.dispatch(
      setSignInData({
        token: signInCookie,
        refreshToken: refreshCookie,
        userId: userIdCookie
      })
    )

    saveSignInDataLocally()
  } else if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    // old login data is in localstorage but we don't have the cookies we need
    clearAllClientSignInData()
    setMode(MODES.AUTH_EXPIRED)
    processMode()
    return true
  }

  const signInData = getSignInData()

  // Check if token is valid
  // Note that jwtDecode does not actually validate tokens. We will need
  // another library to do that. For now, we use the try/catch to see if
  // throws an error. If so, we log and report this error so we can see
  // why tokens are invalid, then we force clearing all data so that user
  // can reset and start over.
  try {
    if (signInData.token) {
      jwtDecode(signInData.token)
    }
  } catch (error) {
    Sentry.captureMessage('Error parsing jwt token ', signInData?.token)
    clearAllClientSignInData()
    setMode(MODES.AUTH_EXPIRED)
    processMode()
    return true
  }

  const storage = JSON.parse(window.localStorage.getItem('flags'))
  const sessionOverrides = generateFlagOverrides(storage, 'session')

  let flagOverrides = []

  if (signInData && signInData.token && signInData.userId) {
    const decoded = jwtDecode(signInData.token)

    // Check if token has expired
    const currentDate = new Date()
    const expDate = new Date(decoded.exp * 1000)

    // Set the expiration date to one day early so that tokens
    // don't wait till the last moment to refresh
    expDate.setDate(expDate.getDate() - 1)

    if (currentDate >= expDate) {
      await refreshLoginToken(signInData.refreshToken)
    }
    flagOverrides = await fetchSignInDetails(signInData.userId)
  } else {
    store.dispatch(clearSignInData())
  }

  if (!flagOverrides) {
    flagOverrides = []
  }
  applyFlagOverrides(store.getState().flags, ...flagOverrides, sessionOverrides)

  _signInLoaded()

  return true
}

/**
 *
 * @param {String} refreshToken
 * @returns {Object}
 */
async function refreshLoginToken (refreshToken) {
  const requestBody = JSON.stringify({ token: refreshToken })
  try {
    const response = await window.fetch('/services/auth/refresh-login-token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    })

    if (!response.ok) {
      throw response
    }

    return
  } catch (error) {
    errorRefreshLoginToken(error)
  }
}

function errorRefreshLoginToken (data) {
  if (data.status === 401) {
    signOut(true)

    showError(ERRORS.SIGN_IN_401, true)
    return
  } else if (data.status === 503) {
    showError(ERRORS.SIGN_IN_SERVER_FAILURE, true)
    return
  }

  // Fail silently
  store.dispatch(clearSignInData())
}

/**
 *
 * @param {String} userId
 * @returns {Array}
 */
async function fetchSignInDetails (userId) {
  try {
    const response = await window.fetch(API_URL + 'v1/users/' + userId)

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
  const signInData = {
    ...getSignInData(),
    details
  }
  store.dispatch(setSignInData(signInData))
  saveSignInDataLocally()

  // cache the users profile image so we don't have to request it later
  store.dispatch(rememberUserProfile(details))
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
    signOut(true)

    // showError(ERRORS.SIGN_IN_401, true)
    // TODO: Check to make sure that this is the correct place to display
    // this. Currently, this will display for all 401 errors, not just
    // when a valid user who was previously signed in has been signed out.
    store.dispatch(
      addToast({
        message: formatMessage(
          'error.auth-expired',
          'We automatically signed you out due to inactivity. Please sign in again.'
        ),
        component: 'TOAST_SIGN_IN',
        duration: Infinity
      })
    )

    return
  } else if (data.status === 503) {
    showError(ERRORS.SIGN_IN_SERVER_FAILURE, true)
    return
  }

  // Fail silently
  store.dispatch(clearSignInData())
}

export function onSignOutClick (event) {
  signOut(false)

  if (event) {
    event.preventDefault()
  }
}

function signOut (quiet) {
  store.dispatch(
    updateSettings({
      lastStreetId: null,
      lastStreetNamespacedId: null,
      lastStreetCreatorId: null
    })
  )

  removeSignInCookies()
  window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  sendSignOutToServer(quiet)
}

function sendSignOutToServer (quiet) {
  const signInData = getSignInData()

  // TODO const
  window
    .fetch(API_URL + 'v1/users/' + signInData.userId + '/login-token', {
      method: 'DELETE'
    })
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

  const surveyStreetId = Cookies.get('last_survey_url')

  // hack to return user to the survey street after signing in
  if (surveyStreetId) {
    Cookies.remove('last_survey_url')
    if (mode === MODES.JUST_SIGNED_IN) {
      window.location = surveyStreetId
    }
  }

  if (
    mode === MODES.CONTINUE ||
    mode === MODES.JUST_SIGNED_IN ||
    mode === MODES.USER_GALLERY ||
    mode === MODES.SURVEY_FINISHED ||
    mode === MODES.GLOBAL_GALLERY
  ) {
    const settings = store.getState().settings

    if (settings.lastStreetId) {
      store.dispatch(
        updateStreetIdMetadata({
          creatorId: settings.lastStreetCreatorId,
          id: settings.lastStreetId,
          namespacedId: settings.lastStreetNamespacedId
        })
      )

      if (mode === MODES.JUST_SIGNED_IN && !street.creatorId) {
        setPromoteStreet(true)
      }

      if (mode === MODES.SURVEY_FINISHED) {
        store.dispatch(
          addToast({
            message: formatMessage(
              'error.survey-finished',
              'Survey complete. Congratulations and thank you!'
            ),
            duration: Infinity
          })
        )
        setMode(MODES.CONTINUE)
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
