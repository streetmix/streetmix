import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Street } from '@streetmix/types'

interface HistoryState {
  stack: Street[]
  position: number
}

export const MAX_UNDO_LIMIT = 100

const initialState: HistoryState = {
  stack: [],
  position: 0
}

/**
 * If undoStack is higher than limit, trim earliest entries so that stack is
 * within the undo limit.
 */
function trimUndoStack (
  undoStack: HistoryState['stack']
): HistoryState['stack'] {
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
function unifyUndoStack (
  undoStack: HistoryState['stack'],
  street: Street
): HistoryState['stack'] {
  return undoStack.map((item) => {
    item.id = street.id
    item.name = street.name
    item.namespacedId = street.namespacedId
    item.creatorId = street.creatorId
    item.updatedAt = street.updatedAt
    return item
  })
}

const undoSlice = createSlice({
  name: 'undo',
  initialState,

  reducers: {
    undo (state, action: PayloadAction<Street>) {
      const newPosition = state.position - 1

      state.stack[state.position] = action.payload
      state.position = newPosition < 0 ? 0 : newPosition
    },

    redo (state, action) {
      const newPosition = state.position + 1
      const stackSize = state.stack.length - 1

      state.position = newPosition > stackSize ? stackSize : newPosition
    },

    resetUndoStack (state, action) {
      state.stack = []
      state.position = 0
    },

    replaceUndoStack (state, action: PayloadAction<HistoryState>) {
      state.stack = action.payload.stack

      // Make sure given position is set to a value within stack length
      state.position = Math.min(
        action.payload.position,
        action.payload.stack.length - 1
      )
    },

    createNewUndo (state, action: PayloadAction<Street>) {
      const position = state.position

      // Create a shallow copy of the original undo stack up to the current
      // current position. This removes future undo path in case we undo a
      // few times and then do something undoable.
      let stack = state.stack.slice(0, position)

      // Add the latest state
      const street = action.payload
      stack.push({ ...street })

      // Post-process stack data
      stack = trimUndoStack(stack)
      stack = unifyUndoStack(stack, street)

      // Update
      state.stack = stack
      state.position = Math.min(position, MAX_UNDO_LIMIT) + 1
    },

    /**
     * Sometimes street metadata is updated and we need to update the undo
     * stack data to match the street metadata. There are better ways of doing
     * this. One way is to make the undo stack listen for dispatches to update
     * streets and then automatically unify the undo stack in response, instead
     * of needing code to manually "remember" to dispatch this action. Another
     * way to do this is to refactor our undo stack behavior to be a sequence
     * of change objects, rather than copies of street state, which means we
     * don't need to maintain consistent metadata at each level of the stack.
     * (This is our preferred option.)
     */
    unifyStack (state, action: PayloadAction<Street>) {
      state.stack = unifyUndoStack(state.stack, action.payload)
    }
  }
})

export const {
  undo,
  redo,
  resetUndoStack,
  replaceUndoStack,
  createNewUndo,
  unifyStack
} = undoSlice.actions

export default undoSlice.reducer
