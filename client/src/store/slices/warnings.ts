import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { SliceWarnings } from '@streetmix/types'

interface WarningState {
  slices: Record<string, Partial<SliceWarnings>>
}

const initialState: WarningState = {
  slices: {},
}

const warningsSlice = createSlice({
  name: 'warnings',
  initialState,

  reducers: {
    setSliceWarnings(state, action: PayloadAction<WarningState['slices']>) {
      state.slices = action.payload
    },
  },
})

export const { setSliceWarnings } = warningsSlice.actions

export default warningsSlice.reducer
