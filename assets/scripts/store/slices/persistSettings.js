import { createSlice } from '@reduxjs/toolkit'
import { changeLocale } from './locale'

/**
 * Persisted settings are settings that should persist across
 * user sessions in the same browser (e.g. stored in localstorage.)
 */
const persistSettingsSlice = createSlice({
  name: 'persistSettings',
  initialState: {
    units: 1,
    locale: null
  },

  reducers: {
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

export const { setUserUnits } = persistSettingsSlice.actions

export default persistSettingsSlice.reducer
