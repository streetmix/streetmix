import { createAsyncThunk } from '@reduxjs/toolkit'
import { updateSettings } from '../slices/settings'
import {
  saveSettingsLocally,
  scheduleSavingSettingsToServer
} from '../../users/settings'

export const setSettings = createAsyncThunk(
  'settings/setSettings',
  (settings, { dispatch, getState }) => {
    // Update the settings with the given payload. The `updateSettings`
    // reducer will merge new settings with existing settings.
    dispatch(updateSettings(settings))

    // The previous dispatch should have occurred synchronously, so let's
    // now retrieve all current settings from state.
    const currentSettings = getState().settings

    // Mirror the settings to local storage (so they persist across browser
    // sessions) and also to the server (to a user account, if the user is
    // signed in).
    saveSettingsLocally(currentSettings)
    scheduleSavingSettingsToServer(currentSettings)
  }
)
