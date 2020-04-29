import { updateSettings } from '../slices/settings'
import { saveSettingsLocally } from '../../users/settings'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const setSettings = createAsyncThunk(
  'settings/setSettings',
  (settings, { dispatch }) => {
    dispatch(updateSettings(settings))

    // Auto save changes to localstorage
    // This also kicks off saving remotely
    saveSettingsLocally(settings)
  }
)
