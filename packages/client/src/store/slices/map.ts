import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { LatLngObject } from '@streetmix/types'
import { clearLocation } from './street'

interface MapState {
  markerLocation: LatLngObject | null
  // See here for example response format (should we type it?)
  // https://geocode.earth/docs/reference/response_format/
  addressInformation: object
  rawInputString: string | null
}

const initialState: MapState = {
  markerLocation: null,
  addressInformation: {},
  rawInputString: null
}

const mapSlice = createSlice({
  name: 'map',
  initialState,

  reducers: {
    setMapState (state, action: PayloadAction<MapState>) {
      return {
        ...state,
        ...action.payload
      }
    },

    resetMapState () {
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
