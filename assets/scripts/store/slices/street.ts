import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { getVariantString } from '../../segments/variant_utils'
import { DEFAULT_SKYBOX } from '../../sky/constants'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../../segments/constants'
import { getSegmentInfo, getSegmentVariantInfo } from '../../segments/info'
import type { Segment, StreetLocation } from '@streetmix/types'

// TODO: many of these values were "optional" but it might be worthwhile to
// convert most of them to values that cannot be "undefined" to make it easier
// to work with as more TypeScript is adopted.
interface StreetState {
  segments: Segment[]
  remainingWidth: number
  skybox: string
  immediateRemoval: boolean
  creatorId?: string | null
  namespacedId?: number
  schemaVersion?: number
  showAnalytics?: boolean
  width?: number
  id?: string // UUID
  units?: number // Enum
  location?: StreetLocation | null
  userUpdated: boolean
  leftBuildingHeight: number
  rightBuildingHeight: number
  leftBuildingVariant?: string
  rightBuildingVariant?: string
  editCount: number
  originalStreetId?: string | null // UUID, if set
  updatedAt?: string // Datetime string
  clientUpdatedAt?: string // Datetime string
  name?: string | null
  occupiedWidth?: number
  capacitySource?: string
}

const initialState: StreetState = {
  segments: [],
  remainingWidth: 0,
  skybox: DEFAULT_SKYBOX,
  userUpdated: false,
  leftBuildingHeight: 0,
  rightBuildingHeight: 0,
  immediateRemoval: true,
  editCount: 0
}

