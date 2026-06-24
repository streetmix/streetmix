import clone from 'just-clone'
import { create } from 'jsondiffpatch'
import type { Delta } from 'jsondiffpatch'

import { cancelSegmentResizeTransitions } from '../segments/resizing.js'
import store from '../store'
import { updateStreetDataAction } from '../store/actions/street.js'
import { createNewUndoDelta } from '../store/slices/history.js'
import {
  setIgnoreStreetChanges,
  setUpdateTimeToNow,
  updateEverything,
} from './data_model.js'

import type { StreetState } from '@streetmix/types'

const historyDiffer = create()

function seedMissingWarnings(street: Partial<StreetState>) {
  if (Array.isArray(street?.segments)) {
    street.segments = street.segments.map((segment) => ({
      ...segment,
      warnings: segment.warnings ?? [false],
    }))
  }
}

function restoreFromDelta(
  direction: 'undo' | 'redo',
  previousPosition: number,
  deltaStack: Array<{ forwardDelta: unknown; reverseDelta: unknown }>,
  currentStreet: Partial<StreetState>
) {
  const deltaIndex =
    direction === 'undo' ? previousPosition : previousPosition + 1
  const entry = deltaStack[deltaIndex]
  if (!entry) {
    return null
  }

  const delta = direction === 'undo' ? entry.reverseDelta : entry.forwardDelta
  if (typeof delta !== 'object' || delta === null) {
    return null
  }

  const restoredStreet = clone(currentStreet)
  historyDiffer.patch(restoredStreet, clone(delta) as Delta)

  seedMissingWarnings(restoredStreet)
  return restoredStreet
}

export async function finishUndoOrRedo(
  direction: 'undo' | 'redo',
  previousPosition: number
) {
  // set current street to the thing we just updated
  const { history, street } = store.getState()
  const { deltaPosition, deltaStack } = history
  if (deltaPosition === null) {
    return
  }

  if (!Array.isArray(deltaStack) || deltaStack.length === 0) {
    return
  }

  const finalStreet = restoreFromDelta(
    direction,
    previousPosition,
    deltaStack,
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
  if (lastStreet.name !== currentStreet.name) {
    return
  }

  const previousSnapshot = clone(lastStreet)
  const nextSnapshot = clone(currentStreet)

  const forwardDelta = historyDiffer.diff(previousSnapshot, nextSnapshot)
  const reverseDelta = historyDiffer.diff(nextSnapshot, previousSnapshot)

  if (!forwardDelta || !reverseDelta) {
    return
  }

  store.dispatch(
    createNewUndoDelta({
      forwardDelta,
      reverseDelta,
    })
  )
}
