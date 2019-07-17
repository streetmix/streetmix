import FEATURE_FLAGS from '../../../app/data/flags'
import store, { observeStore } from '../store'
import { setFlagOverrides } from '../store/actions/flags'

export const PRIORITY_LEVELS = {
  'initial': 0,
  'user': 1,
  'session': 2
}

export function initializeFlagSubscribers () {
  initLocalStorageUpdateListener()
  initRedrawPaletteUpdateListener()
  initExperimentalBodyFontListener()
}

function whatAreTheFlagsWeNeedToSave (flags) {
  // convert to array
  const array = Object.entries(flags)
  // filter out all non-user set flags
  const filter1 = array.filter((item) => item[1].source === 'session')
  // filter out flags that equal default values
  const filter2 = filter1.filter((item) => item[1].value !== FEATURE_FLAGS[item[0]].defaultValue)
  // convert back to obj but simplify it to just the value
  return filter2.reduce((obj, item) => {
    obj[item[0]] = item[1].value
    return obj
  }, {})
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

function initExperimentalBodyFontListener () {
  const select = (state) => state.flags.BODY_FONT_UPDATE.value
  const onChange = (value) => {
    if (value === true) {
      const el = document.createElement('link')
      el.href = 'https://fonts.googleapis.com/css?family=Barlow:400,600,400italic'
      el.ref = 'stylesheet'
      document.head.appendChild(el)
      document.body.classList.add('experimental-font-family')
    } else {
      document.body.classList.remove('experimental-font-family')
    }
  }

  return observeStore(select, onChange)
}

/**
 * Creates and returns an Object in shape of { source, flags: [ { key: value } ], priority }
 *
 * @param {Object} flags
 * @param {String} source
 */
export function generateFlagOverrides (flags, source) {
  if (!flags) return

  const flagsOverrides = {
    source,
    flags: [],
    priority: PRIORITY_LEVELS[source]
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
 * @param {Array} flagOverrides
 */
export function applyFlagOverrides (defaultFlags, ...flagOverrides) {
  let updatedFlags

  flagOverrides.forEach((flagSource) => {
    if (!flagSource) return

    const { source, flags, priority } = flagSource

    updatedFlags = flags.reduce((obj, item) => {
      const { flag, value } = item

      if (obj[flag]) {
        const prevFlagSource = obj[flag].source
        const prevPriorityLevel = PRIORITY_LEVELS[prevFlagSource]
        if (obj[flag].value !== value && prevPriorityLevel < priority) {
          obj[flag] = { value, source }
        }
      }

      return obj
    }, defaultFlags)
  })

  store.dispatch(setFlagOverrides(updatedFlags))
  return updatedFlags
}
