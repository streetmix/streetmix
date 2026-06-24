import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { HistoryState, StreetState } from '@streetmix/types'

type HistoryDeltaEntry = {
  forwardDelta: unknown
  reverseDelta: unknown
}

export const MAX_UNDO_LIMIT = 100

const initialState: HistoryState = {
  stack: [],
  position: null,
  deltaStack: [],
  deltaPosition: null,
}

/**
 * If undoStack is higher than limit, trim earliest entries so that stack is
 * within the undo limit.
 */
function trimUndoStack(
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
function unifyUndoStack(
  undoStack: HistoryState['stack'],
  street: Partial<StreetState>
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
    undo(state) {
      if (state.position === null) {
        return
      }

      state.position = Math.max(0, state.position - 1)

      if (state.deltaPosition !== null) {
        state.deltaPosition = Math.max(0, state.deltaPosition - 1)
      }
    },

    redo(state) {
      if (state.position === null) {
        return
      }

      const newPosition = state.position + 1
      const stackSize = state.stack.length - 1

      state.position = newPosition > stackSize ? stackSize : newPosition

      if (state.deltaPosition !== null) {
        const deltaStackSize = (state.deltaStack ?? []).length - 1
        const newDeltaPosition = state.deltaPosition + 1
        state.deltaPosition =
          newDeltaPosition > deltaStackSize ? deltaStackSize : newDeltaPosition
      }
    },

    resetUndoStack(state) {
      state.stack = []
      state.position = null
      state.deltaStack = []
      state.deltaPosition = null
    },

    replaceUndoStack(state, action: PayloadAction<HistoryState>) {
      state.stack = action.payload.stack
      state.deltaStack = action.payload.deltaStack ?? []

      // Make sure given position is set to a value within stack length,
      // and use `null` for an empty stack.
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

      if ((state.deltaStack ?? []).length === 0) {
        state.deltaPosition = null
      } else if (action.payload.deltaPosition === null) {
        state.deltaPosition = (state.deltaStack ?? []).length - 1
      } else {
        state.deltaPosition = Math.min(
          Math.max(action.payload.deltaPosition ?? 0, 0),
          (state.deltaStack ?? []).length - 1
        )
      }
    },

    createNewUndo(state, action: PayloadAction<Partial<StreetState>>) {
      // Keep history up to and including the current item, dropping any
      // redo branch when a new snapshot is recorded after undo.
      const retainedLength = state.position === null ? 0 : state.position + 1
      let stack = state.stack.slice(0, retainedLength)

      // Add the latest state
      const street = action.payload
      stack.push({ ...street })

      // Post-process stack data
      stack = trimUndoStack(stack)
      stack = unifyUndoStack(stack, street)

      // Update
      state.stack = stack
      state.position = stack.length > 0 ? stack.length - 1 : null
    },

    createNewUndoDelta(state, action: PayloadAction<HistoryDeltaEntry>) {
      const retainedLength =
        state.deltaPosition === null ? 0 : state.deltaPosition + 1
      let deltaStack = (state.deltaStack ?? []).slice(0, retainedLength)

      deltaStack.push(action.payload)
      deltaStack = trimUndoStack(deltaStack)

      state.deltaStack = deltaStack
      state.deltaPosition = deltaStack.length > 0 ? deltaStack.length - 1 : null
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
    unifyStack(state, action: PayloadAction<Partial<StreetState>>) {
      state.stack = unifyUndoStack(state.stack, action.payload)
    },
  },
})

export const {
  undo,
  redo,
  resetUndoStack,
  replaceUndoStack,
  createNewUndo,
  createNewUndoDelta,
  unifyStack,
} = undoSlice.actions

export default undoSlice.reducer
