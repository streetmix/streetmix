import { createSlice } from '@reduxjs/toolkit'
import { getSegmentInfo, getSegmentVariantInfo } from '@streetmix/parts'

import { getElevationValue } from '~/src/segments/elevation'
import { getVariantString } from '~/src/segments/variant_utils'
import { DEFAULT_SKYBOX } from '~/src/sky/constants'
import { MAX_BUILDING_HEIGHT } from '~/src/segments/constants'
import { SETTINGS_UNITS_METRIC } from '~/src/users/constants'

import type {
  BoundaryPosition,
  Segment,
  StreetState,
  WeatherEffect,
} from '@streetmix/types'
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState: StreetState = {
  id: '',
  namespacedId: 0,
  schemaVersion: 0,
  units: SETTINGS_UNITS_METRIC,
  width: 0,
  name: null,
  segments: [],
  boundary: {
    left: {
      id: '',
      variant: '',
      floors: 0,
      elevation: 0,
    },
    right: {
      id: '',
      variant: '',
      floors: 0,
      elevation: 0,
    },
  },
  skybox: DEFAULT_SKYBOX,
  weather: null,
  location: null,
  showAnalytics: false,
  occupiedWidth: 0,
  remainingWidth: 0,
  creatorId: null,
  userUpdated: false,
  editCount: 0,
  immediateRemoval: true,
}

