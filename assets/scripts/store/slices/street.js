import { createSlice } from '@reduxjs/toolkit'
import { getVariantString } from '../../segments/variant_utils'
import { DEFAULT_ENVIRONS } from '../../streets/constants'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../../segments/constants'

const streetSlice = createSlice({
  name: 'street',
  initialState: {
    segments: [],
    environment: DEFAULT_ENVIRONS,
    immediateRemoval: true
  },

  reducers: {
    // This completely replaces arbitrary street data. The other actions below
    // are much more surgical and should be used instead of this one for small
    // updates. Use this one if you need to batch multiple actions into one.
    updateStreetData (state, action) {
      return {
        ...state,
        ...action.payload,
        immediateRemoval: true
      }
    },

    addSegment: {
      reducer (state, action) {
        const { index, segment } = action.payload
        state.segments.splice(index, 0, segment)
      },
      prepare (index, segment) {
        return {
          payload: { index, segment }
        }
      }
    },

    removeSegment: {
      reducer (state, action) {
        const { index, immediate } = action.payload
        state.segments.splice(index, 1)
        state.immediateRemoval = immediate
      },
      prepare (index, immediate = true) {
        return {
          payload: { index, immediate }
        }
      }
    },

    moveSegment: {
      reducer (state, action) {
        const { fromIndex, toIndex } = action.payload
        const segment = state.segments[fromIndex]
        state.segments.splice(fromIndex, 1)
        state.segments.splice(toIndex, 0, segment)
      },
      prepare (fromIndex, toIndex) {
        return {
          payload: { fromIndex, toIndex }
        }
      }
    },

    updateAnalytics (state, action) {
      state.showAnalytics = action.payload
    },
    updateSegments: {
      reducer (state, action) {
        const { segments, occupiedWidth, remainingWidth } = action.payload

        state.segments = segments
        state.occupiedWidth = occupiedWidth
        state.remainingWidth = remainingWidth
      },
      prepare (segments, occupiedWidth, remainingWidth) {
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
      reducer (state, action) {
        const { index, width } = action.payload
        state.segments[index].width = width
      },
      prepare (index, width) {
        return {
          payload: { index, width }
        }
      }
    },

    changeSegmentVariant: {
      reducer (state, action) {
        const { index, set, selection } = action.payload

        // Monkey-patch
        // Address a situation where the .variant property may not
        // exist. Ideally, it should always be present and be an
        // object. If it doesn't exist, create an empty object now.
        // TODO: Guarantee that segment always the `variant` property
        // and remove this.
        state.segments[index].variant = state.segments[index].variant || {}

        state.segments[index].variant[set] = selection
        state.segments[index].variantString = getVariantString(
          state.segments[index].variant
        )
      },
      prepare (index, set, selection) {
        return {
          payload: { index, set, selection }
        }
      }
    },

    changeSegmentProperties: {
      reducer (state, action) {
        const { index, properties } = action.payload
        Object.assign(state.segments[index], properties)
      },
      prepare (index, properties) {
        return {
          payload: { index, properties }
        }
      }
    },

    saveStreetName: {
      reducer (state, action) {
        const { streetName, userUpdated } = action.payload

        if ((state.userUpdated && userUpdated) || !state.userUpdated) {
          // Normalize street name input
          // TODO: Consider whether to limit street name length here
          state.name = streetName.trim()
        }

        if (userUpdated) {
          state.userUpdated = true
        }
      },
      prepare (streetName, userUpdated) {
        return {
          payload: { streetName, userUpdated }
        }
      }
    },

    saveCreatorId (state, action) {
      state.creatorId = action.payload
    },

    saveStreetId: {
      reducer (state, action) {
        const { id, namespacedId } = action.payload

        // Why is this not always present?
        if (id) {
          state.id = id
        }

        state.namespacedId = namespacedId
      },
      prepare (id, namespacedId) {
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
      if (state.userUpdated === false) {
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
      reducer (state, action) {
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
      prepare (position, value) {
        return {
          payload: { position, value }
        }
      }
    },

    setBuildingVariant: {
      reducer (state, action) {
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
      prepare (position, variant) {
        return {
          payload: { position, variant }
        }
      }
    },

    setEnvironment (state, action) {
      state.environment = action.payload
    }
  }
})

export const {
  updateStreetData,
  addSegment,
  removeSegment,
  moveSegment,
  updateSegments,
  updateAnalytics,
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
  setEnvironment
} = streetSlice.actions

export default streetSlice.reducer
