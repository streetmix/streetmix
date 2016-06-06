import _ from 'lodash'

import { trackEvent } from '../app/event_tracking'
import { msg } from '../app/messages'
import { showStatusMessage, hideStatusMessage } from '../app/status_message'
import { infoBubble } from '../info_bubble/info_bubble'
import {
  trimStreetData,
  getStreet,
  setStreet,
  setUpdateTimeToNow,
  updateEverything,
  getLastStreet
} from './data_model'
import { getRemixOnFirstEdit } from './remix'

const UNDO_LIMIT = 1000

export const FLAG_SAVE_UNDO = false // true to save undo with street data, false to not save undo

let undoStack = []

export function getUndoStack () {
  return undoStack
}

export function setUndoStack (value) {
  undoStack = value
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
    showStatusMessage(msg('STATUS_NOTHING_TO_UNDO'))
  } else if (!undo && !isRedoAvailable()) {
    showStatusMessage(msg('STATUS_NOTHING_TO_REDO'))
  } else {
    if (undo) {
      undoStack[undoPosition] = trimStreetData(getStreet())
      undoPosition--
    } else {
      undoPosition++
    }
    setStreet(_.cloneDeep(undoStack[undoPosition]))
    setUpdateTimeToNow()

    infoBubble.hide()
    infoBubble.hideSegment()
    infoBubble.dontConsiderShowing()

    updateEverything(true)
    hideStatusMessage()
  }

  trackEvent('INTERACTION', 'UNDO', null, null, true)
}

export function undo () {
  undoRedo(true)
}

export function redo () {
  undoRedo(false)
}

function trimUndoStack () {
  // TODO optimize
  while (undoPosition >= UNDO_LIMIT) {
    undoPosition--
    undoStack = undoStack.slice(1)
  }
}

function createNewUndo () {
  // This removes future undo path in case we undo a few times and then do
  // something undoable.
  undoStack = undoStack.splice(0, undoPosition)
  undoStack[undoPosition] = _.cloneDeep(getLastStreet())
  undoPosition++

  trimUndoStack()
  unifyUndoStack()
}

export function createNewUndoIfNecessary (lastStreet, currentStreet) {
  if (lastStreet.name !== -currentStreet.name) {
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

  return (undoPosition < undoStack.length - 1) && !getRemixOnFirstEdit()
}

export function updateUndoButtons () {
  document.querySelector('#undo').disabled = !isUndoAvailable()
  document.querySelector('#redo').disabled = !isRedoAvailable()
}

export function unifyUndoStack () {
  var street = getStreet()
  for (var i = 0; i < undoStack.length; i++) {
    undoStack[i].id = street.id
    undoStack[i].name = street.name
    undoStack[i].namespacedId = street.namespacedId
    undoStack[i].creatorId = street.creatorId
    undoStack[i].updatedAt = street.updatedAt
  }
}
