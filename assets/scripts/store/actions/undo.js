import { createAsyncThunk } from '@reduxjs/toolkit'
import { undo, redo } from '../slices/undo'
import { addToast } from '../slices/toasts'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { finishUndoOrRedo } from '../../streets/undo_stack'
import { trimStreetData } from '../../streets/data_model'
import { formatMessage } from '../../locales/locale'

// These async thunks remain in a separate module because they import other
// modules with deeply nested dependencies ... some of which will throw
// errors when imported too early (when the reducers and slices are being
// created, during app initialization.
// So we can't define these actions alongside the slice.

export const handleUndo = createAsyncThunk('undo/handleUndo', function (
  arg,
  { dispatch, getState }
) {
  const { position } = getState().undo
  const { street } = getState()

  // Don’t allow undo/redo unless you own the street
  if (position > 0 && isOwnedByCurrentUser()) {
    // Before undoing, send a copy of the current street data
    // to update data at the current position
    dispatch(undo(trimStreetData(street)))
    finishUndoOrRedo()
  } else {
    dispatch(
      addToast({
        message: formatMessage('toast.no-undo', 'Nothing to undo.'),
        duration: 4000
      })
    )
  }
})

export const handleRedo = createAsyncThunk('undo/handleRedo', function (
  arg,
  { dispatch, getState }
) {
  const { position, stack } = getState().undo

  // Don’t allow undo/redo unless you own the street
  if (position >= 0 && position < stack.length - 1 && isOwnedByCurrentUser()) {
    dispatch(redo())
    finishUndoOrRedo()
  } else {
    dispatch(
      addToast({
        message: formatMessage('toast.no-redo', 'Nothing to redo.'),
        duration: 4000
      })
    )
  }
})
