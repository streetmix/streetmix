import { createAsyncThunk } from '@reduxjs/toolkit'

import { formatMessage } from '../../locales/locale'
import { trimStreetData } from '../../streets/data_model'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { finishUndoOrRedo } from '../../streets/undo_stack'
import { redo, undo } from '../slices/history'
import { addToast } from '../slices/toasts'

import type { Dispatch, RootState } from '../index'

// These async thunks remain in a separate module because they import other
// modules with deeply nested dependencies ... some of which will throw
// errors when imported too early (when the reducers and slices are being
// created, during app initialization.
// So we can't define these actions alongside the slice.

export const handleUndo = createAsyncThunk(
  'history/handleUndo',
  function (
    arg,
    { dispatch, getState }: { dispatch: Dispatch; getState: () => RootState }
  ) {
    const { position } = getState().history
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
          duration: 4000,
        })
      )
    }
  }
)

export const handleRedo = createAsyncThunk(
  'history/handleRedo',
  function (
    arg,
    { dispatch, getState }: { dispatch: Dispatch; getState: () => RootState }
  ) {
    const { position, stack } = getState().history

    // Don’t allow undo/redo unless you own the street
    if (
      position >= 0 &&
      position < stack.length - 1 &&
      isOwnedByCurrentUser()
    ) {
      dispatch(redo())
      finishUndoOrRedo()
    } else {
      dispatch(
        addToast({
          message: formatMessage('toast.no-redo', 'Nothing to redo.'),
          duration: 4000,
        })
      )
    }
  }
)
