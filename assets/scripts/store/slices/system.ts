import { createSlice } from '@reduxjs/toolkit'

const systemSlice = createSlice({
  name: 'system',
  initialState: {
    // "Phone" detection is based on "max screen size"
    phone:
      (typeof window.matchMedia !== 'undefined' &&
        (window.matchMedia('only screen and (max-device-width: 480px)')
          .matches ||
          window.matchMedia('only screen and (max-device-height: 480px)')
            .matches)) ||
      false,
    safari:
      (navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')) ||
      false,
    windows: navigator.userAgent.includes('Windows') || false,
    offline: false,
    devicePixelRatio: window.devicePixelRatio || 1.0
  },

  reducers: {
    setSystemFlags (state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
})

export const { setSystemFlags } = systemSlice.actions

export default systemSlice.reducer
