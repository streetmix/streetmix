import { createSlice } from '@reduxjs/toolkit'
import { NEW_STREET_DEFAULT } from '../../streets/constants'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetCreatorId: null,
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
