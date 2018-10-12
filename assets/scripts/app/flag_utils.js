import FEATURE_FLAGS from '../../../app/data/flags'
import { store, observeStore } from '../store'
import { setFeatureFlag } from '../store/actions/flags'

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
  Object.keys(flags).forEach((key) => {
    // If local storage does not already have the flag,
    // set the flag in Redux as source user.
    if (!window.localStorage.flags[key]) {
      store.dispatch(setFeatureFlag(key, flags[key].value, 'user'))
    }
  })
}
