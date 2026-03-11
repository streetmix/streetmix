import { createSlice } from '@reduxjs/toolkit'
import type { ContentDirection } from '~/src/types'

import { changeLocale } from './locale.js'

import type { PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  readOnly: boolean
  printing: boolean
  everythingLoaded: boolean
  contentDirection: ContentDirection
  tutorialStep: number
  priorLastStreetId: string | null
}

const initialState: AppState = {
  readOnly: false,
  printing: false,
  everythingLoaded: false,
  contentDirection: 'ltr',

  // Tutorial state is tied to device/browser. Other settings (like user prefs)
  // should be able to reset this value (e.g. set to 0 to turn off entirely)
  tutorialStep: 1,

  // Used to remember the "last street" ID when making a copy of a street
  // looked at in a previous tab. Its value is copied from the `lastStreetId`
  // value from the `settings` reducer, so that it can be remembered
  priorLastStreetId: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,

  reducers: {
    setAppFlags(state, action: PayloadAction<Partial<AppState>>) {
      return {
        ...state,
        ...action.payload,
      }
    },

    startPrinting(state) {
      state.printing = true
    },

    stopPrinting(state) {
      state.printing = false
    },

    everythingLoaded(state) {
      state.everythingLoaded = true
    },

    nextTutorialStep(state) {
      state.tutorialStep += 1
    },

    setTutorialStep(state, action: PayloadAction<number>) {
      state.tutorialStep = action.payload
    },

    resetTutorial(state) {
      state.tutorialStep = 1
    },

    skipTutorial(state) {
      state.tutorialStep = 0
    },
  },

  extraReducers: (builder) => {
    builder.addCase(changeLocale.fulfilled, (state, action) => {
      const direction = ['ar', 'dv', 'fa', 'he'].includes(action.payload.locale)
        ? 'rtl'
        : 'ltr'
      state.contentDirection = direction
    })
  },
})

export const {
  setAppFlags,
  startPrinting,
  stopPrinting,
  everythingLoaded,
  nextTutorialStep,
  setTutorialStep,
  resetTutorial,
  skipTutorial,
} = appSlice.actions

export default appSlice.reducer
