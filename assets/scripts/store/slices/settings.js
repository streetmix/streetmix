import { createSlice } from '@reduxjs/toolkit'
import { NEW_STREET_DEFAULT } from '../../streets/constants'

/**
 * This is a legacy settings state which mashes together several different
 * types of settings: some persist across browser sessions, some are stored
 * in the user account, and others are session-only state (like
 * priorLastStreetId). Significant refactoring of all of this is desired.
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
    priorLastStreetId: null, // NOTE: Do not save to localstorage or server side, only used for current client session
    newStreetPreference: NEW_STREET_DEFAULT,
    saveAsImageTransparentSky: false,
    saveAsImageSegmentNamesAndWidths: false,
    saveAsImageStreetName: false,
    saveAsImageWatermark: true
  },

  reducers: {
    updateSettings (state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
})

export const { updateSettings } = settingsSlice.actions

export default settingsSlice.reducer
