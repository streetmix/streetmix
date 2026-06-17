import store, { observeStore, type RootState } from '~/src/store'

import type { Tour } from 'shepherd.js'

interface WatchTourStateForStepOptions<T> {
  stepId: string
  activeTour: Tour | null
  select: (state: RootState) => T
  shouldAdvance: (selected: T) => boolean
  onAdvance?: (tour: Tour) => void
}

export function watchTourStateForStep<T>({
  stepId,
  activeTour,
  select,
  shouldAdvance,
  onAdvance,
}: WatchTourStateForStepOptions<T>): () => void {
  let hasAdvanced = false

  const runCheck = (selected: T): boolean => {
    if (hasAdvanced) return false

    // If activeTour hasn't been passed in, bail.
    if (!activeTour) return false

    // If this is not the current step, and advance check has not passed, bail.
    if (activeTour.currentStep?.id !== stepId) return false
    if (!shouldAdvance(selected)) return false

    hasAdvanced = true

    // onAdvance is a callback that can be used to run something other than
    // the tour itself. This is not currently used by any step
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
