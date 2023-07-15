import { createSlice } from '@reduxjs/toolkit'

const debugSlice = createSlice({
  name: 'debug',
  initialState: {
    forceLeftHandTraffic: false,
    forceNonRetina: false,
    forceOfflineMode: false,
    forceReadOnly: false
  },

  reducers: {
    setDebugFlags (state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
})

export const { setDebugFlags } = debugSlice.actions

export default debugSlice.reducer
