import clone from 'just-clone'

import { cancelSegmentResizeTransitions } from '../segments/resizing.js'
import store from '../store'
import { updateStreetData } from '../store/slices/street.js'
import { createNewUndo, unifyStack } from '../store/slices/history.js'
import { setUpdateTimeToNow, updateEverything } from './data_model.js'

import type { StreetState } from '@streetmix/types'

export function getUndoStack() {
  return clone(store.getState().history.stack)
}

export function getUndoPosition() {
  return store.getState().history.position
}

export function finishUndoOrRedo() {
  // set current street to the thing we just updated
  const { position, stack } = store.getState().history
  store.dispatch(updateStreetData(clone(stack[position])))
  cancelSegmentResizeTransitions()

  setUpdateTimeToNow()

  updateEverything(true)
}

export function createNewUndoIfNecessary(
  lastStreet: Partial<StreetState> = {},
  currentStreet: Partial<StreetState>
) {
  // If just the street name has changed, don't make a new undo step for it.
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  store.dispatch(createNewUndo(clone(lastStreet)))
}

export function unifyUndoStack() {
  const street = store.getState().street
  store.dispatch(unifyStack(street))
}
