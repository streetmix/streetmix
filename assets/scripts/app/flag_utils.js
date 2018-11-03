import FEATURE_FLAGS from '../../../app/data/flags'
import { observeStore } from '../store'

export function initializeFlagSubscribers () {
  initLocalStorageUpdateListener()
  initRedrawPaletteUpdateListener()
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

export function receiveUserFlags (flags) {
  if (!flags) return

  const sessionFlags = (window.localStorage.flags) ? JSON.parse(window.localStorage.flags) : {}
  // Convert to array
  const array = Object.entries(flags)
  // Filter flags not in session flags
  const filter = array.filter((item) => !(item[0] in sessionFlags))
  // Convert back to object

  return filter.reduce((obj, item) => {
    obj[item[0]] = {
      value: item[1],
      source: 'user'
    }

    return obj
  }, {})
}
