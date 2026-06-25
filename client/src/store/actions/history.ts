import { createAsyncThunk } from '@reduxjs/toolkit'

import { formatMessage } from '../../locales/locale.js'
import {
  finishUndoOrRedo,
  isRedoAvailable,
  isUndoAvailable,
} from '../../streets/undo_stack.js'
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
  const state = getState()
  const { position } = state.history

  if (isUndoAvailable(state)) {
    dispatch(undo())
    await finishUndoOrRedo('undo', position)
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
  const state = getState()
  const { position } = state.history

  if (isRedoAvailable(state)) {
    dispatch(redo())
    await finishUndoOrRedo('redo', position)
  } else {
    dispatch(
      addToast({
        message: formatMessage('toast.no-redo', 'Nothing to redo.'),
        duration: 4000,
      })
    )
  }
})
