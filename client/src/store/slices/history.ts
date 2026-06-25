import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Delta } from 'jsondiffpatch'
import type { HistoryState } from '@streetmix/types'

export const MAX_UNDO_LIMIT = 100

const initialState: HistoryState = {
  stack: [],
  // Position is null when the stack is empty
  // It is a number to reflect where in the stack an undo state currently is.
  // This value can be -1 when undoing all the way to the back of the stack.
  position: null,
}

/**
 * If undoStack is higher than limit, trim earliest entries so that stack is
 * within the undo limit.
 */
function trimHistoryStack<T>(stack: T[]): T[] {
  const diff = stack.length - MAX_UNDO_LIMIT
  if (diff > 0) {
    return stack.slice(diff)
  } else {
    return stack
  }
}

const undoSlice = createSlice({
  name: 'undo',
  initialState,

  reducers: {
    undo(state) {
      // Nothing in the stack, do nothing
      if (state.position === null) {
        return
      }

      state.position = Math.max(-1, state.position - 1)
    },

    redo(state) {
      // Nothing in the stack, do nothing
      if (state.position === null) {
        return
      }

      const stackSize = state.stack.length - 1
      const newPosition = state.position + 1
      state.position = newPosition > stackSize ? stackSize : newPosition
    },

    resetUndoStack(state) {
      state.stack = []
      state.position = null
    },

    replaceUndoStack(state, action: PayloadAction<HistoryState>) {
      state.stack = action.payload.stack

      if (state.stack.length === 0) {
        state.position = null
      } else if (action.payload.position === null) {
        state.position = state.stack.length - 1
      } else {
        state.position = Math.min(
          Math.max(action.payload.position, 0),
          state.stack.length - 1
        )
      }
    },

    createNewUndo(state, action: PayloadAction<Delta>) {
      // If a new undo is created when the position points mid-stack, only
      // keep the history up to this point, and we lose the rest
      const retainedLength =
        state.position === null ? 0 : (state.position ?? 0) + 1
      let stack = state.stack.slice(0, retainedLength)

      // Add the new delta, and keep stack within range
      stack.push(action.payload)
      stack = trimHistoryStack(stack)

      // Update
      state.stack = stack
      state.position = stack.length > 0 ? stack.length - 1 : null
    },
  },
})

export const { undo, redo, resetUndoStack, replaceUndoStack, createNewUndo } =
  undoSlice.actions

export default undoSlice.reducer
