import { cloneDeep } from 'lodash'
import { infoBubble } from '../info_bubble/info_bubble'
import { cancelSegmentResizeTransitions } from '../segments/resizing'
import { setUpdateTimeToNow, updateEverything } from './data_model'
import store from '../store'
import { updateStreetData } from '../store/slices/street'
import { createNewUndo, unifyStack } from '../store/slices/undo'

export function getUndoStack () {
  return cloneDeep(store.getState().undo.stack)
}

export function getUndoPosition () {
  return store.getState().undo.position
}

export function finishUndoOrRedo () {
  // set current street to the thing we just updated
  const { position, stack } = store.getState().undo
  store.dispatch(updateStreetData(cloneDeep(stack[position])))
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

  store.dispatch(createNewUndo(cloneDeep(lastStreet)))
}

export function unifyUndoStack () {
  const street = store.getState().street
  store.dispatch(unifyStack(street))
}
