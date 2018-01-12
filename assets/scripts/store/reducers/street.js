import {
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  REPLACE_STREET_DATA,
  CHANGE_SEGMENT_WIDTH,
  CHANGE_SEGMENT_VARIANT,
  // BUILDINGS
  ADD_BUILDING_FLOOR,
  REMOVE_BUILDING_FLOOR,
  SET_BUILDING_FLOOR_VALUE,
  SET_BUILDING_VARIANT
} from '../actions'
import { getVariantString } from '../../segments/variant_utils'

const initialState = {
  segments: []
}

const MAX_BUILDING_HEIGHT = 20

const street = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SEGMENT:
      return {
        ...state,
        segments: [
          ...state.segments.slice(0, action.index),
          action.segment,
          ...state.segments.slice(action.index)
        ]
      }
    case REMOVE_SEGMENT:
      return {
        ...state,
        segments: state.segments.filter((element, index) => index !== action.index)
      }
    case MOVE_SEGMENT: {
      const toMove = Object.assign({}, state.segments[action.index])
      const temp = [
        ...state.segments.slice(0, action.index),
        ...state.segments.slice(action.index + 1)
      ]
      return {
        ...state,
        segments: [
          ...temp.slice(0, action.newIndex),
          toMove,
          ...temp.slice(action.newIndex)
        ]
      }
    }
    case REPLACE_STREET_DATA:
      return {
        ...state,
        ...action.street
      }
    case CHANGE_SEGMENT_WIDTH: {
      const copy = [...state.segments]
      copy[action.index].width = action.width
      return {
        ...state,
        segments: copy
      }
    }
    case CHANGE_SEGMENT_VARIANT: {
      const copy = [...state.segments]
      copy[action.index].variant[action.set] = action.selection
      copy[action.index].variantString = getVariantString(copy[action.index].variant)

      return {
        ...state,
        segments: copy
      }
    }
    // TODO: Move buildings logic?
    case ADD_BUILDING_FLOOR: {
      switch (action.position) {
        case 'left':
          return {
            ...state,
            leftBuildingHeight: Math.min(state.leftBuildingHeight + 1, MAX_BUILDING_HEIGHT)
          }
        case 'right':
          return {
            ...state,
            rightBuildingHeight: Math.min(state.rightBuildingHeight + 1, MAX_BUILDING_HEIGHT)
          }
        default:
          return state
      }
    }
    case REMOVE_BUILDING_FLOOR: {
      switch (action.position) {
        case 'left':
          return {
            ...state,
            leftBuildingHeight: Math.max(state.leftBuildingHeight - 1, 1)
          }
        case 'right':
          return {
            ...state,
            rightBuildingHeight: Math.max(state.rightBuildingHeight - 1, 1)
          }
        default:
          return state
      }
    }
    case SET_BUILDING_FLOOR_VALUE: {
      const value = Number.parseInt(action.value, 10)
      if (Number.isNaN(value)) return state

      switch (action.position) {
        case 'left':
          return {
            ...state,
            leftBuildingHeight: Math.min(Math.max(value, 1), MAX_BUILDING_HEIGHT)
          }
        case 'right':
          return {
            ...state,
            rightBuildingHeight: Math.min(Math.max(value, 1), MAX_BUILDING_HEIGHT)
          }
        default:
          return state
      }
    }
    case SET_BUILDING_VARIANT: {
      if (!action.variant) return state

      switch (action.position) {
        case 'left':
          return {
            ...state,
            leftBuildingVariant: action.variant
          }
        case 'right':
          return {
            ...state,
            rightBuildingVariant: action.variant
          }
        default:
          return state
      }
    }
    default:
      return state
  }
}

export default street
