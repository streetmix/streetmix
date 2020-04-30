import { throttle } from 'lodash'
import { API_URL } from '../app/config'
import { trackEvent } from '../app/event_tracking'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { newNonblockingAjaxRequest } from '../util/fetch_nonblocking'
import { getAuthHeader, getSignInData, isSignedIn } from './authentication'
import store, { observeStore } from '../store'
import { setSettings } from '../store/actions/settings'
import { setAppFlags } from '../store/slices/app'

export const LOCAL_STORAGE_SETTINGS_ID = 'settings'
export const LOCAL_STORAGE_SETTINGS_UNITS_ID = 'settings-units'
const SAVE_SETTINGS_DELAY = 500
let saveSettingsTimerId = -1

export function loadSettings () {
  // Get server settings.
  let serverSettings = {}
  const signInData = getSignInData()
  if (isSignedIn() && signInData.details) {
    serverSettings = signInData.details.data
  }

  // Get local settings.
  // Skip this if localStorage is corrupted
  let localSettings = {}
  try {
    if (window.localStorage[LOCAL_STORAGE_SETTINGS_ID]) {
      localSettings = JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_ID])
    }
  } catch (e) {}

  // Marge settings to a new object. Server settings take priority and will
  // overwrite local settings.
  const settings = Object.assign({}, localSettings, serverSettings)

  // Except for last street settings -- if we've just signed in, local settings
  // take priority.
  if (getMode() === MODES.JUST_SIGNED_IN) {
    settings.lastStreetId = localSettings.lastStreetId
    settings.lastStreetNamespacedId = localSettings.lastStreetNamespacedId
    settings.lastStreetCreatorId = localSettings.lastStreetCreatorId
  }

  // This is a temporary value used only for the "fetch last street"
  // functionality (this can happen either through the welcome panel)
  // or the /copy-last convenience URL.
  store.dispatch(
    setAppFlags({
      priorLastStreetId: settings.lastStreetId
    })
  )

  // Update our application state.
  store.dispatch(setSettings(settings))
}

/**
 * Save settings to LocalStorage. This should only be called by the settings
 * reducer when data is updated. This is meant to mirror application state that
 * should persist across browser sessions and even different users.
 *
 * @param {Object} settings
 */
export function saveSettingsLocally (settings) {
  try {
    window.localStorage[LOCAL_STORAGE_SETTINGS_ID] = JSON.stringify(settings)
  } catch (err) {
    // Ignore localstorage write errors.
  }
}

function saveSettingsToServer (settings) {
  if (!isSignedIn() || store.getState().errors.abortEverything) {
    return
  }

  const transmission = JSON.stringify({ data: settings })

  // TODO const url
  newNonblockingAjaxRequest(
    API_URL + 'v1/users/' + getSignInData().userId,
    {
      method: 'PUT',
      body: transmission,
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json'
      }
    },
    true,
    null,
    errorSavingSettingsToServer
  )
}

function errorSavingSettingsToServer (data) {
  if (!store.getState().errors.abortEverything && data.status === 401) {
    trackEvent('ERROR', 'ERROR_RM2', null, null, false)

    setMode(MODES.FORCE_RELOAD_SIGN_OUT_401)
    processMode()
  }
}

export function scheduleSavingSettingsToServer (settings) {
  if (!isSignedIn()) {
    return
  }

  clearScheduledSavingSettingsToServer()

  saveSettingsTimerId = window.setTimeout(function () {
    saveSettingsToServer(settings)
  }, SAVE_SETTINGS_DELAY)
}

function clearScheduledSavingSettingsToServer () {
  window.clearTimeout(saveSettingsTimerId)
}

/**
 * Use an observer model to set localstorage (a Redux pattern)
 *
 * Similar to:
 * https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
 * https://twitter.com/dan_abramov/status/703684128416333825
 *
 * Benefit: LocalStorage is always reflects the store, no matter how it's updated
 * Uses a throttle to prevent continuous rewrites
 */
export function initPersistedSettingsStoreObserver () {
  const select = (state) => state.persistSettings
  const onChange = throttle((settings) => {
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_SETTINGS_UNITS_ID,
        JSON.stringify(settings.units)
      )
      if (settings.locale) {
        window.localStorage.setItem('locale', JSON.stringify(settings.locale))
      } else {
        window.localStorage.removeItem('locale')
      }
    } catch (err) {
      // Ignore write errors.
    }
  }, 1000)

  return observeStore(select, onChange)
}
