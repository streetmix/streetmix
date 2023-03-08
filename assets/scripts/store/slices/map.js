import { createSlice } from '@reduxjs/toolkit'
import { clearLocation } from './street'

const initialState = {
  markerLocation: null,
  addressInformation: {},
  rawInputString: null
}

const mapSlice = createSlice({
  name: 'map',
  initialState,

  reducers: {
    setMapState (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },

    resetMapState (state, action) {
      return initialState
    }
  },

  extraReducers: (builder) => {
    // If location is cleared from the street, also reset map state.
    builder.addCase(clearLocation, (state) => initialState)
  }
})

export const { setMapState, resetMapState } = mapSlice.actions

export default mapSlice.reducer
