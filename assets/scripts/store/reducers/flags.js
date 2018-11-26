import { SET_FEATURE_FLAG, SET_FLAG_OVERRIDES } from '../actions'
import FEATURE_FLAGS from '../../../../app/data/flags'

function generateInitialFlags (flags) {
  return Object.entries(flags).reduce((obj, item) => {
    const [key, value] = item
    obj[key] = {
      value: value.defaultValue,
      source: 'initial'
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
    case SET_FLAG_OVERRIDES:
      return {
        ...state,
        ...action.flags
      }
    default:
      return state
  }
}

export default flags
