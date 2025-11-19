import { createSlice } from '@reduxjs/toolkit'

import { clearLocation } from './street'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { LatLngObject } from '@streetmix/types'

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
  rawInputString: null,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,

  reducers: {
    setMapState(state, action: PayloadAction<Partial<MapState>>) {
      return {
        ...state,
        ...action.payload,
      }
    },

    resetMapState(_state) {
      return initialState
    },
  },

  extraReducers: (builder) => {
    // If location is cleared from the street, also reset map state.
    builder.addCase(clearLocation, () => initialState)
  },
})

export const { setMapState, resetMapState } = mapSlice.actions

export default mapSlice.reducer
