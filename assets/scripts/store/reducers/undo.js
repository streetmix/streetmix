import {
  CLEAR_UNDO_STACK,
  REPLACE_UNDO_STACK,
  UNDO,
  REDO
} from '../actions'

const initialState = {
  stack: [],
  position: -1,
  ignoreChanges: false
}

const undo = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_UNDO_STACK:
      return {
        ...state,
        stack: []
      }
    case REPLACE_UNDO_STACK:
      return {
        ...state,
        stack: action.stack
      }
    case UNDO: {
      const newPosition = (state.position - 1)
      return {
        ...state,
        position: (newPosition < 0) ? 0 : newPosition
      }
    }
    case REDO: {
      const newPosition = (state.position + 1)
      const stackSize = (state.stack.length - 1)
      return {
        ...state,
        position: (newPosition > stackSize) ? stackSize : newPosition
      }
    }
    default:
      return state
  }
}

export default undo
