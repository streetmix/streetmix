import type { FeatureFlagSettings } from '~/src/types'
import store, { observeStore, type RootState } from '../store'
import { setFlagOverrides, type FeatureFlagState } from '../store/slices/flags'

import type { Unsubscribe } from '@reduxjs/toolkit'

type FeatureFlagsSimplified = Record<string, boolean>
interface FeatureFlagOverrides {
  source: string
  flags: FeatureFlagsSimplified
}

export function initializeFlagSubscribers (): void {
  initLocalStorageUpdateListener()
  initRedrawPaletteUpdateListener()
}

function whatAreTheFlagsWeNeedToSave (
  flags: FeatureFlagSettings
): FeatureFlagsSimplified {
  return (
    Object.entries(flags)
      // filter out all non-user set flags
      .filter(([key, flag]) => flag.source === 'session')
      // convert back to obj but simplify it to just the value
      .reduce((obj, [key, flag]) => {
        obj[key] = flag.value
        return obj
      }, {})
  )
}

function initLocalStorageUpdateListener (): Unsubscribe {
  const select = (state: RootState): FeatureFlagSettings => state.flags
  const onChange = (flags: FeatureFlagSettings): void => {
    const toSet = whatAreTheFlagsWeNeedToSave(flags)
    window.localStorage.setItem('flags', JSON.stringify(toSet))
  }

  return observeStore(select, onChange)
}

function initRedrawPaletteUpdateListener (): Unsubscribe {
  const select = (state: RootState): boolean =>
    state.flags.SEGMENT_INCEPTION_TRAIN.value
  const onChange = (): void => {
    window.dispatchEvent(new window.CustomEvent('stmx:force_palette_redraw'))
  }

  return observeStore(select, onChange)
}

export function generateFlagOverrides (
  flags: FeatureFlagsSimplified | null,
  source: string
): FeatureFlagOverrides {
  return {
    source,
    flags: flags ?? {}
  }
}

/**
 * Dispatches action to apply flag overrides to Redux flag state
 * Overrides should be passed in order of priority. Later entries override
 * earlier ones.
 */
export function applyFlagOverrides (
  defaultFlags: FeatureFlagSettings,
  ...overrides: FeatureFlagOverrides[]
): FeatureFlagSettings {
  // Quickly clone the defaultFlags object by converting it to a string
  // and then back to an object. The source of this can come from state
  // and we need to avoid mutating it.
  const initialFlags: FeatureFlagSettings = JSON.parse(
    JSON.stringify(defaultFlags)
  )

  const newFlags = overrides.reduce(
    (accumulatedFlags: FeatureFlagSettings, currentFlags) => {
      const { source, flags } = currentFlags

      for (const [key, value] of Object.entries(flags)) {
        const previousFlag = accumulatedFlags[key]

        if (previousFlag !== undefined) {
          previousFlag.value = value
          previousFlag.source = source
        }
      }

      return accumulatedFlags
    },
    initialFlags
  )

  store.dispatch(setFlagOverrides(newFlags as FeatureFlagState))

  return newFlags
}
