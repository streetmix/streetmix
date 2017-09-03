import {
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  REPLACE_SEGMENTS,
  CHANGE_SEGMENT_WIDTH
} from '../actions'

const initialState = {
  segments: []
}

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
        segments: [
          ...state.segments.slice(0, action.index),
          ...state.segments.slice(action.index + 1)
        ]
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
    case REPLACE_SEGMENTS:
      return {
        ...state,
        segments: action.segments
      }
    case CHANGE_SEGMENT_WIDTH: {
      const copy = state.segments.slice()
      copy[action.index].width = action.width
      return {
        ...state,
        segments: copy
      }
    }
    default:
      return state
  }
}

export default street
