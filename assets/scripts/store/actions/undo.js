import {
  RESET_UNDO_STACK,
  REPLACE_UNDO_STACK,
  CREATE_NEW_UNDO,
  UNDO,
  REDO,
  UNIFY_UNDO_STACK
} from './'
import { showStatusMessage } from './status'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { finishUndoOrRedo } from '../../streets/undo_stack'
import { trimStreetData } from '../../streets/data_model'
import { t } from '../../locales/locale'

export function resetUndoStack () {
  return {
    type: RESET_UNDO_STACK
  }
}

// todo: check to make sure position is set to a value within stack length
export function replaceUndoStack (stack, position) {
  return {
    type: REPLACE_UNDO_STACK,
    stack,
    position
  }
}

export function createNewUndo (street) {
  return {
    type: CREATE_NEW_UNDO,
    street
  }
}

export function handleUndo () {
  return (dispatch, getState) => {
    const { position } = getState().undo
    const { street } = getState()

    // Don’t allow undo/redo unless you own the street
    if (position > 0 && isOwnedByCurrentUser()) {
      // Before undoing, send a copy of the current street data
      // to update data at the current position
      dispatch(undoAction(trimStreetData(street)))
      finishUndoOrRedo()
    } else {
      dispatch(showStatusMessage(t('toast.no-undo', 'Nothing to undo.')))
    }
  }
}

export function handleRedo () {
  return (dispatch, getState) => {
    const { position, stack } = getState().undo

    // Don’t allow undo/redo unless you own the street
    if (
      position >= 0 &&
      position < stack.length - 1 &&
      isOwnedByCurrentUser()
    ) {
      dispatch(redoAction())
      finishUndoOrRedo()
    } else {
      dispatch(showStatusMessage(t('toast.no-redo', 'Nothing to redo.')))
    }
  }
}

export function undoAction (street) {
  return {
    type: UNDO,
    street
  }
}

export function redoAction () {
  return {
    type: REDO
  }
}

export function unifyStack (street) {
  return {
    type: UNIFY_UNDO_STACK,
    street
  }
}
