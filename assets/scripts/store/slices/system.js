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
      (navigator.userAgent.indexOf('Safari') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1) ||
      false,
    windows: navigator.userAgent.indexOf('Windows') !== -1 || false,
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
