import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  signInData: null,
  signedIn: false,
  geolocation: {
    attempted: false,
    data: null
  },
  profileCache: {}
}

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    setSignInData (state, action) {
      state.signInData = action.payload
      state.signedIn = true
    },

    clearSignInData (state, action) {
      state.signInData = null
      state.signedIn = false
    },

    setGeolocationAttempted (state, action) {
      state.geolocation.attempted = action.payload
    },

    setGeolocationData (state, action) {
      state.geolocation.data = action.payload
    },

    rememberUserProfile (state, action) {
      const profile = action.payload

      // Prevent a case where a bad action results in a corrupted cache
      if (!profile || !profile.id) return

      state.profileCache[profile.id] = profile
    }
  }
})

export const {
  setSignInData,
  clearSignInData,
  setGeolocationAttempted,
  setGeolocationData,
  rememberUserProfile
} = userSlice.actions

export default userSlice.reducer
