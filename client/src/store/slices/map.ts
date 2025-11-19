import { createSlice } from '@reduxjs/toolkit'

import { clearLocation } from './street'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { LatLngObject } from '@streetmix/types'
import type { GeoJsonProperties } from 'geojson'

interface MapState {
  markerLocation: LatLngObject | null
  // This value stores GeoJSON properties from geocode.earth's response
  // https://geocode.earth/docs/reference/response_format/
  // It is not explicitly typed.
  addressInformation: GeoJsonProperties
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
