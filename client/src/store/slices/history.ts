import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Delta } from 'jsondiffpatch'
import type { HistoryState } from '@streetmix/types'

export const MAX_UNDO_LIMIT = 100

const initialState: HistoryState = {
  stack: [],
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
      if (state.position === null) {
        return
      }

      state.position = Math.max(0, (state.position ?? 0) - 1)
    },

    redo(state) {
      if (state.position === null) {
        return
      }

      const stackSize = state.stack.length - 1
      const newPosition = (state.position ?? 0) + 1
      state.position = newPosition > stackSize ? stackSize : newPosition
    },

    resetUndoStack(state) {
      state.stack = []
      state.position = null
    },

    replaceUndoStack(state, action: PayloadAction<HistoryState>) {
      state.stack = action.payload.stack ?? []

      if (state.stack.length === 0) {
        state.position = null
      } else if (action.payload.position === null) {
        state.position = state.stack.length - 1
      } else {
        state.position = Math.min(
          Math.max(action.payload.position ?? 0, 0),
          state.stack.length - 1
        )
      }
    },

    createNewUndoDelta(state, action: PayloadAction<Delta>) {
      const retainedLength =
        state.position === null ? 0 : (state.position ?? 0) + 1
      let stack = state.stack.slice(0, retainedLength)

      stack.push(action.payload)
      stack = trimHistoryStack(stack)

      state.stack = stack
      state.position = stack.length > 0 ? stack.length - 1 : null
    },
  },
})

export const {
  undo,
  redo,
  resetUndoStack,
  replaceUndoStack,
  createNewUndoDelta,
} = undoSlice.actions

export default undoSlice.reducer
