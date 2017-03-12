import { API_URL } from '../app/config'

import { trackEvent } from '../app/event_tracking'
import {
  checkIfEverythingIsLoaded,
  getAbortEverything,
  setServerContacted
} from '../app/initialization'
import { MODES, processMode, getMode, setMode } from '../app/mode'

import { setSaveStreetIncomplete } from '../streets/xhr'
import { newNonblockingAjaxRequest } from '../util/fetch_nonblocking'
import { getAuthHeader, getSignInData, isSignedIn } from './authentication'
import store from '../store'
import { SET_USER_SETTINGS } from '../store/actions'

const LOCAL_STORAGE_SETTINGS_ID = 'settings'
const SAVE_SETTINGS_DELAY = 500
let saveSettingsTimerId = -1

export function getSettings () {
  return store.getState().user
}

// Action creator
function createSetSettingsAction (settings) {
  return {
    ...settings,
    type: SET_USER_SETTINGS
  }
}

export function setSettings (settings) {
  store.dispatch(createSetSettingsAction(settings))

  // Legacy: auto save changes to localstorage
  saveSettingsLocally(settings)
}

function mergeSettings (serverSettings = {}, localSettings = {}) {
  const settings = getSettings()

  // Redux initial state will contain default settings. Merge in
  // server and local settings with it.
  return Object.assign({}, settings, serverSettings, localSettings)
}

export function loadSettings () {
  let serverSettings = {}
  let localSettings = {}
  let signInData = getSignInData()

  if (isSignedIn() && signInData.details) {
    serverSettings = signInData.details.data
  }

  if (window.localStorage[LOCAL_STORAGE_SETTINGS_ID]) {
    // Skip this if localStorage is corrupted
    try {
      localSettings = JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_ID])
    } catch (e) {}
  }

  const settings = mergeSettings(serverSettings, localSettings)

  if (getMode() === MODES.JUST_SIGNED_IN) {
    settings.lastStreetId = localSettings.lastStreetId
    settings.lastStreetNamespacedId = localSettings.lastStreetNamespacedId
    settings.lastStreetCreatorId = localSettings.lastStreetCreatorId
  }

  settings.priorLastStreetId = settings.lastStreetId

  setSettings(settings)
}

// Called before saving settings to LocalStorage or server. Ensures only some
// data we want to save are saved.
function trimSettings (settings) {
  const data = {}

  data.lastStreetId = settings.lastStreetId
  data.lastStreetNamespacedId = settings.lastStreetNamespacedId
  data.lastStreetCreatorId = settings.lastStreetCreatorId
  data.saveAsImageTransparentSky = settings.saveAsImageTransparentSky
  data.saveAsImageSegmentNamesAndWidths = settings.saveAsImageSegmentNamesAndWidths
  data.saveAsImageStreetName = settings.saveAsImageStreetName

  data.newStreetPreference = settings.newStreetPreference

  return data
}

// Legacy: exporting because some parts of Streetmix code manually force current
// settings to write to localstorage.
export function saveSettingsLocally (settings = getSettings()) {
  window.localStorage[LOCAL_STORAGE_SETTINGS_ID] =
    JSON.stringify(trimSettings(settings))

  scheduleSavingSettingsToServer()
}

export function confirmSaveStreetToServerInitial () {
  setSaveStreetIncomplete(false)

  setServerContacted(true)
  checkIfEverythingIsLoaded()
}

export function saveSettingsToServer () {
  if (!isSignedIn() || getAbortEverything()) {
    return
  }

  const settings = getSettings()
  const transmission = JSON.stringify({ data: trimSettings(settings) })

  // TODO const url
  newNonblockingAjaxRequest(API_URL + 'v1/users/' + getSignInData().userId, {
    method: 'PUT',
    body: transmission,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    }
  }, true, null, errorSavingSettingsToServer)
}

function errorSavingSettingsToServer (data) {
  if (!getAbortEverything() && (data.status === 401)) {
    trackEvent('ERROR', 'ERROR_RM2', null, null, false)

    setMode(MODES.FORCE_RELOAD_SIGN_OUT_401)
    processMode()
  }
}

function scheduleSavingSettingsToServer () {
  if (!isSignedIn()) {
    return
  }

  clearScheduledSavingSettingsToServer()

  saveSettingsTimerId = // eslint-disable-line no-native-reassign
    window.setTimeout(function () { saveSettingsToServer() }, SAVE_SETTINGS_DELAY)
}

function clearScheduledSavingSettingsToServer () {
  window.clearTimeout(saveSettingsTimerId)
}
