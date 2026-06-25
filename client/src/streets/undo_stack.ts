import clone from 'just-clone'
import { create } from 'jsondiffpatch'

import { cancelSegmentResizeTransitions } from '../segments/resizing.js'
import store, { type RootState } from '../store'
import { updateStreetDataAction } from '../store/actions/street.js'
import { createNewUndo } from '../store/slices/history.js'
import {
  setIgnoreStreetChanges,
  setUpdateTimeToNow,
  updateEverything,
} from './data_model.js'
import { isOwnedByCurrentUser } from './owner.js'

import type { StreetState, HistoryState } from '@streetmix/types'

const historyDiffer = create()

export function isUndoAvailable(state: RootState): boolean {
  const { position } = state.history

  // This checks for ownership as well -- don't allow undo/redo unless you
  // own the street
  return position !== null && position >= 0 && isOwnedByCurrentUser()
}

export function isRedoAvailable(state: RootState): boolean {
  const { stack, position } = state.history

  return (
    position !== null &&
    position >= -1 &&
    position < stack.length - 1 &&
    isOwnedByCurrentUser()
  )
}

function restoreFromDelta(
  direction: 'undo' | 'redo',
  previousPosition: number,
  stack: HistoryState['stack'],
  currentStreet: Partial<StreetState>
) {
  const restoredStreet = clone(currentStreet)

  if (direction === 'undo') {
    // Undo reverse-patches ("unpatches") street state with the current delta
    const delta = stack[previousPosition]
    historyDiffer.unpatch(restoredStreet, delta)
  } else {
    // Redo forward-patches street state with the next delta
    const delta = stack[previousPosition + 1]
    historyDiffer.patch(restoredStreet, delta)
  }

  return restoredStreet
}

export async function finishUndoOrRedo(
  direction: 'undo' | 'redo',
  previousPosition: number
) {
  const { history, street } = store.getState()
  const { position, stack } = history
  if (position === null) {
    return
  }

  if (stack.length === 0) {
    return
  }

  const finalStreet = restoreFromDelta(
    direction,
    previousPosition,
    stack,
    street
  )
  if (!finalStreet) {
    return
  }

  setIgnoreStreetChanges(true)
  try {
    await store.dispatch(updateStreetDataAction(finalStreet))
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
  if (lastStreet.name !== currentStreet.name) return

  const delta = historyDiffer.diff(lastStreet, currentStreet)

  // Bail if tehre is no change
  if (!delta) return

  store.dispatch(createNewUndo(delta))
}
