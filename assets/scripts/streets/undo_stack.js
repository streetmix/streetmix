import { cloneDeep } from 'lodash'

import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'
import { showStatusMessage, hideStatusMessage } from '../app/status_message'
import { infoBubble } from '../info_bubble/info_bubble'
import {
  trimStreetData,
  getStreet,
  setStreet,
  setUpdateTimeToNow,
  updateEverything,
  getLastStreet,
  setStreetDataInRedux
} from './data_model'
import { getRemixOnFirstEdit } from './remix'

import store from '../store'
import { replaceUndoStack } from '../store/actions/undo'

const UNDO_LIMIT = 1000

export const FLAG_SAVE_UNDO = false // true to save undo with street data, false to not save undo

export function getUndoStack () {
  return cloneDeep(store.getState().undo.stack)
}

export function setUndoStack (value) {
  store.dispatch(replaceUndoStack(value))
}

let undoPosition = 0

export function getUndoPosition () {
  return undoPosition
}

export function setUndoPosition (value) {
  undoPosition = value
}

let ignoreStreetChanges = false

export function getIgnoreStreetChanges () {
  return ignoreStreetChanges
}

export function setIgnoreStreetChanges (value) {
  ignoreStreetChanges = value
}

function undoRedo (undo) {
  if (undo && !isUndoAvailable()) {
    showStatusMessage(t('toast.no-undo'))
  } else if (!undo && !isRedoAvailable()) {
    showStatusMessage(t('toast.no-redo'))
  } else {
    const undoStack = getUndoStack()

    if (undo) {
      undoStack[undoPosition] = trimStreetData(getStreet())
      setUndoStack(undoStack)
      undoPosition--
    } else {
      undoPosition++
    }
    setStreet(cloneDeep(undoStack[undoPosition]))
    setUpdateTimeToNow()

    infoBubble.hide()
    infoBubble.hideSegment()
    infoBubble.dontConsiderShowing()

    updateEverything(true)
    hideStatusMessage()

    // The `setStreet()` above only sets minimum (trimmed) data from the undo stack
    // Code following that replaces and recalculates the data and adjusts the legacy global
    // `street` object, which we have to put back onto Redux
    setStreetDataInRedux()
  }

  trackEvent('INTERACTION', 'UNDO', null, null, true)
}

export function undo () {
  undoRedo(true)
}

export function redo () {
  undoRedo(false)
}

function trimUndoStack (undoStack) {
  // TODO optimize
  while (undoPosition >= UNDO_LIMIT) {
    undoPosition--
    undoStack = undoStack.slice(1)
  }
  return undoStack
}

function createNewUndo () {
  // This removes future undo path in case we undo a few times and then do
  // something undoable.
  let undoStack = getUndoStack()
  undoStack = undoStack.splice(0, undoPosition)
  undoStack[undoPosition] = cloneDeep(getLastStreet())
  undoPosition++

  undoStack = trimUndoStack(undoStack)
  setUndoStack(undoStack)

  unifyUndoStack()
}

export function createNewUndoIfNecessary (lastStreet, currentStreet) {
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  createNewUndo()
}

function isUndoAvailable () {
  // Don’t allow undo/redo unless you own the street

  return (undoPosition > 0) && !getRemixOnFirstEdit()
}

function isRedoAvailable () {
  // Don’t allow undo/redo unless you own the street
  const undoStack = getUndoStack()
  return (undoPosition < undoStack.length - 1) && !getRemixOnFirstEdit()
}

export function updateUndoButtons () {
  document.querySelector('#undo').disabled = !isUndoAvailable()
  document.querySelector('#redo').disabled = !isRedoAvailable()
}

export function unifyUndoStack () {
  var street = getStreet()
  const undoStack = getUndoStack()
  for (var i = 0; i < undoStack.length; i++) {
    undoStack[i].id = street.id
    undoStack[i].name = street.name
    undoStack[i].namespacedId = street.namespacedId
    undoStack[i].creatorId = street.creatorId
    undoStack[i].updatedAt = street.updatedAt
  }
  setUndoStack(undoStack)
}
