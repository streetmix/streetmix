import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import USER_ROLES from '../../../../app/data/user_roles.json'
import { getGeoIp } from '../../util/api'

const initialState = {
  signInData: null,
  signedIn: false,
  isSubscriber: false,
  isCoilPluginSubscriber: false,
  geolocation: {
    attempted: false,
    data: null,
    error: null
  }
}

export const detectGeolocation = createAsyncThunk(
  'user/detectGeolocation',
  async () => {
    const response = await getGeoIp()
    return response.data
  }
)

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

    updateDisplayName (state, action) {
      if (state.signInData?.details) {
        state.signInData.details.displayName = action.payload
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(detectGeolocation.pending, (state) => {
        // Reset state when pending
        state.geolocation.attempted = false
        state.geolocation.data = null
        state.geolocation.error = null
      })

      .addCase(detectGeolocation.fulfilled, (state, action) => {
        state.geolocation.attempted = true
        state.geolocation.data = action.payload
        state.geolocation.error = false
      })

      .addCase(detectGeolocation.rejected, (state, action) => {
        state.geolocation.attempted = true
        state.geolocation.data = null
        state.geolocation.error = action.error.message || action.error
      })
  }
})

export const {
  setSignInData,
  clearSignInData,
  setCoilPluginSubscriber,
  updateDisplayName
} = userSlice.actions

export default userSlice.reducer
