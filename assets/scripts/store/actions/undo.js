import {
  CLEAR_UNDO_STACK,
  REPLACE_UNDO_STACK,
  CREATE_NEW_UNDO,
  UNDO,
  REDO,
  SET_UNDO_POSITION,
  UNIFY_UNDO_STACK
} from './'

export function clearUndoStack () {
  return {
    type: CLEAR_UNDO_STACK
  }
}

export function replaceUndoStack (stack) {
  return {
    type: REPLACE_UNDO_STACK,
    stack
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

export function replaceUndoPosition (position) {
  return {
    type: SET_UNDO_POSITION,
    position
  }
}

export function unifyStack (street) {
  return {
    type: UNIFY_UNDO_STACK,
    street
  }
}
