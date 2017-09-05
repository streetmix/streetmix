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
import {
  createNewUndo,
  unifyStack,
  replaceUndoStack,
  replaceUndoPosition,
  undoAction,
  redoAction
} from '../store/actions/undo'

export const FLAG_SAVE_UNDO = false // true to save undo with street data, false to not save undo

export function getCurrentUndo () {
  const state = store.getState().undo
  return state.stack[state.position]
}

export function getUndoStack () {
  return cloneDeep(store.getState().undo.stack)
}

export function setUndoStack (value) {
  store.dispatch(replaceUndoStack(value))
}

export function getUndoPosition () {
  return store.getState().undo.position
}

export function setUndoPosition (value) {
  replaceUndoPosition(value)
}

let ignoreStreetChanges = false

export function getIgnoreStreetChanges () {
  return ignoreStreetChanges
}

export function setIgnoreStreetChanges (value) {
  ignoreStreetChanges = value
}

function undoRedo (undo) {
  if (undo) {
    // sends current street to update current position before undoing
    store.dispatch(undoAction(trimStreetData(getStreet())))
  } else {
    store.dispatch(redoAction())
  }

  // set current street to the thing we just updated
  const state = store.getState().undo
  setStreet(cloneDeep(state.stack[state.position]))

  setUpdateTimeToNow()

  infoBubble.hide()
  infoBubble.hideSegment()
  infoBubble.dontConsiderShowing()

  updateEverything(true)
  hideStatusMessage()

  trackEvent('INTERACTION', 'UNDO', null, null, true)
}

export function undo () {
  if (!isUndoAvailable()) {
    showStatusMessage(t('toast.no-undo'))
    return
  }

  undoRedo(true)
}

export function redo () {
  if (!isRedoAvailable()) {
    showStatusMessage(t('toast.no-undo'))
    return
  }

  undoRedo(false)
}

export function createNewUndoIfNecessary (lastStreet, currentStreet) {
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  store.dispatch(createNewUndo(cloneDeep(getLastStreet())))
}

function isUndoAvailable () {
  const undoPosition = getUndoPosition()
  // Don’t allow undo/redo unless you own the street
  return (undoPosition > 0) && !getRemixOnFirstEdit()
}

function isRedoAvailable () {
  const undoStack = getUndoStack()
  const undoPosition = getUndoPosition()
  // Don’t allow undo/redo unless you own the street
  return (undoPosition >= 0 && undoPosition < undoStack.length - 1) && !getRemixOnFirstEdit()
}

export function updateUndoButtons () {
  document.querySelector('#undo').disabled = !isUndoAvailable()
  document.querySelector('#redo').disabled = !isRedoAvailable()
}

export function unifyUndoStack () {
  var street = getStreet()
  store.dispatch(unifyStack(street))
}
