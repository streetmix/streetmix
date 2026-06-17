import Shepherd from 'shepherd.js'

import store, { observeStore, type RootState } from '~/src/store'

import type { Tour } from 'shepherd.js'

interface WatchTourStateForStepOptions<T> {
  stepId: string
  select: (state: RootState) => T
  shouldAdvance: (selected: T) => boolean
  onAdvance?: (tour: Tour) => void
  getActiveTour?: () => Tour | null
}

function resolveActiveTour(getActiveTour?: () => Tour | null): Tour | null {
  const contextTour = getActiveTour?.()
  if (contextTour) return contextTour

  if (Shepherd.activeTour) {
    return Shepherd.activeTour as Tour
  }

  const runtimeShepherd = (
    globalThis as { Shepherd?: { activeTour?: Tour | null } }
  ).Shepherd
  return runtimeShepherd?.activeTour ?? null
}

export function watchTourStateForStep<T>({
  stepId,
  select,
  shouldAdvance,
  onAdvance,
  getActiveTour,
}: WatchTourStateForStepOptions<T>): () => void {
  let hasAdvanced = false

  const runCheck = (selected: T): boolean => {
    if (hasAdvanced) return false

    const activeTour = resolveActiveTour(getActiveTour)
    if (!activeTour) return false

    if (activeTour.currentStep?.id !== stepId) return false
    if (!shouldAdvance(selected)) return false

    hasAdvanced = true

    if (onAdvance) {
      onAdvance(activeTour)
    } else {
      activeTour.next()
    }

    return true
  }

  let unsubscribe = () => {}

  unsubscribe = observeStore(select, (selected) => {
    if (runCheck(selected)) {
      unsubscribe()
    }
  })

  if (runCheck(select(store.getState()))) {
    unsubscribe()
  }

  return () => {
    unsubscribe()
  }
}
