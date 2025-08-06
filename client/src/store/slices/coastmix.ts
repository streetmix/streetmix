import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CoastmixState {
  controlsVisible: boolean
  waterLevel: number
}

const initialState: CoastmixState = {
  controlsVisible: false,
  waterLevel: 0
}

const coastmixSlice = createSlice({
  name: 'coastmix',
  initialState,

  reducers: {
    setCoastmixState (state, action: PayloadAction<CoastmixState>) {
      return {
        ...state,
        ...action.payload
      }
    },

    showCoastmixControls (state) {
      state.controlsVisible = true
    },

    hideCoastmixControls (state) {
      state.controlsVisible = false
    },

    setWaterLevel (state, action: PayloadAction<number>) {
      state.waterLevel = action.payload
    }
  }
})

export const {
  setCoastmixState,
  showCoastmixControls,
  hideCoastmixControls,
  setWaterLevel
} = coastmixSlice.actions

export default coastmixSlice.reducer
