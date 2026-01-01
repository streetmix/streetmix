import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SystemState {
  safari: boolean
  windows: boolean
  offline: boolean
  devicePixelRatio: number
}

const initialState: SystemState = {
  safari:
    (navigator.userAgent.includes('Safari') &&
      !navigator.userAgent.includes('Chrome')) ||
    false,
  windows: navigator.userAgent.includes('Windows') || false,
  offline: false,
  devicePixelRatio: window.devicePixelRatio || 1.0,
}

const systemSlice = createSlice({
  name: 'system',
  initialState,

  reducers: {
    setSystemFlags(state, action: PayloadAction<Partial<SystemState>>) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

export const { setSystemFlags } = systemSlice.actions

export default systemSlice.reducer
