import { SET_USER_SETTINGS } from './index'
import { saveSettingsLocally } from '../../users/settings'

// Normal action creator.
export function updateSettings (settings) {
  return {
    type: SET_USER_SETTINGS,
    settings
  }
}

// Thunk version of above.
export function setSettings (settings) {
  return (dispatch) => {
    dispatch(updateSettings(settings))

    // Other actions here.
    // Auto save changes to localstorage
    saveSettingsLocally(settings)
  }
}
