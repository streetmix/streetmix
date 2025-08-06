import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CoastmixState {
  waterLevel: number
}

const initialState: CoastmixState = {
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

    setWaterLevel (state, action: PayloadAction<number>) {
      state.waterLevel = action.payload
    }
  }
})

export const { setCoastmixState, setWaterLevel } = coastmixSlice.actions

export default coastmixSlice.reducer
