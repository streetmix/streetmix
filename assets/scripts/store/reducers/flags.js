import { SET_FEATURE_FLAG } from '../actions'
import { FEATURE_FLAGS } from '../../app/flag_data'

function generateInitialFlags (flags) {
  return Object.entries(flags).reduce((obj, item) => {
    obj[item[0]] = {
      value: item[1].defaultValue,
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
        [action.flag]: Object.assign({}, state[action.flag], { value: action.value, source: 'user' })
      }
    default:
      return state
  }
}

export default flags
