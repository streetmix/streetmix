import { updateSettings } from '../slices/settings'
import { saveSettingsLocally } from '../../users/settings'

export function setSettings (settings) {
  return (dispatch) => {
    dispatch(updateSettings(settings))

    // Other actions here.
    // Auto save changes to localstorage
    saveSettingsLocally(settings)
  }
}
