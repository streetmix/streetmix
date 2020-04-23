import { createSlice } from '@reduxjs/toolkit'
import { CLEAR_LOCATION } from '../actions'

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

  extraReducers: {
    // If location is cleared from the street, also reset map state.
    [CLEAR_LOCATION]: (state) => initialState
  }
})

export const { setMapState, resetMapState } = mapSlice.actions

export default mapSlice.reducer
