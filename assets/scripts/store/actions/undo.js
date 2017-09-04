import {
  CLEAR_UNDO_STACK,
  REPLACE_UNDO_STACK,
  UNDO,
  REDO
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

export function undoAction () {
  return {
    type: UNDO
  }
}

export function redoAction () {
  return {
    type: REDO
  }
}
