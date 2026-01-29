import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type FloodDirection = 'left' | 'right' | 'both' | 'none'

export interface CoastmixState {
  controlsVisible: boolean
  seaLevelRise: number
  stormSurge: boolean
  isRaining: boolean
  floodDirection: FloodDirection
  floodDistance: number | null
}

const initialState: CoastmixState = {
  controlsVisible: false,
  seaLevelRise: 0,
  stormSurge: false,
  isRaining: false,
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

    setRain(state, action: PayloadAction<boolean>) {
      state.isRaining = action.payload
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
  setRain,
} = coastmixSlice.actions

export default coastmixSlice.reducer
