import { SET_FEATURE_FLAG, SET_USER_FLAGS } from '../actions'
import FEATURE_FLAGS from '../../../../app/data/flags'

function generateInitialFlags (flags) {
  const storage = JSON.parse(window.localStorage.getItem('flags'))

  return Object.entries(flags).reduce((obj, item) => {
    const [key, value] = item
    obj[key] = {
      value: value.defaultValue,
      source: 'initial'
    }

    // get user-defined settings saved in local storage if present
    // only keep it if it is different from the default value.
    if (storage && typeof storage[key] === 'boolean' && storage[key] !== value.defaultValue) {
      obj[key].value = storage[key]
      obj[key].source = 'session'
    }

    return obj
  }, {})
}

const initialState = generateInitialFlags(FEATURE_FLAGS)

const flags = (state = initialState, action) => {
  switch (action.type) {
    case SET_FEATURE_FLAG:
      return {
        ...state,
        [action.flag]: Object.assign({}, state[action.flag], { value: action.value, source: 'session' })
      }
    case SET_USER_FLAGS:
      return {
        ...state,
        ...action.userFlags
      }
    default:
      return state
  }
}

export default flags
