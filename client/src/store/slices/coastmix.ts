import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { CoastmixState } from '@streetmix/types'

const initialState: CoastmixState = {
  controlsVisible: false,
  seaLevelRise: 0,
  stormSurge: false,
  floodDetails: [null, null],
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

    setSeaLevelRise(state, action: PayloadAction<number>) {
      state.seaLevelRise = action.payload
    },

    setFloodDetails(
      state,
      action: PayloadAction<CoastmixState['floodDetails']>
    ) {
      state.floodDetails = action.payload
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
  setSeaLevelRise,
  setFloodDetails,
  setStormSurge,
} = coastmixSlice.actions

export default coastmixSlice.reducer