const streetSlice = createSlice({
  name: 'street',
  initialState,

  reducers: {
    // This completely replaces arbitrary street data. The other actions below
    // are much more surgical and should be used instead of this one for small
    // updates. Use this one if you need to batch multiple actions into one.
    updateStreetData (state, action: PayloadAction<StreetState>) {
      return {
        ...state,
        ...action.payload,
        immediateRemoval: true
      }
    },

    addSegment: {
      reducer (
        state,
        action: PayloadAction<{ index: number, segment: Segment }>
      ) {
        const { index, segment } = action.payload
        state.segments.splice(index, 0, segment)
      },
      prepare (index: number, segment: Segment) {
        return {
          payload: { index, segment }
        }
      }
    },

    removeSegment: {
      reducer (
        state,
        action: PayloadAction<{ index: number, immediate: boolean }>
      ) {
        const { index, immediate } = action.payload
        state.segments.splice(index, 1)
        state.immediateRemoval = immediate
      },
      prepare (index: number, immediate = true) {
        return {
          payload: { index, immediate }
        }
      }
    },

    moveSegment: {
      reducer (
        state,
        action: PayloadAction<{ fromIndex: number, toIndex: number }>
      ) {
        const { fromIndex, toIndex } = action.payload
        const segment = state.segments[fromIndex]
        state.segments.splice(fromIndex, 1)
        state.segments.splice(toIndex, 0, segment)
      },
      prepare (fromIndex: number, toIndex: number) {
        return {
          payload: { fromIndex, toIndex }
        }
      }
    },

    updateShowAnalytics (state, action) {
      state.showAnalytics = action.payload
    },

    updateCapacitySource (state, action) {
      state.capacitySource = action.payload
    },

    updateSegments: {
      reducer (
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
      prepare (
        segments: Segment[],
        occupiedWidth: number,
        remainingWidth: number
      ) {
        return {
          payload: { segments, occupiedWidth, remainingWidth }
        }
      }
    },

    clearSegments (state, action) {
      state.segments = []
      state.immediateRemoval = true
    },

    changeSegmentWidth: {
      reducer (state, action: PayloadAction<{ index: number, width: number }>) {
        const { index, width } = action.payload
        state.segments[index].width = width
      },
      prepare (index: number, width: number) {
        return {
          payload: { index, width }
        }
      }
    },

    changeSegmentVariant: {
      reducer (
        state,
        action: PayloadAction<{ index: number, set: string, selection: string }>
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
        const segmentInfo = getSegmentInfo(segment.type)
        const variantInfo = getSegmentVariantInfo(
          segment.type,
          segment.variantString
        )
        if (segmentInfo.enableElevation !== true) {
          segment.elevation = variantInfo.elevation
        }
      },
      prepare (index: number, set: string, selection: string) {
        return {
          payload: { index, set, selection }
        }
      }
    },

    changeSegmentProperties: {
      reducer (
        state,
        action: PayloadAction<{ index: number, properties: Partial<Segment> }>
      ) {
        const { index, properties } = action.payload
        Object.assign(state.segments[index], properties)
      },
      prepare (index: number, properties: Partial<Segment>) {
        return {
          payload: { index, properties }
        }
      }
    },

    saveStreetName: {
      reducer (
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
          } else {
            // If a streetname is null, unset it
            state.name = null
          }
        }

        if (userUpdated) {
          state.userUpdated = true
        }
      },
      prepare (streetName: string | null, userUpdated: boolean) {
        return {
          payload: { streetName, userUpdated }
        }
      }
    },

    saveCreatorId (state, action) {
      state.creatorId = action.payload
    },

    saveStreetId: {
      reducer (
        state,
        action: PayloadAction<{ id: string, namespacedId: number }>
      ) {
        const { id, namespacedId } = action.payload

        // Why is this not always present?
        if (id) {
          state.id = id
        }

        state.namespacedId = namespacedId
      },
      prepare (id: string, namespacedId: number) {
        return {
          payload: { id, namespacedId }
        }
      }
    },

    updateStreetIdMetadata (state, action) {
      const { creatorId, id, namespacedId } = action.payload
      state.creatorId = creatorId
      state.id = id
      state.namespacedId = namespacedId
    },

    // TODO: validate time (payload) is a string matching ISO string format
    setUpdateTime (state, action) {
      state.updatedAt = action.payload
      state.clientUpdatedAt = action.payload
    },

    saveOriginalStreetId (state, action) {
      state.originalStreetId = action.payload
    },

    updateEditCount (state, action) {
      state.editCount = action.payload
    },

    setUnits (state, action) {
      state.units = action.payload
    },

    updateStreetWidth (state, action) {
      state.width = action.payload
    },

    updateSchemaVersion (state, action) {
      state.schemaVersion = action.payload
    },

    addLocation (state, action) {
      state.location = action.payload
    },

    clearLocation (state, action) {
      state.location = null

      // If the street name was added as a result of geotagging, but not
      // updated by the user, then clearing the location also resets the
      // street name
      if (!state.userUpdated) {
        state.name = null
      }
    },

    // TODO: Buildings could be a child slice?
    addBuildingFloor (state, action) {
      const position = action.payload

      switch (position) {
        case BUILDING_LEFT_POSITION:
          state.leftBuildingHeight = Math.min(
            state.leftBuildingHeight + 1,
            MAX_BUILDING_HEIGHT
          )
          break
        case BUILDING_RIGHT_POSITION:
          state.rightBuildingHeight = Math.min(
            state.rightBuildingHeight + 1,
            MAX_BUILDING_HEIGHT
          )
          break
        default:
          break
      }
    },

    removeBuildingFloor (state, action) {
      const position = action.payload

      switch (position) {
        case BUILDING_LEFT_POSITION:
          state.leftBuildingHeight = Math.max(state.leftBuildingHeight - 1, 1)
          break
        case BUILDING_RIGHT_POSITION:
          state.rightBuildingHeight = Math.max(state.rightBuildingHeight - 1, 1)
          break
        default:
          break
      }
    },

    setBuildingFloorValue: {
      reducer (
        state,
        action: PayloadAction<{ position: string, value: string }>
      ) {
        const value = Number.parseInt(action.payload.value, 10)
        if (Number.isNaN(value)) return

        const { position } = action.payload

        switch (position) {
          case BUILDING_LEFT_POSITION:
            state.leftBuildingHeight = Math.min(
              Math.max(value, 1),
              MAX_BUILDING_HEIGHT
            )
            break
          case BUILDING_RIGHT_POSITION:
            state.rightBuildingHeight = Math.min(
              Math.max(value, 1),
              MAX_BUILDING_HEIGHT
            )
            break
          default:
            break
        }
      },
      prepare (position: string, value: string) {
        return {
          payload: { position, value }
        }
      }
    },

    setBuildingVariant: {
      reducer (
        state,
        action: PayloadAction<{ position: string, variant: string }>
      ) {
        const { position, variant } = action.payload

        if (!variant) return

        switch (position) {
          case BUILDING_LEFT_POSITION:
            state.leftBuildingVariant = variant
            break
          case BUILDING_RIGHT_POSITION:
            state.rightBuildingVariant = variant
            break
          default:
            break
        }
      },
      prepare (position: string, variant: string) {
        return {
          payload: { position, variant }
        }
      }
    },

    setSkybox (state, action) {
      state.skybox = action.payload
    }
  }
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
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue,
  setBuildingVariant,
  setSkybox
} = streetSlice.actions

export default streetSlice.reducer
