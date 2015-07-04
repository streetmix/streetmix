var TRACK_ACTION_ERROR_RM2 = 'Error RM2 (auth 401 failure mid-flight)'

var LOCAL_STORAGE_SETTINGS_ID = 'settings'
var LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'
var LOCAL_STORAGE_SIGN_IN_ID = 'sign-in'
var LOCAL_STORAGE_FEEDBACK_BACKUP = 'feedback-backup'
var LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP = 'feedback-email-backup'
var SAVE_SETTINGS_DELAY = 500

var settings = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetUserId: null,
  priorLastStreetId: null, // Do not save
  newStreetPreference: null,

  saveAsImageTransparentSky: null,
  saveAsImageSegmentNamesAndWidths: null,
  saveAsImageStreetName: null
}
var settingsWelcomeDismissed = false

var saveSettingsTimerId = -1

var signedIn = false
var signInLoaded = false
var signInData = null

function _mergeAndFillDefaultSettings (secondSettings) {
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

function _loadSettingsWelcomeDismissed () {
  if (window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]) {
    settingsWelcomeDismissed =
      JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED])
  }
}

function _saveSettingsWelcomeDismissed () {
  window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] =
    JSON.stringify(settingsWelcomeDismissed)
}

function _loadSettings () {
  if (signedIn && signInData.details) {
    var serverSettings = signInData.details.data
  } else {
    var serverSettings = {}
  }

  // TODO handle better if corrupted
  if (window.localStorage[LOCAL_STORAGE_SETTINGS_ID]) {
    var localSettings = JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_ID])
  } else {
    var localSettings = {}
  }

  settings = {}

  if (serverSettings) {
    settings = serverSettings
  }
  _mergeAndFillDefaultSettings(localSettings)

  if (mode == MODES.JUST_SIGNED_IN) {
    settings.lastStreetId = localSettings.lastStreetId
    settings.lastStreetNamespacedId = localSettings.lastStreetNamespacedId
    settings.lastStreetCreatorId = localSettings.lastStreetCreatorId
  }

  settings.priorLastStreetId = settings.lastStreetId

  _saveSettingsLocally()
}

function _trimSettings () {
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

function _saveSettingsLocally () {
  window.localStorage[LOCAL_STORAGE_SETTINGS_ID] =
    JSON.stringify(_trimSettings())

  _scheduleSavingSettingsToServer()
}

function _confirmSaveStreetToServerInitial () {
  saveStreetIncomplete = false

  serverContacted = true
  _checkIfEverythingIsLoaded()
}

function _saveSettingsToServer () {
  if (!signedIn || abortEverything) {
    return
  }

  var transmission = JSON.stringify({ data: _trimSettings() })

  _newNonblockingAjaxRequest({
    // TODO const
    url: API_URL + 'v1/users/' + signInData.userId,
    data: transmission,
    dataType: 'json',
    type: 'PUT',
    contentType: 'application/json',
    headers: { 'Authorization': _getAuthHeader() }
  }, true, null, _errorSavingSettingsToServer)
}

function _errorSavingSettingsToServer (data) {
  if (!abortEverything && (data.status == 401)) {
    EventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_RM2,
      null, null, false)

    mode = MODES.FORCE_RELOAD_SIGN_OUT_401
    _processMode()
  }
}

function _scheduleSavingSettingsToServer () {
  if (!signedIn) {
    return
  }

  _clearScheduledSavingSettingsToServer()

  saveSettingsTimerId =
    window.setTimeout(function () { _saveSettingsToServer(); }, SAVE_SETTINGS_DELAY)
}

function _clearScheduledSavingSettingsToServer () {
  window.clearTimeout(saveSettingsTimerId)
}

function _onStorageChange () {
  if (signedIn && !window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    mode = MODES.FORCE_RELOAD_SIGN_OUT
    _processMode()
  } else if (!signedIn && window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    mode = MODES.FORCE_RELOAD_SIGN_IN
    _processMode()
  }
}
