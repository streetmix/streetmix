import { createSlice } from '@reduxjs/toolkit'
import { COLOR_MODE_LIGHT } from '../../app/constants'
import { NEW_STREET_DEFAULT } from '../../streets/constants'
import { changeLocale } from './locale'
import type { ColorModes } from '../../app/constants'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  lastStreetId: string | null
  lastStreetNamespacedId: number | null
  lastStreetCreatorId: string | null
  newStreetPreference: number
  saveAsImageTransparentSky: boolean
  saveAsImageSegmentNamesAndWidths: boolean
  saveAsImageStreetName: boolean
  saveAsImageWatermark: boolean
  colorMode: ColorModes
  locale: string | null
  units: number | null
}

const initialState: SettingsState = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetCreatorId: null,
  newStreetPreference: NEW_STREET_DEFAULT,
  saveAsImageTransparentSky: false,
  saveAsImageSegmentNamesAndWidths: false,
  saveAsImageStreetName: false,
  saveAsImageWatermark: true,
  colorMode: COLOR_MODE_LIGHT,
  locale: null,
  units: null
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,

  reducers: {
    updateSettings (state, action: PayloadAction<SettingsState>) {
      return {
        ...state,
        ...action.payload
      }
    },

    setUserUnits (state, action: PayloadAction<SettingsState['units']>) {
      const units = action.payload
      state.units = units
    },

    setUserColorMode (state, action: PayloadAction<ColorModes>) {
      const mode = action.payload
      state.colorMode = mode
    }
  },

  extraReducers: (builder) => {
    builder.addCase(changeLocale.fulfilled, (state, action) => {
      state.locale = action.payload.locale
    })
  }
})

export const { updateSettings, setUserUnits, setUserColorMode } =
  settingsSlice.actions

export default settingsSlice.reducer
