import store, { observeStore } from '../store'
import { setFlagOverrides } from '../store/slices/flags'

export const PRIORITY_LEVELS = {
  initial: 0,
  role: 1,
  user: 2,
  session: 3
}

export function initializeFlagSubscribers () {
  initLocalStorageUpdateListener()
  initRedrawPaletteUpdateListener()
}

function whatAreTheFlagsWeNeedToSave (flags) {
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

function initLocalStorageUpdateListener () {
  const select = (state) => state.flags
  const onChange = (flags) => {
    const toSet = whatAreTheFlagsWeNeedToSave(flags)
    window.localStorage.setItem('flags', JSON.stringify(toSet))
  }

  return observeStore(select, onChange)
}

function initRedrawPaletteUpdateListener () {
  const select = (state) => state.flags.SEGMENT_INCEPTION_TRAIN.value
  const onChange = () => {
    window.dispatchEvent(new window.CustomEvent('stmx:force_palette_redraw'))
  }

  return observeStore(select, onChange)
}

/**
 * Creates and returns an Object in shape of { source, flags: [ { key: value } ] }
 *
 * @param {Object} flags
 * @param {String} source
 */
export function generateFlagOverrides (flags, source) {
  if (!flags) return

  const flagsOverrides = {
    source,
    flags: []
  }

  return Object.entries(flags).reduce((obj, item) => {
    const [key, value] = item
    const flag = {
      flag: key,
      value
    }

    flagsOverrides.flags.push(flag)
    return obj
  }, flagsOverrides)
}

/**
 * Dispatches action to apply flag overrides to Redux flag state
 *
 * @param {Object} defaultFlags
 * @param {Array} overrides
 */
export function applyFlagOverrides (defaultFlags, ...overrides) {
  // Quickly clone the defaultFlags object by converting it to a string
  // and then back to an object. The source of this can come from state
  // and we need to avoid mutating it.
  const initialFlags = JSON.parse(JSON.stringify(defaultFlags))

  const newFlags = overrides.reduce((accumulatedFlags, currentFlags) => {
    // Handle a situation where currentFlags could be `undefined`
    // TODO: fix this (it's basically a type error.)
    if (!currentFlags) return accumulatedFlags

    const { source, flags } = currentFlags

    flags.forEach((item) => {
      const { flag, value } = item
      const previousFlag = accumulatedFlags[flag]

      if (previousFlag) {
        const previousPriority = PRIORITY_LEVELS[previousFlag.source] || 0
        const newPriority = PRIORITY_LEVELS[source.split(':')[0]] || 0

        if (newPriority > previousPriority) {
          previousFlag.value = value
          previousFlag.source = source
        }
      }
    })

    return accumulatedFlags
  }, initialFlags)

  store.dispatch(setFlagOverrides(newFlags))

  return newFlags
}
