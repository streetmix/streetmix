import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { HistoryState } from '@streetmix/types'

type HistoryDeltaEntry = {
  forwardDelta: unknown
  reverseDelta: unknown
}

export const MAX_UNDO_LIMIT = 100

const initialState: HistoryState = {
  deltaStack: [],
  deltaPosition: null,
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
      if (state.deltaPosition === null) {
        return
      }

      state.deltaPosition = Math.max(0, (state.deltaPosition ?? 0) - 1)
    },

    redo(state) {
      if (state.deltaPosition === null) {
        return
      }

      const deltaStackSize = state.deltaStack.length - 1
      const newDeltaPosition = (state.deltaPosition ?? 0) + 1
      state.deltaPosition =
        newDeltaPosition > deltaStackSize ? deltaStackSize : newDeltaPosition
    },

    resetUndoStack(state) {
      state.deltaStack = []
      state.deltaPosition = null
    },

    replaceUndoStack(state, action: PayloadAction<HistoryState>) {
      state.deltaStack = action.payload.deltaStack ?? []

      if (state.deltaStack.length === 0) {
        state.deltaPosition = null
      } else if (action.payload.deltaPosition === null) {
        state.deltaPosition = state.deltaStack.length - 1
      } else {
        state.deltaPosition = Math.min(
          Math.max(action.payload.deltaPosition ?? 0, 0),
          state.deltaStack.length - 1
        )
      }
    },

    createNewUndoDelta(state, action: PayloadAction<HistoryDeltaEntry>) {
      const retainedLength =
        state.deltaPosition === null ? 0 : (state.deltaPosition ?? 0) + 1
      let deltaStack = state.deltaStack.slice(0, retainedLength)

      deltaStack.push(action.payload)
      deltaStack = trimHistoryStack(deltaStack)

      state.deltaStack = deltaStack
      state.deltaPosition = deltaStack.length > 0 ? deltaStack.length - 1 : null
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
