import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { CoastmixState, FloodDirection } from '@streetmix/types'

const initialState: CoastmixState = {
  controlsVisible: false,
  seaLevelRise: 0,
  stormSurge: false,
  floodDirection: 'none',
  floodDistance: null,
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

    setFloodDirection(
      state,
      action: PayloadAction<FloodDirection | undefined>
    ) {
      state.floodDirection = action.payload ?? 'none'
    },

    setFloodDistance(state, action: PayloadAction<number | null>) {
      state.floodDistance = action.payload
    },

    setStormSurge(state, action: PayloadAction<boolean>) {
      state.stormSurge = action.payload
    },
  },
})

export const {
  setCoastmixState,
  showCoastalFloodingPanel,
  hideCoastalFloodingPanel,
  toggleCoastalFloodingPanel,
  setSeaLevelRise,
  setFloodDirection,
  setFloodDistance,
  setStormSurge,
} = coastmixSlice.actions

export default coastmixSlice.reducer
