var UNDO_LIMIT = 1000

var TRACK_ACTION_UNDO = 'Undo'

var FLAG_SAVE_UNDO = false; // true to save undo with street data, false to not save undo

var undoStack = []
var undoPosition = 0
var ignoreStreetChanges = false

function _undoRedo (undo) {
  if (undo && !_isUndoAvailable()) {
    _statusMessage.show(msg('STATUS_NOTHING_TO_UNDO'))
  } else if (!undo && !_isRedoAvailable()) {
    _statusMessage.show(msg('STATUS_NOTHING_TO_REDO'))
  } else {
    if (undo) {
      undoStack[undoPosition] = _trimStreetData(street)
      undoPosition--
    } else {
      undoPosition++
    }
    street = _clone(undoStack[undoPosition])
    _setUpdateTimeToNow()

    _infoBubble.hide()
    _infoBubble.hideSegment()
    _infoBubble.dontConsiderShowing()

    _updateEverything(true)
    _statusMessage.hide()
  }

  EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_UNDO,
    null, null, true)
}

function _clearUndoStack () {
  undoStack = []
  undoPosition = 0
  _updateUndoButtons()
}

function _undo () {
  _undoRedo(true)
}

function _redo () {
  _undoRedo(false)
}

function _trimUndoStack () {
  // TODO optimize
  while (undoPosition >= UNDO_LIMIT) {
    undoPosition--
    undoStack = undoStack.slice(1)
  }
}

function _createNewUndo () {
  // This removes future undo path in case we undo a few times and then do
  // something undoable.
  undoStack = undoStack.splice(0, undoPosition)
  undoStack[undoPosition] = _clone(lastStreet)
  undoPosition++

  _trimUndoStack()
  _unifyUndoStack()
}

function _createNewUndoIfNecessary (lastStreet, currentStreet) {
  if (lastStreet.name != currentStreet.name) {
    return
  }

  _createNewUndo()
}

function _isUndoAvailable () {
  // Don’t allow undo/redo unless you own the street

  return (undoPosition > 0) && !remixOnFirstEdit
}

function _isRedoAvailable () {
  // Don’t allow undo/redo unless you own the street

  return (undoPosition < undoStack.length - 1) && !remixOnFirstEdit
}

function _updateUndoButtons () {
  document.querySelector('#undo').disabled = !_isUndoAvailable()
  document.querySelector('#redo').disabled = !_isRedoAvailable()
}

function _unifyUndoStack () {
  for (var i = 0; i < undoStack.length; i++) {
    undoStack[i].id = street.id
    undoStack[i].name = street.name
    undoStack[i].namespacedId = street.namespacedId
    undoStack[i].creatorId = street.creatorId
    undoStack[i].updatedAt = street.updatedAt
  }
}
