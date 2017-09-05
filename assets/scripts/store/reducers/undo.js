import {
  CLEAR_UNDO_STACK,
  REPLACE_UNDO_STACK,
  CREATE_NEW_UNDO,
  UNDO,
  REDO,
  SET_UNDO_POSITION,
  UNIFY_UNDO_STACK
} from '../actions'

export const MAX_UNDO_LIMIT = 100

function createNewUndo (state, street) {
  const position = state.position

  // This removes future undo path in case we undo a few times and then do
  // something undoable.
  let stack = state.stack.slice(0, position + 1)

  stack.push(Object.assign({}, street))
  stack = trimUndoStack(stack)
  stack = unifyUndoStack(stack, street)

  return stack
}

/**
 * If undoStack is higher than limit, trim earliest entries so that stack is
 * within the undo limit.
 */
function trimUndoStack (undoStack) {
  const diff = undoStack.length - MAX_UNDO_LIMIT
  if (diff > 0) {
    return undoStack.slice(diff)
  } else {
    return undoStack
  }
}

/**
 * Each item in the stack should share the same meta data.
 *
 * @todo maybe we shouldn't keep repeated info in the stack, but each item
 *          in the stack are currently just street data objects
 * @param {Array} undoStack - the undo stack to unify
 * @param {Object} street - the street containing properties that should be
 *          copied to all other streets in the stack
 */
function unifyUndoStack (undoStack, street) {
  return undoStack.map((item) => {
    item.id = street.id
    item.name = street.name
    item.namespacedId = street.namespacedId
    item.creatorId = street.creatorId
    item.updatedAt = street.updatedAt
    return item
  })
}

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
    case CREATE_NEW_UNDO: {
      const stack = createNewUndo(state, action.street)
      return {
        ...state,
        stack,
        position: stack.length - 1
      }
    }
    case UNIFY_UNDO_STACK: {
      const stack = state.stack.slice()
      return {
        ...state,
        stack: unifyUndoStack(stack, action.street)
      }
    }
    case UNDO: {
      const newPosition = (state.position - 1)
      return {
        ...state,
        stack: [
          ...state.stack.slice(0, state.position),
          action.street,
          ...state.stack.slice(state.position + 1)
        ],
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
    case SET_UNDO_POSITION:
      return {
        ...state,
        position: action.position
      }
    default:
      return state
  }
}

export default undo
