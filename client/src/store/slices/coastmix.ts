import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CoastmixState {
  controlsVisible: boolean
  seaLevelRise: number
}

const initialState: CoastmixState = {
  controlsVisible: false,
  seaLevelRise: 0
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

    setSeaLevelRise (state, action: PayloadAction<number>) {
      state.seaLevelRise = action.payload
    }
  }
})

export const {
  setCoastmixState,
  showCoastmixControls,
  hideCoastmixControls,
  setSeaLevelRise
} = coastmixSlice.actions

export default coastmixSlice.reducer