const streetSlice = createSlice({
  name: 'street',
  initialState,

  reducers: {
    // This completely replaces arbitrary street data. The other actions below
    // are much more surgical and should be used instead of this one for small
    // updates. Use this one if you need to batch multiple actions into one.
    updateStreetData(state, action: PayloadAction<StreetState>) {
      return {
        ...state,
        ...action.payload,
        immediateRemoval: true,
      }
    },

    addSegment: {
      reducer(
        state,
        action: PayloadAction<{ index: number; segment: Segment }>
      ) {
        const { index, segment } = action.payload
        state.segments.splice(index, 0, segment)
      },
      prepare(index: number, segment: Segment) {
        return {
          payload: { index, segment },
        }
      },
    },

    removeSegment: {
      reducer(
        state,
        action: PayloadAction<{ index: number; immediate: boolean }>
      ) {
        const { index, immediate } = action.payload
        state.segments.splice(index, 1)
        state.immediateRemoval = immediate
      },
      prepare(index: number, immediate = true) {
        return {
          payload: { index, immediate },
        }
      },
    },

    moveSegment: {
      reducer(
        state,
        action: PayloadAction<{
          fromIndex: number
          toIndex: number
          update: Partial<Segment>
        }>
      ) {
        const { fromIndex, toIndex, update } = action.payload
        // `update` is an optional partial SliceItem / Segment object
        // so while moving, we can apply any changes to the slice
        const segment = {
          ...state.segments[fromIndex],
          ...update,
        }
        state.segments.splice(fromIndex, 1)
        state.segments.splice(toIndex, 0, segment)
      },
      prepare(
        fromIndex: number,
        toIndex: number,
        update: Partial<Segment> = {}
      ) {
        return {
          payload: { fromIndex, toIndex, update },
        }
      },
    },

    updateShowAnalytics(state, action) {
      state.showAnalytics = action.payload
    },

    updateCapacitySource(state, action) {
      state.capacitySource = action.payload
    },

    updateSegments: {
      reducer(
        state,
        action: PayloadAction<{
          segments: Segment[]
          occupiedWidth: number
          remainingWidth: number
        }>
      ) {
        const { segments, occupiedWidth, remainingWidth } = action.payload

        state.segments = segments
        state.occupiedWidth = occupiedWidth
        state.remainingWidth = remainingWidth
      },
      prepare(
        segments: Segment[],
        occupiedWidth: number,
        remainingWidth: number
      ) {
        return {
          payload: { segments, occupiedWidth, remainingWidth },
        }
      },
    },

    clearSegments(state) {
      state.segments = []
      state.immediateRemoval = true
    },

    changeSegmentWidth: {
      reducer(state, action: PayloadAction<{ index: number; width: number }>) {
        const { index, width } = action.payload
        state.segments[index].width = width
      },
      prepare(index: number, width: number) {
        return {
          payload: { index, width },
        }
      },
    },

    changeSegmentVariant: {
      reducer(
        state,
        action: PayloadAction<{ index: number; set: string; selection: string }>
      ) {
        const { index, set, selection } = action.payload

        const segment: Segment = state.segments[index]

        // Monkey-patch
        // Address a situation where the .variant property may not
        // exist. Ideally, it should always be present and be an
        // object. If it doesn't exist, create an empty object now.
        // TODO: Guarantee that segment always the `variant` property
        // and remove this.
        segment.variant = segment.variant ?? {}

        segment.variant[set] = selection
        segment.variantString = getVariantString(segment.variant)

        // When an element is changed, we also need to set the segment's
        // elevation from the new variant information. Sometimes a
        // variant has different elevations, see "divider" type for example
        // NOTE: skip this if `enableElevation` is on
        // also skip this if segment elevation has been manually set
        const segmentInfo = getSegmentInfo(segment.type)
        const variantInfo = getSegmentVariantInfo(
          segment.type,
          segment.variantString
        )
        if (
          segmentInfo.enableElevation !== true &&
          segment.elevationChanged !== true
        ) {
          segment.elevation = getElevationValue(
            variantInfo.elevation,
            state.units
          )
        }
      },
      prepare(index: number, set: string, selection: string) {
        return {
          payload: { index, set, selection },
        }
      },
    },

    toggleSliceSlope: {
      reducer(state, action: PayloadAction<{ index: number; value: boolean }>) {
        const { index, value } = action.payload
        const slice = state.segments[index]

        slice.slope.on = value
      },
      prepare(index: number, value: boolean) {
        return {
          payload: { index, value },
        }
      },
    },

    changeSegmentProperties: {
      reducer(
        state,
        action: PayloadAction<{ index: number; properties: Partial<Segment> }>
      ) {
        const { index, properties } = action.payload
        Object.assign(state.segments[index], properties)
      },
      prepare(index: number, properties: Partial<Segment>) {
        return {
          payload: { index, properties },
        }
      },
    },

    saveStreetName: {
      reducer(
        state,
        action: PayloadAction<{
          streetName: string | null
          userUpdated: boolean
        }>
      ) {
        const { streetName, userUpdated } = action.payload

        if ((state.userUpdated && userUpdated) || !state.userUpdated) {
          if (typeof streetName === 'string') {
            // Normalize street name input
            // TODO: Consider whether to limit street name length here
            state.name = streetName.trim()

            if (userUpdated) {
              state.userUpdated = true
            }

            // If a streetname is an empty string, unset it
            // Also reset userUpdated state
            if (streetName === '') {
              state.name = null
              state.userUpdated = false
            }
          } else {
            // If a streetname is null, unset it
            // Also reset userUpdated state
            state.name = null
            state.userUpdated = false
          }
        }
      },
      prepare(streetName: string | null, userUpdated: boolean) {
        return {
          payload: { streetName, userUpdated },
        }
      },
    },

    saveCreatorId(state, action) {
      state.creatorId = action.payload
    },

    saveStreetId: {
      reducer(
        state,
        action: PayloadAction<{ id: string | null; namespacedId: number }>
      ) {
        const { id, namespacedId } = action.payload

        // Why is this not always present?
        if (id) {
          state.id = id
        }

        state.namespacedId = namespacedId
      },
      prepare(id: string | null, namespacedId: number) {
        return {
          payload: { id, namespacedId },
        }
      },
    },

    updateStreetIdMetadata(state, action) {
      const { creatorId, id, namespacedId } = action.payload
      state.creatorId = creatorId
      state.id = id
      state.namespacedId = namespacedId
    },

    // TODO: validate time (payload) is a string matching ISO string format
    setUpdateTime(state, action) {
      state.updatedAt = action.payload
      state.clientUpdatedAt = action.payload
    },

    saveOriginalStreetId(state, action) {
      state.originalStreetId = action.payload
    },

    updateEditCount(state, action) {
      state.editCount = action.payload
    },

    setUnits(state, action) {
      state.units = action.payload
    },

    updateStreetWidth(state, action) {
      state.width = action.payload
    },

    updateSchemaVersion(state, action) {
      state.schemaVersion = action.payload
    },

    addLocation(state, action) {
      state.location = action.payload
    },

    clearLocation(state) {
      state.location = null

      // If the street name was added as a result of geotagging, but not
      // updated by the user, then clearing the location also resets the
      // street name
      if (!state.userUpdated) {
        state.name = null
      }
    },

    setBoundaryElevation: {
      reducer(
        state,
        action: PayloadAction<{ position: BoundaryPosition; value: number }>
      ) {
        const { position, value } = action.payload

        if (typeof value !== 'number' || Number.isNaN(value)) {
          return
        }
        switch (position) {
          case 'left':
            state.boundary.left.elevation = value
            break
          case 'right':
            state.boundary.right.elevation = value
            break
        }
      },
      prepare(position: BoundaryPosition, value: number) {
        return {
          payload: { position, value },
        }
      },
    },

    // TODO: Buildings could be a child slice?
    addBuildingFloor(state, action: PayloadAction<BoundaryPosition>) {
      const position = action.payload

      switch (position) {
        case 'left':
          state.boundary.left.floors = Math.min(
            state.boundary.left.floors + 1,
            MAX_BUILDING_HEIGHT
          )
          break
        case 'right':
          state.boundary.right.floors = Math.min(
            state.boundary.right.floors + 1,
            MAX_BUILDING_HEIGHT
          )
          break
      }
    },

    removeBuildingFloor(state, action: PayloadAction<BoundaryPosition>) {
      const position = action.payload

      switch (position) {
        case 'left':
          state.boundary.left.floors = Math.max(
            state.boundary.left.floors - 1,
            1
          )
          break
        case 'right':
          state.boundary.right.floors = Math.max(
            state.boundary.right.floors - 1,
            1
          )
          break
      }
    },

    setBuildingFloorValue: {
      reducer(
        state,
        action: PayloadAction<{ position: BoundaryPosition; value: string }>
      ) {
        const value = Number.parseInt(action.payload.value, 10)
        if (Number.isNaN(value)) return

        const { position } = action.payload

        switch (position) {
          case 'left':
            state.boundary.left.floors = Math.min(
              Math.max(value, 1),
              MAX_BUILDING_HEIGHT
            )
            break
          case 'right':
            state.boundary.right.floors = Math.min(
              Math.max(value, 1),
              MAX_BUILDING_HEIGHT
            )
            break
        }
      },
      prepare(position: BoundaryPosition, value: string) {
        return {
          payload: { position, value },
        }
      },
    },

    setBuildingVariant: {
      reducer(
        state,
        action: PayloadAction<{ position: BoundaryPosition; variant: string }>
      ) {
        const { position, variant } = action.payload

        if (!variant) return

        switch (position) {
          case 'left':
            state.boundary.left.variant = variant
            break
          case 'right':
            state.boundary.right.variant = variant
            break
        }
      },
      prepare(position: BoundaryPosition, variant: string) {
        return {
          payload: { position, variant },
        }
      },
    },

    setSkybox(state, action) {
      state.skybox = action.payload
    },

    setWeather(state, action: PayloadAction<WeatherEffect | null>) {
      state.weather = action.payload
    },
  },
})

export const {
  updateStreetData,
  addSegment,
  removeSegment,
  moveSegment,
  updateSegments,
  updateShowAnalytics,
  updateCapacitySource,
  clearSegments,
  changeSegmentWidth,
  changeSegmentVariant,
  toggleSliceSlope,
  changeSegmentProperties,
  saveStreetName,
  saveCreatorId,
  saveStreetId,
  updateStreetIdMetadata,
  setUpdateTime,
  saveOriginalStreetId,
  updateEditCount,
  setUnits,
  updateStreetWidth,
  updateSchemaVersion,
  addLocation,
  clearLocation,
  setBoundaryElevation,
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue,
  setBuildingVariant,
  setSkybox,
  setWeather,
} = streetSlice.actions

export default streetSlice.reducer
