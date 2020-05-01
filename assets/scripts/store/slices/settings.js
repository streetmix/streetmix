import { createSlice } from '@reduxjs/toolkit'
import { NEW_STREET_DEFAULT } from '../../streets/constants'
import { changeLocale } from './locale'

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
    saveAsImageWatermark: true,
    locale: null,
    units: null
  },

  reducers: {
    updateSettings (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },

    setUserUnits (state, action) {
      const units = action.payload
      state.units = Number.parseInt(units, 10)
    }
  },

  extraReducers: {
    [changeLocale.fulfilled]: (state, action) => {
      state.locale = action.payload.locale
    }
  }
})

export const { updateSettings, setUserUnits } = settingsSlice.actions

export default settingsSlice.reducer
