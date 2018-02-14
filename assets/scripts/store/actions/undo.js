import {
  RESET_UNDO_STACK,
  REPLACE_UNDO_STACK,
  CREATE_NEW_UNDO,
  UNDO,
  REDO,
  UNIFY_UNDO_STACK
} from './'

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
