import clone from 'just-clone'
import { infoBubble } from '../info_bubble/info_bubble'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import store from '../store'
import { updateStreetData } from '../store/slices/street'
import { createNewUndo, unifyStack } from '../store/slices/history'
import { setUpdateTimeToNow, updateEverything } from './data_model'

export function getUndoStack () {
  return clone(store.getState().history.stack)
}

export function getUndoPosition () {
  return store.getState().history.position
}

export function finishUndoOrRedo () {
  // set current street to the thing we just updated
  const { position, stack } = store.getState().history
  store.dispatch(updateStreetData(clone(stack[position])))
  cancelSegmentResizeTransitions()

  setUpdateTimeToNow()

  infoBubble.hide()
  infoBubble.hideSegment()
  infoBubble.dontConsiderShowing()

  updateEverything(true)
}

export function createNewUndoIfNecessary (lastStreet = {}, currentStreet) {
  // If just the street name has changed, don't make a new undo step for it.
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  store.dispatch(createNewUndo(clone(lastStreet)))
}

export function unifyUndoStack () {
  const street = store.getState().street
  store.dispatch(unifyStack(street))
}
