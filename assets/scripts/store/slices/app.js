import { createSlice } from '@reduxjs/toolkit'
import { changeLocale } from './locale'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    readOnly: false,
    printing: false,
    everythingLoaded: false,
    contentDirection: 'ltr',

    // Used to remember the "last street" ID when making a copy of a street
    // looked at in a previous tab. Its value is copied from the `lastStreetId`
    // value from the `settings` reducer, so that it can be remembered
    priorLastStreetId: null
  },

  reducers: {
    setAppFlags (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },

    startPrinting (state, action) {
      state.printing = true
    },

    stopPrinting (state, action) {
      state.printing = false
    },

    everythingLoaded (state, action) {
      state.everythingLoaded = true
    }
  },

  extraReducers: {
    [changeLocale.fulfilled]: (state, action) => {
      const direction =
        ['ar', 'dv', 'fa', 'he'].indexOf(action.payload.locale) > -1
          ? 'rtl'
          : 'ltr'
      state.contentDirection = direction
    }
  }
})

export const { setAppFlags, startPrinting, stopPrinting, everythingLoaded } =
  appSlice.actions

export default appSlice.reducer
