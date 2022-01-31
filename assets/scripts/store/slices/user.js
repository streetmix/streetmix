import { createSlice } from '@reduxjs/toolkit'
import USER_ROLES from '../../../../app/data/user_roles.json'

const initialState = {
  signInData: null,
  signedIn: false,
  isSubscriber: false,
  isCoilPluginSubscriber: false,
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

      if (
        action.payload.details?.roles?.includes(USER_ROLES.SUBSCRIBER_1.value)
      ) {
        state.isSubscriber = true
      }
    },

    clearSignInData (state, action) {
      state.signInData = null
      state.signedIn = false
      state.isSubscriber = false
      state.isCoilPluginSubscriber = false
    },

    setGeolocationAttempted (state, action) {
      state.geolocation.attempted = action.payload
    },

    setGeolocationData (state, action) {
      state.geolocation.data = action.payload
    },

    setCoilPluginSubscriber (state, action) {
      state.isCoilPluginSubscriber = action.payload

      // Also set `isSubscriber` if the user is signed in.
      if (action.payload === true && state.signedIn === true) {
        state.isSubscriber = true
      } else {
        // Unset isSubscriber only if the user doesn't have the role elsewhere
        if (
          !state.signInData?.details?.roles?.includes(
            USER_ROLES.SUBSCRIBER_1.value
          )
        ) {
          state.isSubscriber = false
        }
      }
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
  setCoilPluginSubscriber,
  rememberUserProfile
} = userSlice.actions

export default userSlice.reducer
