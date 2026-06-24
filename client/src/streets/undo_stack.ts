import clone from 'just-clone'

import { cancelSegmentResizeTransitions } from '../segments/resizing.js'
import store from '../store'
import { updateStreetDataAction } from '../store/actions/street.js'
import { createNewUndo, unifyStack } from '../store/slices/history.js'
import {
  setIgnoreStreetChanges,
  setUpdateTimeToNow,
  updateEverything,
} from './data_model.js'

import type { StreetState } from '@streetmix/types'

export function getUndoStack() {
  return clone(store.getState().history.stack)
}

export function getUndoPosition() {
  return store.getState().history.position
}

export async function finishUndoOrRedo() {
  // set current street to the thing we just updated
  const { position, stack } = store.getState().history
  if (position === null) {
    return
  }

  const restoredStreet = clone(stack[position])

  // Undo stack snapshots intentionally omit derived warnings.
  // Seed defaults so render paths never read `undefined` before recomputation.
  if (Array.isArray(restoredStreet?.segments)) {
    restoredStreet.segments = restoredStreet.segments.map((segment) => ({
      ...segment,
      warnings: segment.warnings ?? [false],
    }))
  }

  setIgnoreStreetChanges(true)
  try {
    await store.dispatch(updateStreetDataAction(restoredStreet))
    cancelSegmentResizeTransitions()
    setUpdateTimeToNow()
    updateEverything(true)
  } finally {
    setIgnoreStreetChanges(false)
  }
}

export function createNewUndoIfNecessary(
  lastStreet: Partial<StreetState> = {},
  currentStreet: Partial<StreetState>
) {
  // If just the street name has changed, don't make a new undo step for it.
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  store.dispatch(createNewUndo(clone(currentStreet)))
}

export function unifyUndoStack() {
  const street = store.getState().street
  store.dispatch(unifyStack(street))
}
