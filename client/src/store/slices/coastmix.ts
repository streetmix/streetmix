import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { CoastmixState } from '@streetmix/types'

const initialState: CoastmixState = {
  controlsVisible: false,
  targetYear: null,
  stormSurge: false,
  floodDetails: [null, null],
  floodHeight: 0,
}

const coastmixSlice = createSlice({
  name: 'coastmix',
  initialState,

  reducers: {
    setCoastmixState(state, action: PayloadAction<CoastmixState>) {
      return {
        ...state,
        ...action.payload,
      }
    },

    resetCoastmixState() {
      return {
        ...initialState,
      }
    },

    showCoastalFloodingPanel(state) {
      state.controlsVisible = true
    },

    hideCoastalFloodingPanel(state) {
      state.controlsVisible = false
    },

    toggleCoastalFloodingPanel(state) {
      state.controlsVisible = !state.controlsVisible
    },

    setTargetYear(state, action: PayloadAction<CoastmixState['targetYear']>) {
      state.targetYear = action.payload
    },

    setFloodDetails(
      state,
      action: PayloadAction<CoastmixState['floodDetails']>
    ) {
      state.floodDetails = action.payload
    },

    setFloodHeight(state, action: PayloadAction<CoastmixState['floodHeight']>) {
      state.floodHeight = action.payload
    },

    setStormSurge(state, action: PayloadAction<boolean>) {
      state.stormSurge = action.payload
    },
  },
})

export const {
  setCoastmixState,
  resetCoastmixState,
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  toggleCoastalFloodingPanel,
  setTargetYear,
  setFloodDetails,
  setFloodHeight,
  setStormSurge,
} = coastmixSlice.actions

export default coastmixSlice.reducer
