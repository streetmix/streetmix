import { createSlice } from '@reduxjs/toolkit'

import type { ColorModes } from '~/src/app/constants'
import { COLOR_MODE_LIGHT } from '~/src/app/constants'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '~/src/users/constants'
import { STREETMIX_INSTANCE } from '../../app/config'
import { changeLocale } from './locale'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { UnitsSetting } from '@streetmix/types'

interface SettingsState {
  lastStreetId: string | null
  lastStreetNamespacedId: number | null
  lastStreetCreatorId: string | null
  newStreetPreference: number // Deprecated
  saveAsImageTransparentSky: boolean
  saveAsImageSegmentNamesAndWidths: boolean
  saveAsImageStreetName: boolean
  saveAsImageWatermark: boolean
  colorMode: ColorModes
  locale: string | null
  units: UnitsSetting
}

const initialState: SettingsState = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetCreatorId: null,
  newStreetPreference: 1,
  saveAsImageTransparentSky: false,
  saveAsImageSegmentNamesAndWidths: false,
  saveAsImageStreetName: false,
  saveAsImageWatermark: true,
  colorMode: COLOR_MODE_LIGHT,
  locale: null,
  // Temporary workaround: coastmix instance defaults to US customary units
  units:
    STREETMIX_INSTANCE === 'coastmix'
      ? SETTINGS_UNITS_IMPERIAL
      : SETTINGS_UNITS_METRIC
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,

  reducers: {
    updateSettings (state, action: PayloadAction<Partial<SettingsState>>) {
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
