import debounce from 'just-debounce-it'
import { MODES, getMode } from '../app/mode'
import store, { observeStore } from '../store'
import { updateSettings } from '../store/slices/settings'
import { setAppFlags } from '../store/slices/app'
import { putUserSettings } from '../util/api'
import { getSignInData, isSignedIn } from './authentication'

const LOCAL_STORAGE_SETTINGS_ID = 'settings'
const SAVE_SETTINGS_DELAY = 500

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
    if (window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_ID)) {
      localSettings = JSON.parse(
        window.localStorage.getItem(LOCAL_STORAGE_SETTINGS_ID)
      )
    }
  } catch (err) {
    console.error(err)
  }

  // Merge settings to a new object. Server settings take priority and will
  // overwrite local settings.

  const settings = Object.assign({}, localSettings, serverSettings)

  // Except for last street settings -- if we've just signed in, local settings
  // take priority.
  const currentMode = getMode()
  if (currentMode === MODES.JUST_SIGNED_IN) {
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
  store.dispatch(updateSettings(settings))
}

/**
 * Save settings to LocalStorage. This should only be called after the settings
 * reducer has updated. This is meant to mirror application state that
 * should persist across browser sessions and even different users.
 *
 * @param {Object} settings
 */
function saveSettingsLocally (settings) {
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_SETTINGS_ID,
      JSON.stringify(settings)
    )
  } catch (err) {
    // Ignore localstorage write errors.
  }
}

function saveSettingsToServer (settings) {
  if (!isSignedIn() || store.getState().errors.abortEverything) {
    return
  }

  const userId = getSignInData().userId
  putUserSettings(userId, { data: settings })
}

function persistSettingsToBackends (settings) {
  // Mirror the settings to local storage (so they persist across browser
  // sessions) and also to the server (to a user account, if the user is
  // signed in).
  saveSettingsLocally(settings)
  saveSettingsToServer(settings)
}

/**
 * Use an observer model to set localstorage (a Redux pattern)
 *
 * Similar to:
 * https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
 * https://twitter.com/dan_abramov/status/703684128416333825
 *
 * Benefit: LocalStorage is always reflects the store, no matter how it's
 * updated. Debounced so updates are only made after rapid changes have
 * completed.
 */
export function initSettingsStoreObserver () {
  const select = (state) => state.settings
  const onChange = debounce(persistSettingsToBackends, SAVE_SETTINGS_DELAY)

  return observeStore(select, onChange)
}
