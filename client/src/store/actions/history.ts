import { createAsyncThunk } from '@reduxjs/toolkit'

import { formatMessage } from '../../locales/locale.js'
import { isOwnedByCurrentUser } from '../../streets/owner.js'
import { finishUndoOrRedo } from '../../streets/undo_stack.js'
import { redo, undo } from '../slices/history.js'
import { addToast } from '../slices/toasts.js'

import type { Dispatch, RootState } from '../index.js'

// These async thunks remain in a separate module because they import other
// modules with deeply nested dependencies ... some of which will throw
// errors when imported too early (when the reducers and slices are being
// created, during app initialization.
// So we can't define these actions alongside the slice.

export const handleUndo = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: Dispatch }
>('history/handleUndo', async (arg, { dispatch, getState }) => {
  const deltaPosition = getState().history.deltaPosition ?? null

  // Don't allow undo/redo unless you own the street
  if (deltaPosition !== null && deltaPosition > 0 && isOwnedByCurrentUser()) {
    dispatch(undo())
    await finishUndoOrRedo('undo', deltaPosition)
  } else {
    dispatch(
      addToast({
        message: formatMessage('toast.no-undo', 'Nothing to undo.'),
        duration: 4000,
      })
    )
  }
})

export const handleRedo = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: Dispatch }
>('history/handleRedo', async (arg, { dispatch, getState }) => {
  const deltaPosition = getState().history.deltaPosition ?? null
  const deltaStack = getState().history.deltaStack
  const deltas = deltaStack ?? []

  // Don't allow undo/redo unless you own the street
  if (
    deltaPosition !== null &&
    deltaPosition >= 0 &&
    deltaPosition < deltas.length - 1 &&
    isOwnedByCurrentUser()
  ) {
    dispatch(redo())
    await finishUndoOrRedo('redo', deltaPosition)
  } else {
    dispatch(
      addToast({
        message: formatMessage('toast.no-redo', 'Nothing to redo.'),
        duration: 4000,
      })
    )
  }
})
