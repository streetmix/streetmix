import { API_URL } from '../app/config'

import { trackEvent } from '../app/event_tracking'
import {
  checkIfEverythingIsLoaded,
  getAbortEverything,
  setServerContacted
} from '../app/initialization'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { NEW_STREET_DEFAULT } from '../streets/creation'
import { setSaveStreetIncomplete } from '../streets/xhr'
import { newNonblockingAjaxRequest } from '../util/fetch_nonblocking'
import { getAuthHeader, getSignInData, isSignedIn } from './authentication'

const LOCAL_STORAGE_SETTINGS_ID = 'settings'
const SAVE_SETTINGS_DELAY = 500
export const LOCAL_STORAGE_SIGN_IN_ID = 'sign-in'
let saveSettingsTimerId = -1

let settings = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetUserId: null,
  priorLastStreetId: null, // Do not save
  newStreetPreference: null,

  saveAsImageTransparentSky: null,
  saveAsImageSegmentNamesAndWidths: null,
  saveAsImageStreetName: null
}

export function getSettings () {
  return settings
}

function mergeAndFillDefaultSettings (secondSettings) {
  // Merge with local settings

  if (!settings.newStreetPreference) {
    settings.newStreetPreference = secondSettings.newStreetPreference
  }
  if (typeof settings.lastStreetId === 'undefined') {
    settings.lastStreetId = secondSettings.lastStreetId
  }
  if (typeof settings.lastStreetNamespacedId === 'undefined') {
    settings.lastStreetNamespacedId = secondSettings.lastStreetNamespacedId
  }
  if (typeof settings.lastStreetCreatorId === 'undefined') {
    settings.lastStreetCreatorId = secondSettings.lastStreetCreatorId
  }
  if (typeof settings.saveAsImageTransparentSky === 'undefined') {
    settings.saveAsImageTransparentSky = secondSettings.saveAsImageTransparentSky
  }
  if (typeof settings.saveAsImageSegmentNamesAndWidths === 'undefined') {
    settings.saveAsImageSegmentNamesAndWidths = secondSettings.saveAsImageSegmentNamesAndWidths
  }
  if (typeof settings.saveAsImageStreetName === 'undefined') {
    settings.saveAsImageStreetName = secondSettings.saveAsImageStreetName
  }

  // Provide defaults if the above failed

  if (!settings.newStreetPreference) {
    settings.newStreetPreference = NEW_STREET_DEFAULT
  }
  if (typeof settings.lastStreetId === 'undefined') {
    settings.lastStreetId = null
  }
  if (typeof settings.lastStreetNamespacedId === 'undefined') {
    settings.lastStreetNamespacedId = null
  }
  if (typeof settings.lastStreetCreatorId === 'undefined') {
    settings.lastStreetCreatorId = null
  }
  if (typeof settings.saveAsImageTransparentSky === 'undefined') {
    settings.saveAsImageTransparentSky = false
  }
  if (typeof settings.saveAsImageSegmentNamesAndWidths === 'undefined') {
    settings.saveAsImageSegmentNamesAndWidths = false
  }
  if (typeof settings.saveAsImageStreetName === 'undefined') {
    settings.saveAsImageStreetName = false
  }
}

export function loadSettings () {
  let serverSettings, localSettings
  let signInData = getSignInData()
  if (isSignedIn() && signInData.details) {
    serverSettings = signInData.details.data
  } else {
    serverSettings = {}
  }

  // TODO handle better if corrupted
  if (window.localStorage[LOCAL_STORAGE_SETTINGS_ID]) {
    localSettings = JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_ID])
  } else {
    localSettings = {}
  }

  settings = {}

  if (serverSettings) {
    settings = serverSettings
  }
  mergeAndFillDefaultSettings(localSettings)

  if (getMode() === MODES.JUST_SIGNED_IN) {
    settings.lastStreetId = localSettings.lastStreetId
    settings.lastStreetNamespacedId = localSettings.lastStreetNamespacedId
    settings.lastStreetCreatorId = localSettings.lastStreetCreatorId
  }

  settings.priorLastStreetId = settings.lastStreetId

  saveSettingsLocally()
}

function trimSettings () {
  var data = {}

  data.lastStreetId = settings.lastStreetId
  data.lastStreetNamespacedId = settings.lastStreetNamespacedId
  data.lastStreetCreatorId = settings.lastStreetCreatorId
  data.saveAsImageTransparentSky = settings.saveAsImageTransparentSky
  data.saveAsImageSegmentNamesAndWidths = settings.saveAsImageSegmentNamesAndWidths
  data.saveAsImageStreetName = settings.saveAsImageStreetName

  data.newStreetPreference = settings.newStreetPreference

  return data
}

export function saveSettingsLocally () {
  window.localStorage[LOCAL_STORAGE_SETTINGS_ID] =
    JSON.stringify(trimSettings())

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

  var transmission = JSON.stringify({ data: trimSettings() })

  newNonblockingAjaxRequest({
    // TODO const
    url: API_URL + 'v1/users/' + getSignInData().userId,
    data: transmission,
    dataType: 'json',
    type: 'PUT',
    contentType: 'application/json',
    headers: { 'Authorization': getAuthHeader() }
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

export function onStorageChange () {
  if (isSignedIn() && !window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    setMode(MODES.FORCE_RELOAD_SIGN_OUT)
    processMode()
  } else if (!isSignedIn() && window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    setMode(MODES.FORCE_RELOAD_SIGN_IN)
    processMode()
  }
}
