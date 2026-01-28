import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CoastmixState {
  controlsVisible: boolean
  seaLevelRise: number
  stormSurge: boolean
  isRaining: boolean
  floodDirection: 'left' | 'right' | 'both' | 'none'
}

const initialState: CoastmixState = {
  controlsVisible: false,
  seaLevelRise: 0,
  stormSurge: false,
  isRaining: false,
  floodDirection: 'none',
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
      action: PayloadAction<CoastmixState['floodDirection'] | undefined>
    ) {
      state.floodDirection = action.payload ?? 'none'
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
  setStormSurge,
  setRain,
} = coastmixSlice.actions

export default coastmixSlice.reducer
